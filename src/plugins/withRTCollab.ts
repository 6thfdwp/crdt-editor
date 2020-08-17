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
  SetNodeOperation,
  NodeOperation,
  MoveNodeOperation,
} from 'slate';
import { withWebsocket } from './withWebSocket';
import { formYDocNodes, locateY, locateYParent } from './apply';
import { toSlateOps } from './convert';

// type SyncValue = Y.Array<Node>;
// type SyncDoc = Y.Map<{ children: SyncValue }>;

// export function withRTCollab<T extends Editor>(editor: T)
export function withRTCollab(editor: Editor, initContent: Node[]) {
  const ydoc = new Y.Doc();
  // ydoc.gc = false;
  // const ydocNodes = ydoc.getXmlFragment('sync-doc');
  const ydocNodes = ydoc.getArray<Y.XmlElement | Y.Text>('sync-doc');
  ydocNodes.push(formYDocNodes(initContent));

  editor.doc = ydocNodes.doc;
  editor.ydocNodes = ydocNodes;

  const { onChange } = editor;
  // apply Slate ops to Yjs doc on every change in editor
  editor.onChange = () => {
    const ops = editor.operations;
    if (!editor.isRemote) {
      console.log('editor.onChange with ops count', ops.length);
      console.log(
        ops.map((op) => {
          const { type, path, ...others } = op;
          return { type, path, others: JSON.stringify(others) };
        })
      );
      applySlateOps(editor, ops);
    }

    onChange();
    // console.log(`after ${ops.length} ops change: `);
    // console.log(JSON.stringify(editor.ydocNodes, null, 2));
  };

  // apply YDoc change events on Slate
  ydocNodes.observeDeep((events) => {
    console.log(`# ydocNodes on observeing`);
    applyYjsEvents(editor, events);
  });

  const endPoint =
    process.env.NODE_ENV === 'production'
      ? window.location.origin
      : 'ws://localhost:1234';
  withWebsocket(editor, ydoc, {
    roomName: 'my-doc',
    endPoint,
  });

  return editor;
}

// From remote Yjs -> Slate
const applyYjsEvents = (editor: Editor, events: Y.YEvent[]) => {
  const remoteEvents = events.filter((event) => !event.transaction.local);
  if (remoteEvents.length == 0) {
    return;
  }

  console.log(`[applyYjsEvents] receiving remote evennts..`);
  console.log(events);

  editor.isRemote = true;
  Editor.withoutNormalizing(editor, () => {
    console.log(`apply remote ${events.length} events`);
    toSlateOps(remoteEvents).forEach((op) => editor.apply(op));
  });
  Promise.resolve().then(() => (editor.isRemote = false));
};

