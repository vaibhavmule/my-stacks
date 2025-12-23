'use client';

import { useState, useEffect } from 'react';
import { openAuth, UserSession } from '@stacks/connect';
import { StacksTestnet, StacksMainnet } from '@stacks/network';
import { formatAddress } from '@/app/lib/stacks-wallet';

const network = (process.env.NEXT_PUBLIC_STACKS_NETWORK || 'testnet') === 'mainnet'
  ? new StacksMainnet()
  : new StacksTestnet();

interface WalletButtonProps {
  onConnect?: (address: string) => void;
  onDisconnect?: () => void;
}

export default function WalletButton({ onConnect, onDisconnect }: WalletButtonProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [userSession, setUserSession] = useState<UserSession | null>(null);

  useEffect(() => {
    // Check if user is already signed in
    checkConnection();
  }, []);

  const checkConnection = () => {
    if (typeof window === 'undefined') return;
    
    const session = new UserSession({ appConfig: { network } });
    setUserSession(session);
    
    if (session.isUserSignedIn()) {
      const userData = session.loadUserData();
      setIsConnected(true);
      setAddress(userData.profile.stxAddress.mainnet || userData.profile.stxAddress.testnet);
    }
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await openAuth({
        appDetails: {
          name: 'StackCounter',
          icon: typeof window !== 'undefined' ? window.location.origin + '/icon.png' : '',
        },
        redirectTo: typeof window !== 'undefined' ? window.location.origin : '/',
        onFinish: (data) => {
          const session = new UserSession({ appConfig: { network } });
          setUserSession(session);
          const userData = session.loadUserData();
          const userAddress = userData.profile.stxAddress.mainnet || userData.profile.stxAddress.testnet;
          setIsConnected(true);
          setAddress(userAddress);
          setIsConnecting(false);
          if (onConnect) {
            onConnect(userAddress);
          }
        },
        onCancel: () => {
          setIsConnecting(false);
        },
      });
    } catch (error) {
      console.error('Failed to connect wallet:', error);
      alert('Failed to connect wallet. Please try again.');
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    if (userSession) {
      userSession.signUserOut();
    }
    setIsConnected(false);
    setAddress(null);
    setUserSession(null);
    if (onDisconnect) {
      onDisconnect();
    }
  };

  if (isConnected && address) {
    return (
      <div className="flex items-center gap-3">
        <div className="px-4 py-2 bg-green-900/30 border border-green-700 rounded-lg">
          <span className="text-sm text-green-400 font-mono">
            {formatAddress(address)}
          </span>
        </div>
        <button
          onClick={handleDisconnect}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleConnect}
      disabled={isConnecting}
      className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg font-medium transition-colors"
    >
      {isConnecting ? 'Connecting...' : 'Connect Wallet'}
    </button>
  );
}
