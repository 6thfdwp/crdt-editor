import { NodeOperation } from 'slate';
import * as Y from 'yjs';

import { toSlatePath } from './path';

export const arrayEvent = (
  event: Y.YArrayEvent<Y.XmlElement>
): NodeOperation[] => {
  const eventTargetPath = toSlatePath(event.path);

  const createOpMatter = (type: 'insert_node' | 'remove_node') => (
    item: Y.Item
  ): NodeOperation => {
    //
    const { content } = item;

    if (!(content instanceof Y.ContentType)) {
      throw new TypeError('Unknown content type in array operation');
    }
    const node = { type: '', children: [] };
    return { type, path: eventTargetPath, node };
  };

  const sortFunc = (a: NodeOperation, b: NodeOperation) =>
    a.path[a.path.length - 1] > b.path[b.path.length - 1] ? 1 : 0;

  const removeOps = Array.from(
    event.changes.deleted.values(),
    createOpMatter('remove_node')
  ).sort(sortFunc);
  const addOps = Array.from(
    event.changes.added.values(),
    createOpMatter('insert_node')
  ).sort(sortFunc);

  return [...removeOps, ...addOps];
};
