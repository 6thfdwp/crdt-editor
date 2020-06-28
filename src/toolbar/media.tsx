import React, { useState, useEffect } from 'react';
import {
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
} from '@material-ui/core';
import { ImageOutlined, VideocamOutlined } from '@material-ui/icons';
import { useSlate } from 'slate-react';

import { EditorCommands } from '../commands';

type EditModalProps = {
  isOpen: boolean;
  title: string;
  onDone: (sourceUri: string) => void;
  onCancel: () => void;
};

const EditModal: React.FunctionComponent<EditModalProps> = ({
  isOpen,
  title,
  onDone,
  onCancel,
}) => {
  const [data, setData] = useState({ source: '' });
  return (
    <Dialog open={isOpen} aria-labelledby='Embed' fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <TextField
          label='Source'
          fullWidth
          value={data.source}
          onChange={(e) => setData({ ...data, source: e.target.value })}
        />
        <DialogActions>
          <Button onClick={onCancel}>Cancel</Button>
          <Button color='primary' onClick={() => onDone(data.source)}>
            Done
          </Button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  );
};

export const InsertImageButton: React.FunctionComponent<React.ButtonHTMLAttributes<
  HTMLButtonElement
>> = ({ className }) => {
  const [isOpen, setOpen] = useState(false);
  const editor = useSlate();
  return (
    <React.Fragment>
      <IconButton
        className={className}
        onMouseDown={() => {
          // currentAt = editor.selection;
          setOpen(!isOpen);
        }}
      >
        <ImageOutlined />
      </IconButton>
      <EditModal
        title='Image source'
        isOpen={isOpen}
        onCancel={() => setOpen(false)}
        onDone={(sourceUri) => {
          setOpen(false);
          EditorCommands.insertImage(editor, sourceUri);
        }}
      />
    </React.Fragment>
  );
};
