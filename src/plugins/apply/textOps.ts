import { Editor, TextOperation } from 'slate';
import * as Y from 'yjs';

import { locateY } from './path';

const insertText = (editor: Editor, op: TextOperation) => {
  const ytext: any = locateY(editor.ydocNodes, op.path);
  if (!ytext || !(ytext instanceof Y.Text)) {
    console.log(`can not insert text into unmatched node`);
    return;
  }
  // console.log(`insert into YText at ${op.offset}`);
  ytext.insert(op.offset, op.text);
  console.log(`after insert:`, ytext.toString(), ytext.toDelta().attributes);
};
