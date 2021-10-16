/**
 * Logic entry
 */
import { startRecognition, checkOperation } from './google';
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
    handler: (query: ReqInfo['query']) => exportHandler(query.operationId, query.file)
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

// todo: fetch from static
async function exportHandler(operationId: string, file: string) {
  const { done, words } = await checkOperation(operationId);
  if (!done) throw new Error('Operation not done.');
  return exportToDoc(words!, file);
}
