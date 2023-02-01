import * as fs from "node:fs";
import * as vosk from "vosk";
import { spawn } from "node:child_process";
import * as wav from "wav";

function addSentence(str: string, newStr: string): string {
    if (newStr === '') {
        return str;
    }
    return str + newStr.charAt(0).toUpperCase() + newStr.slice(1) + '. ';
}

export class AudioService {

    private model: any;

    constructor(
        private modelPath: string,
        private audioPath: string,
        private sampleRate: string,
        private bufferSize: string
    ) {
        // vosk.setLogLevel(1);
        this.model = new vosk.Model(this.modelPath);
    }

    ensureAudioDirectory() {
        if (!fs.existsSync(this.audioPath)) {
            fs.mkdirSync(this.audioPath);
        }
    }

    getFilePath(fileUuid: string, extension: string) {
        return `${this.audioPath}/${fileUuid}.${extension}`;    
    }

    removeFile(fileUuid: string, extension: string) {
        fs.rmSync(this.getFilePath(fileUuid, extension));
    }

    async convertOggToWav(fileUuid: string): Promise<number | null> {
        
        const oggFilePath = this.getFilePath(fileUuid, 'ogg');
        const wavFilePath = this.getFilePath(fileUuid, 'wav');
        const ffmpeg = spawn('ffmpeg', [
            // '-loglevel', 'quiet',
            // '-acodec', 'libvorbis',
            '-i', oggFilePath,                      // input file name
            '-ar', String(this.sampleRate) ,        // set sample rate
            '-ac', '1',                             // mono (1 audio channel)
            // '-f', 's16le',                       // force output format (?)
            '-bufsize', String(this.bufferSize),    // set buffer size
            '-acodec', 'pcm_s16le',
            wavFilePath                             // output file name
        ]);

        return new Promise((resolve, reject) => {
            ffmpeg.on('close', (code: number | null) => {
                if (code === 0) {
                    resolve(code);
                } else {
                    reject(code);
                }
            });
        });
    }

    async convertToText(fileUuid: string): Promise<string> {
        return new Promise((resolve, reject) => {        

            let resultText = '';
            const wavFilePath = this.getFilePath(fileUuid, 'wav');
            const fileStream = fs.createReadStream(wavFilePath);
            const reader = new wav.Reader();

            reader.on('format', (format: any) => {
                
                const rec = new vosk.Recognizer({model: this.model, sampleRate: format.sampleRate});
                // rec.setMaxAlternatives(1);
                // rec.setWords(true);
                // rec.setPartialWords(true);

                reader.on('data', async (data: any) => {
                    const endOfSpeach = rec.acceptWaveform(data);
                    if (endOfSpeach) {
                        resultText = addSentence(resultText, rec.result().text);
                    }
                });
        
                reader.on('finish', () => {
                    resultText = addSentence(resultText, rec.finalResult(rec).text);
                    resolve(resultText);
                    rec.free();
                });

            });

            fileStream.pipe(reader);
        });
    }
}