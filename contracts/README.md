# Contracts - PerkOS Stacks Agentic Commerce

Clarity smart contracts for PerkOS Stacks Agentic Commerce.

## Overview

Four core contracts providing agent identity, job escrow, reputation, and validation on Stacks.

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
;; Verify agent
(define-public (verify-agent
  (agent principal)
  (proof-hash (string-ascii 64))
  (verification-type (string-ascii 32))
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
