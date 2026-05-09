-- Pure Reason D1 Schema

-- Table for tracking whale movements
CREATE TABLE IF NOT EXISTS whale_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  whale_name TEXT,
  wallet_address TEXT,
  type TEXT, -- BUY / SELL
  token_id TEXT,
  amount TEXT,
  timestamp INTEGER,
  logic_score REAL DEFAULT 0, -- Verified logic score from MiroFish
  logic_reasoning TEXT -- Summary of WHY the logic matched or failed
);

-- Table for PnL history
CREATE TABLE IF NOT EXISTS pnl_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp INTEGER,
  net_worth REAL,
  change_24h REAL
);

-- Table for logic engine audits
CREATE TABLE IF NOT EXISTS logic_audits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  event_id INTEGER,
  consensus_probability REAL,
  whale_logic_match TEXT,
  reasoning_summary TEXT,
  timestamp INTEGER,
  FOREIGN KEY(event_id) REFERENCES whale_events(id)
);
