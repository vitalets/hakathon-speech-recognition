/**
 * Restore punctuation service.
 */
import fetch from 'node-fetch';
import { google } from '@google-cloud/speech/build/protos/protos';
import { splitOnChunks } from './utils';
import { logger } from './logger';
import { config } from './config';

/* eslint-disable max-statements, complexity, max-depth */

type IWordInfo = google.cloud.speech.v1p1beta1.IWordInfo;

const PUNCT_API_CHUNKS = 10;

export async function restorePunct(words: IWordInfo[]) {
  const chunks = splitOnChunks(words, PUNCT_API_CHUNKS);
  logger.log(`Restoring punct (${PUNCT_API_CHUNKS} chunks, per ${chunks[0].length} words)...`);
  const tasks = chunks.map(chunk => restorePunctChunk(chunk));
  const restoredChunks = await Promise.all(tasks);
  const restoredWords = getRestoredWords(restoredChunks.join(' '));
  return updateWords(words, restoredWords);
}

async function restorePunctChunk(words: IWordInfo[]) {
  const text = words.map(w => w.word).join(' ');
  const headers = { 'Content-Type': 'application/json' };
  const method = 'post';
  const body = JSON.stringify({ text });
  const res = await fetch(config.punctuationApi, { method, headers, body });
  if (!res.ok) throw new Error(`${res.status} ${await res.text()}`);
  const { restored } = await res.json() as { restored: string };
  return restored;
}

function getRestoredWords(restoredText: string) {
  return restoredText
    .replace(/ -- -/g, '-') // replace " -- -" -> "-" (to avoid extra words)
    .replace(/- -/g, '-') // replace "- -" -> "-" (to avoid extra words)
    .replace(/ - /g, '. ') // replace " - " -> ". " (to avoid extra words)
    .replace(/\.\./g, '.') // replace ".." -> "."
    .replace(/,,/g, ',') // replace ",," -> ","
    .split(' ');
}

function updateWords(words: IWordInfo[], restoredWords: string[]) {
  let j = 0;
  for (let i = 0; i < words.length; i++) {
    const word = words[i].word!;
    if (!restoredWords[j].startsWith(word)) {
      const msg = [
        `Error: Words not same: ${i} "${word}" != "${restoredWords[j]}"`,
        words.slice(i - 3, i + 3).map(w => w.word).join(' '),
        restoredWords.slice(i - 3, i + 3).join(' '),
      ].join('\n');
      logger.log(msg);
      // пытаемся найти слово даже при смещении индексов
      let found = false;
      for (let k = 1; k <= 4; k++) {
        if (restoredWords[j + k] && restoredWords[j + k].startsWith(word)) {
          j = j + k;
          found = true;
          logger.log(`Word indexes restored! i=${i}, j=${j}, word=${word}, restoredWord=${restoredWords[j + k]}`);
          break;
        }
      }
      if (!found) {
        j++;
        continue;
      }
    }
    words[i].word = restoredWords[j];
    j++;
  }
  return words;
}
