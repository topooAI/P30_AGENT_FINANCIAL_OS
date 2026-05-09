import { createPublicClient, http, parseAbiItem } from 'viem';
import { polygon } from 'viem/chains';
import { CTF_ABI } from './abi';
import { WHALE_WATCHLIST } from './config';

const CTF_CONTRACT_ADDRESS = '0x4D97022061FE381B811B711B8D142EB9098233D0';

export class WhaleTracker {
  private client;
  private watchList: string[];

  constructor() {
    this.client = createPublicClient({
      chain: polygon,
      transport: http('https://polygon-rpc.com'), // Should use a private RPC in production
    });
    this.watchList = WHALE_WATCHLIST.map(w => w.address.toLowerCase());
  }

  public async startTracking() {
    console.log('--- Whale Tracker Started ---');
    console.log(`Monitoring ${this.watchList.length} wallets...`);

    this.client.watchContractEvent({
      address: CTF_CONTRACT_ADDRESS,
      abi: CTF_ABI,
      eventName: 'TransferSingle',
      onLogs: (logs) => {
        for (const log of logs) {
          const { from, to, id, value } = log.args;
          
          if (from && this.watchList.includes(from.toLowerCase())) {
            this.handleWhaleMovement(from, 'SELL', id!, value!);
          }
          
          if (to && this.watchList.includes(to.toLowerCase())) {
            this.handleWhaleMovement(to, 'BUY', id!, value!);
          }
        }
      },
    });
  }

  private async handleWhaleMovement(address: string, type: 'BUY' | 'SELL', tokenId: bigint, amount: bigint) {
    const whale = WHALE_WATCHLIST.find(w => w.address.toLowerCase() === address.toLowerCase());
    const event = {
      whale: whale?.name || address,
      type,
      tokenId: tokenId.toString(),
      amount: amount.toString(),
      time: new Date().toLocaleTimeString(),
    };

    console.log(`[SHADOW ALERT] ${event.whale} ${event.type} Token ${event.tokenId} Amount: ${event.amount}`);
    
    // Trigger MiroFish logic analysis
    const logicEngine = new (await import('../strategies/logic-engine')).LogicEngine();
    const result = await logicEngine.analyzeWhaleAction(
      { title: "Sample Market" }, // Placeholder market context
      event,
      "Breaking: New polling data released in key swing states." // Placeholder news
    );

    console.log(`[LOGIC RESULT] Consensus: ${result.consensus_probability * 100}% | Match: ${result.whale_logic_match}`);
    console.log(`[REASONING] ${result.reasoning_summary}`);
    
    // TODO: Push to WebSocket/Frontend
  }
}
