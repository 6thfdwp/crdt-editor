import React from 'react';
import { makeStyles, styled } from '@material-ui/core/styles';
import { RenderElementProps } from 'slate-react';

const useStyles = makeStyles((theme) => ({
  listPadding: {
    paddingLeft: 30,
    paddingTop: 10,
    paddingBottom: 10,
  },
  item: {
    lineHeight: 1.2,
  },
}));

export const BulletList = ({ attributes, children }: RenderElementProps) => {
  const classes = useStyles();
  return (
    <ul
      {...attributes}
      className={classes.listPadding}
      style={{
        listStyleType: 'square',
      }}
    >
      {children}
    </ul>
  );
};

export const ListItem = ({ attributes, children }: RenderElementProps) => {
  const classes = useStyles();
  return (
    <li {...attributes} className={classes.item}>
      {children}
    </li>
  );
};
