/**
 * Logic entry
 */
import { startRecognition, checkOperation } from './google';
import { ReqInfo } from './serverless/types';

const routes = [
  {
    method: 'POST',
    action: 'recognize',
    handler: (query: ReqInfo['query']) => startRecognition(query.file)
  },
  {
    method: 'GET',
    action: 'check',
    handler: (query: ReqInfo['query']) => checkOperation(query.operationId)
  },
];

export async function handleRequest({ method, query }: ReqInfo) {
  const { action } = query;
  for (const route of routes) {
    if (route.method === method && route.action === action) {
      return route.handler(query);
    }
  }
  throw new Error(`No route for: method=${method} action=${action}`);
}
