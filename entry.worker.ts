import { createPublicClient, http, parseAbiItem } from 'viem';
import { polygon } from 'viem/chains';

interface Env {
  DB: D1Database;
  DEPLOY_ID: string;
}

const CTF_CONTRACT_ADDRESS = '0x4D97022061FE381B811B711B8D142EB9098233D0';
const WHALE_WATCHLIST = [
  { address: '0x4bFbE651E49eDB33c7f99967664B566494F36075', name: 'RN1 (Top Whale)' }
];

export default {
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    console.log(`[Pure Reason] Cron triggered at ${event.scheduledTime}. Deploy ID: ${env.DEPLOY_ID}`);
    
    const client = createPublicClient({
      chain: polygon,
      transport: http('https://polygon-rpc.com'),
    });

    const watchList = WHALE_WATCHLIST.map(w => w.address.toLowerCase());

    // Pull logs for the last 100 blocks (approx 4 minutes on Polygon)
    const logs = await client.getLogs({
      address: CTF_CONTRACT_ADDRESS,
      event: parseAbiItem('event TransferSingle(address indexed operator, address indexed from, address indexed to, uint256 id, uint256 value)'),
      fromBlock: 'latest',
      // In a real worker, we'd store the last processed block in D1 or KV
    });

    for (const log of logs) {
      const { from, to, id, value } = log.args;
      
      const isFromWhale = from && watchList.includes(from.toLowerCase());
      const isToWhale = to && watchList.includes(to.toLowerCase());

      if (isFromWhale || isToWhale) {
        const type = isToWhale ? 'BUY' : 'SELL';
        const address = isToWhale ? to : from;
        const whale = WHALE_WATCHLIST.find(w => w.address.toLowerCase() === address?.toLowerCase());

        console.log(`[FOUND WHALE] ${whale?.name} ${type} token ${id}`);

        // SAVE TO D1
        await env.DB.prepare(
          "INSERT INTO whale_events (whale_name, wallet_address, type, token_id, amount, timestamp) VALUES (?, ?, ?, ?, ?, ?)"
        ).bind(
          whale?.name || address,
          address,
          type,
          id?.toString(),
          value?.toString(),
          Math.floor(Date.now() / 1000)
        ).run();
      }
    }
  },

  async fetch(request: Request, env: Env, ctx: ExecutionContext) {
    const url = new URL(request.url);
    
    // Simple API endpoint for the frontend
    if (url.pathname === "/api/whale-events") {
      const { results } = await env.DB.prepare(
        "SELECT * FROM whale_events ORDER BY timestamp DESC LIMIT 20"
      ).all();
      
      return new Response(JSON.stringify(results), {
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" }
      });
    }

    return new Response("Pure Reason OS Worker is active.", { status: 200 });
  }
};
