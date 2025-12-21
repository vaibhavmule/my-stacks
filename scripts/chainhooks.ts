#!/usr/bin/env node

import { ChainhooksClient, CHAINHOOKS_BASE_URL } from '@hirosystems/chainhooks-client';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const API_KEY = process.env.CHAINHOOKS_API_KEY || '917e408fb844db2d0535a95a92741c4c';
const DEFAULT_DEPLOYER = 'SP3AZ8QEJXQNA6SH2T9BB8GRQ8JPWJ05Z0SAD70DH';
const CONTRACT_NAME = 'daily-checkin';

// Initialize the Chainhooks client
const client = new ChainhooksClient({
  baseUrl: CHAINHOOKS_BASE_URL.mainnet,
  apiKey: API_KEY,
});

/**
 * Register a chainhook to monitor daily-checkin contract's check-in function
 * @param contractAddress - Full contract address (e.g., SP3AZ8QEJXQNA6SH2T9BB8GRQ8JPWJ05Z0SAD70DH.daily-checkin)
 *                          If not provided, will construct from default deployer
 */
async function registerDailyCheckinChainhook(contractAddress?: string): Promise<void> {
  const contractId = contractAddress || `${DEFAULT_DEPLOYER}.${CONTRACT_NAME}`;
  
  console.log(`Registering chainhook for contract: ${contractId}`);

  try {
    // Create chainhook definition with if_this/then_that structure
    // Note: For console logging, you'll need to set up a local webhook server
    // or use a service that converts webhooks to console output
    const chainhookDefinition = {
      chain: 'stacks',
      uuid: `daily-checkin-${Date.now()}`, // Generate unique UUID
      name: 'Daily Check-in Monitor',
      version: 1,
      networks: {
        mainnet: {
          if_this: {
            scope: 'contract_call',
            contract_identifier: contractId,
            method: 'check-in',
          },
          then_that: {
            http_post: {
              url: process.env.WEBHOOK_URL || 'http://localhost:3000/chainhook',
              authorization_header: `Bearer ${API_KEY}`,
            },
          },
        },
      },
    };

    // Register the chainhook
    // Try createChainhook first (based on latest API docs), fallback to registerChainhook if needed
    let result;
    try {
      result = await (client as any).createChainhook(chainhookDefinition);
    } catch (createError: any) {
      // Fallback to registerChainhook if createChainhook doesn't exist
      if (createError.message?.includes('createChainhook is not a function') || 
          createError.message?.includes('createChainhook') === false) {
        result = await (client as any).registerChainhook(chainhookDefinition);
      } else {
        throw createError;
      }
    }
    
    console.log('✅ Chainhook registered successfully!');
    console.log('Chainhook UUID:', result.uuid || chainhookDefinition.uuid);
    console.log('Details:', JSON.stringify(result, null, 2));
    console.log('\n⚠️  Note: Set up a webhook endpoint at:', chainhookDefinition.networks.mainnet.then_that.http_post.url);
    console.log('   Events will be sent as HTTP POST requests with the event data.');
  } catch (error: any) {
    console.error('❌ Failed to register chainhook:', error.message);
    if (error.response?.data) {
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    } else if (error.response) {
      console.error('Response:', error.response);
    }
    process.exit(1);
  }
}

/**
 * List all registered chainhooks
 */
async function listChainhooks(): Promise<void> {
  console.log('Fetching registered chainhooks...');

  try {
    // Try listChainhooks, fallback to getChainhooks if needed
    let chainhooks;
    try {
      chainhooks = await (client as any).listChainhooks();
    } catch (listError: any) {
      if (listError.message?.includes('listChainhooks is not a function')) {
        chainhooks = await (client as any).getChainhooks();
      } else {
        throw listError;
      }
    }
    
    console.log(`\n✅ Found ${chainhooks?.length || 0} chainhook(s):\n`);
    
    if (!chainhooks || chainhooks.length === 0) {
      console.log('No chainhooks registered.');
      return;
    }

    chainhooks.forEach((hook: any, index: number) => {
      console.log(`--- Chainhook ${index + 1} ---`);
      console.log('UUID:', hook.uuid);
      console.log('Name:', hook.name || 'N/A');
      console.log('Chain:', hook.chain || 'N/A');
      console.log('Network:', hook.network || 'N/A');
      console.log('Status:', hook.status || 'N/A');
      console.log('');
    });
  } catch (error: any) {
    console.error('❌ Failed to list chainhooks:', error.message);
    if (error.response?.data) {
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    } else if (error.response) {
      console.error('Response:', error.response);
    }
    process.exit(1);
  }
}

/**
 * Delete a chainhook by UUID
 * @param uuid - The UUID of the chainhook to delete
 */
async function deleteChainhook(uuid: string): Promise<void> {
  if (!uuid) {
    console.error('❌ UUID is required. Usage: npm run chainhooks:delete <uuid>');
    process.exit(1);
  }

  console.log(`Deleting chainhook: ${uuid}`);

  try {
    // Try deleteChainhook, fallback to removeChainhook if needed
    try {
      await (client as any).deleteChainhook(uuid);
    } catch (deleteError: any) {
      if (deleteError.message?.includes('deleteChainhook is not a function')) {
        await (client as any).removeChainhook(uuid);
      } else {
        throw deleteError;
      }
    }
    
    console.log('✅ Chainhook deleted successfully!');
  } catch (error: any) {
    console.error('❌ Failed to delete chainhook:', error.message);
    if (error.response?.data) {
      console.error('Response:', JSON.stringify(error.response.data, null, 2));
    } else if (error.response) {
      console.error('Response:', error.response);
    }
    process.exit(1);
  }
}

// Main CLI handler
async function main() {
  const command = process.argv[2];
  const arg = process.argv[3];

  switch (command) {
    case 'register':
      await registerDailyCheckinChainhook(arg);
      break;
    case 'list':
      await listChainhooks();
      break;
    case 'delete':
      if (!arg) {
        console.error('❌ UUID required for delete command');
        console.log('Usage: npm run chainhooks:delete <uuid>');
        process.exit(1);
      }
      await deleteChainhook(arg);
      break;
    default:
      console.log('Chainhooks Management CLI');
      console.log('');
      console.log('Usage:');
      console.log('  npm run chainhooks:register [contract-address]  - Register chainhook for daily-checkin');
      console.log('  npm run chainhooks:list                         - List all registered chainhooks');
      console.log('  npm run chainhooks:delete <uuid>                - Delete a chainhook by UUID');
      console.log('');
      console.log('Examples:');
      console.log('  npm run chainhooks:register');
      console.log('  npm run chainhooks:register SP3AZ8QEJXQNA6SH2T9BB8GRQ8JPWJ05Z0SAD70DH.daily-checkin');
      console.log('  npm run chainhooks:list');
      console.log('  npm run chainhooks:delete <uuid>');
      process.exit(1);
  }
}

main().catch((error) => {
  console.error('Unexpected error:', error);
  process.exit(1);
});