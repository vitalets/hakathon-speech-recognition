// /**
//  * Entry
//  */
// import fs from 'fs';
// import path from 'path';
// import fetch from 'node-fetch';
// import { S3Client, ListObjectsCommand, PutObjectCommand } from '@aws-sdk/client-s3';

// // bucket: https://console.cloud.yandex.ru/folders/b1gbbj1k3qqeshcm0ccd/storage/buckets/hakathon

// // const { YC_API_KEY } = process.env;
// import { YC_API_KEY, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY } from '../../.env.js';
// import { LongRunningRecognizeOperation, LongRunningRecognizeResponse } from './types.js';

// // const AUDIO_FILE = '33-fragment.opus';
// // const AUDIO_FILE = '33-fragment-1-channel.opus';
// const AUDIO_FILE = '33. Форум знание как искусственный интелл (mono).opus';

// main();

// async function main() {
//   // const res = await recognizeShort('speech.opus');
//   //const res = await uploadToStorage(`data/${AUDIO_FILE}`);
//   //const res = await recognizeLong(`https://storage.yandexcloud.net/hakathon/${AUDIO_FILE}`);
//   //const res = await checkOperation('e03o2mkclas4tfs04ven');
//   const { default: res } = await import(`../data/${AUDIO_FILE.replace('.opus', '.json')}`);
//   saveText(res);
//   //saveJson(res);
//   //console.log(JSON.stringify(res.done, null, 2));
// }

// /**
//  * See: https://cloud.yandex.ru/docs/speechkit/stt/request
//  */
// async function recognizeShort(file: string) {
//   const url = 'https://stt.api.cloud.yandex.net/speech/v1/stt:recognize';
//   return fetchJson(url, {
//     method: 'post',
//     headers: {
//       'Authorization': `Api-Key ${YC_API_KEY}`
//     },
//     body: fs.readFileSync(file)
//   });
// }

// /**
//  * See: https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3/index.html
//  */
// async function uploadToStorage(file: string) {
//   const client = new S3Client({
//     region: 'ru-central1',
//     endpoint: 'https://storage.yandexcloud.net',
//     credentials: {
//       accessKeyId: AWS_ACCESS_KEY_ID,
//       secretAccessKey: AWS_SECRET_ACCESS_KEY,
//     }
//   });
//   const command = new PutObjectCommand({
//     Bucket: 'hakathon',
//     Key: path.basename(file),
//     Body: fs.createReadStream(file),
//   });
//   const response = await client.send(command);
//   return response;
// }

// /**
//  *
//  */
// async function recognizeLong(audioUri: string) {
//   const url = 'https://transcribe.api.cloud.yandex.net/speech/stt/v2/longRunningRecognize';
//   return fetchJson(url, {
//     method: 'post',
//     headers: {
//       'Authorization': `Api-Key ${YC_API_KEY}`,
//       'Content-type': 'application/json',
//     },
//     body: JSON.stringify({
//       config: {},
//       audio: {
//         uri: audioUri
//       }
//     })
//   });
// }

// async function checkOperation(operationId: string) {
//   const url = `https://operation.api.cloud.yandex.net/operations/${operationId}`;
//   return fetchJson(url, {
//     method: 'get',
//     headers: {
//       'Authorization': `Api-Key ${YC_API_KEY}`,
//     },
//   });
// }

// async function fetchJson(url: string, options: Parameters<typeof fetch>[1]) {
//   const res = await fetch(url, options);
//   if (res.ok) {
//     return res.json();
//   } else {
//     throw new Error(`Status ${res.status} ${await res.text()}`);
//   }
// }

// function saveJson(data: unknown) {
//   const content = JSON.stringify(data, null, 2);
//   fs.writeFileSync(`data/${AUDIO_FILE.replace('.opus', '.json')}`, content);
// }

// function saveText(operation: LongRunningRecognizeOperation) {
//   const chunks = operation.response.chunks.map(chunk => {
//     if (chunk.alternatives.length > 1) console.log('WARN: Many alternatives:', chunk);
//     const { text, confidence, words } = chunk.alternatives[0];
//     if (confidence !== 1) console.log('WARN: Confidence != 1', chunk.alternatives[0]);
//     words.forEach(word => {
//       if (word.confidence !== 1) console.log('WARN: Word confidence != 1', word);
//     });
//     return text;
//   });
//   const content = chunks.join('\n');
//   fs.writeFileSync(`data/${AUDIO_FILE.replace('.opus', '.txt')}`, content);
// }
