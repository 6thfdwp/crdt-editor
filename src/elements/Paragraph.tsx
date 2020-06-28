import React from "react";
import { makeStyles, styled } from "@material-ui/core/styles";

import { RenderElementProps } from "slate-react";

const useStyles = makeStyles((theme) => ({
  p: {
    fontSize: 20,
    lineHeight: 1.2,
    margin: "16 0",
    [theme.breakpoints.down("xs")]: {},
  },
}));
export const Paragraph = ({ attributes, children }: RenderElementProps) => {
  const classes = useStyles();
  return (
    <p
      className={classes.p}
      {...attributes}
      // ref={ref}
    >
      {children}
    </p>
  );
};
