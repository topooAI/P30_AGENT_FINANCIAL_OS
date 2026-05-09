export const CTF_ABI = [
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "name": "operator", "type": "address" },
      { "indexed": true, "name": "from", "type": "address" },
      { "indexed": true, "name": "to", "type": "address" },
      { "indexed": false, "name": "id", "type": "uint256" },
      { "indexed": false, "name": "value", "type": "uint256" }
    ],
    "name": "TransferSingle",
    "type": "event"
  }
] as const;

export const EXCHANGE_ABI = [
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "name": "orderHash", "type": "bytes32" },
      { "indexed": true, "name": "maker", "type": "address" },
      { "indexed": true, "name": "taker", "type": "address" },
      { "indexed": false, "name": "makerAmount", "type": "uint256" },
      { "indexed": false, "name": "takerAmount", "type": "uint256" },
      { "indexed": false, "name": "feeAmount", "type": "uint256" }
    ],
    "name": "OrderFilled",
    "type": "event"
  }
] as const;
