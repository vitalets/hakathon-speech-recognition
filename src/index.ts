/**
 * Serverless function invoke.
 */
import { Handler, HttpRequest, sendJson, Context } from 'yandex-cloud-fn';
import { handleRequest } from './routes';
import { logger } from './logger';

export interface ReqInfo {
  requestId: string;
  version: string;
  method: string;
  query: Record<string, string>;
  iamToken: string;
}

export const handler: Handler<HttpRequest> = async (event, context) => {
  const reqInfo = getRequestInfo(event, context);
  logRequest(reqInfo);
  const resBody = await handleRequest(reqInfo);
  logResponse(resBody);
  return sendJson(resBody);
};

function getRequestInfo(event: HttpRequest, context: Context): ReqInfo {
  const query = event.queryStringParameters || {};
  const { requestId, token, functionVersion } = context;
  return {
    requestId,
    version: functionVersion,
    method: event.httpMethod,
    query,
    iamToken: token?.access_token || '',
  };
}

function logRequest(reqInfo: ReqInfo) {
  logger.log(`REQUEST: ${JSON.stringify(reqInfo)}`);
}

function logResponse(resBody: unknown) {
  logger.log(`RESPONSE: ${JSON.stringify(resBody).substr(0, 150)}`);
}
