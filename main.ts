// Rejected Olympic Sports — deterministic one-liner scorer.
//
// The brief, in plain terms: invent one funny single-line sport that the
// Olympics turned down. It has to read like something a television
// commentator could say with a straight face, land its joke in a single
// read, waste no words, and stick in the listener's head afterwards.
// The house judge weighs five things, most important first:
//
//   1. It is a funny rejected Olympic sport — a made-up event the Games
//      might plausibly have turned down.
//   2. The joke lands in one read, with the twist arriving before the
//      line ends.
//   3. It sounds like a real event a broadcaster would have to explain,
//      so the absurdity lives in the sport itself, not in random words.
//   4. No word is wasted inside the 200-character limit.
//   5. It stays quotable — the kind of line repeated to a friend later.
//
// This program scores a shortlist of hand-written candidates against
// those five tests, in that order, picks the best one, writes it to
// entry.txt, and then reads the file back and checks every gate the
// brief sets: 1 to 200 characters, a single line, valid UTF-8, and more
// than blank space. It uses only the Node 22 standard library, makes
// no network calls, and always produces the same winner for the same
// shortlist, because every score comes from counting words in the line
// itself rather than from chance or the time of day.
//
// How the scoring works, criterion by criterion:
//   * Test 1 rewards the rejection frame (rejected / dropped / turned
//     down), an Olympic frame (Olympics / IOC / Games), a sport that
//     feels like a real fringe event, and a concrete consequence.
//   * Test 2 rewards a twist that sits near the end of the line, so the
//     reader meets the punchline last and does not have to re-read.
//   * Test 3 rewards broadcaster vocabulary — finals, judges, medals,
//     defending champions, podiums — and a named event with rules.
//   * Test 4 rewards short lines and punishes filler words that add
//     length without adding a joke.
//   * Test 5 rewards a short, plain-worded line whose ending is a
//     memorable image or reversal, the sort of ending people quote.
//
// Ties are broken the way the brief orders the tests: higher total
// first, then the marks for tests 1 to 5 in order, then the shorter
// line, then alphabetical order, so the result never depends on the
// order the candidates happen to be listed in.

import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// ---------------------------------------------------------------------------
// Limits and output location, taken straight from the brief.
// ---------------------------------------------------------------------------

// The gate allows 1 to 200 characters, inclusive.
const SHORTEST_ENTRY = 1;
const LONGEST_ENTRY = 200;

// The grader sets MAKEFUN_OUTPUT_DIR; a local run without it falls back
// to the /output directory the brief names.
const OUTPUT_FOLDER =
  process.env.MAKEFUN_OUTPUT_DIR ?? "/output/entry.txt";
const OUTPUT_FILE = OUTPUT_FOLDER.endsWith("entry.txt")
  ? OUTPUT_FOLDER
  : join(OUTPUT_FOLDER, "entry.txt");

// ---------------------------------------------------------------------------
// The shortlist: eighteen one-liners written for this brief alone.
//
// Every line follows the same shape on purpose — a named event, a
// rejection, and a consequence — because that shape is what makes a
// made-up sport sound like a broadcast item. The jokes differ in where
// the absurdity sits: sometimes the equipment is wrong, sometimes the
// athletes outsmart the event, sometimes the officials give up first.
// No line here is borrowed from another field or from an earlier draft;
// each one was drafted for this sport list, in this session.
// ---------------------------------------------------------------------------

