import React, { ReactElement, ReactComponentElement } from 'react';
import { Grid, IconButton, Button } from '@material-ui/core';
import { makeStyles } from '@material-ui/styles';
import {
  FormatBoldOutlined,
  FormatItalicOutlined,
  FormatQuoteOutlined,
  FormatListNumbered,
  FormatListBulleted,
} from '@material-ui/icons';
import { Editor } from 'slate';
import { useSlate } from 'slate-react';

import { InsertImageButton } from './media';
import { EditorCommands } from '../commands';

const useStyles = makeStyles({
  toolbar: {
    boxShadow: '0 1px 3px rgba(0,0,0,0.12), 0 1px 1px 1px rgba(0,0,0,0.16)',
  },
  tbBtn: {
    borderRadius: 'inherit',
  },

  tbBtnActive: {
    fontWeight: 'bold',
    fontSize: 18,
    color: '#3f51b5',
  },
  tbBtnInActive: {
    fontWeight: 'bold',
    fontSize: 18,
    color: 'rgba(0, 0, 0, 0.54)',
  },
});

export type ToolbarBtnProps = {
  onPress?: (event: React.MouseEvent) => void;
  onExecCommand: (editor: Editor) => void;
  children: React.ReactNode;
  // children: (active: boolean) => ReactElement;
};
const ToolbarBtn = ({ onExecCommand, children }: ToolbarBtnProps) => {
  const classes = useStyles();
  const editor = useSlate();
  return (
    <IconButton
      className={classes.tbBtn}
      onMouseDown={(e) => {
        e.preventDefault();
        onExecCommand(editor);
      }}
    >
      {children}
      {/* {children(active)} */}
    </IconButton>
  );
};

const FormatHeadingButton = (props: { format: string }) => {
  const classes = useStyles();
  const editor = useSlate();
  let label = 'H';
  if (props.format === 'heading.h1') label = 'H1';
  if (props.format === 'heading.h2') label = 'H2';

  const active = EditorCommands.isFormattedBlock(editor, props.format);
  return (
    <ToolbarBtn
      onExecCommand={(editor) => {
        EditorCommands.toggleHeading(editor, props.format);
      }}
    >
      <span className={active ? classes.tbBtnActive : classes.tbBtnInActive}>
        {label}
      </span>
    </ToolbarBtn>
  );
};

const FormatBoldButton = () => {
  const editor = useSlate();
  const active = EditorCommands.isFormattedMark(editor, 'bold');
  return (
    <ToolbarBtn
      onExecCommand={(editor) => {
        EditorCommands.toggleMark(editor, 'bold');
      }}
    >
      <FormatBoldOutlined color={active ? 'primary' : 'action'} />
    </ToolbarBtn>
  );
};
const FormatItalicButton = () => {
  const editor = useSlate();
  const active = EditorCommands.isFormattedMark(editor, 'italic');
  return (
    <ToolbarBtn
      onExecCommand={(editor) => {
        EditorCommands.toggleMark(editor, 'italic');
      }}
    >
      <FormatItalicOutlined color={active ? 'primary' : 'action'} />
    </ToolbarBtn>
  );
};

const ToggleListButton = () => {
  const editor = useSlate();
  const active = EditorCommands.isFormattedMark(editor, 'bullet-list');
  return (
    <ToolbarBtn
      onExecCommand={(editor) => {
        EditorCommands.toggleList(editor, 'bullet-list');
      }}
    >
      <FormatListBulleted color={active ? 'primary' : 'action'} />
    </ToolbarBtn>
  );
};

const Toolbar = () => {
  const classes = useStyles();
  return (
    <Grid container className={classes.toolbar}>
      <FormatHeadingButton format='heading.h1' />
      <FormatBoldButton />
      <FormatItalicButton />
      <ToggleListButton />
      <InsertImageButton />
    </Grid>
  );
};

export default Toolbar;
