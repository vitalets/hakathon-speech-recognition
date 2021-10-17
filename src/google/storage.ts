import { Storage } from '@google-cloud/storage';
import { logger } from '../logger';
import { config } from '../config';

const storage = new Storage({ keyFilename: config.googleAuthFile });

export async function save(content: string | Buffer, fileName: string, cacheControl?: string) {
  logger.log(`Saving file: ${getInternalUrl(fileName)}`);
  const file = storage.bucket(config.googleBucket).file(fileName);
  await file.save(content);
  if (cacheControl) await file.setMetadata({ cacheControl });
  return file.publicUrl();
}

export async function download(fileName: string) {
  const file = storage.bucket(config.googleBucket).file(fileName);
  const [ buffer ] = await file.download();
  return buffer.toString('utf8');
}

export async function enableCors() {
  const [ cors ] = await storage.bucket(config.googleBucket).setCorsConfiguration([{
    maxAgeSeconds: 3600,
    method: [ 'GET', 'POST', 'PUT', 'DELETE' ],
    origin: [ '*' ],
    responseHeader: [ 'content-type' ],
  }]);

  return cors;
}

export function getInternalUrl(fileName: string) {
  return `gs://${config.googleBucket}/${fileName}`;
}
