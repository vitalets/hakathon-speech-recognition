import fs from 'fs';
import { google } from '@google-cloud/speech/build/protos/protos';
import { changeFileExtension } from './utils';

type IWordInfo = google.cloud.speech.v1p1beta1.IWordInfo;

export async function exportToDoc(words: IWordInfo[], fileName: string) {
  const text = buildText(words);
  const filePath = `data/${changeFileExtension(fileName, '.txt')}`;
  await fs.promises.writeFile(filePath, text);
  return { filePath };
}

function buildText(words: IWordInfo[]) {
  const result: string[] = [];
  let curSpeakerTag: IWordInfo['speakerTag'];
  words.forEach(({ word, speakerTag }) => {
    if (!word) return;
    if (curSpeakerTag !== speakerTag) result.push(`\n\n[cпикер ${speakerTag}]\n\n`);
    result.push(word);
    curSpeakerTag = speakerTag;
  });
  return result.join(' ');
}
