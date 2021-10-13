/**
 * Examples:
 * https://github.com/googleapis/nodejs-speech/blob/main/samples/betaFeatures.js
 *
 */
import { v1p1beta1 } from '@google-cloud/speech';
import { google } from '@google-cloud/speech/build/protos/protos';
import { logger } from '../logger';

const client = new v1p1beta1.SpeechClient({
  keyFilename: '.env.google.json'
});

/**
 * See: https://cloud.google.com/speech-to-text/docs/reference/rest/v1p1beta1/speech/longrunningrecognize
 * @param uri e.g. gs:/bucket/audio.mp3
 */
export async function recongize(uri: string) {
  const config = {
    encoding: google.cloud.speech.v1p1beta1.RecognitionConfig.AudioEncoding.MP3,
    sampleRateHertz: 44100,
    languageCode: 'ru-RU',
    model: 'default',
    maxAlternatives: 2,
    enableAutomaticPunctuation: true,
    enableSpeakerDiarization: true,
    enableWordConfidence: true,
  };

  const audio = { uri };
  const [ operation ] = await client.longRunningRecognize({ config, audio });
  logger.log(operation);

  //const [ response ] = await client.recognize(request);
  //const { default: response } = await import(`../${AUDIO_FILE.replace('.mp3', '.json')}`);
  // Note: https://github.com/googleapis/nodejs-speech/blob/b775dd15ba3a8fec8f86edfc5a4a95def452e65e/samples/betaFeatures.js#L115
  //console.log(JSON.stringify(response, null, 2))
  //saveJson(response);
  //saveText(response);
  // const transcription = response.results
  //   .map(result => result.alternatives[0].transcript)
  //   .join('\n');
  // console.log(`Transcription: ${transcription}`);
}
