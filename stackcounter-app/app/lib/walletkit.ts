/**
 * WalletKit integration for Stacks
 * Note: WalletKit primarily supports EVM chains. For Stacks, we use @stacks/connect
 * but demonstrate WalletKit concepts. In production, use @stacks/connect-react
 */

import { Core } from '@walletconnect/core';
import { WalletKit } from '@reown/walletkit';

const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '';

// Initialize WalletConnect Core (for WalletKit integration)
let core: Core | null = null;
let walletKitInstance: any = null;

if (projectId) {
  try {
    core = new Core({
      projectId,
      relayUrl: 'wss://relay.walletconnect.com',
    });

    walletKitInstance = WalletKit.init({
      core,
      metadata: {
        name: 'StackCounter',
        description: 'A simple counter app on Stacks blockchain',
        url: typeof window !== 'undefined' ? window.location.origin : 'https://stackcounter.app',
        icons: ['https://avatars.githubusercontent.com/u/816174'],
      },
    });
  } catch (error) {
    console.warn('WalletKit initialization failed:', error);
  }
} else {
  console.warn('NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set. WalletKit features will be limited.');
}

// Export walletKit instance
export const walletKit = walletKitInstance;

// Helper to check if WalletKit is available
export const isWalletKitAvailable = () => {
  return walletKitInstance !== null;
};

export default walletKit;
