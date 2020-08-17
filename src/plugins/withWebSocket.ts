import { Editor } from 'slate';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';

export type WebSocketOptions = {
  roomName: string;
  endPoint: string;
  onConnect?: () => void;
  onDisConnect?: () => void;
};

export const withWebsocket = (
  editor: Editor,
  doc: Y.Doc,
  { roomName, endPoint, onConnect }: WebSocketOptions
) => {
  // const edt = editor as T & WebSocket
  const edt = editor;

  editor.websocketProvider = new WebsocketProvider(endPoint, roomName, doc, {
    connect: false,
  });

  editor.websocketProvider.on('status', (event: { status: string }) => {
    if (event.status === 'connected') {
      console.log(`connected to ${roomName}`);
    }
    if (event.status === 'disconnected') {
    }
  });

  editor.connect = () => {
    editor.websocketProvider.connect();
  };
  editor.disconnect = () => {
    editor.websocketProvider.disconnect();
  };
  editor.destroy = () => {
    editor.websocketProvider.destory();
  };
};
