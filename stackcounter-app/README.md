# StackCounter App

A simple counter application built on Stacks blockchain that demonstrates Reown WalletKit SDK integration. Users can connect their Stacks wallet and interact with a counter smart contract.

## Features

- 🔗 **Wallet Connection**: Connect Stacks wallets using Reown WalletKit
- 📊 **Counter Display**: View the current count from the blockchain
- ➕ **Increment Counter**: Sign and broadcast transactions to increment the counter
- 🔍 **Transaction Tracking**: View transaction status and explorer links

## Prerequisites

- Node.js 18+ and npm
- A WalletConnect Project ID (get one at [cloud.reown.com](https://cloud.reown.com))
- A deployed counter contract on Stacks (testnet or mainnet)

## Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Configure environment variables**:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add:
   - `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID`: Your WalletConnect Project ID
   - `NEXT_PUBLIC_STACKS_NETWORK`: `testnet` or `mainnet`
   - `NEXT_PUBLIC_CONTRACT_ADDRESS`: Counter contract address
     - **Testnet**: `ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.counter` (default)
     - **Mainnet**: `SP3AZ8QEJXQNA6SH2T9BB8GRQ8JPWJ05Z0SAD70DH.counter`
   
   **Note**: The app uses the same counter contract from this repository. The contract addresses above are from the deployment plans.

3. **Run the development server**:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. Click "Connect Wallet" to open the WalletKit modal
2. Select your Stacks wallet (Hiro Wallet, Xverse, etc.)
3. Approve the connection
4. View the current counter value
5. Click "Increment Counter" to create and sign a transaction
6. Wait for transaction confirmation
7. The counter will update automatically

## Project Structure

```
stackcounter-app/
├── app/
│   ├── components/
│   │   └── WalletButton.tsx    # Wallet connection component
│   ├── lib/
│   │   ├── walletkit.ts        # WalletKit initialization
│   │   ├── contract.ts         # Contract interaction utilities
│   │   └── stacks-wallet.ts    # Stacks wallet helpers
│   ├── globals.css             # Global styles
│   ├── layout.tsx              # Root layout
│   └── page.tsx                # Main application page
├── .env.example                # Environment variables template
├── package.json                # Dependencies and scripts
└── README.md                   # This file
```

## Technologies

- **Next.js 14**: React framework
- **Reown WalletKit**: Wallet connection SDK (demonstrated)
- **@stacks/connect**: Stacks wallet connection library (primary implementation)
- **@stacks/transactions**: Stacks blockchain transaction library
- **Tailwind CSS**: Styling

## Implementation Notes

This app demonstrates Reown WalletKit SDK integration concepts. For Stacks blockchain, the primary wallet connection is implemented using `@stacks/connect`, which is the standard library for connecting Stacks wallets (Hiro Wallet, Xverse, etc.). WalletKit is initialized and demonstrated, but the actual wallet connection uses Stacks Connect for full Stacks blockchain support.

## Notes

- The app defaults to Stacks testnet for development
- Uses the same `counter.clar` contract from this repository
- Contract addresses are pre-configured based on deployment plans:
  - **Testnet**: `ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.counter`
  - **Mainnet**: `SP3AZ8QEJXQNA6SH2T9BB8GRQ8JPWJ05Z0SAD70DH.counter`
- Make sure the counter contract is deployed before using the app
- Transaction signing uses `@stacks/connect` for Stacks wallet integration

## Troubleshooting

- **Wallet won't connect**: Check that `NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID` is set correctly
- **Can't read count**: Verify `NEXT_PUBLIC_CONTRACT_ADDRESS` is correct and the contract is deployed
- **Transaction fails**: Ensure you have enough STX for transaction fees

## License

ISC
