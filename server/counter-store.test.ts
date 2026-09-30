import { describe, expect, test } from "bun:test";
import { getRanking, recordTap } from "./counter-store";

describe("counter store", () => {
  test("returns ranking sorted by count", () => {
    recordTap(`Sort A ${Date.now()}`, 2);
    recordTap(`Sort B ${Date.now()}`, 1);
    const ranking = getRanking();

    expect(ranking.length).toBeGreaterThanOrEqual(2);
    for (let index = 1; index < ranking.length; index++) {
      expect(ranking[index - 1].count).toBeGreaterThanOrEqual(ranking[index].count);
    }
  });

  test("increments a new country and includes it in ranking", () => {
    const country = `Test Country ${Date.now()}`;
    const ranking = recordTap(country);

    expect(ranking.find((entry) => entry.country === country)).toEqual({ country, count: 1 });
  });
});