// From local Slate -> Yjs
const applySlateOps = (editor: Editor, ops: Operation[]) => {
  const insertText = (op: TextOperation) => {
    const ytext: any = locateY(editor.ydocNodes, op.path);
    if (!ytext || !(ytext instanceof Y.Text)) {
      console.log(`can not insert text into unmatched node`);
      return;
    }
    console.log(`insert into YText at ${op.offset}`);
    ytext.insert(op.offset, op.text);
    console.log(`after insert:`, ytext.toString(), ytext.toDelta().attributes);
  };
  const deleteText = (op: TextOperation) => {
    const ytext: any = locateY(editor.ydocNodes, op.path);
    if (!ytext || !(ytext instanceof Y.Text)) {
      console.log(`can not delete text from unmatched node`);
      return;
    }
    console.log(`delete YText from ${op.offset}`);
    ytext.delete(op.offset, op.text.length);
  };

  /**
   * Format bold:
   * split_node {path:[2,0], position:12}
   * split_node {path:[2,0], position:7}
   * set_selection {newProperties: {focus: {path: [2,1]}}, offset: 5 }
   * set_node {newProperties: {italic: true}}
   *
   * Toggle block (heading, list, quote etc. )
   */
  const setNode = (editor: Editor, op: SetNodeOperation) => {
    // const parentPath = Path.parent(op.path);
    const targetEl = locateY(editor.ydocNodes, op.path);
    const parentEl = locateYParent(editor.ydocNodes, op.path);
    const targetPathIdx = op.path[op.path.length - 1];

    const { newProperties } = op;
    if (!targetEl) {
      throw new TypeError('no target can be located in Yjs');
    }
    const { type, ...others } = op.newProperties;
    // set attr on text
    if (targetEl instanceof Y.Text && !type) {
      targetEl.format(0, targetEl.length, newProperties);
      return;
    }
    // for Y.XmlElment
    let inject = targetEl;
    if (type) {
      inject = new Y.XmlElement(type);
      // for (const k in others) {
      //   inject.setAttribute(k, op.newProperties[k]);
      // }
      let toCLone =
        targetEl instanceof Y.Text ? [targetEl] : targetEl.toArray();
      const children = toCLone.map((e: any) => cloneEl(e));
      inject.insert(0, children);
      parentEl.delete(targetPathIdx, 1);
      parentEl.insert(targetPathIdx, [inject]);
    }
  };
  /**
   * Insert a list command
   *
   * insert_node {path:[3], node: {type:'bullet-list', children:[]}}
   * move_node {path:[2], newPath: [3,0] }
   * set_node: {path:[2,0], properties:{}, newProps: {type:'list-item'}}
   */
  const insertNode = (editor: Editor, op: InsertNodeOperation) => {
    const targetParent = locateYParent(editor.ydocNodes, op.path);
    const targetPathIdx = op.path[op.path.length - 1];

    // const inject = new Y.XmlElement(op.node.type);

    // if (!op.node.children || op.node.children.length === 0) {
    //   inject.insert (0, [new Y.Text('')])
    // }
    const inject: any = formYDocNodes([op.node]);
    // inject.insert(0, yList);
    // targetParent.insert(targetPathIdx - 1, inject);
    targetParent.insert(targetPathIdx, inject);
  };
  const moveNode = (editor: Editor, op: MoveNodeOperation) => {
    const fromParent = locateYParent(editor.ydocNodes, op.path);
    const toParent = locateYParent(editor.ydocNodes, op.newPath);
    const fromPathIdx = op.path[op.path.length - 1];
    const pathIdx = op.newPath[op.newPath.length - 1];

    const elToMove = locateY(editor.ydocNodes, op.path);
    const children = elToMove.toArray().map((e: any) => cloneEl(e));
    // delete previous inserted where list is toggled against
    fromParent.delete(fromPathIdx, 1);
    toParent.insert(pathIdx, children);
  };

  const mergeNode = (editor: Editor, op: MergeNodeOperation) => {};

  /**
   * backspace from the begining of one p, lift it to the previous location
   * {path: [0] (from [1] to [0]), node: {type:'p', children: [{text: ''}]}},
   */
  const removeNode = (ediotr: Editor, op: RemoveNodeOperation) => {
    const parent = locateY(editor.ydocNodes, Path.parent(op.path));
    if (parent instanceof Y.Text) {
      throw new TypeError('can not remove from a text node');
    }

    const pIdx = op.path[op.path.length - 1];
    parent.delete(pIdx, 1);
  };

  /** Insert break (at the end of line)
   * split_node {path:[1,1], position:5, properties: {bold}}
   * split_node {path:[1], position:2, target:5, type: 'p'}
   * Where target is set to the position of the deeper split node when splitting deeply.
   *
   * Insert break (at the beginning of P)
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
  const cloneEl = (yEl: any) => {
    if (yEl instanceof Y.Text) {
      const text = yEl.toString();
      const attrs = yEl.toDelta().attributes;
      console.log('clone on text:', yEl.toDelta());
      const yText = new Y.Text();
      yText.insert(0, text, attrs);
      return yText;
    }
    const yList = yEl.toArray();
    const children = yList.map((item: any) => cloneEl(item));
    const attrs = yEl.getAttributes();
    const clonedEl = new Y.XmlElement(yEl.nodeName);
    if (attrs) {
      for (const k in attrs) {
        clonedEl.setAttribute(k, attrs[k]);
      }
    }
    clonedEl.insert(0, children);
    return clonedEl;
  };

  const splitNode = (editor: Editor, op: SplitNodeOperation) => {
    // find node / text in editor by op.path,
    const [atNode, _] = Editor.node(editor, op.path);
    const [atParent] = Editor.parent(editor, op.path);
    const parentPath = Path.parent(op.path);
    // path index in which the op is performed in relation to its parent
    const pIdx = op.path[op.path.length - 1];

    const yEl = locateY(editor.ydocNodes, op.path);
    const yParentEl = locateY(editor.ydocNodes, parentPath);
    if (yEl instanceof Y.Text && Text.isText(atNode)) {
      // need to solve non-continuous text string (like bold text portion)
      const deltaAttrs = yEl.toDelta().attributes;
      const textString = yEl.toJSON();
      const lsplit = textString.slice(0, op.position);
      const rsplit = textString.slice(op.position, textString.length);

      yEl.delete(op.position, yEl.length - op.position);
      const inject = new Y.Text();
      inject.insert(0, rsplit, deltaAttrs);
      yParentEl.insert(pIdx + 1, [inject]);
    } else {
      const children = yEl.toArray();
      const rNode = children.slice(op.position, children.length);
      const clones = rNode.map((n: any) => cloneEl(n));

      const inject = new Y.XmlElement(op.properties.type);

      inject.insert(0, clones);
      yParentEl.insert(pIdx + 1, [inject]);
      yEl.delete(op.position, children.length - op.position);
    }
  };

  editor.doc.transact(() => {
    ops.forEach((op) => {
      if (Operation.isTextOperation(op)) {
        if (op.type === 'insert_text') insertText(op);
        else if (op.type === 'remove_text') deleteText(op);
      } else {
        if (op.type === 'split_node') {
          splitNode(editor, op);
        } else if (op.type === 'set_node') {
          setNode(editor, op);
        } else if (op.type === 'insert_node') {
          insertNode(editor, op);
        } else if (op.type === 'move_node') {
          moveNode(editor, op);
        } else if (op.type === 'remove_node') {
          removeNode(editor, op);
        }
      }
    });
  });
  // Y.applyUpdate;
};
