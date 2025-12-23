'use client';

import { useState, useEffect } from 'react';
import { openContractCall, UserSession } from '@stacks/connect';
import { StacksTestnet, StacksMainnet } from '@stacks/network';
import { getCount, getContractConfig } from '@/app/lib/contract';
import { formatAddress, getExplorerUrl } from '@/app/lib/stacks-wallet';
import WalletButton from '@/app/components/WalletButton';

type TransactionStatus = 'idle' | 'pending' | 'success' | 'error';

export default function Home() {
  const [count, setCount] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [address, setAddress] = useState<string | null>(null);
  const [txStatus, setTxStatus] = useState<TransactionStatus>('idle');
  const [txId, setTxId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userSession, setUserSession] = useState<UserSession | null>(null);

  const network = (process.env.NEXT_PUBLIC_STACKS_NETWORK || 'testnet') === 'mainnet'
    ? new StacksMainnet()
    : new StacksTestnet();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const session = new UserSession({ appConfig: { network } });
      setUserSession(session);
      
      if (session.isUserSignedIn()) {
        const userData = session.loadUserData();
        setIsConnected(true);
        setAddress(userData.profile.stxAddress.mainnet || userData.profile.stxAddress.testnet);
      }
    }
    
    loadCount();
    // Refresh count every 10 seconds
    const interval = setInterval(loadCount, 10000);
    return () => clearInterval(interval);
  }, []);

  const loadCount = async () => {
    try {
      const currentCount = await getCount();
      setCount(currentCount);
      setError(null);
    } catch (err: any) {
      console.error('Error loading count:', err);
      setError(err.message || 'Failed to load count');
    }
  };

  const handleIncrement = async () => {
    if (!isConnected || !address || !userSession) {
      alert('Please connect your wallet first');
      return;
    }

    setIsLoading(true);
    setTxStatus('pending');
    setError(null);

    try {
      const config = getContractConfig();
      
      await openContractCall({
        network,
        contractAddress: config.contractAddress,
        contractName: config.contractName,
        functionName: 'increment',
        functionArgs: [],
        onFinish: async (data) => {
          setTxId(data.txId);
          setTxStatus('success');
          setIsLoading(false);
          // Refresh count after a short delay to allow for block confirmation
          setTimeout(() => {
            loadCount();
          }, 3000);
        },
        onCancel: () => {
          setTxStatus('idle');
          setIsLoading(false);
        },
      });
    } catch (err: any) {
      console.error('Error incrementing counter:', err);
      setTxStatus('error');
      setError(err.message || 'Failed to increment counter');
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 text-white">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              StackCounter
            </h1>
            <p className="text-gray-400 text-lg">
              Connect your wallet and increment the counter on Stacks blockchain
            </p>
          </div>

          {/* Wallet Connection */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold mb-2">Wallet Connection</h2>
                {isConnected && address ? (
                  <p className="text-sm text-gray-400">
                    Connected: <span className="font-mono text-purple-400">{formatAddress(address)}</span>
                  </p>
                ) : (
                  <p className="text-sm text-gray-400">Connect your Stacks wallet to get started</p>
                )}
              </div>
              <WalletButton 
                onConnect={(addr) => {
                  setIsConnected(true);
                  setAddress(addr);
                }}
                onDisconnect={() => {
                  setIsConnected(false);
                  setAddress(null);
                }}
              />
            </div>
          </div>

          {/* Counter Display */}
          <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 mb-6 border border-gray-700">
            <div className="text-center">
              <h2 className="text-2xl font-semibold mb-4">Current Count</h2>
              {count !== null ? (
                <div className="text-6xl font-bold text-purple-400 mb-6">
                  {count}
                </div>
              ) : (
                <div className="text-4xl text-gray-500 mb-6">Loading...</div>
              )}
              
              {error && (
                <div className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded-lg">
                  <p className="text-sm text-red-400">{error}</p>
                </div>
              )}

              <button
                onClick={handleIncrement}
                disabled={!isConnected || isLoading || txStatus === 'pending'}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white rounded-xl font-semibold text-lg transition-all duration-300 shadow-lg hover:shadow-xl disabled:shadow-none"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Processing...
                  </span>
                ) : (
                  'Increment Counter'
                )}
              </button>

              {/* Transaction Status */}
              {txStatus !== 'idle' && (
                <div className="mt-4 p-4 bg-gray-900/50 rounded-lg border border-gray-700">
                  {txStatus === 'pending' && (
                    <p className="text-yellow-400">Transaction pending...</p>
                  )}
                  {txStatus === 'success' && txId && (
                    <div>
                      <p className="text-green-400 mb-2">Transaction successful!</p>
                      <a
                        href={getExplorerUrl(txId)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-purple-400 hover:text-purple-300 underline text-sm"
                      >
                        View on Explorer
                      </a>
                    </div>
                  )}
                  {txStatus === 'error' && (
                    <p className="text-red-400">Transaction failed. Please try again.</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Info Section */}
          <div className="bg-gray-800/30 backdrop-blur-sm rounded-2xl p-6 border border-gray-700">
            <h3 className="text-lg font-semibold mb-3">About</h3>
            <p className="text-sm text-gray-400 mb-2">
              This app demonstrates Reown WalletKit integration with Stacks blockchain.
            </p>
            <p className="text-sm text-gray-400">
              Connect your wallet using WalletKit and interact with the counter smart contract deployed on Stacks.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
