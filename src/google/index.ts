/**
 * Examples:
 * https://github.com/googleapis/nodejs-speech/blob/main/samples/betaFeatures.js
 *
 */
import { v1p1beta1 } from '@google-cloud/speech';
import { google } from '@google-cloud/speech/build/protos/protos';
import { logger } from '../logger';
import { config } from '../config';
import mockResult from './mock-response.json';
import { changeFileExtension } from '../utils';

const { AudioEncoding } = google.cloud.speech.v1p1beta1.RecognitionConfig;
type ILongRunningRecognizeResponse = google.cloud.speech.v1p1beta1.ILongRunningRecognizeResponse;
type ILongRunningRecognizeMetadata = google.cloud.speech.v1p1beta1.ILongRunningRecognizeMetadata;

const BUCKET = config.googleBucket;
const client = new v1p1beta1.SpeechClient({ keyFilename: config.googleAuthFile });

/**
 * See: https://cloud.google.com/speech-to-text/docs/reference/rest/v1p1beta1/speech/longrunningrecognize
 * @param uri e.g. gs://bucket/audio.mp3
 */
// eslint-disable-next-line max-statements
export async function startRecognition(fileName: string) {
  if (!fileName) throw new Error(`Empty file`);
  const inputConfig = buildRecognitionConfig();
  const uri = getStorageUrl(fileName);
  const audio = { uri };
  const outputConfig = { gcsUri: getStorageUrl(changeFileExtension(fileName, '.json')) };
  const request = { audio, config: inputConfig, outputConfig };
  logger.log(`Starting recognize: ${uri}`);
  const [ operation ] = config.googleUseMocks
    ? await mockLongRunningRecognize()
    : await client.longRunningRecognize(request);
  const { error, name } = operation;
  if (error) throw new Error(error.message);
  logger.log(`Operation id: ${name}`);
  return {
    operationId: name,
  };
}

/**
 * See: https://github.com/googleapis/gax-nodejs/blob/main/client-libraries.md#long-running-operations
 */
export async function checkOperation(operationId: string) {
  if (!operationId) throw new Error(`Empty operationId`);
  logger.log(`Checking operation: ${operationId}`);
  const { done, result, error, metadata } = config.googleUseMocks
    ? await mockCheckLongRunningRecognizeProgress(operationId)
    : await client.checkLongRunningRecognizeProgress(operationId);
  logger.log(`Operation status: ${JSON.stringify({ done, error })}`);
  if (error) throw new Error(error.message);
  const percent = (metadata as ILongRunningRecognizeMetadata).progressPercent;
  const words = done
    // See: https://github.com/googleapis/nodejs-speech/blob/b775dd15ba3a8fec8f86edfc5a4a95def452e65e/samples/betaFeatures.js#L115
    ? (result as ILongRunningRecognizeResponse).results?.pop()?.alternatives![0].words
    : [];
  return { done, percent, words };
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

function getStorageUrl(fileName: string) {
  return `gs://${BUCKET}/${fileName}`;
}

async function mockLongRunningRecognize() {
  return [ { name: `fake-id-${Date.now()}`, error: null } ];
}

async function mockCheckLongRunningRecognizeProgress(operationId: string) {
  const matches = operationId.match(/(\d+)/);
  const startTime = matches ? Number(matches[1]) : 0;
  const progressDuration = 5 * 1000;
  const done = startTime ? (Date.now() - startTime) > progressDuration : false;
  return {
    done,
    error: null,
    metadata: {
      progressPercent: done ? 100 : 42,
    },
    result: done ? mockResult : null,
  };
}
