# Agentic Commerce

Job escrow with budget, provider, evaluator, and x402 payments.

## Job States

1. **Open** - Created, budget not set or funded
2. **Funded** - Budget escrowed, provider can submit
3. **Submitted** - Work submitted, evaluator can complete/reject
4. **Completed** - Payment released to provider
5. **Rejected** - Escrow refunded to client
6. **Expired** - Escrow refunded to client after deadline

## Functions

### create-job
Create a new job.

```clarity
(create-job client evaluator expiredAt description)
```

### set-budget
Set the budget for a job.

```clarity
(set-budget job-id amount)
```

### fund-job
Fund the job (escrow).

```clarity
(fund-job job-id)
```

### submit-work
Submit work.

```clarity
(submit-work job-id deliverable)
```

### complete-job
Complete job (payments to provider).

```clarity
(complete-job job-id)
```

### reject-job
Reject job (refund to client).

```clarity
(reject-job job-id)
```

### get-job
Get job by ID.

```clarity
(get-job job-id)
```

## Upgradeability

The contract uses the registry/implementation pattern. Only the owner can upgrade:

```clarity
(upgrade-implementation new-impl-principal)
```
