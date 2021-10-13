export type ServerlessEvent = ServerlessHttpEvent;

export interface ServerlessHttpEvent {
  httpMethod: string;
  queryStringParameters: Record<string, string>;
  isBase64Encoded: boolean;
  body?: string;
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
  method: string;
  query: Record<string, string>;
  iamToken: string;
}
