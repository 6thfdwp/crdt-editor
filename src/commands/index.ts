import { Editor, Node, Transforms } from 'slate';

const LIST_TYPE = ['bullet-list', 'number-list'];
export const EditorCommands = {
  ...Editor,
  // is content block applied with heading / list / code etc
  isFormattedBlock(editor: Editor, blockType: string) {
    const [matches] = Editor.nodes(editor, {
      match: (n) => n.type === blockType,
      mode: 'all',
    });
    return !!matches;
  },

  // is text applied with bold / italic  mark
  isFormattedMark(editor: Editor, format: string) {
    const marks = Editor.marks(editor);
    return marks ? marks[format] === true : false;
  },

  toggleHeading(editor: Editor, format: string) {
    const active = this.isFormattedBlock(editor, format);
    // Transforms.setNodes(active ? "paragraph" : format);
    Transforms.setNodes(editor, { type: active ? 'paragraph' : format });
  },

  toggleList(editor: Editor, listType: string) {
    const toggled = this.isFormattedBlock(editor, listType);
    if (toggled) {
      Transforms.unwrapNodes(editor, {
        match: (n: Node) => LIST_TYPE.includes(n.type),
        split: true,
      });
    } else {
      Transforms.wrapNodes(editor, { type: listType, children: [] });
    }
    Transforms.setNodes(editor, { type: toggled ? 'paragraph' : 'list-item' });
  },

  // add or remove bold/italic mark on current selection
  toggleMark(editor: Editor, format: string) {
    const active = this.isFormattedMark(editor, format);
    if (active) {
      // Editor.removeMark(editor, format);
      editor.removeMark(format);
    } else {
      // Editor.addMark(editor, format, true);
      editor.addMark(format, true);
    }
  },

  insertImage(editor: Editor, url: string) {
    const text = { text: '' };
    const image = { type: 'image', url, children: [text] };
    // Transforms.insertNodes(editor, image);
    editor.insertNode(image);
  },
};

// export default EditorCommands;
