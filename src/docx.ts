import { google } from '@google-cloud/speech/build/protos/protos';
import {
  Document,
  HeadingLevel,
  Paragraph,
  Packer,
  AlignmentType,
  TextRun,
  ShadingType,
  ExternalHyperlink,
  ParagraphChild,
  XmlComponent,
  OnOffElement,
} from 'docx';

import { replaceFileExtension, upperFirstLetter } from './utils';
import * as storage from './google/storage';

type IWordInfo = google.cloud.speech.v1p1beta1.IWordInfo;

const MIN_CONFIDENCE = 0.65;
const PLAYER_URL = 'https://mikavanko.github.io/hackathon/dist/player?file={file}&t={time}';

export interface SpeakerBlock {
  speakerTag: number;
  words: IWordInfo[];
}

export async function exportToDoc(fileName: string, words?: IWordInfo[]) {
  if (!words) {
    const content = await storage.download(replaceFileExtension(fileName, '.json'));
    words = JSON.parse(content) as IWordInfo[];
  }
  // todo: make class to not pull playerUrl through all functions
  const playerUrl = PLAYER_URL.replace('{file}', encodeURIComponent(replaceFileExtension(fileName, '.mp3')));
  const buffer = await buildDocx(words, playerUrl);
  return storage.save(buffer, replaceFileExtension(fileName, '.docx'), 'no-cache');
}

export function buildDocx(words: IWordInfo[], playerUrl: string) {
  const blocks = buildSpeakerBlocks(words);
  const children: Paragraph [] = [];
  blocks.forEach(({ speakerTag, words }) => {
    const speakerHeader = buildSpeakerHeader(speakerTag);
    const paragraph = buildParagraph(words, playerUrl);
    children.push(speakerHeader, paragraph);
  });
  const doc = new Document({
    sections: [{ children }]
  });
  doc.Settings.addChildElement(new DoNotExpandShiftReturn());
  return Packer.toBuffer(doc);
}

function buildSpeakerHeader(speakerTag: number) {
  return new Paragraph({
    text: `Спикер ${speakerTag}`,
    heading: HeadingLevel.HEADING_1,
  });
}

function buildParagraph(words: IWordInfo[], playerUrl: string) {
  const children: ParagraphChild[] = [];
  // eslint-disable-next-line complexity, max-statements
  words.forEach((wordInfo, i) => {
    const confidence = wordInfo.confidence || 1;
    let text = wordInfo.word || '';
    if (i === 0) {
      text = upperFirstLetter(text);
    } else {
      const prevWord = words[i - 1]?.word || '';
      if (/\.$/.test(prevWord)) {
        children.push(new TextRun({ text: '', break: 2 }));
      } else {
        children.push(new TextRun({ text: ' ' }));
      }
    }
    const child = confidence > MIN_CONFIDENCE
      ? new TextRun({ text })
      : buildMarkedText(text, wordInfo, playerUrl);
    children.push(child);
  });
  return new Paragraph({
    children,
    alignment: AlignmentType.JUSTIFIED,
  });
}

function buildMarkedText(text: string, wordInfo: IWordInfo, playerUrl: string) {
  return new ExternalHyperlink({
    children: [
      new TextRun({
        text,
        shading: {
          type: ShadingType.PERCENT_25,
          fill: 'FC8B73',
        }
        // style: 'Hyperlink'
      }),
    ],
    link: playerUrl.replace('{time}', String(wordInfo.startTime?.seconds || 0)),
  });
  // return new TextRun({
  //   text,
  //   shading: {
  //     type: ShadingType.PERCENT_25,
  //     fill: 'FF0000',
  //   }
  // });
}

// eslint-disable-next-line complexity, max-statements
export function buildSpeakerBlocks(words: IWordInfo[]) {
  const result: SpeakerBlock[] = [];
  let curSpeakerBlock: SpeakerBlock | undefined;
  for (const wordInfo of words) {
    let { word, speakerTag } = wordInfo;
    if (!word) continue;
    speakerTag = speakerTag || 0;
    if (!curSpeakerBlock) curSpeakerBlock = { speakerTag, words: [] };
    if (curSpeakerBlock.speakerTag !== speakerTag) {
      result.push(curSpeakerBlock);
      curSpeakerBlock = { speakerTag, words: [] };
    }
    curSpeakerBlock.words.push(wordInfo);
  }
  if (curSpeakerBlock) result.push(curSpeakerBlock);
  return result;
}

// see: https://github.com/dolanmiu/docx/discussions/1033
class DoNotExpandShiftReturn extends XmlComponent {
  constructor() {
    super('w:compat');
    this.root.push(new OnOffElement('w:doNotExpandShiftReturn', true));
  }
}
