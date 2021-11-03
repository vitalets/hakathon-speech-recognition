# hakathon-speech-recognition

Бэкенд для задачи [СИСТЕМА АВТОПРОТОКОЛИРОВАНИЯ КОНФЕРЕНЦИЙ В ОНЛАЙН РЕЖИМЕ](https://leaders2021.innoagency.ru/08/).

Команда: **Voice Team**

## Архитектура и схема работы
1. Клиент загружает аудиофайл [напрямую](https://github.com/mikavanko/mikavanko.github.io/blob/84730b4b74c6d41c6c56292ced5f655439014e17/hackathon/src/components/Form.vue#L2) в Google Storage (бэкенд не участвует)
2. После загрузки клиент вызывает на бэкенде функцию [startRecognition](https://github.com/vitalets/hakathon-speech-recognition/blob/e72031e9d491dec82ae3e314852f1e389eaf1449/src/google/speech.ts#L30), передав имя файла для распознавания. В ответ получает `operationId`.
3. Имея `operationId`, клиент запускает цикл проверки статуса операции - раз в секунду вызывает функцию [checkOperation](https://github.com/vitalets/hakathon-speech-recognition/blob/e72031e9d491dec82ae3e314852f1e389eaf1449/src/google/speech.ts#L51). В ответ получает статус и процент распознавания.
4. Когда распознавание завершено, бэкенд получает [массив слов](https://storage.googleapis.com/hakathon/5.%20Совещание%20по%20развитию%20искусственного%20интеллекта.json) и производит несколько автоматических улучшений - файл [src/improve.ts](https://github.com/vitalets/hakathon-speech-recognition/blob/e72031e9d491dec82ae3e314852f1e389eaf1449/src/improve.ts#L17):
  - удаление мусора
  - расстановка пунктуации (отдельный [микросервис](https://github.com/avidale/Punctuation))
  - корректировка разбивки по спикерам
  - корректировка верхнего/нижнего регистра
5. После улучшений бэкенд формирует docx документ, разбивая по спикерам и помечая цветом фразы с низким уровнем уверенности - файл [src/docx.ts](https://github.com/vitalets/hakathon-speech-recognition/blob/e72031e9d491dec82ae3e314852f1e389eaf1449/src/docx.ts#L40). Созданный docx загружается на Google Storage, а ссылка отдается клиенту.
6. Клиент показывает пользователю ссылку для скачивания.
