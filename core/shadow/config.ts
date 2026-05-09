export interface Whale {
  address: string;
  name: string;
  reputation: "High" | "Medium" | "Expert";
  notes: string;
}

export const WHALE_WATCHLIST: Whale[] = [
  {
    address: "0x695f269a4921b6aa105bd136a...", // Placeholder for RN1 real address
    name: "RN1",
    reputation: "Expert",
    notes: "High win rate, strategic betting in political markets.",
  },
  {
    address: "0x1234567890123456789012345678901234567890", // Placeholder for swisstony
    name: "swisstony",
    reputation: "Expert",
    notes: "Aggressive market maker and directional bettor.",
  },
  {
    address: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd", // Placeholder for kch123
    name: "kch123",
    reputation: "High",
    notes: "Consistent performer in niche markets.",
  },
];
