export type ServerlessEvent = ServerlessHttpEvent;

export interface ServerlessHttpEvent {
  httpMethod: string;
  path: string;
  queryStringParameters: Record<string, string>;
  body: string;
  isBase64Encoded: boolean;
}

export interface ServerlessContext {
  requestId: string;
  functionVersion: string;
  token?: {
    access_token: string;
  }
}

export interface ReqInfo {
  requestId: string;
  version: string;
  path: string;
  query: Record<string, string>;
  iamToken: string;
}
