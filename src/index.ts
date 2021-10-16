/**
 * Logic entry
 */
import { startRecognition, checkOperation } from './google/speech';
import { exportToDoc } from './export';
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
  {
    method: 'POST',
    action: 'export',
    handler: (query: ReqInfo['query']) => exportToDoc(query.file)
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
