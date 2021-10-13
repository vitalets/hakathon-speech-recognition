process.env.LOG_LEVEL = process.env.LOG_LEVEL || 'warn';

import assert from 'assert';
import { handler } from '../src/serverless';

type Assert = typeof assert.strict;
type CallHandler = typeof callHandler;

declare global {
  const assert: Assert;
  const callHandler: CallHandler;
}

Object.assign(global, {
  assert: assert.strict,
  callHandler,
});

async function callHandler(
  httpMethod: string,
  path: string,
  query?: Record<string, string>,
  body?: Record<string, unknown>
) {
  const event = {
    httpMethod,
    path,
    queryStringParameters: query || {},
    isBase64Encoded: false,
    body: body ? JSON.stringify(body) : '',
  };
  const res = await handler(event, {
    requestId: 'xxx',
    functionVersion: 'abc',
  });
  return JSON.parse(res.body);
}
