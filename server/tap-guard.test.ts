import { afterEach, expect, test } from "bun:test";
import { resetTapScores, scoreTap } from "./tap-guard";

afterEach(() => resetTapScores());

test("allows a short burst and suppresses rapid spam", () => {
  for (let index = 0; index < 60; index++) expect(scoreTap("visitor", 1_000 + index * 100).points).toBe(1);
  expect(scoreTap("visitor", 7_001).points).toBe(0);
  expect(scoreTap("visitor", 11_001).points).toBe(1);
});

test("allows rapid manual tapping under the sustained limit", () => {
  expect(scoreTap("manual", 1_000).points).toBe(1);
  expect(scoreTap("manual", 1_010).points).toBe(1);
  expect(scoreTap("manual", 1_020).points).toBe(1);
});
