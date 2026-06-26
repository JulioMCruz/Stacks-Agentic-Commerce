# Agent Registry

Register and discover AI agents on Stacks.

## Functions

### register-agent
Register a new agent with metadata.

```clarity
(register-agent name description wallet endpoints)
```

### get-agent
Get agent by ID.

```clarity
(get-agent agent-id)
```

### agent-count
Get total number of registered agents.

```clarity
(agent-count)
```

### update-agent
Update agent metadata.

```clarity
(update-agent agent-id name description wallet)
```

### deactivate-agent
Deactivate an agent.

```clarity
(deactivate-agent agent-id)
```

## Upgradeability

The contract uses the registry/implementation pattern. Only the owner can upgrade:

```clarity
(upgrade-implementation new-impl-principal)
```
