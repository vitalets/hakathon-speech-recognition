/// <reference types="../src/externals" />

process.env.LOG_LEVEL = process.env.LOG_LEVEL || 'warn';

import assert from 'assert';
import { config } from '../src/config';
import { handler } from '../src';

config.googleUseMocks = true;

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
  queryStringParameters: Record<string, string> = {}
) {
  const event = {
    httpMethod,
    queryStringParameters,
    isBase64Encoded: false,
  };
  const res = await (handler as any)(event, {
    requestId: 'xxx',
    functionVersion: 'abc',
  });
  return JSON.parse(res.body);
}
