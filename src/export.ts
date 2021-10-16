import { google } from '@google-cloud/speech/build/protos/protos';
import { Document, HeadingLevel, Paragraph, Packer, AlignmentType } from 'docx';
import { replaceFileExtension } from './utils';
import * as storage from './google/storage';

type IWordInfo = google.cloud.speech.v1p1beta1.IWordInfo;

export interface SpeakerBlock {
  speakerTag: number;
  words: string[];
}

export async function exportToDoc(fileName: string) {
  const content = await storage.download(replaceFileExtension(fileName, '.json'));
  const words = JSON.parse(content);
  const blocks = buildSpeakerBlocks(words);
  const buffer = await buildDocx(blocks);
  const url = await storage.save(buffer, replaceFileExtension(fileName, '.docx'));
  return { url };
}

// eslint-disable-next-line complexity, max-statements
function buildSpeakerBlocks(words: IWordInfo[]) {
  const result: SpeakerBlock[] = [];
  let curSpeakerBlock: SpeakerBlock | undefined;
  for (let { word, speakerTag } of words) {
    if (!word) continue;
    speakerTag = speakerTag || 0;
    if (!curSpeakerBlock) curSpeakerBlock = { speakerTag, words: [] };
    if (curSpeakerBlock.speakerTag !== speakerTag) {
      result.push(curSpeakerBlock);
      curSpeakerBlock = { speakerTag, words: [] };
    }
    curSpeakerBlock.words.push(word);
  }
  if (curSpeakerBlock) result.push(curSpeakerBlock);
  return result;
}

// function buildTxt(blocks: SpeakerBlock[]) {
//   return blocks.map(({ speakerTag, words }) => `[спикер ${speakerTag}]\n\n${words.join(' ')}`).join('\n\n');
// }

function buildDocx(blocks: SpeakerBlock[]) {
  const children: Paragraph[] = [];
  blocks.forEach(({ speakerTag, words }) => {
    children.push(new Paragraph({
      text: `Спикер ${speakerTag}`,
      heading: HeadingLevel.HEADING_2,
    }));
    children.push(new Paragraph({
      text: words.join(' '),
      alignment: AlignmentType.JUSTIFIED,
    }));
  });
  const doc = new Document({
    sections: [{ children }]
  });
  return Packer.toBuffer(doc);
}
