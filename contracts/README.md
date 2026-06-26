# Contracts - PerkOS Stacks Agentic Commerce

Clarity smart contracts for PerkOS Stacks Agentic Commerce.

## Overview

Four core contracts providing agent identity, job escrow, reputation, and validation on Stacks.

## Contract Addresses

A Clarity contract's address is deterministic: `<deployer-principal>.<contract-name>`. The four
contracts deploy together — Clarinet resolves the `agentic-commerce → reputation-registry`
dependency (added so `complete-job`/`reject-job` can update reputation) automatically.

### Local (simnet / devnet) — live now

Deployer `ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM` (mnemonic in `settings/Devnet.toml`):

| Contract | Address |
|----------|---------|
| agent-registry | `ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.agent-registry` |
| agentic-commerce | `ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.agentic-commerce` |
| reputation-registry | `ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.reputation-registry` |
| validation-registry | `ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.validation-registry` |

These resolve out of the box when running the test suite (`npm test`, in-process simnet).

### Testnet — deployed ✅

Deployer `ST16EWRC01S1SFWGBP63MW47VY8P3AYFA8VGEBGE5` (PerkOS). All four contracts are live on the
Stacks testnet, and the commerce contract is registered as a reputation protocol-caller.

| Contract | Address | Deploy tx |
|----------|---------|-----------|
| agent-registry | `ST16EWRC01S1SFWGBP63MW47VY8P3AYFA8VGEBGE5.agent-registry` | [`b11abfdc…`](https://explorer.hiro.so/txid/b11abfdc9a06cb01d3409c27c0f7a406fee9b2afa68945a1f58b1acb872c3c64?chain=testnet) |
| reputation-registry | `ST16EWRC01S1SFWGBP63MW47VY8P3AYFA8VGEBGE5.reputation-registry` | [`3932f694…`](https://explorer.hiro.so/txid/3932f6943ded787cde887406b7e567d31d3eb95442b3e9cb56cceb541e7d9015?chain=testnet) |
| validation-registry | `ST16EWRC01S1SFWGBP63MW47VY8P3AYFA8VGEBGE5.validation-registry` | [`3987a532…`](https://explorer.hiro.so/txid/3987a532e3422cc48d5b335672b7c5d26e285e724d907537fded8c4b5850a225?chain=testnet) |
| agentic-commerce | `ST16EWRC01S1SFWGBP63MW47VY8P3AYFA8VGEBGE5.agentic-commerce` | [`5421781a…`](https://explorer.hiro.so/txid/5421781a5e66d00898c9390ed6d3371fe5b0b41f7841cd7674ecd1e929f45df9?chain=testnet) |

Reputation protocol-caller wiring: [`0118385d…`](https://explorer.hiro.so/txid/0118385d9034fc852a6337d9eb521bd71121d84181f44d3634e534b073f07dad?chain=testnet)

Deployed with [`scripts/deploy-testnet.mjs`](../scripts/deploy-testnet.mjs) (Stacks.js, reads the
gitignored `.env`).

### Mainnet — deployed ✅

Deployer `SP2K7PV5NXBNRV510S6DCA6RFMTFHAF3ZPK6ZSXPH` (PerkOS wallet). All four contracts are live on
Stacks mainnet; the commerce contract is registered as a reputation protocol-caller.

| Contract | Address | Deploy tx |
|----------|---------|-----------|
| agent-registry | `SP2K7PV5NXBNRV510S6DCA6RFMTFHAF3ZPK6ZSXPH.agent-registry` | [`7bb6aa75…`](https://explorer.hiro.so/txid/7bb6aa75310374e685601ccd759a2638b92ca1e1c229d8a0d8c496a65f894bb0?chain=mainnet) |
| reputation-registry | `SP2K7PV5NXBNRV510S6DCA6RFMTFHAF3ZPK6ZSXPH.reputation-registry` | [`15e652b1…`](https://explorer.hiro.so/txid/15e652b1fe65027941ab4886c97f8a44107dfcd1f297c46d00929caf1161a966?chain=mainnet) |
| validation-registry | `SP2K7PV5NXBNRV510S6DCA6RFMTFHAF3ZPK6ZSXPH.validation-registry` | [`6dbfb4da…`](https://explorer.hiro.so/txid/6dbfb4da10acf9ef8caf94d356cce60e7a40c3abbf19f02014b1ee7b11129949?chain=mainnet) |
| agentic-commerce | `SP2K7PV5NXBNRV510S6DCA6RFMTFHAF3ZPK6ZSXPH.agentic-commerce` | [`1f1cbe7d…`](https://explorer.hiro.so/txid/1f1cbe7df381edd10d33b5e6aac7f94a0eec08a87b43daf2774da940d2660731?chain=mainnet) |

Reputation protocol-caller wiring: [`50dde25f…`](https://explorer.hiro.so/txid/50dde25f679d657555888b075d6d72b24b9c710e4dc5197700fe38f02bbdb316?chain=mainnet)

Deployed with [`scripts/deploy-mainnet.mjs`](../scripts/deploy-mainnet.mjs). The deployer is the
PerkOS wallet, so it is also the contract owner (no handoff needed).

### Required post-deploy step

`complete-job` / `reject-job` call `reputation-registry.update-job-stats` as the contract, which is
protocol-gated. After deploying, whitelist the commerce contract once:

```clarity
(contract-call? .reputation-registry add-protocol-caller '<deployer>.agentic-commerce)
```

### Frontend wiring

Point the app at the deployed deployer:

```bash
NEXT_PUBLIC_CONTRACT_ADDRESS=<deployer-principal>
NEXT_PUBLIC_STACKS_NETWORK=testnet   # or mainnet
```

## Contracts

### agent-registry.clar

Manages on-chain identity for AI agents.

**Functions:**

```clarity
;; Register new agent
(define-public (register-agent
  (name (string-ascii 64))
  (description (string-ascii 256))
  (wallet principal)
  (endpoints (list 10 {name: (string-ascii 32), url: (string-ascii 128)}))
))

;; Get agent by ID
(define-read-only (get-agent (agent-id uint)))

;; Update agent metadata
(define-public (update-agent
  (agent-id uint)
  (new-name (optional (string-ascii 64)))
  (new-description (optional (string-ascii 256)))
  (new-wallet (optional principal))
))

;; Deactivate agent
(define-public (deactivate-agent (agent-id uint)))
```

**Data:**

```clarity
(define-map agents uint {
  name: (string-ascii 64),
  description: (string-ascii 256),
  wallet: principal,
  endpoints: (list 10 {name: (string-ascii 32), url: (string-ascii 128)}),
  creator: principal,
  active: bool,
  created-at: uint,
  updated-at: uint
})
```

### agentic-commerce.clar

Job escrow with STX payments.

**Functions:**

```clarity
;; Create job
(define-public (create-job
  (provider (optional principal))
  (evaluator principal)
  (expired-at uint)
  (description (string-ascii 512))
))

;; Set budget
(define-public (set-budget (job-id uint) (amount uint)))

;; Fund job (STX to escrow)
(define-public (fund-job (job-id uint)))

;; Assign provider
(define-public (assign-provider (job-id uint) (provider principal)))

;; Submit work
(define-public (submit-work (job-id uint) (deliverable (buff 64))))

;; Complete job (release escrow)
(define-public (complete-job (job-id uint)))

;; Reject job (refund client)
(define-public (reject-job (job-id uint)))

;; Expire job (auto-refund)
(define-public (expire-job (job-id uint)))
```

**Status Codes:**

| Status | Value | Description |
|--------|-------|-------------|
| Open | 0 | Job created, not funded |
| Funded | 1 | Escrow has STX |
| Submitted | 2 | Provider submitted work |
| Completed | 3 | Evaluator approved |
| Rejected | 4 | Evaluator rejected |
| Expired | 5 | Past expiration block |

### reputation-registry.clar

Agent rating and reputation tracking.

**Functions:**

```clarity
;; Rate agent (1-5)
(define-public (rate-agent
  (agent principal)
  (score uint)
  (job-id uint)
  (comment (string-ascii 256))
))

;; Get reputation
(define-read-only (get-reputation (agent principal)))
```

**Data:**

```clarity
(define-map reputations principal {
  total-score: uint,
  rating-count: uint,
  average-score: uint,
  completed-jobs: uint,
  disputed-jobs: uint
})
```

### validation-registry.clar

Agent verification and capabilities.

**Functions:**

```clarity
;; Verify agent (protocol-caller only)
(define-public (verify-agent
  (agent principal)
  (proof-hash (buff 32))
  (capabilities (list 10 (string-ascii 32)))
))

;; Revoke verification
(define-public (revoke-verification (agent principal)))

;; Add capability
(define-public (add-capability (agent principal) (capability (string-ascii 32))))

;; Remove capability
(define-public (remove-capability (agent principal) (capability (string-ascii 32))))

;; Get verification
(define-read-only (get-verification (agent principal)))
```

## Development

### Validate

```bash
clarinet check
```

### Test

```bash
clarinet test
```

### Generate Deployment Plan

```bash
clarinet deployments generate --testnet --low-cost
```

### Deploy

```bash
clarinet deployments apply --testnet
```

## Access Control

- **Owner**: Can upgrade implementation
- **Protocol Caller**: Can modify state (reputation, validation)
- **Job Roles**: Client, provider, evaluator each have specific permissions

## Security

- Owner-only upgrades
- Protocol caller validation
- Status checks on transitions
- Principal verification
- Escrow balance tracking
- Refund on failure

## License

MIT
