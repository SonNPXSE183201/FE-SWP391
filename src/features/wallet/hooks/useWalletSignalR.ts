import { useEffect, useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSignalR } from '../../../hooks/useSignalR';

export const useWalletSignalR = () => {
  const { isConnected, on, off } = useSignalR();
  const queryClient = useQueryClient();

  const handleWalletUpdated = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['wallet'] });
  }, [queryClient]);

  const handleTransactionCreated = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['wallet'] });
  }, [queryClient]);

  useEffect(() => {
    if (!isConnected) return;

    on('WalletUpdated', handleWalletUpdated);
    on('TransactionCreated', handleTransactionCreated);

    return () => {
      off('WalletUpdated', handleWalletUpdated);
      off('TransactionCreated', handleTransactionCreated);
    };
  }, [isConnected, on, off, handleWalletUpdated, handleTransactionCreated]);

  return { isConnected };
};