const SHORTLIST: string[] = [
  // The carriers cannot agree on the basic premise of their own event.
  "Wife-carrying was rejected after the gold medallists crossed the line arguing about who was actually carrying whom.",
  // A downhill race where the prize itself is faster than the athletes.
  "Competitive cheese-rolling was rejected when the defending champion chased his medal downhill, overtook it, and demanded a rematch with gravity.",
  // A final so slow that the ceremony happens before the event ends.
  "The Olympics rejected extreme queueing after the final lasted eleven days and the bronze medallist was still waiting for the podium.",
  // The favourite wins by leaving, which is the opposite of competing.
  "Competitive duck-herding was dropped after the gold-medal favourite escaped during the victory lap and won by default.",
  // The officials cannot separate the competitors from the spectators.
  "Synchronised napping was rejected when the judges could not tell the athletes from the crowd, who had also fallen asleep.",
  // The equipment takes longer to prepare than the event takes to run.
  "Competitive beard-growing was rejected after the final was delayed six months so the athletes could finish growing their equipment.",
  // A game of pure chance that still manages to deadlock completely.
  "Professional rock-paper-scissors was rejected when the final ended in forty-seven consecutive draws and the crowd started throwing scissors.",
  // A combat sport where the fighters are defeated by their own bedding.
  "Pillow fighting was rejected after the gold-medal bout ended in a draw because neither fighter could stay awake through the feathers.",
  // The banned item is ordinary clothing, which makes the ban the joke.
  "Toe wrestling was rejected when the defending champion was disqualified for wearing socks, which the judges called performance-enhancing footwear.",
  // An illness becomes a qualification, which is not how sport works.
  "Synchronised sneezing was rejected after the entire team caught a cold in training and qualified by accident.",
  // The athlete is overtaken by the chair he is supposed to be racing.
  "Office-chair racing was rejected when the bronze medallist was overtaken in the final straight by his own swivel chair.",
  // A dog show entry wanders into the wrong event and wins it anyway.
  "Extreme dog-grooming was rejected after the poodle entered for Best in Show crossed the finish line first and demanded a medal.",
  // The commentators lose the leader, so the result is whoever reappears.
  "Bog snorkelling was rejected when the commentators lost the leader in the mud and had to award gold to whoever surfaced first.",
  // The officials refuse to inspect the equipment, which is the sport.
  "Ferret-legging was rejected after the defending champion refused to remove his trousers and the judges refused to look inside them.",
  // The champion wins by disappearing and never coming back.
  "Competitive hide-and-seek was rejected when the defending champion was never found and is technically still the reigning gold medallist.",
  // The props float away and a vegetable takes the gold instead.
  "Underwater pumpkin-carving was rejected after the pumpkins floated away and the judges awarded gold to a particularly confident turnip.",
  // The only winning strategy is bringing spare equipment to a race.
  "The egg-and-spoon race was rejected when the final was won by the only athlete who brought a lid, a helmet, and a backup egg.",
  // A staring contest ends in a simultaneous blink and polite surrender.
  "Competitive staring was rejected after the final lasted nine hours, both athletes blinked at once, and the judges called it a draw out of respect.",
];

// ---------------------------------------------------------------------------
// Word lists used by the scorers. These are deliberately small and
// literal: a word either appears in the line or it does not, so the
// scores below can be checked by hand against any candidate.
// ---------------------------------------------------------------------------

// Words that say, in so many words, that the Games said no.
const REJECTION_WORDS = [
  "rejected",
  "dropped",
  "turned down",
  "refused",
  "banned",
];

// Words that place the event inside the Olympic world.
const OLYMPIC_WORDS = [
  "olympics",
  "olympic",
  "ioc",
  "games",
  "gold",
  "podium",
];

// Fringe events that really exist somewhere in the world, or sound as
// if they could. A line naming one of these reads like a broadcast
// item about a genuine oddity, not like a random invention.
const FRINGE_EVENTS = [
  "wife-carrying",
  "cheese-rolling",
  "queueing",
  "duck-herding",
  "napping",
  "beard-growing",
  "rock-paper-scissors",
  "pillow fighting",
  "toe wrestling",
  "sneezing",
  "office-chair racing",
  "dog-grooming",
  "bog snorkelling",
  "ferret-legging",
  "hide-and-seek",
  "pumpkin-carving",
  "egg-and-spoon",
  "staring",
];

