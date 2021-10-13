/**
 * Check locally.
 */
import { handler } from '../src/serverless';

main();

async function main() {
  const event = {
    httpMethod: 'POST',
    path: '',
    queryStringParameters: {},
    isBase64Encoded: false,
    body: JSON.stringify({ foo: 42 })
  };
  const res = await handler(event, {
    requestId: 'xxx',
    functionVersion: 'abc',
  });
  console.log(res);
}

