// post-x-promote-make-your-own-bounty-01 entry (Node 22, standard library only).
//
// The entry itself is a post on X that quotes make.fun's make-your-own-bounty
// post, carries a photo, the make.fun link and the entrant's play code. This
// program's only job is to hand the house that post's address: it reads
// POST.json from the repository root, checks it really names an X post, and
// writes the same bytes to /output/POST.json, where the gate reads them.
//
// Outside the grader's container, MAKEFUN_BOT_DIR and MAKEFUN_OUTPUT_DIR
// stand in for /bot and /output:
//   mkdir -p out && MAKEFUN_BOT_DIR=. MAKEFUN_OUTPUT_DIR=out node main.ts

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const BOT_DIR = process.env.MAKEFUN_BOT_DIR ?? "/bot";
const OUTPUT_DIR = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const source = join(BOT_DIR, "POST.json");
const target = join(OUTPUT_DIR, "POST.json");

if (!existsSync(source)) {
  throw new Error("POST.json is missing from the repository root");
}
const raw = readFileSync(source, "utf8");
let parsed: unknown;
try {
  parsed = JSON.parse(raw);
} catch {
  throw new Error("POST.json does not parse as JSON");
}
const url =
  typeof parsed === "object" && parsed !== null
    ? (parsed as Record<string, unknown>).url
    : undefined;
if (typeof url !== "string" || !/\/status\/\d+/.test(url)) {
  throw new Error("POST.json has no url shaped like an X post address");
}
// The address must actually point at X (or its twitter.com mirror): a
// /status/<id> path on any other host is not a post the house can read.
let host: string;
try {
  host = new URL(url).hostname.replace(/^(www\.|mobile\.)/, "");
} catch {
  throw new Error("POST.json url does not parse as a URL");
}
if (host !== "x.com" && host !== "twitter.com") {
  throw new Error(`POST.json url points at ${host}, not at X`);
}

mkdirSync(OUTPUT_DIR, { recursive: true });
writeFileSync(target, raw);
const roundTrip = readFileSync(target, "utf8");
if (roundTrip !== raw) {
  throw new Error("round-trip check failed: output bytes differ from POST.json");
}
console.log(`post-x-promote: handed in ${url}`);
