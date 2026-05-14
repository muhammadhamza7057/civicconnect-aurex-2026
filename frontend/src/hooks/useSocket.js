import { useEffect } from 'react';
import { connectSocket, getSocket } from '../socket/client';
import { toast } from 'react-hot-toast';

export function useSocket(enabled, handlers = {}) {
  useEffect(() => {
    if (!enabled) return undefined;

    const socket = connectSocket();
    const bindings = Object.entries(handlers);
    const handleConnect = () => {
      if (handlers.onConnect) handlers.onConnect();
    };
    const handleDisconnect = () => {
      if (handlers.onDisconnect) handlers.onDisconnect();
    };

    bindings.forEach(([event, handler]) => {
      if (typeof handler === 'function') {
        socket.on(event, handler);
      }
    });

    socket.on('connect', handleConnect);

    socket.on('disconnect', handleDisconnect);

    socket.on('notification:new', payload => {
      toast(payload?.message || 'New notification received');
      if (handlers['notification:new']) handlers['notification:new'](payload);
    });

    return () => {
      bindings.forEach(([event, handler]) => {
        if (typeof handler === 'function') {
          getSocket().off(event, handler);
        }
      });
      if (handlers.onConnect) getSocket().off('connect', handlers.onConnect);
      if (handlers.onDisconnect) getSocket().off('disconnect', handlers.onDisconnect);
      if (handlers['notification:new']) getSocket().off('notification:new', handlers['notification:new']);
      getSocket().off('connect', handleConnect);
      getSocket().off('disconnect', handleDisconnect);
    };
  }, [enabled, handlers]);
}
