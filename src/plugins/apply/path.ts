import * as Y from 'yjs';
import { Path } from 'slate';

// Locate the YEl or YText based on Slate path
const locateY = (ydocNodes: Y.Array<any>, path: Path) => {
  // const path = op.path;
  let initial = ydocNodes;
  return path.reduce((target: any, curPathIdx: number) => {
    if (!target || !target.toArray) {
      throw new Error(`path ${curPathIdx} does not match ydoc hierarchy `);
    }
    const yEls = target.toArray();
    return yEls[curPathIdx];
  }, initial);
};

// Locate the parent YEl based on current Slate path
const locateYParent = (ydocNodes: Y.Array<any>, path: Path) => {
  // Path.parent(path)
  return locateY(ydocNodes, Path.parent(path));
};

export { locateY, locateYParent };
