# Телеграм бот Афина Паллада Аудио

Добавляйте бота [@athena_pallas_audio_bot](https://t.me/athena_pallas_audio_bot) в чаты Telegram — он сразу начнёт преобразовывать аудиосообщения в текст.

## Технологический стек

- node.js
- typescript
- [telegraf](https://telegraf.js.org/) - легковесный фреймворк для создания телеграм ботов
- [ffmpeg](https://ffmpeg.org/) - для преобразования ogg в wav
- [vosk](https://alphacephei.com/vosk/) - распознавание речи

## Запуск на собственном сервере

Для запуска на своём сервере можно склонировать этот репозиторий.

Далее необходимо создать нового бота через [@BotFather](https://t.me/BotFather). Выданный им токен прописать в файле <code>.env</code>

Далее необходимо выбрать одну или несколько моделей Vosk - https://alphacephei.com/vosk/models - скачать, распаковать их и положить в папку vosk-models, например

```
/vosk-models/vosk-model-ru-0.22/
/vosk-models/vosk-model-ru-0.10/
/vosk-models/vosk-model-small-ru-0.22/
...
```

Хорошая модель <code>vosk-model-ru-0.22</code> у меня не запустилась (вероятно, необходимо больше оперативной памяти). Поэтому на текущем сервере работает простая модель <code>vosk-model-small-ru-0.22</code>.

После загрузки модели её нужно прописать в файле <code>.env</code>

Далее можно запускать docker compose

```
docker compose up -d
```

© 2023 mikeziminio