/**
 * Examples:
 * https://github.com/googleapis/nodejs-speech/blob/main/samples/betaFeatures.js
 */

/* eslint-disable @typescript-eslint/no-unused-vars */

import fs from 'fs';
import path from 'path';
import { v1p1beta1 } from '@google-cloud/speech';
import { google } from '@google-cloud/speech/build/protos/protos';
import { logger } from '../logger';
import { config } from '../config';
import * as mock from './mock';
import * as storage from './storage';
import { replaceFileExtension } from '../utils';
import { improveResult } from '../improve';
import { buildDocx } from '../export';

const { AudioEncoding } = google.cloud.speech.v1p1beta1.RecognitionConfig;
type ILongRunningRecognizeResponse = google.cloud.speech.v1p1beta1.ILongRunningRecognizeResponse;
type ILongRunningRecognizeMetadata = google.cloud.speech.v1p1beta1.ILongRunningRecognizeMetadata;

const client = new v1p1beta1.SpeechClient({ keyFilename: config.googleAuthFile });

/**
 * See: https://cloud.google.com/speech-to-text/docs/reference/rest/v1p1beta1/speech/longrunningrecognize
 */
// eslint-disable-next-line max-statements
export async function startRecognition(fileName: string) {
  if (!fileName) throw new Error(`Empty file`);
  const inputConfig = buildRecognitionConfig();
  const uri = storage.getInternalUrl(fileName);
  const audio = { uri };
  // dont use outputConfig, because it saves times not in protobuf.Duration!
  // { seconds: "6", nanos: 200000000 } -> "6.200s"
  const request = { audio, config: inputConfig };
  logger.log(`Starting recognize: ${uri}`);
  const [ operation ] = config.googleUseMocks
    ? await mock.longRunningRecognize()
    : await client.longRunningRecognize(request);
  const { error, name } = operation;
  if (error) throw new Error(error.message);
  logger.log(`Operation id: ${name}`);
  return { operationId: name };
}

/**
 * See: https://github.com/googleapis/gax-nodejs/blob/main/client-libraries.md#long-running-operations
 */
export async function checkOperation(operationId: string) {
  if (!operationId) throw new Error(`Empty operationId`);
  logger.log(`Checking operation: ${operationId}`);
  const { done, result, error, metadata } = config.googleUseMocks
    ? await mock.checkLongRunningRecognizeProgress(operationId)
    : await client.checkLongRunningRecognizeProgress(operationId);
  logger.log(`Operation status: ${JSON.stringify({ done, error })}`);
  if (error) throw new Error(error.message);
  const { uri, progressPercent: percent } = metadata as ILongRunningRecognizeMetadata;
  const resultUrl = done ? await saveResult(result as ILongRunningRecognizeResponse, uri!) : '';
  return { done, percent, resultUrl };
}

function buildRecognitionConfig() {
  return {
    encoding: AudioEncoding.MP3,
    sampleRateHertz: 44100,
    languageCode: 'ru-RU',
    model: 'default',
    // maxAlternatives: 2,
    enableAutomaticPunctuation: true,
    enableSpeakerDiarization: true,
    enableWordConfidence: true,
  };
}

async function saveResult(result: ILongRunningRecognizeResponse, uri: string) {
  // Use last result (as it contains speakers)
  // See: https://github.com/googleapis/nodejs-speech/blob/b775dd15ba3a8fec8f86edfc5a4a95def452e65e/samples/betaFeatures.js#L115
  const lastResult = result.results![result.results!.length - 1];
  const words = lastResult.alternatives?.[0]?.words || [];
  const improvedWords = await improveResult(words);
  if (config.googleUseMocks) {
    // dev: для тестов на check всегда сохраняем docx
    // const buffer = await buildDocx(improvedWords);
    // await fs.promises.writeFile('data/test.docx', buffer);
    // dev: save improved json to storage
    //await saveFile(improvedWords, mock.getResultPublicUrl(), '.json');
    // dev: save improved json to disk
    // await fs.promises.writeFile('data/words.json', JSON.stringify(improvedWords, null, 2));
    return mock.getResultPublicUrl();
  }
  const [ resultUrl ] = await Promise.all([
    saveFile(improvedWords, uri, '.json'),
    saveFile(result, uri, ' (orig).json'),
  ]);
  return resultUrl;
}

async function saveFile(json: unknown, uri: string, ext: string) {
  const content = JSON.stringify(json, null, 2);
  const fileName = replaceFileExtension(path.basename(uri), ext);
  return storage.save(content, fileName, 'no-cache');
}
