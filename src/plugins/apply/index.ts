import * as Y from 'yjs';
import { Text, Node, Element } from 'slate';

export const formYDocNodes = (initContent: Node[]) => {
  const formYXmlEl = (
    childNodes: any, // (Y.XmlElement | Y.Text)[],
    type: string,
    attrs: { [key: string]: any }
  ) => {
    const yXmlEl = new Y.XmlElement(type);
    // console.log(
    //   `[formYXmlEl] insert ${childNodes.length} childs under ${type}`
    // );
    yXmlEl.insert(0, childNodes);
    for (const k in attrs) {
      yXmlEl.setAttribute(k, attrs[k]);
    }
    return yXmlEl;
  };
  const formYText = (tnode: Text) => {
    const { text: textString, ...attrs } = tnode;
    const ytext = new Y.Text();
    // console.log(`[formYText] insert ${textString}`, attrs);
    ytext.insert(0, textString, attrs);

    return ytext;
  };

  const transform = (node: Node) => {
    if (node.text) {
      return formYText(node as Text);
    }
    const { children, type, ...attrs } = node as Element;
    const childNodes: (Y.XmlElement | Y.Text)[] = children.map((c) =>
      transform(c)
    );
    return formYXmlEl(childNodes, type || 'ElType', attrs);
  };

  return initContent.map((n) => transform(n));
};

export * from './path';
export * from './textOps';
// export { insertText } from './insertText';
// export { removeText } from './removeText';