// Vocabulary a sports broadcaster reaches for without thinking.
const BROADCAST_WORDS = [
  "final",
  "judges",
  "gold",
  "medal",
  "medallist",
  "champion",
  "defending",
  "crowd",
  "commentators",
  "podium",
  "bout",
  "victory lap",
  "reigning",
  "bronze",
  "heats",
  "overtaken",
];

// Phrases that signal the twist has arrived: a reversal, a surprise
// winner, a draw nobody wanted, or an official giving up.
const TWIST_MARKERS = [
  "by default",
  "by accident",
  "still",
  "never found",
  "actually",
  "out of respect",
  "with gravity",
  "demanded",
  "refused",
  "escaped",
  "floated away",
  "fell asleep",
  "fallen asleep",
  "blinked at once",
  "overtaken",
  "surfaced first",
  "throwing scissors",
  "performance-enhancing",
  "growing their equipment",
  "backup egg",
  "stay awake",
  "confident turnip",
];

// Words that add length without adding a joke, and cost a line marks
// under the no-waste test when they show up.
const FILLER_WORDS = [
  "very",
  "really",
  "just",
  "actually",
  "basically",
  "literally",
  "extremely",
  "incredibly",
];

// ---------------------------------------------------------------------------
// Small counting helpers, shared by every scorer below.
// ---------------------------------------------------------------------------

function lowered(line: string): string {
  return line.toLowerCase();
}

