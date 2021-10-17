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
} from 'docx';
import { replaceFileExtension } from './utils';
import * as storage from './google/storage';

type IWordInfo = google.cloud.speech.v1p1beta1.IWordInfo;

const MIN_CONFIDENCE = 0.65;

export interface SpeakerBlock {
  speakerTag: number;
  words: IWordInfo[];
}

export async function exportToDoc(fileName: string) {
  const content = await storage.download(replaceFileExtension(fileName, '.json'));
  const words = JSON.parse(content);
  const blocks = buildSpeakerBlocks(words);
  const buffer = await buildDocx(blocks);
  // return { buffer, fileName: replaceFileExtension(fileName, '.docx') };
  const url = await storage.save(buffer, replaceFileExtension(fileName, '.docx'), 'no-cache');
  return { url };
}

// function buildTxt(blocks: SpeakerBlock[]) {
//   return blocks.map(({ speakerTag, words }) => `[спикер ${speakerTag}]\n\n${words.join(' ')}`).join('\n\n');
// }

function buildDocx(blocks: SpeakerBlock[]) {
  const children: Paragraph [] = [];
  blocks.forEach(({ speakerTag, words }) => {
    const speakerHeader = buildSpeakerHeader(speakerTag);
    const paragraph = buildParagraph(words);
    children.push(speakerHeader, paragraph);
  });
  const doc = new Document({
    sections: [{ children }]
  });
  return Packer.toBuffer(doc);
}

function buildSpeakerHeader(speakerTag: number) {
  return new Paragraph({
    text: `Спикер ${speakerTag}`,
    heading: HeadingLevel.HEADING_1,
  });
}

function buildParagraph(words: IWordInfo[]) {
  const children: ParagraphChild[] = [];
  words.forEach((wordInfo, i) => {
    if (i > 0) children.push(new TextRun({ text: ' ' }));
    const confidence = wordInfo.confidence || 1;
    const text = wordInfo.word || '';
    const child = confidence > MIN_CONFIDENCE
      ? new TextRun({ text })
      : buildMarkedText(text, wordInfo);
    children.push(child);
  });
  return new Paragraph({
    children,
    alignment: AlignmentType.JUSTIFIED,
  });
}

function buildMarkedText(text: string, wordInfo: IWordInfo) {
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
    link: `https://example.com?t=${wordInfo.startTime?.seconds || 0}`,
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
function buildSpeakerBlocks(words: IWordInfo[]) {
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
