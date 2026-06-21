import { rm } from "node:fs/promises";
import { packSourceRoot } from "./pack-paths.mjs";

await rm(packSourceRoot, { recursive: true, force: true });

await import("./build-skill-source.mjs");
await import("./build-chapter-2-content-source.mjs");
await import("./build-chapter-3-technique-source.mjs");
await import("./build-equipment-source.mjs");
await import("./build-npc-source.mjs");
await import("./build-packs.mjs");

await rm(packSourceRoot, { recursive: true, force: true });
