import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { useFocused, useSelected, RenderElementProps } from 'slate-react';

const useStyles = makeStyles((theme) => ({
  imgWrapper: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 24,
    marginBottom: 24,
  },
  img: {
    width: '100%',
    height: 'auto',
    maxWidth: 960,
    objectFit: 'cover',
  },
  caption: {
    fontStyle: 'normal',
    color: '#595b67',
    letterSpacing: 'normal',
    fontSize: 18,
    lineHeight: 1.33,
    [theme.breakpoints.down('sm')]: {
      fontSize: 16,
      lineHeight: 1.33,
    },
  },
}));

export const Image = ({
  attributes,
  element,
  children,
}: RenderElementProps) => {
  const classes = useStyles();
  const selected = useSelected();
  const focused = useFocused();
  const { url } = element;
  return (
    <div {...attributes}>
      <div
        contentEditable={false}
        className={classes.imgWrapper}
        style={{
          boxShadow: selected && focused ? '0 0 0 3px #B4D5FF' : 'none',
        }}
      >
        <img src={url} className={classes.img} />
      </div>
      {/* {caption && caption.length > 0 && (
        <div
          className={classes.caption}
          style={{
            textAlign: 'center',
            marginTop: 8,
            marginBottom: 16,
            opacity: 0.7,
          }}>
          {caption}
        </div>
      )} */}
      {children}
    </div>
  );
};
