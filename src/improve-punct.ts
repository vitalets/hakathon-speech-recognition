/*
curl -X 'POST' \
  'http://punct.toys.dialogic.digital/restore-punct' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{"text": "Привет как дела"}'
*/

import fetch from 'node-fetch';
import { google } from '@google-cloud/speech/build/protos/protos';
import { splitOnChunks } from './utils';
import { logger } from './logger';

type IWordInfo = google.cloud.speech.v1p1beta1.IWordInfo;

const PUNCT_API_URL = 'http://punct.toys.dialogic.digital/restore-punct';
const PUNCT_API_CHUNKS = 5;

export async function restorePunct(words: IWordInfo[]) {
  logger.log(`Restoring punct (${PUNCT_API_CHUNKS} chunks)...`);
  const chunks = splitOnChunks(words, PUNCT_API_CHUNKS);
  const tasks = chunks.map(chunk => restorePunctChunk(chunk));
  const restoredChunks = await Promise.all(tasks);
  const restoredWords = restoredChunks.flat();
  return updateWords(words, restoredWords);
}

async function restorePunctChunk(words: IWordInfo[]) {
  const text = words.join(' ');
  const headers = { 'Content-Type': 'application/json' };
  const method = 'post';
  const body = JSON.stringify({ text });
  const res = await fetch(PUNCT_API_URL, { method, headers, body });
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  const { restored } = await res.json() as { restored: string };
  return restored
    .replace(/- -/g, '-') // replace "- -" -> "-" (to avoid extra words)
    .replace(/ - /g, '. ') // replace " - " -> ". " (to avoid extra words)
    .split(' ');
}

function updateWords(words: IWordInfo[], restoredWords: string[]) {
  // todo: dont be so strict!
  if (words.length !== restoredWords.length) {
    throw new Error(`Words length does not equal (${words.length}, ${restoredWords.length})`);
  }
  for (let i = 0; i < words.length; i++) {
    const word = words[i].word;
    if (word && restoredWords[i].startsWith(word)) {
      words[i].word = restoredWords[i];
    }
  }
  return words;
}
