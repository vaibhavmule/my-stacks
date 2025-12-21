#!/usr/bin/env node

/**
 * Simple webhook server for receiving and logging chainhook events to console
 * 
 * Usage:
 *   1. Start this server: npm run chainhooks:server
 *   2. Register chainhook with webhook URL: http://localhost:3000/chainhook
 *   3. Events will be logged to console as they arrive
 */

import http from 'http';

const PORT = process.env.PORT || 3000;

const server = http.createServer((req, res) => {
  if (req.method === 'POST' && req.url === '/chainhook') {
    let body = '';

    req.on('data', (chunk) => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const event = JSON.parse(body);
        
        // Log the event with structured output
        console.log('\n' + '='.repeat(80));
        console.log('📥 Chainhook Event Received');
        console.log('='.repeat(80));
        console.log(JSON.stringify(event, null, 2));
        console.log('='.repeat(80) + '\n');

        // Send success response
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'ok', received: true }));
      } catch (error) {
        console.error('Error parsing webhook payload:', error);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Invalid JSON' }));
      }
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

server.listen(PORT, () => {
  console.log(`🚀 Webhook server listening on http://localhost:${PORT}`);
  console.log(`📡 Ready to receive chainhook events at http://localhost:${PORT}/chainhook`);
  console.log('Press Ctrl+C to stop the server\n');
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n\n👋 Shutting down webhook server...');
  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});
