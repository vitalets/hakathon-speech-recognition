import { Storage } from '@google-cloud/storage';
import { config } from '../config';

const storage = new Storage({ keyFilename: config.googleAuthFile });

export async function enableCors() {
  const [ cors ] = await storage.bucket(config.googleBucket).setCorsConfiguration([{
    maxAgeSeconds: 3600,
    method: [ 'GET', 'POST', 'PUT', 'DELETE' ],
    origin: [ '*' ],
    responseHeader: [ 'content-type' ],
  }]);

  return cors;
}
