# Chainhooks

Hiro Chainhooks stream on-chain contract events to a webhook in real time. This indexes PerkOS
mainnet activity (new agents, jobs, completions) to power `/stats`, notifications, and to register
Chainhooks usage for Stacks Builder Rewards.

## Receiver
A live endpoint ships with the app: `https://stacks.perkos.xyz/api/chainhook`
(`App/src/app/api/chainhook/route.ts`). It validates an optional `CHAINHOOK_SECRET` bearer token and
acknowledges. Wire the `apply` payload to a store (Vercel KV / Postgres) to persist the index.

## Predicates
- `register-agent.json` watches `SP2K7PV5NXBNRV510S6DCA6RFMTFHAF3ZPK6ZSXPH.agent-registry::register-agent`.

Add more predicates per high-value method (one file each): `agentic-commerce::fund-job`,
`agentic-commerce::complete-job`, `agentic-commerce::create-job`, `reputation-registry::rate-agent`.

## Register
1. Set a secret: `CHAINHOOK_SECRET` env var on Vercel, and the matching `Bearer` in each predicate.
2. Register the predicate on the Hiro Platform (Chainhooks) pointing at the receiver URL, or run a
   local `chainhook` node with `chainhook predicates scan register-agent.json`.
