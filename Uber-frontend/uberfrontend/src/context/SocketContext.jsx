import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useUserStore } from '../Zustand/useUserstore';
import { useCaptainStore } from '../Zustand/useCaptainStore';
import { API_BASE_URL } from '../config';

const SocketContext = createContext();

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const userToken = useUserStore((state) => state.token);
  const captainToken = useCaptainStore((state) => state.token);

  useEffect(() => {
    const token = userToken || captainToken;
    
    if (token) {
      const newSocket = io(API_BASE_URL.replace('/api', ''), {
        auth: {
          token
        }
      });

      newSocket.on('connect', () => {
        console.log('Socket connected:', newSocket.id);
      });

      newSocket.on('connect_error', (err) => {
        console.error('Socket connection error:', err.message);
      });

      setSocket(newSocket);

      return () => {
        newSocket.disconnect();
      };
    }
  }, [userToken, captainToken]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
