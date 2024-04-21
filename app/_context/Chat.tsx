'use client';

import { MessageState } from '@/app/_lib/types';
import React, { createContext, useState, useContext } from 'react';

interface AppContextType {
  query: string;
  setQuery: React.Dispatch<React.SetStateAction<string>>;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
  error: string | null;
  setError: React.Dispatch<React.SetStateAction<string | null>>;
  messageState: MessageState;
  setMessageState: React.Dispatch<React.SetStateAction<MessageState>>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [query, setQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [messageState, setMessageState] = useState<MessageState>({
    messages: [],
    history: [],
  });

  const contextValue: AppContextType = {
    query,
    setQuery,
    loading,
    setLoading,
    error,
    setError,
    messageState,
    setMessageState,
  };

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
};

export const useAppContext = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};
