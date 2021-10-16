import path from 'path';

export function changeFileExtension(fileName: string, ext: string) {
  return path.format({ ...path.parse(fileName), base: undefined, ext });
}