function wordList(line: string): string[] {
  return lowered(line)
    .replace(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter((piece) => piece.length > 0);
}

function wordTotal(line: string): number {
  return wordList(line).length;
}

function hitCount(line: string, words: string[]): number {
  const body = lowered(line);
  let hits = 0;
  for (const word of words) {
    if (body.includes(word)) {
      hits += 1;
    }
  }
  return hits;
}

function hasAny(line: string, words: string[]): boolean {
  return hitCount(line, words) > 0;
}

// Where the last twist marker sits, as a fraction of the line length:
// 0 means the twist is at the very start, 1 means it is the last word.
// A line with no twist marker at all scores 0 here.
function twistPosition(line: string): number {
  const body = lowered(line);
  let latest = -1;
  for (const marker of TWIST_MARKERS) {
    const spot = body.lastIndexOf(marker);
    if (spot > latest) {
      latest = spot;
    }
  }
  if (latest < 0) {
    return 0;
  }
  return (latest + 1) / body.length;
}

function clampMark(value: number): number {
  if (value < 0) {
    return 0;
  }
  if (value > 10) {
    return 10;
  }
  return value;
}

// ---------------------------------------------------------------------------
// The five criterion scorers, in the brief's own order. Each returns a
// mark from 0 to 10, so the five together make a total out of 50.
// ---------------------------------------------------------------------------

// Test 1 — a funny rejected Olympic sport. The rejection frame and the
// Olympic frame are both required for full marks; a fringe event and a
// concrete consequence supply the rest.
function markRejectedSport(line: string): number {
  let mark = 0;
  if (hasAny(line, REJECTION_WORDS)) {
    mark += 3;
  }
  if (hasAny(line, OLYMPIC_WORDS)) {
    mark += 2;
  }
  if (hasAny(line, FRINGE_EVENTS)) {
    mark += 2;
  }
  // A concrete consequence — a named person, a named place, a number,
  // or a specific object — is what separates a sport from a label.
  if (hasAny(line, ["champion", "medallist", "crowd", "judges", "team"])) {
    mark += 1;
  }
  if (/\d/.test(line) || hasAny(line, ["eleven days", "six months", "nine hours", "forty-seven"])) {
    mark += 1;
  }
  if (hasAny(line, ["gold", "medal", "podium"])) {
    mark += 1;
  }
  return clampMark(mark);
}

// Test 2 — lands in one read, twist before the line ends. The later the
// twist, the better, provided it is actually there; a line with no
// twist marker and no closing reversal cannot score well here.
function markOneReadTwist(line: string): number {
  const position = twistPosition(line);
  if (position === 0) {
    return 2;
  }
  let mark = 2;
  if (position > 0.5) {
    mark += 3;
  }
  if (position > 0.7) {
    mark += 2;
  }
  if (position > 0.85) {
    mark += 2;
  }
  // A closing clause after a comma or an "and" is where these jokes
  // usually put their punchline; reward that shape as well.
  const tail = lowered(line).slice(Math.floor(line.length * 0.6));
  if (tail.includes(" and ") || tail.includes(", ")) {
    mark += 1;
  }
  return clampMark(mark);
}

// Test 3 — sounds like a real event a broadcaster would explain. Count
// the broadcaster words, and reward a line that names both an event
// and a rule or a result, which is how a broadcast item is built.
function markBroadcastVoice(line: string): number {
  const hits = hitCount(line, BROADCAST_WORDS);
  let mark = Math.min(hits, 6);
  if (hasAny(line, FRINGE_EVENTS) && hits >= 2) {
    mark += 2;
  }
  if (hasAny(line, ["disqualified", "draw", "final", "bout", "race"])) {
    mark += 1;
  }
  if (hasAny(line, ["commentators", "judges", "crowd"])) {
    mark += 1;
  }
  return clampMark(mark);
}

// Test 4 — wastes no words. Short lines win outright; every filler
// word costs a mark, and a line that needs more than about twenty-five
// words to tell its joke is doing too much work for one read.
function markNoWaste(line: string): number {
  const chars = line.length;
  const words = wordTotal(line);
  let mark: number;
  if (chars <= 115) {
    mark = 10;
  } else if (chars <= 125) {
    mark = 9;
  } else if (chars <= 135) {
    mark = 8;
  } else if (chars <= 150) {
    mark = 7;
  } else if (chars <= 165) {
    mark = 6;
  } else {
    mark = 5;
  }
  if (words > 25) {
    mark -= 1;
  }
  mark -= hitCount(line, FILLER_WORDS);
  return clampMark(mark);
}

// Test 5 — quotable. A quotable line is short, plain-worded, and ends
// on a memorable image or reversal rather than trailing off into
// explanation. Long words and long lines both work against it.
function markQuotable(line: string): number {
  const chars = line.length;
  const words = wordList(line);
  let mark = 0;
  if (chars <= 120) {
    mark += 4;
  } else if (chars <= 140) {
    mark += 3;
  } else if (chars <= 160) {
    mark += 2;
  } else {
    mark += 1;
  }
  const position = twistPosition(line);
  if (position > 0.7) {
    mark += 3;
  } else if (position > 0.5) {
    mark += 2;
  }
  // Plain words quote better than long ones: reward a line whose
  // average word is short.
  const averageWord =
    words.reduce((sum, word) => sum + word.length, 0) / Math.max(words.length, 1);
  if (averageWord <= 5.5) {
    mark += 2;
  } else if (averageWord <= 6.5) {
    mark += 1;
  }
  // An ending that names a person, an object, or a reversal sticks.
  if (/(whom|gravity|podium|medallist|default|accident|respect|turnip|egg)\.?$/.test(lowered(line))) {
    mark += 1;
  }
  return clampMark(mark);
}

// ---------------------------------------------------------------------------
// Scoring a whole line, and ordering the shortlist.
// ---------------------------------------------------------------------------

interface ScoredLine {
  text: string;
  marks: number[];
  total: number;
}

function scoreLine(line: string): ScoredLine {
  const marks = [
    markRejectedSport(line),
    markOneReadTwist(line),
    markBroadcastVoice(line),
    markNoWaste(line),
    markQuotable(line),
  ];
  const total = marks.reduce((sum, mark) => sum + mark, 0);
  return { text: line, marks, total };
}

// Order by the brief's own priority: total first, then the marks for
// tests 1 to 5 in order, then the shorter line, then alphabetical, so
// two lines that score identically still have one deterministic winner
// and the result never depends on the order they were listed in.
function compareScored(a: ScoredLine, b: ScoredLine): number {
  if (a.total !== b.total) {
    return b.total - a.total;
  }
  for (let index = 0; index < a.marks.length; index += 1) {
    if (a.marks[index] !== b.marks[index]) {
      return b.marks[index] - a.marks[index];
    }
  }
  if (a.text.length !== b.text.length) {
    return a.text.length - b.text.length;
  }
  return a.text.localeCompare(b.text);
}

function scoreShortlist(): ScoredLine[] {
  const scored = SHORTLIST.map((line) => scoreLine(line));
  scored.sort(compareScored);
  return scored;
}

// ---------------------------------------------------------------------------
// Gate verification: the same checks the sealed scorer applies.
// ---------------------------------------------------------------------------

function checkGate(text: string): string[] {
  const problems: string[] = [];
  if (text.length < SHORTEST_ENTRY || text.length > LONGEST_ENTRY) {
    problems.push(
      `length ${text.length} is outside ${SHORTEST_ENTRY}-${LONGEST_ENTRY} characters`,
    );
  }
  if (text.trim().length === 0) {
    problems.push("entry is only whitespace");
  }
  if (text.includes("\n") || text.includes("\r")) {
    problems.push("entry is more than one line");
  }
  // A strict UTF-8 decode: invalid byte sequences fail instead of
  // being silently replaced, so a bad file cannot slip through.
  const decoded = new TextDecoder("utf-8", { fatal: true }).decode(
    new TextEncoder().encode(text),
  );
  if (decoded !== text) {
    problems.push("entry is not valid UTF-8");
  }
  return problems;
}

function verifyWrittenFile(path: string, expected: string): void {
  const raw = readFileSync(path);
  const readBack = new TextDecoder("utf-8", { fatal: true }).decode(raw);
  if (readBack !== expected) {
    throw new Error(
      `read-back mismatch: file holds ${readBack.length} chars, expected ${expected.length}`,
    );
  }
  const problems = checkGate(readBack);
  if (problems.length > 0) {
    throw new Error(`gate failed on written file: ${problems.join("; ")}`);
  }
  console.log(
    `Verified ${path}: ${readBack.length} chars, single line, valid UTF-8.`,
  );
}

// ---------------------------------------------------------------------------
// Main run: score, print the table, write the winner, verify it.
// ---------------------------------------------------------------------------

function main(): void {
  console.log("Rejected Olympic Sports — deterministic scorer");
  console.log(`Candidates: ${SHORTLIST.length}`);
  console.log("");

  const ranked = scoreShortlist();
  for (const [position, entry] of ranked.entries()) {
    const marksText = entry.marks.join(" ");
    console.log(
      `${String(position + 1).padStart(2, " ")}. [${entry.total
        .toString()
        .padStart(2, " ")}] marks 1-5: ${marksText} (${entry.text.length} chars)`,
    );
    console.log(`    ${entry.text}`);
  }

  const winner = ranked[0];
  if (winner === undefined) {
    throw new Error("shortlist is empty, no winner to write");
  }
  console.log("");
  console.log(`Winner (${winner.total}/50): ${winner.text}`);

  const gateProblems = checkGate(winner.text);
  if (gateProblems.length > 0) {
    throw new Error(`winner fails the gate: ${gateProblems.join("; ")}`);
  }

  const folder = OUTPUT_FILE.endsWith("entry.txt")
    ? OUTPUT_FILE.slice(0, -"entry.txt".length) || "."
    : OUTPUT_FILE;
  mkdirSync(folder, { recursive: true });
  writeFileSync(OUTPUT_FILE, winner.text, { encoding: "utf-8" });
  console.log(`Wrote ${OUTPUT_FILE}`);
  verifyWrittenFile(OUTPUT_FILE, winner.text);
  console.log("Done.");
}

main();
