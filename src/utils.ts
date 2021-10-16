export function replaceFileExtension(fileName: string, ext: string) {
  return fileName.replace(/\.[^.]+$/i, ext);
}
