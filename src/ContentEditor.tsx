import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { makeStyles } from '@material-ui/styles';

import {
  Editable,
  withReact,
  useSlate,
  Slate,
  RenderElementProps,
  RenderLeafProps,
} from 'slate-react';
import { Editor, Node, Transforms, createEditor } from 'slate';
import { withHistory } from 'slate-history';

import Toolbar from './toolbar';
import { Element, Leaf } from './elements';
import { withImage, withRTCollab } from './plugins';

const useStyles = makeStyles((theme) => ({
  editorWrapper: {
    // boxShadow: "0 1px 3px rgba(0,0,0,0.12), 0 1px 1px 1px rgba(0,0,0,0.16)"
    padding: 15,
    height: '100%',
    overflowY: 'scroll',
  },
}));

const initialValue: Node[] = [
  { type: 'heading.h1', children: [{ text: 'Great Heading' }] },
  {
    type: 'paragraph',
    children: [{ text: 'Start collaborating ' }, { text: 'SUPER', bold: true }],
  },

  {
    type: 'paragraph',
    children: [
      {
        text:
          'A wise quote. Operations are the granular, low-level actions that occur while invoking commands and transforms. A single high-level command could result in many low-level operations being applied to the editor.',
      },
    ],
  },
  // {
  //   type: 'ul-list',
  //   children: [
  //     { type: 'list-item', children: [{ text: 'item1' }] },
  //     { type: 'list-item', children: [{ text: 'i2' }] },
  //   ],
  // },
];
const ContentEditor = () => {
  const [value, setValue] = useState(initialValue);

  // const editor = useMemo(() => withHistory(withReact(createEditor())), []);
  const editor = useMemo(() => {
    const rtEditor = withRTCollab(createEditor(), initialValue);
    return withHistory(withReact(rtEditor));
  }, []);
  const renderElement = useCallback(
    (props: RenderElementProps) => <Element {...props} />,
    []
  );
  const renderLeaf = useCallback(
    (props: RenderLeafProps) => <Leaf {...props} />,
    []
  );

  useEffect(() => {
    editor.connect();
    return editor.disconnect;
  }, []);

  const classes = useStyles();
  return (
    <Slate editor={editor} value={value} onChange={(v) => setValue(v)}>
      <Toolbar />
      <div className={classes.editorWrapper}>
        <Editable
          autoFocus
          placeholder='Start writing cool stuff..'
          renderElement={renderElement}
          renderLeaf={renderLeaf}
        />
      </div>
    </Slate>
  );
};

export default ContentEditor;
