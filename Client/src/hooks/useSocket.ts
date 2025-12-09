import { useEffect, useState, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../contexts/AuthContext';

interface UseSocketOptions {
  autoConnect?: boolean;
}

interface SocketState {
  isConnected: boolean;
  error: Error | null;
}

const SOCKET_SERVER_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

export const useSocket = (options: UseSocketOptions = {}) => {
  const { autoConnect = true } = options;
  const { user, token } = useAuth();
  const [state, setState] = useState<SocketState>({
    isConnected: false,
    error: null
  });
  const socketRef = useRef<Socket | null>(null);

  // Initialize socket connection
  useEffect(() => {
    if (!token || !autoConnect) return;

    // Create socket instance
    const socket = io(SOCKET_SERVER_URL, {
      auth: { token },
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      autoConnect: true
    });

    // Set up event listeners
    socket.on('connect', () => {
      console.log('Socket connected:', socket.id);
      setState({ isConnected: true, error: null });
      
      // Join appropriate rooms based on user role and branch
      if (user) {
        socket.emit('join_room', {
          userId: user.id,
          branchId: user.branchId,
          role: user.role
        });
      }
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err);
      setState({ isConnected: false, error: err });
    });

    socket.on('disconnect', (reason) => {
      console.log('Socket disconnected:', reason);
      setState({ isConnected: false, error: null });
    });

    // Store socket reference
    socketRef.current = socket;

    // Cleanup on unmount
    return () => {
      if (socket) {
        socket.disconnect();
        socketRef.current = null;
      }
    };
  }, [token, user, autoConnect]);

  // Emit event to socket server
  const emit = useCallback((eventName: string, data: any) => {
    if (socketRef.current && state.isConnected) {
      socketRef.current.emit(eventName, data);
      return true;
    }
    return false;
  }, [state.isConnected]);

  // Listen for events from socket server
  const on = useCallback((eventName: string, callback: (...args: any[]) => void) => {
    if (socketRef.current) {
      socketRef.current.on(eventName, callback);
    }
  }, []);

  // Remove event listener
  const off = useCallback((eventName: string, callback?: (...args: any[]) => void) => {
    if (socketRef.current) {
      socketRef.current.off(eventName, callback);
    }
  }, []);

  // Manually connect socket
  const connect = useCallback(() => {
    if (socketRef.current && !state.isConnected) {
      socketRef.current.connect();
    }
  }, [state.isConnected]);

  // Manually disconnect socket
  const disconnect = useCallback(() => {
    if (socketRef.current && state.isConnected) {
      socketRef.current.disconnect();
    }
  }, [state.isConnected]);

  return {
    socket: socketRef.current,
    isConnected: state.isConnected,
    error: state.error,
    emit,
    on,
    off,
    connect,
    disconnect
  };
};

export default useSocket;