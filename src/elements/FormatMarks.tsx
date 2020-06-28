import React from "react";

import { RenderLeafProps } from "slate-react";

export const FormatMarks = ({
  attributes,
  leaf,
  children,
}: RenderLeafProps) => {
  let fontStyles = {};
  if (leaf.bold) {
    Object.assign(fontStyles, { fontWeight: "bold" });
  }
  if (leaf.italic) {
    Object.assign(fontStyles, { fontStyle: "italic" });
  }
  return (
    <span {...attributes} style={fontStyles}>
      {children}
    </span>
  );
};
