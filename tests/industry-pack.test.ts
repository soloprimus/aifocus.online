// The industry pack stays self-consistent: the vocabulary the models may use, the topics built on it, the
// chain map, the lists written into the understanding prompt, the score weights and the seeded sources.
// These are the files an editor changes most; a slip here would silently empty a topic or a tag.
// Needs no database.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { test } from "node:test";
import { CHAIN_LAYERS, TOPIC_GROUPS } from "@aihot/industry/chain";
import {
  CATEGORIES, CATEGORY_BY_ITEM_TYPE, CATEGORY_TAGS, ENTITIES, ENTITY_TAGS, IDENTITY_LEXICON, ITEM_TYPES, TAG_SYNONYMS, TOPIC_TAGS,
} from "@aihot/industry/taxonomy";
import { unsupportedConfig } from "@aihot/backend/sources/config-keys";

const INDUSTRY = path.join(import.meta.dirname, "../industry");
const read = (file: string) => readFileSync(path.join(INDUSTRY, file), "utf8");
const topics = (JSON.parse(read("topics.json")) as {
  topics: Array<{ slug: string; name: string; group: string; entityId?: string; tags: string[]; related?: string[] }>;
}).topics;
const sources = (JSON.parse(read("sources.json")) as {
  sources: Array<{ id: string; kind: "rss"; config: Record<string, unknown>; tier: string; owner_entity_id: string | null }>;
}).sources;
const VOCABULARY = new Set<string>([...CATEGORY_TAGS, ...TOPIC_TAGS, ...ENTITY_TAGS]);

test("topics match on tags the models can actually give", () => {
  const slugs = new Set(topics.map((t) => t.slug));
  assert.equal(slugs.size, topics.length, "duplicate topic slugs");
  for (const t of topics) {
    assert.ok(TOPIC_GROUPS.some((g) => g.key === t.group), `${t.slug}: unknown group ${t.group}`);
    if (t.entityId) assert.ok(ENTITIES[t.entityId], `${t.slug}: unknown entity ${t.entityId}`);
    else for (const tag of t.tags) assert.ok(VOCABULARY.has(tag), `${t.slug}: tag ${tag} is not in the vocabulary`);
    for (const r of t.related ?? []) assert.ok(slugs.has(r), `${t.slug}: related topic ${r} does not exist`);
  }
});

test("the chain map places each field topic once, and only field topics", () => {
  const field = new Map(topics.filter((t) => t.group === "field").map((t) => [t.slug, t]));
  const placed: string[] = CHAIN_LAYERS.flatMap((l) => [...l.topics]);
  assert.equal(new Set(placed).size, placed.length, "a topic sits in two layers");
  for (const slug of placed) assert.ok(field.has(slug), `chain layer lists ${slug}, which is not a field topic`);
  assert.deepEqual([...field.keys()].filter((s) => !placed.includes(s)), [], "field topics missing from the chain map");
});

test("tag vocabulary, synonyms and item types agree", () => {
  const displayTags = Object.values(ENTITIES).flatMap((e) => (e.displayTag ? [e.displayTag] : []));
  assert.deepEqual([...displayTags].sort(), [...ENTITY_TAGS].sort(), "ENTITY_TAGS must equal the entities' display tags");
  for (const [from, to] of Object.entries(TAG_SYNONYMS)) assert.ok(VOCABULARY.has(to), `synonym ${from} → ${to} maps outside the vocabulary`);
  for (const type of ITEM_TYPES) assert.ok((CATEGORY_TAGS as readonly string[]).includes(CATEGORY_BY_ITEM_TYPE[type] ?? ""), `no category tag for ${type}`);
  assert.equal(new Set(CATEGORIES.map((c) => c.key)).size, CATEGORIES.length, "duplicate category keys");
});

test("the understanding prompt lists exactly the pack's types and tags", () => {
  const prompt = readFileSync(path.join(INDUSTRY, "prompts/content-understanding.md"), "utf8");
  for (const word of [...ITEM_TYPES.map((t) => `\`${t}\``), ...CATEGORY_TAGS, ...TOPIC_TAGS, ...ENTITY_TAGS]) {
    assert.ok(prompt.includes(word), `content-understanding.md does not mention ${word}`);
  }
});

test("every item type has a score weight row that sums to 10", () => {
  const prompt = readFileSync(path.join(INDUSTRY, "prompts/selection-score.md"), "utf8");
  for (const type of ITEM_TYPES) {
    const row = prompt.match(new RegExp(`^\\| ${type} \\|([^\\n]+)$`, "m"));
    assert.ok(row, `selection-score.md has no weight row for ${type}`);
    const weights = row[1]!.split("|").map((c) => c.trim()).filter(Boolean).map(Number);
    assert.equal(weights.length, 5, `${type}: five weights`);
    assert.equal(weights.reduce((a, b) => a + b, 0), 10, `${type}: weights sum to 10`);
  }
});

test("seeded sources are well-formed", () => {
  const ids = new Set(sources.map((s) => s.id));
  assert.equal(ids.size, sources.length, "duplicate source ids");
  const lexicon = new Set(IDENTITY_LEXICON.map((e) => e.id));
  for (const s of sources) {
    assert.deepEqual(unsupportedConfig(s.kind, s.config), [], `${s.id}: unsupported config`);
    assert.ok(["T1", "T1_5", "T2", "EXCLUDE_MP"].includes(s.tier), `${s.id}: unknown tier ${s.tier}`);
    if (s.owner_entity_id) assert.ok(lexicon.has(s.owner_entity_id), `${s.id}: owner ${s.owner_entity_id} is not in the identity lexicon`);
  }
});
