import { useState } from "react";

// Mock data representing a real member's dashboard
const MOCK_DATA = {
  username: "Dan",
  deload: { A: 4, B: 3, C: 5, D: 2, E: 4 },
  workouts: {
    A: [
      { name: "Single Arm DB Floor Press", best_pr: "85/12", warmup: 45, feeler: 70 },
      { name: "Single Arm DB Floor Press", best_pr: "75/12", warmup: 45, feeler: 65, isSecondSet: true },
      { name: "Alternating DB Hammer Curl", best_pr: "45/10", warmup: 25, feeler: 35 },
      { name: "Seated DB Curls", best_pr: "35/12", warmup: 20, feeler: 30 },
      { name: "Standing DB Curls", best_pr: "40/10", warmup: 20, feeler: 30 },
      { name: "Reverse Grip EZ Bar Curls", best_pr: "65/12", warmup: 35, feeler: 55 },
    ],
    B: [
      { name: "Wide Grip Pullups", best_pr: "0/12", warmup: null, feeler: null },
      { name: "Chinups", best_pr: "0/15", warmup: null, feeler: null },
      { name: "Pulldowns", best_pr: "160/12", warmup: 90, feeler: 130 },
      { name: "Chest Supported DB Rows", best_pr: "70/12", warmup: 40, feeler: 60, notes: "Bench at 30° incline" },
      { name: "Single Arm DB Rows", best_pr: "90/12", warmup: 50, feeler: 75, notes: "Brace opposite knee on bench" },
      { name: "Head Supported RDF", best_pr: "25/15", lo_pr: "20/20", warmup: 10, feeler: 20 },
    ],
    C: [
      { name: "DB Front Raises", best_pr: "30/12", lo_pr: "25/18", warmup: 15, feeler: 25 },
      { name: "Seated DB Lateral Raises", best_pr: "25/15", lo_pr: "20/22", warmup: 10, feeler: 20 },
      { name: "Standing DB Lateral Raises", best_pr: "30/12", lo_pr: "25/17", warmup: 15, feeler: 25 },
      { name: "Lying DB Triceps Extensions", best_pr: "30/12", lo_pr: "25/16", warmup: 15, feeler: 25 },
      { name: "Incline EZ Bar Triceps Extensions", best_pr: "55/12", warmup: 30, feeler: 45 },
      { name: "Straight Bar Pushdowns", best_pr: "80/15", warmup: 40, feeler: 65 },
    ],
    D: [
      { name: "Front Loaded Barbell Reverse Lunges", best_pr: "135/8", warmup: 65, feeler: 115 },
      { name: "Heels Elevated Front Squats", best_pr: "185/8", warmup: 95, feeler: 155, notes: "2\" heel wedge, elbows high" },
      { name: "Glute Ham Raises", best_pr: "0/10", warmup: null, feeler: null },
      { name: "Barbell Hip Thrusts", best_pr: "225/12", warmup: 135, feeler: 185 },
      { name: "Reverse Hypers", best_pr: "90/15", warmup: 45, feeler: 70, notes: "2-4x12-20" },
    ],
    E: [
      { name: "Side Planks", best_pr: "0/60", warmup: null, feeler: null, special: "reps_as_seconds" },
      { name: "Roman Chair Situps", best_pr: "25/15", lo_pr: "20/20", warmup: 0, feeler: 15 },
      { name: "Rotational Neck Bridges", best_pr: "0/12", warmup: null, feeler: null },
      { name: "Single Leg Calf Raises", best_pr: "50/20", warmup: 25, feeler: 40 },
      { name: "Seated Single Leg Calf Raises", best_pr: "45/20", warmup: 20, feeler: 35 },
      { name: "Standing Dip Belt Calf Raises", best_pr: "90/15", warmup: 45, feeler: 75 },
    ],
  },
  coreFoods: {
    checkedDates: (() => {
      const dates = {};
      const t = new Date();
      for (let i = 1; i <= 47; i++) {
        const d = new Date(t);
        d.setDate(t.getDate() - i);
        dates[d.toISOString().split("T")[0]] = true;
      }
      return dates;
    })(),
  },
  cycleGains: {
    A: [8.2, 6.5, 4.1, 5.8, 3.2, 7.0],
    B: [3.5, 5.0, 6.8, 4.2, 7.5, 2.8],
    C: [5.1, 3.8, 4.5, 6.2, 3.0, 5.5],
    D: [4.0, 6.5, 3.2, 5.8, 2.5],
    E: [2.0, 4.5, 3.8, 5.2, 4.0, 3.5],
  },
  cyclePills: {
    A: [true, true, true, true, true, true, true],
    B: [true, true, true, true, true, true, true],
    C: [true, true, true, true, true, true, null],
    D: [true, true, false, true, true, true, null],
    E: [true, true, true, true, true, null, null],
  },
  deloadMode: { A: false, B: false, C: false, D: false, E: false },
  lastWorkoutDate: "2026-02-12",
  upNext: "E",
  behind: { C: true },
};
