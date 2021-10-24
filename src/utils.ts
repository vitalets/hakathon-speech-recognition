export function replaceFileExtension(fileName: string, ext: string) {
  return fileName.replace(/\.[^.]+$/i, ext);
}

export function upperFirstLetter(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function lowerFirstLetter(s: string) {
  return s.charAt(0).toLowerCase() + s.slice(1);
}

export function splitOnChunks<T>(arr: T[], chunksCount: number) {
  const size = Math.ceil(arr.length / chunksCount);
  const result = [];
  let start = 0;
  while (start < arr.length) {
    const end = start + size;
    result.push(arr.slice(start, end));
    start = end;
  }
  return result;
}
