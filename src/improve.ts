/**
 * Improve result (euristic)
 */
import { google } from '@google-cloud/speech/build/protos/protos';
import Az from 'az';
import { buildSpeakerBlocks } from './export';
import { upperFirstLetter } from './utils';

/* eslint-disable max-depth */

type IWordInfo = google.cloud.speech.v1p1beta1.IWordInfo;

let initAzPromise: Promise<unknown> | undefined;

export async function improveResult(words: IWordInfo[]) {
  words = removeDuplicates(words);
  words = await upperCaseOrganizations(words);
  words = mergeShortSpeakerPhrase(words);
  words = addCommas(words);
  words = addDotsByPause(words);
  words = upperCaseByDots(words);
  return words;
}

/**
 * Если фраза спикера короткая, то цепляем ее к предыдущему спикеру.
 */
function mergeShortSpeakerPhrase(words: IWordInfo[]) {
  const speakerBlocks = buildSpeakerBlocks(words);
  const result = speakerBlocks[0].words.slice();
  for (let i = 1; i < speakerBlocks.length; i++) {
    const prevSpeakerTag = result[result.length - 1]?.speakerTag || undefined;
    const words = prevSpeakerTag !== undefined && speakerBlocks[i].words.length <= 8
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

function addCommas(words: IWordInfo[]) {
  const commaBefore = [
    /^что/,
    /^котор(ый|ая|ое|ым|ому|ой|ом|ые|ого)/,
  ];
  for (let i = 1; i < words.length; i++) {
    if (commaBefore.some(r => r.test(words[i].word || ''))) {
      const prev = words[i - 1];
      if (endsWithLetter(prev.word)) prev.word = `${prev.word},`;
    }
  }
  return words;
}

function addDotsByPause(words: IWordInfo[]) {
  for (let i = 1; i < words.length; i++) {
    const prev = words[i - 1];
    const pause = calcPause(words, i);
    if (pause >= 1 && endsWithLetter(prev.word)) {
      prev.word = `${prev.word}.`;
    }
  }
  return words;
}

function upperCaseByDots(words: IWordInfo[]) {
  for (let i = 1; i < words.length; i++) {
    const prev = words[i - 1];
    if (/\.$/.test(prev.word || '')) {
      const cur = words[i];
      if (cur.word) cur.word = upperFirstLetter(cur.word);
    }
  }
  return words;
}

function endsWithLetter(word?: string | null): word is string {
  return typeof word === 'string' && /[^.,?]$/i.test(word);
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
