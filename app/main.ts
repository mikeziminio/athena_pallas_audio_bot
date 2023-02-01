import { Telegraf } from "telegraf";
import * as https from "node:https";
import * as crypto from "crypto";
import * as fs from "node:fs";
import * as dotenv from "dotenv";
import { AudioService } from "./audio.service";

dotenv.config({ path: '../.env' });

async function runBot() {

    if (
        process.env.MODEL_PATH === undefined ||
        process.env.AUDIO_PATH === undefined ||
        process.env.SAMPLE_RATE === undefined ||
        process.env.BUFFER_SIZE === undefined ||
        process.env.BOT_TOKEN === undefined
    ) {
        console.error("Указаны не все переменные окружения");
        return;
    }

    const audioService = new AudioService(
        process.env.MODEL_PATH,
        process.env.AUDIO_PATH,
        process.env.SAMPLE_RATE,
        process.env.BUFFER_SIZE
    );

    const bot = new Telegraf(process.env.BOT_TOKEN);

    bot.on('voice', async (context) => {
        
        const fileId = context.message.voice.file_id;
        const fileLink = await bot.telegram.getFileLink(fileId);
        
        audioService.ensureAudioDirectory();
        const fileUuid = crypto.randomUUID();
        const localFilePath = audioService.getFilePath(fileUuid, 'ogg');
        const fileStream = fs.createWriteStream(localFilePath);

        https.get(fileLink.href, (response) => {
            response.pipe(fileStream);
        });

        fileStream.on('close', async () => {
            await audioService.convertOggToWav(fileUuid);
            const text = await audioService.convertToText(fileUuid);
            if (text !== '') {
                context.reply('✨ ' + text, { reply_to_message_id: context.message.message_id });
            }
            audioService.removeFile(fileUuid, 'wav');
            audioService.removeFile(fileUuid, 'ogg');
        });

    });

    bot.launch();
}

runBot();