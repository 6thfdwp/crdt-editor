import React from 'react';
// import { makeStyles } from '@material-ui/core/styles';
import { Editor } from 'slate';
import { RenderElementProps, RenderLeafProps } from 'slate-react';

import { FormatMarks } from './FormatMarks';
import { Heading } from './Heading';
import { Paragraph } from './Paragraph';
import { BulletList, ListItem } from './Lists';
import { Image } from './Image';

export const Element = ({
  attributes,
  element,
  children,
}: RenderElementProps) => {
  switch (element.type) {
    case 'heading.h1':
      return (
        <Heading.H1 attributes={attributes} element={element}>
          {children}
        </Heading.H1>
      );
    case 'paragraph':
      return (
        <Paragraph attributes={attributes} element={element}>
          {children}
        </Paragraph>
      );
    case 'bullet-list':
      return (
        <BulletList attributes={attributes} element={element}>
          {children}
        </BulletList>
      );
    case 'list-item':
      return (
        <ListItem attributes={attributes} element={element}>
          {children}
        </ListItem>
      );

    case 'image':
      return (
        <Image attributes={attributes} element={element}>
          {children}
        </Image>
      );
    default:
      return (
        <Paragraph attributes={attributes} element={element}>
          {children}
        </Paragraph>
      );
  }
};

export const Leaf = ({ attributes, children, leaf, text }: RenderLeafProps) => {
  return (
    <FormatMarks attributes={attributes} leaf={leaf} text={text}>
      {children}
    </FormatMarks>
  );
};
