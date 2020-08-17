import { TextOperation } from 'slate';
import * as Y from 'yjs';
import { toSlatePath } from './path';

// Calculates the offset of a text item
const getOffset = (item: Y.Item): number => {
  if (!item.left) {
    return 0;
  }
  return (item.left.deleted ? 0 : item.left.length) + getOffset(item.left);
};

export const textEvents = (event: Y.YTextEvent): TextOperation[] => {
  const eventTargetPath = toSlatePath(event.path);
  const createOpMapper = (type: 'insert_text' | 'remove_text') => (
    item: Y.Item
  ): TextOperation => {
    const { content } = item;
    if (!(content instanceof Y.ContentString)) {
      throw new TypeError(`Unsupported content type ${item.content}`);
    }

    return {
      type: type,
      offset: getOffset(item),
      text: content.str,
      path: eventTargetPath,
    };
  };

  const removeOps = Array.from(
    event.changes.deleted.values(),
    createOpMapper('remove_text')
  );
  const insertOps = Array.from(
    event.changes.added.values(),
    createOpMapper('insert_text')
  );
  // .sort(sortFunc);
  return [...removeOps, ...insertOps];
};
