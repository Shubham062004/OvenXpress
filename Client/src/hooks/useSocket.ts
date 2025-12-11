// src/hooks/useSocket.ts
import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/contexts/AuthContext';

interface UseSocketOptions {
  autoConnect?: boolean;
}

interface SocketState {
  isConnected: boolean;
  error: Error | null;
}

type AuthUser = {
  // adapt these fields to match your AuthContext user shape
  id?: string;
  _id?: string;
  branchId?: string;
  role?: string;
};

const DEFAULT_SOCKET_URL =
  (import.meta.env.VITE_SOCKET_URL as string) || (import.meta.env.VITE_API_URL as string) || 'http://localhost:3000';

// NOTE: we do not call io(...) at import time to avoid connecting on SSR/build
export const useSocket = (options: UseSocketOptions = {}) => {
  const { autoConnect = true } = options;
  const { user, token } = useAuth();

  const [state, setState] = useState<SocketState>({
    isConnected: false,
    error: null,
  });

  const socketRef = useRef<Socket | null>(null);
  const connectingRef = useRef(false);

  // Helper to safely obtain stable user id
  const getUserId = (u: unknown): string | undefined => {
    if (!u || typeof u !== 'object') return undefined;
    const uu = u as AuthUser;
    return uu.id ?? uu._id;
  };

  useEffect(() => {
    // only connect if token exists and autoConnect is true
    if (!token || !autoConnect) {
      return;
    }

    // don't recreate socket if already connecting/connected
    if (socketRef.current && socketRef.current.connected) {
      setState({ isConnected: true, error: null });
      return;
    }

    if (connectingRef.current) return;
    connectingRef.current = true;

    const SOCKET_SERVER_URL = DEFAULT_SOCKET_URL.replace(/\/$/, ''); // remove trailing slash
    const socket = io(SOCKET_SERVER_URL, {
      auth: { token },
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      autoConnect: true,
    });

    socketRef.current = socket;

    const onConnect = () => {
      console.log('Socket connected:', socket.id);
      setState({ isConnected: true, error: null });
      // join rooms after connect
      const uid = getUserId(user);
      if (uid) {
        const branchId = (user as AuthUser).branchId;
        const role = (user as AuthUser).role;
        socket.emit('join_room', { userId: uid, branchId, role });
      }
    };

    const onConnectError = (err: Error) => {
      console.error('Socket connect_error:', err);
      setState({ isConnected: false, error: err });
    };

    const onDisconnect = (reason: string) => {
      console.log('Socket disconnected:', reason);
      setState({ isConnected: false, error: null });
    };

    socket.on('connect', onConnect);
    socket.on('connect_error', onConnectError);
    socket.on('disconnect', onDisconnect);

    // cleanup
    return () => {
      connectingRef.current = false;
      if (socket) {
        socket.off('connect', onConnect);
        socket.off('connect_error', onConnectError);
        socket.off('disconnect', onDisconnect);
        socket.disconnect();
      }
      socketRef.current = null;
      setState({ isConnected: false, error: null });
    };
    // Intentionally only depend on token and autoConnect & user id/branch/role shape
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, autoConnect, getUserId(user)]);

  // Emit event (use unknown for data)
  const emit = useCallback((eventName: string, data?: unknown): boolean => {
    const s = socketRef.current;
    if (s && s.connected) {
      s.emit(eventName, data);
      return true;
    }
    return false;
  }, []);

  // on/off helpers
  const on = useCallback((eventName: string, callback: (...args: unknown[]) => void) => {
    const s = socketRef.current;
    if (s) s.on(eventName, callback);
    return () => {
      if (s) s.off(eventName, callback);
    };
  }, []);

  const off = useCallback((eventName: string, callback?: (...args: unknown[]) => void) => {
    const s = socketRef.current;
    if (s) {
      if (callback) s.off(eventName, callback);
      else s.removeAllListeners(eventName);
    }
  }, []);

  const connect = useCallback(() => {
    const s = socketRef.current;
    if (s && !s.connected) s.connect();
  }, []);

  const disconnect = useCallback(() => {
    const s = socketRef.current;
    if (s && s.connected) s.disconnect();
  }, []);

  return {
    socket: socketRef.current,
    isConnected: state.isConnected,
    error: state.error,
    emit,
    on,
    off,
    connect,
    disconnect,
  };
};

export default useSocket;
