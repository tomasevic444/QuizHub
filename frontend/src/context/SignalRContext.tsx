// src/context/SignalRContext.tsx

import React, { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import * as signalR from '@microsoft/signalr';
import { useAuth } from './AuthContext';

interface SignalRContextType {
  connection: signalR.HubConnection | null;
  isConnected: boolean;
  connect: () => Promise<void>; // Function to start the connection
  disconnect: () => Promise<void>; // Function to stop the connection
}

const SignalRContext = createContext<SignalRContextType | undefined>(undefined);

const HUB_URL = `${import.meta.env.VITE_API_BASE_URL}/quizHub`;

export const SignalRProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { token } = useAuth();
  const [connection, setConnection] = useState<signalR.HubConnection | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  // Use useCallback to memoize the functions, preventing unnecessary re-renders
  const connect = useCallback(async () => {
    if (connection || !token) return; // Don't connect if already connected or no token

    const newConnection = new signalR.HubConnectionBuilder()
      .withUrl(HUB_URL, { accessTokenFactory: () => token })
      .withAutomaticReconnect()
      .build();

    try {
      await newConnection.start();
      console.log('SignalR Connected!');
      setIsConnected(true);
      setConnection(newConnection);
    } catch (err) {
      console.error('SignalR Connection Error:', err);
    }
  }, [token, connection]);

  const disconnect = useCallback(async () => {
    if (connection) {
      await connection.stop();
      console.log('SignalR Disconnected.');
      setIsConnected(false);
      setConnection(null);
    }
  }, [connection]);

  return (
    <SignalRContext.Provider value={{ connection, isConnected, connect, disconnect }}>
      {children}
    </SignalRContext.Provider>
  );
};

export const useSignalR = () => {
  const context = useContext(SignalRContext);
  if (!context) throw new Error('useSignalR must be used within a SignalRProvider');
  return context;
};