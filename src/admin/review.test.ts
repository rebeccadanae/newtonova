import { expect, test } from "vitest";
import { changedFields } from "./review";
import type { GroupDetails } from "./groups";

const base: GroupDetails = {
  name: "I Run, You Run",
  website: "https://example.com",
  blurb: "Hi",
  category: ["Sports & movement"],
  area: ["Arlington"],
  schedule: "",
  cost: "",
  accessibility: "",
  ages: "",
  first_time: "",
  where_text: "",
  no_fixed_place: false,
};

test("changedFields ignores list order and whitespace", () => {
  const a = { ...base, category: ["Creative", "Social"], blurb: "Hi" };
  const b = { ...base, category: ["Social", "Creative"], blurb: " Hi " };
  expect(changedFields(a, b)).toEqual([]);
});

test("changedFields lists real differences", () => {
  expect(changedFields(base, { ...base, website: "https://new.example" })).toEqual(["website"]);
});

test("changedFields notices added towns and the fixed-place tick", () => {
  expect(changedFields(base, { ...base, area: ["Arlington", "Reston"], no_fixed_place: true })).toEqual([
    "area",
    "no_fixed_place",
  ]);
});
