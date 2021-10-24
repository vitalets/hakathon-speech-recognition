/**
 * Improve result (euristic)
 */

/* eslint-disable max-depth, @typescript-eslint/no-unused-vars */

import { google } from '@google-cloud/speech/build/protos/protos';
import Az from 'az';
import { buildSpeakerBlocks } from './docx';
import { lowerFirstLetter, upperFirstLetter } from './utils';
import { restorePunct } from './improve-punct';

type IWordInfo = google.cloud.speech.v1p1beta1.IWordInfo;

let initAzPromise: Promise<unknown> | undefined;

export async function improveResult(words: IWordInfo[]) {
  // words = words.slice(0, 2100);
  words = removeWasteWords(words);
  words = removeDuplicates(words);
  words = mergeShortSpeakerPhrase(words);
  words = await restorePunct(words);
  words = await upperCaseOrganizations(words);
  // words = addCommas(words);
  // words = addDotsByPause(words);
  words = upperCaseAfterDot(words);
  words = lowerCaseAfterComma(words);
  words = insertLastDot(words);
  return words;
}

/**
 * Если фраза спикера короткая, то цепляем ее к предыдущему спикеру.
 * Или если речь предыдущего спикера закончилась на предлоге.
 */
function mergeShortSpeakerPhrase(words: IWordInfo[]) {
  const MIN_SPEAKER_PHRASE_WORDS = 11;
  const speakerBlocks = buildSpeakerBlocks(words);
  const result = speakerBlocks[0].words.slice();
  for (let i = 1; i < speakerBlocks.length; i++) {
    const prevSpeakerTag = result[result.length - 1]?.speakerTag || undefined;
    const prevWord = result[result.length - 1]?.word;
    const shouldMerge = prevSpeakerTag !== undefined && [
      speakerBlocks[i].words.length < MIN_SPEAKER_PHRASE_WORDS,
      prevWord && prevWord?.length <= 2,
    ].some(Boolean);
    const words = shouldMerge
      ? speakerBlocks[i].words.map(word => ({ ...word, speakerTag: prevSpeakerTag }))
      : speakerBlocks[i].words;
    result.push(...words);
  }
  return result;
}

/**
 * Удаляем дубликаты слов (подряд и через 1)
 */
function removeDuplicates(words: IWordInfo[]) {
  const result: IWordInfo[] = [];
  for (let i = 0; i < words.length; i++) {
    const prevWords = result.slice(-3).reverse().map(w => w.word);
    const curWord = words[i]?.word;
    if (curWord === prevWords[0]) continue;
    if (curWord === prevWords[1] && prevWords[0] === prevWords[2]) {
      result.pop();
      continue;
    }
    result.push(words[i]);
  }
  return result;
}

async function upperCaseOrganizations(words: IWordInfo[]) {
  await initAz();
  words.forEach(w => {
    const word = String(w.word).replace(/[^а-яё-]/ig, '');
    const info = Az.Morph(word)?.[0];
    if (info?.tag?.Orgn && w.word) w.word = upperFirstLetter(w.word);
  });
  return words;
}

// function addCommas(words: IWordInfo[]) {
//   const commaBefore = [
//     /^что/,
//     /^котор(ый|ая|ое|ым|ому|ой|ом|ые|ого)/,
//   ];
//   for (let i = 1; i < words.length; i++) {
//     if (commaBefore.some(r => r.test(words[i].word || ''))) {
//       const prev = words[i - 1];
//       if (endsWithLetter(prev.word)) prev.word = `${prev.word},`;
//     }
//   }
//   return words;
// }

// function addDotsByPause(words: IWordInfo[]) {
//   const MIN_PAUSE = 2; // seconds
//   for (let i = 1; i < words.length; i++) {
//     const prev = words[i - 1];
//     const pause = calcPause(words, i);
//     if (pause >= MIN_PAUSE && endsWithLetter(prev.word)) {
//       prev.word = `${prev.word}.`;
//     }
//   }
//   return words;
// }

function upperCaseAfterDot(words: IWordInfo[]) {
  for (let i = 1; i < words.length; i++) {
    const prev = words[i - 1];
    if (/\.$/.test(prev.word || '')) {
      const cur = words[i];
      if (cur.word) cur.word = upperFirstLetter(cur.word);
    }
  }
  return words;
}

function lowerCaseAfterComma(words: IWordInfo[]) {
  for (let i = 1; i < words.length; i++) {
    const prev = words[i - 1];
    if (/,$/.test(prev.word || '')) {
      const cur = words[i];
      if (cur.word) cur.word = lowerFirstLetter(cur.word);
    }
  }
  return words;
}

function insertLastDot(words: IWordInfo[]) {
  const lastWord = words[words.length - 1];
  if (endsWithLetter(lastWord.word)) {
    lastWord.word = `${lastWord.word}.`;
  }
  return words;
}

/**
 * Удаляем "-", т.к. это мешает потом сопоставлять слова
 */
function removeWasteWords(words: IWordInfo[]) {
  return words.filter(w => w.word && w.word !== '-');
}

function endsWithLetter(word?: string | null): word is string {
  return typeof word === 'string' && /[^.,?!-]$/i.test(word);
}

function calcPause(words: IWordInfo[], index: number) {
  return getSeconds(words[index].startTime) - getSeconds(words[index - 1].endTime);
}

function getSeconds(time: IWordInfo['startTime']) {
  return Number(time?.seconds || '0') + (time?.nanos || 0) / 1000000000;
}

async function initAz() {
  return initAzPromise || (initAzPromise = new Promise(resolve => Az.Morph.init(resolve)));
}
