import { Path } from 'slate';
/**
 * Converts a YDoc path the a slate path
 *
 */
export const toSlatePath = (path: (string | number)[]): Path => {
  return path.filter((node) => typeof node === 'number') as Path;
};
