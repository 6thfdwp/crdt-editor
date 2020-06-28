import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import {
  Editor,
  Node,
  Element,
  Path,
  Text,
  Range,
  Operation,
  TextOperation,
  SplitNodeOperation,
  InsertNodeOperation,
  RemoveNodeOperation,
  MergeNodeOperation,
} from 'slate';

// type SyncValue = Y.Array<Node>;
// type SyncDoc = Y.Map<{ children: SyncValue }>;

const initContent = [
  { type: 'heading.h1', children: [{ text: 'Great Heading' }] },
  {
    type: 'paragraph',
    children: [{ text: 'Start collaborating ' }, { text: 'SUPER', bold: true }],
  },
  {
    type: 'ul-list',
    children: [
      { type: 'list-item', children: [{ text: 'i1' }] },
      { type: 'list-item', children: [{ text: 'i2' }] },
    ],
  },
];
const _formYDoc_ = () => {
  const formELMap = (cnodes: any, attrs: { [key: string]: any }) => {
    const ylist = new Y.Array();
    ylist.push(cnodes);
    const ymap = new Y.Map();
    ymap.set('children', ylist);
    for (const k in attrs) {
      ymap.set(k, attrs[k]);
    }
    return ymap;
  };
  const formTextMap = (tnode: Text) => {
    // return new Y.Map(tnode);
    const ymap = new Y.Map();
    const { text: textString, ...attrs } = tnode;
    ymap.set('text', textString);
    for (const k in attrs) {
      ymap.set(k, attrs[k]);
    }
    return ymap;
  };

  const transformToYType = (node: Node) => {
    // if (!node.children) return;
    if (node.text) {
      return formTextMap(node as Text);
    }
    const { children, ...attrs } = node as Element;
    const cnodes: any = children.map((nchild) => transformToYType(nchild));
    return formELMap(cnodes, attrs);
  };

  return initContent.map((n) => transformToYType(n));
};

const formYDocNodes = (initContent: Node[]) => {
  const formYXmlEl = (
    childNodes: any, // (Y.XmlElement | Y.Text)[],
    type: string,
    attrs: { [key: string]: any }
  ) => {
    const yXmlEl = new Y.XmlElement(type);
    console.log(
      `[formYXmlEl] insert ${childNodes.length} childs under ${type}`
    );
    yXmlEl.insert(0, childNodes);
    for (const k in attrs) {
      yXmlEl.setAttribute(k, attrs[k]);
    }
    return yXmlEl;
  };
  const formYText = (tnode: Text) => {
    const { text: textString, ...attrs } = tnode;
    const ytext = new Y.Text();
    console.log(`[formYText] insert ${textString}`, attrs);
    ytext.insert(0, textString, attrs);

    return ytext;
  };
  //
  const transform = (node: Node) => {
    if (node.text) {
      return formYText(node as Text);
    }
    const { children, type, ...attrs } = node as Element;
    const childNodes: (Y.XmlElement | Y.Text)[] = children.map((c) =>
      transform(c)
    );
    return formYXmlEl(childNodes, type || 'ElType', attrs);
  };

  return initContent.map((n) => transform(n));
};

// export function withRTCollab<T extends Editor>(editor: T) {
export function withRTCollab(editor: Editor, initContent: Node[]) {
  const ydoc = new Y.Doc();
  // const ydocNodes = ydoc.getXmlFragment('sync-doc');
  const ydocNodes = ydoc.getArray<Y.XmlElement | Y.Text>('sync-doc');
  ydocNodes.push(formYDocNodes(initContent));
  console.log(JSON.stringify(ydocNodes, null, 2));
  editor.doc = ydocNodes.doc;
  editor.ydocNodes = ydocNodes;

  const { onChange } = editor;
  editor.onChange = () => {
    const ops = editor.operations;
    console.log('editor.onChange with ops count', ops.length);
    console.log(
      ops.map((op) => {
        const { type, path, ...others } = op;
        return { type, path, others: JSON.stringify(others) };
      })
    );
    // applySlateOps(editor, ops);

    onChange();
  };

  editor.receiveDoc = () => {};
  editor.receiveOperation = () => {};

  return editor;

  // const provider = new WebsocketProvider('wss://demos.yjs.dev', 'slate', ydoc);
  // provider
  // apply remote changes on slate and render
  // ylist.observe(function updateSlateState() => {})
}

