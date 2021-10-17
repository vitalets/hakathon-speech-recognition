export function replaceFileExtension(fileName: string, ext: string) {
  return fileName.replace(/\.[^.]+$/i, ext);
}

export function upperFirstLetter(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
