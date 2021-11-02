/**
 * Logic entry
 */
import { startRecognition, checkOperation } from './google/speech';
import { exportToDoc } from './docx';
import { ReqInfo } from '.';

interface Route {
  method: string;
  action: string;
  handler: (query: ReqInfo['query']) => Promise<Record<string, unknown>>;
}

const routes: Route[] = [
  {
    method: 'POST',
    action: 'recognize',
    handler: query => startRecognition(query.file)
  },
  {
    method: 'GET',
    action: 'check',
    handler: query => checkOperation(query.operationId)
  },
  {
    method: 'POST',
    action: 'export',
    handler: async query => {
      const url = await exportToDoc(query.file);
      return { url };
    }
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
