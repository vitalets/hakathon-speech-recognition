
export function getResultPublicUrl() {
  return 'https://storage.googleapis.com/hakathon/recognition-result.json';
}

export async function longRunningRecognize() {
  return [ { name: `fake-id-${Date.now()}`, error: null } ];
}

export async function checkLongRunningRecognizeProgress(operationId: string) {
  const matches = operationId.match(/(\d+)/);
  const startTime = matches ? Number(matches[1]) : 0;
  const progressDuration = 5 * 1000;
  const done = startTime ? (Date.now() - startTime) > progressDuration : false;
  const progressPercent = done ? 100 : Math.round(100 * (Date.now() - startTime) / progressDuration);
  const result = done ? await import('./recognition-result.json') : null;
  return {
    done,
    error: null,
    metadata: {
      progressPercent,
      uri: 'gs://hakathon/recognition-result.mp3'
    },
    result,
  };
}