const locate = (ydocNodes: Y.Array<any>, path: Path) => {
  // const path = op.path;
  let initial = ydocNodes;
  return path.reduce((target: any, curPathIdx: number) => {
    if (!target || !target.toArray) {
      throw new Error(`path ${curPathIdx} does not match ydoc`);
    }
    const arr = target.toArray();
    return arr[curPathIdx];
  }, initial);
};
const locateText = (editor: Editor, op: TextOperation) => {
  const doc = editor.ydocNodes.doc;
  // let noddeArr: any = ydocNodes.toArray();
  let parent: any = editor.ydocNodes;
  let target;
  // op.path.reduce();
  op.path.forEach((pv, idx) => {
    if (parent instanceof Y.Text) {
      console.log(`Fail to locate leaf text.`);
      return;
    }
    const arr = parent.toArray();
    // console.log(arr);
    target = arr[pv];
    parent = target;
  });
  console.log('Y.Text located: ', JSON.stringify(target));
  return target;
};

/**
 * Format bold:
 * split_node {path:[2,0], position:12}
 * split_node {path:[2,0], position:7}
 * set_selection {newProperties: {focus: {path: [2,1]}}, offset: 5 }
 * set_node {newProperties: {italic: true}}
 *
 */
const applySlateOps = (editor: Editor, ops: Operation[]) => {
  const insertText = (op: TextOperation) => {
    const ytext: any = locateText(editor, op);
    if (!ytext || !(ytext instanceof Y.Text)) {
      console.log(`can not insert text into unmatched node`);
      return;
    }
    console.log(`insert into YText at ${op.offset}`);
    ytext.insert(op.offset, op.text);
    console.log(`after insert:`, JSON.stringify(ytext));
  };
  const deleteText = (op: TextOperation) => {
    const ytext: any = locateText(editor, op);
    if (!ytext || !(ytext instanceof Y.Text)) {
      console.log(`can not delete text from unmatched node`);
      return;
    }
    console.log(`delete YText from ${op.offset}`);
    ytext.delete(op.offset, op.text.length);
  };

  const getParentPath = (curPath: Path) => {};

  /**
   * Insert break (at the end of line)
   * split_node {path:[1,1], position:5, properties: {bold}}
   * split_node {path:[1], position:2, target:5, type: 'p'}
   * Where target is set to the position of the deeper split node when splitting deeply.
   *
   * Insert break (at the beginning of line)
   * split_node {path:[2,0], position: 0}
   * split_node {path:[2], position: 1, target: 0, type: 'p'}
   * at the end
   * split_node {path:[2,0], position: 210}
   * split_node {path:[2], position: 1, target:210, type: 'p'}
   *
   * in the middle
   * split_node {path:[2,0], position: 14}
   * split_node {path:[2], position: 1, target: 14, prop: {type:'p'}}
   *
   * at the beginning and end can be seen as special case of split in the middle
   * where the first split is to splice the text based on position
   * the other split is to insert same el type filled with the second spliced text
   */
  const splitNode = (op: SplitNodeOperation) => {
    // figure out the parent path and path idx itself realted to its parent where split occurred
    const parentPath = getParentPath(op.path);
    locate(editor.ydocNodes, op.path);
  };

  editor.doc.transact(() => {
    ops.forEach((op) => {
      if (Operation.isTextOperation(op)) {
        if (op.type === 'insert_text') insertText(op);
        else if (op.type === 'remove_text') deleteText(op);
      } else {
        if (op.type === 'split_node') {
        } else if (op.type === 'insert_node') {
        }
      }
    });
  });
  // Y.applyUpdate;
};
