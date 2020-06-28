import React from "react";
import { Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";

import { RenderElementProps } from "slate-react";

const useStyles = makeStyles((theme) => ({
  h1: {
    fontSize: 40,
    fontWeight: 600,
    color: "#303240",
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    [theme.breakpoints.down("xs")]: {},
  },
  h2: {
    fontSize: 30,
    fontWeight: 500,
    color: "#303240",
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(1),
    [theme.breakpoints.down("xs")]: {},
  },
}));

export const Heading = {
  H1: ({ attributes, children }: RenderElementProps) => {
    const classes = useStyles();
    return (
      <Typography className={classes.h1} {...attributes}>
        {children}
      </Typography>
    );
  },

  H2: ({ attributes, children }: RenderElementProps) => {
    const classes = useStyles();
    return (
      <Typography className={classes.h2} {...attributes}>
        {children}
      </Typography>
    );
  },
};
