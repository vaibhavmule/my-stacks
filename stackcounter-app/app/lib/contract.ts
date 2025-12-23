import {
  callReadOnlyFunction,
  broadcastTransaction,
  makeContractCall,
  AnchorMode,
  PostConditionMode,
  StacksNetwork,
  StacksTestnet,
  StacksMainnet,
} from '@stacks/transactions';

const network = (process.env.NEXT_PUBLIC_STACKS_NETWORK || 'testnet') === 'mainnet'
  ? new StacksMainnet()
  : new StacksTestnet();

const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '';

export interface ContractConfig {
  contractAddress: string;
  contractName: string;
  network: StacksNetwork;
}

export const getContractConfig = (): ContractConfig => {
  if (!contractAddress) {
    throw new Error('NEXT_PUBLIC_CONTRACT_ADDRESS is not set in environment variables');
  }

  const [deployer, contractName] = contractAddress.split('.');
  if (!deployer || !contractName) {
    throw new Error('Invalid contract address format. Expected: DEPLOYER_ADDRESS.contract-name');
  }

  return {
    contractAddress: deployer,
    contractName,
    network,
  };
};

/**
 * Get the current count from the counter contract
 */
export const getCount = async (): Promise<number> => {
  try {
    const config = getContractConfig();
    
    const result = await callReadOnlyFunction({
      network: config.network,
      contractAddress: config.contractAddress,
      contractName: config.contractName,
      functionName: 'get-count',
      functionArgs: [],
      senderAddress: config.contractAddress, // Use contract address as sender for read-only
    });

    // Parse the result - it should be a uint wrapped in an ok response
    if (result && typeof result === 'object' && 'value' in result) {
      const value = (result as any).value;
      if (typeof value === 'bigint') {
        return Number(value);
      }
      return Number(value);
    }

    return 0;
  } catch (error) {
    console.error('Error fetching count:', error);
    throw error;
  }
};

/**
 * Create an increment transaction
 */
export const createIncrementTransaction = async (senderKey: string) => {
  try {
    const config = getContractConfig();
    
    const txOptions = {
      contractAddress: config.contractAddress,
      contractName: config.contractName,
      functionName: 'increment',
      functionArgs: [],
      senderKey,
      network: config.network,
      anchorMode: AnchorMode.Any,
      postConditionMode: PostConditionMode.Allow,
      fee: 1000, // Minimum fee
    };

    const transaction = await makeContractCall(txOptions);
    return transaction;
  } catch (error) {
    console.error('Error creating increment transaction:', error);
    throw error;
  }
};

/**
 * Broadcast a signed transaction
 */
export const broadcastIncrementTransaction = async (transaction: any) => {
  try {
    const result = await broadcastTransaction(transaction, network);
    return result;
  } catch (error) {
    console.error('Error broadcasting transaction:', error);
    throw error;
  }
};

export { network };
