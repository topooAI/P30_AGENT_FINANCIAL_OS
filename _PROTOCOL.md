# Project Protocol: P30_AGENT_FINANCIAL_OS (Agent Financial OS)

> **Mission**: Build an Agent-native Financial Operating System for strategy orchestration, risk control, execution, and audit.
> **Core Objective**: To provide a reliable and extensible finance automation backbone for multi-agent operations.
> **Scope**: Data ingestion, strategy engine, risk engine, execution engine, and audit/replay system.

## 1. Architecture
* **Agent Source**: `0_SYSTEM/4_AGENTS`
* **Agent Instance**: `1_PROJECTS/P30_AGENT_FINANCIAL_OS/agents/` (Synced via _sync_brain.py)

## 2. Product Definition
* **Category**: Agent-native financial operations platform
* **Core Value**: Unified pipeline from market signal to controlled execution and post-trade analysis
* **Key Capabilities**:
  * Multi-source market/account data ingestion and normalization
  * Agent-based strategy planning and allocation
  * Rule + model hybrid risk controls before and during execution
  * Broker/exchange adapter layer for robust order execution
  * Full decision-chain logging for auditability and replay

## 3. Roadmap
* [ ] Phase 1: Domain model and system architecture
* [ ] Phase 2: Data + strategy service MVP
* [ ] Phase 3: Risk + execution closed loop
* [ ] Phase 4: Audit, attribution, and scaling
