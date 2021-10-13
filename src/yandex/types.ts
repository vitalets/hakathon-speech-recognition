export interface LongRunningRecognizeOperation {
  id: string;
  done: boolean;
  response: LongRunningRecognizeResponse;
}

export interface LongRunningRecognizeResponse {
  '@type': string;
  chunks: Chunk[];
}

export interface Chunk {
  alternatives: Alternative[];
  channelTag: string;
}

export interface Alternative {
  words: Word[];
  text: string;
  confidence: number;
}

export interface Word {
  startTime: string;
  endTime: string;
  word: string;
  confidence: number;
}
