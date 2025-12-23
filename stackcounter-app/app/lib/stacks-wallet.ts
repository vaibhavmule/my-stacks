/**
 * Stacks wallet integration utilities
 * This file provides helpers for connecting Stacks wallets via WalletKit
 */

import { StacksTestnet, StacksMainnet } from '@stacks/network';

export const getStacksNetwork = () => {
  const networkType = process.env.NEXT_PUBLIC_STACKS_NETWORK || 'testnet';
  return networkType === 'mainnet' ? new StacksMainnet() : new StacksTestnet();
};

export const formatAddress = (address: string): string => {
  if (address.length <= 10) return address;
  return `${address.slice(0, 5)}...${address.slice(-4)}`;
};

export const getExplorerUrl = (txId: string): string => {
  const network = process.env.NEXT_PUBLIC_STACKS_NETWORK || 'testnet';
  const baseUrl = network === 'mainnet' 
    ? 'https://explorer.stacks.co/txid'
    : 'https://explorer.stacks.co/txid';
  return `${baseUrl}/${txId}?chain=${network}`;
};
