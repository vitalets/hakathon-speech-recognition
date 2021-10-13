/**
 * Serverless function invoke.
 */
import { handleRequest } from '..';
import { logger } from '../logger';
import { ServerlessContext, ServerlessEvent, ServerlessHttpEvent, ReqInfo } from './types';

export async function handler(event: ServerlessEvent, slsContext: ServerlessContext) {
  const reqInfo = getRequestInfo(event, slsContext);
  const reqBody = getRequestBody(event);
  logRequest(reqInfo, reqBody);
  //const resBody = await handleRequest(reqInfo, reqBody);
  const resBody = await handleRequest();
  logResponse(resBody);
  return buildHttpResponse(resBody);
}

function getRequestBody(event: ServerlessEvent): unknown {
  if (isHttpRequest(event)) {
    const { body, isBase64Encoded } = event;
    if (!body) return body;
    const decodedBody = isBase64Encoded ? decodeBase64(body) : body;
    try {
      return JSON.parse(decodedBody);
    } catch (e) {
      throw new Error(`Invalid json: ${decodedBody}`);
    }
  } else {
    throw new Error(`Unknown invocation: ${JSON.stringify(event)}`);
  }
}

function getRequestInfo(event: ServerlessEvent, slsContext: ServerlessContext): ReqInfo {
  const query = isHttpRequest(event) ? (event.queryStringParameters || {}) : {};
  const { requestId, token, functionVersion } = slsContext;
  return {
    requestId,
    version: functionVersion,
    path: event.path,
    query,
    iamToken: token?.access_token || '',
  };
}

function isHttpRequest(event: ServerlessEvent): event is ServerlessHttpEvent {
  return Boolean((event as ServerlessHttpEvent).httpMethod);
}

function buildHttpResponse(json: unknown) {
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
    },
    isBase64Encoded: false,
    body: JSON.stringify(json),
  };
}

function decodeBase64(s: string) {
  return Buffer.from(s, 'base64').toString('utf8');
}

function logRequest(reqInfo: ReqInfo, reqBody: unknown) {
  logger.log(`REQUEST: ${JSON.stringify(reqInfo)} Body: ${JSON.stringify(reqBody)}`);
}
function logResponse(resBody: unknown) {
  logger.log(`RESPONSE: ${JSON.stringify(resBody)}`);
}
