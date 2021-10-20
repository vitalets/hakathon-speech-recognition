import path from 'path';
import { replaceFileExtension } from '../utils';
import * as storage from './storage';

export function getResultPublicUrl() {
  return 'https://storage.googleapis.com/hakathon/5. Совещание по развитию искусственного интеллекта.json';
}

export async function longRunningRecognize() {
  return [ { name: `fake-id-${Date.now()}`, error: null } ];
}

export async function checkLongRunningRecognizeProgress(operationId: string) {
  const matches = operationId.match(/(\d+)/);
  const startTime = matches ? Number(matches[1]) : 0;
  const progressDuration = 5 * 1000;
  const done = startTime ? (Date.now() - startTime) > progressDuration : false;
  const progressPercent = done ? 100 : Math.round(100 * (Date.now() - startTime) / progressDuration);
  const result = done ? await getOrigResult() : null;
  return {
    done,
    error: null,
    metadata: {
      progressPercent,
      uri: ''
    },
    result,
  };
}

async function getOrigResult() {
  const origResultFileName = replaceFileExtension(path.basename(getResultPublicUrl()), ' (orig).json');
  const content = await storage.download(origResultFileName);
  return JSON.parse(content);
}
