/**
 * Cloud function to convert mp3 to opus.
 */

import { Handler, YmqRequest } from 'yandex-cloud-fn';
import { logger } from '../logger';

export const handler: Handler<YmqRequest> = async event => {
  logger.log('got ymq req', event);
  // echo request body to response
  // return sendJson({ reqBody });
};
