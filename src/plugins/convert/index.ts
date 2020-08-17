import _ from 'lodash';
import { Operation } from 'slate';
import * as Y from 'yjs';
// import arrayEvents from './arrayEvents';
import { textEvents } from './textEvents';

export const toSlateOps = (events: Y.YEvent[]): Operation[] => {
  return _.flatten(events.map(toSlateOp));
};

export const toSlateOp = (event: Y.YEvent): Operation[] => {
  if (event instanceof Y.YArrayEvent) {
    // return arrayEvents(event);
  }

  // if (event instanceof Y.YMapEvent) {
  //   return mapEvent(event);
  // }

  if (event instanceof Y.YTextEvent) {
    return textEvents(event);
  }

  return [];
  // throw new Error('Unsupported yjs event');
};
