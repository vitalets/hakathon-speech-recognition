/**
 * Serverless function invoke.
 */
import { handleRequest } from '..';
import { logger } from '../logger';
import { ServerlessContext, ServerlessEvent, ServerlessHttpEvent, ReqInfo } from './types';

export async function handler(event: ServerlessEvent, slsContext: ServerlessContext) {
  const reqInfo = getRequestInfo(event, slsContext);
  logRequest(reqInfo);
  //const resBody = await handleRequest(reqInfo, reqBody);
  const resBody = await handleRequest(reqInfo);
  logResponse(resBody);
  return buildHttpResponse(resBody);
}

// function getRequestBody(event: ServerlessEvent): unknown {
//   if (isHttpRequest(event) && event.body) {
//     const { body, isBase64Encoded } = event;
//     const decodedBody = isBase64Encoded ? decodeBase64(body) : body;
//     try {
//       return JSON.parse(decodedBody);
//     } catch (e) {
//       throw new Error(`Invalid json: ${decodedBody}`);
//     }
//   } else {
//     throw new Error(`Unknown invocation: ${JSON.stringify(event)}`);
//   }
// }

function getRequestInfo(event: ServerlessEvent, slsContext: ServerlessContext): ReqInfo {
  const query = isHttpRequest(event) ? (event.queryStringParameters || {}) : {};
  const { requestId, token, functionVersion } = slsContext;
  return {
    requestId,
    version: functionVersion,
    method: event.httpMethod,
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

// function decodeBase64(s: string) {
//   return Buffer.from(s, 'base64').toString('utf8');
// }

function logRequest(reqInfo: ReqInfo) {
  logger.log(`REQUEST: ${JSON.stringify(reqInfo)}`);
}
function logResponse(resBody: unknown) {
  logger.log(`RESPONSE: ${JSON.stringify(resBody).substr(0, 150)}`);
}
