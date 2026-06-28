# Immutable TypeScript SDK — Behavior-Typed Architecture

This repository keeps the existing TypeScript SDK packages intact while adding an AllasCode semantic layer over them.

The current codebase is still organized as an MCP TypeScript SDK monorepo. The root workspace loads `packages/**/*`, `common/**/*`, `examples/**/*`, and `test/**/*`. The public package surface is mainly split into `@modelcontextprotocol/client`, `@modelcontextprotocol/server`, `@modelcontextprotocol/core`, and private `@modelcontextprotocol/core-internal`.

The new layer does not replace package code blindly. It creates a source-of-truth semantic model that can compile public TypeScript barrels from `.uml`, then progressively move package internals into entity, property, QuarkBehavior, AtomicBehavior, Intent, and OpenEntityChannels files.

## Folder architecture

```text
src/
  Entities/
    SDK/
      entity.yml
      properties/*.yml
    ClientPackage/
      entity.yml
      properties/*.yml
    ServerPackage/
      entity.yml
      properties/*.yml
    CorePackage/
      entity.yml
      properties/*.yml
  Contracts/
    immutable-typescript-sdk.contract.yml
  OpenEntityChannels/
    openentitychannels.json
    openentitychannels.yml
  Schemas/
    atomicbehavior.schema.json
    entity.schema.json
    openentitychannels.schema.json
    property.schema.json
    quarkbehavior.schema.json
  QuarkBehaviors/
    */behavior.yml
    */schema.json
    */behavior.2flow
  AtomicBehaviors/
    */behavior.yml
    */schema.json
    */behavior.2flow
  Intents/
    Intent.2flow
    SystemIntents.2flow
  UML/
    immutable-typescript-sdk.uml
scripts/
  compile-uml-to-ts.ts
```

## Refactor rule

The TypeScript packages remain compatible until the compiler can regenerate each public file byte-for-byte from `src/UML/immutable-typescript-sdk.uml`.

The first compiler target is the public barrel layer:

```text
packages/client/src/index.ts
packages/server/src/index.ts
packages/core/src/index.ts
```

Run:

```bash
pnpm compile:uml
pnpm check:uml
```

`compile:uml` writes the generated TypeScript files. `check:uml` compares generated output against the existing files and fails if they differ.

## Semantics

Entities define stable identities. Property files define one property each. QuarkBehaviors are deterministic micro-behaviors with JSON Schema. AtomicBehaviors compose QuarkBehaviors using `.2flow`. System intents define runtime capabilities. User-facing intents define agent-delegable behavior.

This keeps compatibility with the current SDK while introducing Behavior-Typed Language artifacts without hiding behavior inside implicit TypeScript modules.
