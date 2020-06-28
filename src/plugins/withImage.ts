// import { Editor, Transforms } from 'slate';
import { ReactEditor } from 'slate-react';

export const withImage = (editor: ReactEditor) => {
  const { insertData, isVoid } = editor;

  editor.isVoid = (element) => {
    return element.type === 'image' ? true : isVoid(element);
  };
};
