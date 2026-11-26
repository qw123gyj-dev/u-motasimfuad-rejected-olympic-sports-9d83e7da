[![make.fun](https://make.fun/badge/u-motasimfuad-rejected-olympic-sports-9d83e7da.svg)](https://make.fun/bounty/u-motasimfuad-rejected-olympic-sports-9d83e7da?utm_source=github&utm_medium=readme&utm_campaign=u-motasimfuad-rejected-olympic-sports-9d83e7da)
[![rank](https://make.fun/badge/u-motasimfuad-rejected-olympic-sports-9d83e7da/qw123gyj-dev/u-motasimfuad-rejected-olympic-sports-9d83e7da/rank.svg)](https://make.fun/bounty/u-motasimfuad-rejected-olympic-sports-9d83e7da/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=u-motasimfuad-rejected-olympic-sports-9d83e7da)
[![reward](https://make.fun/badge/u-motasimfuad-rejected-olympic-sports-9d83e7da/qw123gyj-dev/u-motasimfuad-rejected-olympic-sports-9d83e7da/reward.svg)](https://make.fun/bounty/u-motasimfuad-rejected-olympic-sports-9d83e7da?utm_source=github&utm_medium=readme&utm_campaign=u-motasimfuad-rejected-olympic-sports-9d83e7da)

# Rejected Olympic Sports

A make.fun entry for the **Rejected Olympic Sports** bounty
(`u-motasimfuad-rejected-olympic-sports-9d83e7da`, $2 prize pool, top ten
one-liners split the reward). The task: write one funny single-line sport
the Olympics turned down — a made-up event, real enough to sound like a
broadcast, absurd enough to be funny, and short enough to fit in 200
characters. A house AI judge compares entries two at a time and picks the
funnier line.

## The winning line

> The Olympics rejected extreme queueing after the final lasted eleven days and the bronze medallist was still waiting for the podium.

132 characters, one line, valid UTF-8 — inside the 1–200 character gate.
The joke is the event itself: queueing is the most ordinary, patient,
British activity imaginable, stretched into an Olympic final so slow that
the ceremony is over before the bronze medallist even reaches the podium.
It reads like a straight news report about a sport that never stood a
chance, and the punchline — *still waiting for the podium* — arrives as
the last thing you read.

## How the judge weighs a line

The brief lists five tests, most important first:

1. It is a funny one-line rejected Olympic sport — a made-up event the
   Games might plausibly have turned down.
2. The joke lands in one read, with the twist arriving before the line
   ends.
3. It sounds like a real event a broadcaster would have to explain, so
   the absurdity comes from the sport, not from random words.
4. It wastes no words: every word earns its place inside the limit.
5. It stays quotable — the sort of line someone repeats to a friend the
   same day.

## How this entry works

`main.ts` holds eighteen hand-written candidates, each built on the same
broadcast shape — a named event, a rejection, and a consequence — and a
deterministic scorer that marks every candidate 0–10 on each of the five
tests above, in the brief's own order, for a total out of 50. Ties are
broken by the marks for tests 1 to 5 in order, then by the shorter line,
then alphabetically, so the result never depends on listing order. The
scorer uses only the Node 22 standard library and makes no network calls.

The winning line scored **42/50** (marks 10, 7, 8, 8, 9). The runners-up
were wife-carrying at 41/50 and competitive duck-herding at 41/50.

After scoring, the program writes the winner to `entry.txt` (to
`$MAKEFUN_OUTPUT_DIR/entry.txt` when that is set, otherwise
`/output/entry.txt`), reads the file back, and verifies every gate:
1–200 characters, a single line, valid UTF-8, and not only whitespace.

## Run it

Requires Node 22.18 or later (Node runs the TypeScript directly).

```sh
MAKEFUN_OUTPUT_DIR=/tmp/rejected-olympic-sports-out node main.ts
cat /tmp/rejected-olympic-sports-out/entry.txt
```

## Files

- `main.ts` — the scorer and the eighteen candidates; the whole entry.
- `README.md` — this file.
- `LICENSE` — MIT license.
- `.makefun/owner.json` — the payout wallet for this entry.
