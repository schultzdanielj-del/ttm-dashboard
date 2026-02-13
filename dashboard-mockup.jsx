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

const DeloadBar = ({ count, label }) => {
  const pct = Math.round((count / 6) * 100);
  const isWarning = count >= 5;
  const isDeload = count >= 6;
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
        <span style={{ fontSize: 12, color: "#aaa", letterSpacing: "0.05em" }}>
          WORKOUT {label}
        </span>
        <span
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: isDeload ? "#FFD60A" : isWarning ? "#FF9500" : "#34C759",
          }}
        >
          {isDeload ? "DELOAD" : `${pct}%`}
        </span>
      </div>
      <div
        style={{
          height: 4,
          background: "#1C1C1E",
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${pct}%`,
            height: "100%",
            background: isDeload ? "#FFD60A" : isWarning ? "#FF9500" : "#34C759",
            borderRadius: 2,
            transition: "width 0.6s ease",
          }}
        />
      </div>
    </div>
  );
};

export default function Dashboard() {
  const data = MOCK_DATA;

  const daysSinceLastWorkout = data.lastWorkoutDate
    ? Math.floor((new Date() - new Date(data.lastWorkoutDate)) / (1000 * 60 * 60 * 24))
    : 999;
  const autoDeloaded = daysSinceLastWorkout >= 7;
  const [expanded, setExpanded] = useState("A");
  const [inputs, setInputs] = useState({});
  const [showGraph, setShowGraph] = useState(null);
  const [checkedDates, setCheckedDates] = useState(data.coreFoods.checkedDates);
  const [lastTap, setLastTap] = useState({ date: null, time: 0 });
  const [coreFoodsExpanded, setCoreFoodsExpanded] = useState(false);
  const [labelTap, setLabelTap] = useState(0);
  const [servings, setServings] = useState({});
  const [showInfo, setShowInfo] = useState(null);
  const [swaps, setSwaps] = useState({});
  const [subInput, setSubInput] = useState("");
  const [statPanel, setStatPanel] = useState(0);
  const [swipeStart, setSwipeStart] = useState(null);
  const [slideDir, setSlideDir] = useState(null);

  const today = new Date();
  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const rollingDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (6 - i));
    const key = d.toISOString().split("T")[0];
    const daysAgo = 6 - i;
    return {
      key,
      label: dayNames[d.getDay()],
      date: `${monthNames[d.getMonth()]} ${d.getDate()}`,
      isToday: daysAgo === 0,
      canLog: daysAgo <= 2,
    };
  });

  const coreFoodsStreak = (() => {
    let streak = 0;
    const d = new Date(today);
    if (!checkedDates[d.toISOString().split("T")[0]]) {
      d.setDate(d.getDate() - 1);
    }
    while (true) {
      const key = d.toISOString().split("T")[0];
      if (checkedDates[key]) {
        streak++;
        d.setDate(d.getDate() - 1);
      } else {
        break;
      }
    }
    return streak;
  })();

  const handleCoreFoodTap = (dateKey, canLog) => {
    if (!canLog) return;
    const now = Date.now();
    const isChecked = !!checkedDates[dateKey];

    if (isChecked) {
      if (lastTap.date === dateKey && now - lastTap.time < 400) {
        setCheckedDates((prev) => {
          const next = { ...prev };
          delete next[dateKey];
          return next;
        });
        setLastTap({ date: null, time: 0 });
      } else {
        setLastTap({ date: dateKey, time: now });
      }
    } else {
      setCheckedDates((prev) => ({ ...prev, [dateKey]: true }));
      setLastTap({ date: null, time: 0 });
    }
  };

  const toggleStatPanel = (dir) => {
    setSlideDir(dir);
    setTimeout(() => {
      setStatPanel((p) => (p === 0 ? 1 : 0));
      setSlideDir(null);
    }, 200);
  };

  const handleLabelDoubleTap = () => {
    const now = Date.now();
    if (now - labelTap < 400) {
      setCoreFoodsExpanded((p) => !p);
      setLabelTap(0);
    } else {
      setLabelTap(now);
    }
  };

  const getServings = (dateKey) => {
    return servings[dateKey] || { protein: [false, false, false, false], veggie: [false, false, false] };
  };

  const toggleServing = (dateKey, type, index) => {
    setServings((prev) => {
      const current = prev[dateKey] || { protein: [false, false, false, false], veggie: [false, false, false] };
      const updated = { ...current, [type]: [...current[type]] };
      updated[type][index] = !updated[type][index];

      const allDone = updated.protein.every(Boolean) && updated.veggie.every(Boolean);
      if (allDone) {
        setCheckedDates((p) => ({ ...p, [dateKey]: true }));
      } else {
        setCheckedDates((p) => {
          const next = { ...p };
          delete next[dateKey];
          return next;
        });
      }

      return { ...prev, [dateKey]: updated };
    });
  };

  const allGains = Object.values(data.cycleGains).flat();
  const avgStrengthGain = allGains.length > 0
    ? (allGains.reduce((a, b) => a + b, 0) / allGains.length).toFixed(1)
    : "0.0";

  const formatPR = (pr, isTimed) => {
    const [w, r] = pr.split("/");
    const weightStr = w === "0" ? "BW" : w;
    return isTimed ? `${weightStr}/${r}s` : `${weightStr}/${r}`;
  };

  const exerciseDB = {
    "Pulldowns": { best_pr: "160/12", warmup: 90, feeler: 130 },
    "Wide Grip Pullups": { best_pr: "0/12", warmup: null, feeler: null },
    "Chinups": { best_pr: "0/15", warmup: null, feeler: null },
    "Alternating DB Hammer Curl": { best_pr: "45/10", warmup: 25, feeler: 35 },
    "Seated DB Curls": { best_pr: "35/12", warmup: 20, feeler: 30 },
    "Standing DB Curls": { best_pr: "40/10", warmup: 20, feeler: 30 },
    "Barbell Hip Thrusts": { best_pr: "225/12", warmup: 135, feeler: 185 },
    "Heels Elevated Front Squats": { best_pr: "185/8", warmup: 95, feeler: 155 },
    "Standing DB Lateral Raises": { best_pr: "30/12", lo_pr: "25/17", warmup: 15, feeler: 25 },
    "Seated DB Lateral Raises": { best_pr: "25/15", lo_pr: "20/22", warmup: 10, feeler: 20 },
    "DB Front Raises": { best_pr: "30/12", lo_pr: "25/18", warmup: 15, feeler: 25 },
    "Straight Bar Pushdowns": { best_pr: "80/15", warmup: 40, feeler: 65 },
    "Reverse Hypers": { best_pr: "90/15", warmup: 45, feeler: 70 },
    "Single Leg Calf Raises": { best_pr: "50/20", warmup: 25, feeler: 40 },
    "Lying DB Triceps Extensions": { best_pr: "30/12", lo_pr: "25/16", warmup: 15, feeler: 25 },
    "Single Arm DB Floor Press": { best_pr: "85/12", warmup: 45, feeler: 70 },
    "Reverse Grip EZ Bar Curls": { best_pr: "65/12", warmup: 35, feeler: 55 },
    "Chest Supported DB Rows": { best_pr: "70/12", warmup: 40, feeler: 60 },
    "Single Arm DB Rows": { best_pr: "90/12", warmup: 50, feeler: 75 },
    "Head Supported RDF": { best_pr: "25/15", lo_pr: "20/20", warmup: 10, feeler: 20 },
    "Incline EZ Bar Triceps Extensions": { best_pr: "55/12", warmup: 30, feeler: 45 },
    "Front Loaded Barbell Reverse Lunges": { best_pr: "135/8", warmup: 65, feeler: 115 },
    "Glute Ham Raises": { best_pr: "0/10", warmup: null, feeler: null },
    "Side Planks": { best_pr: "0/60", warmup: null, feeler: null, special: "reps_as_seconds" },
    "Roman Chair Situps": { best_pr: "25/15", lo_pr: "20/20", warmup: 0, feeler: 15 },
    "Rotational Neck Bridges": { best_pr: "0/12", warmup: null, feeler: null },
    "Seated Single Leg Calf Raises": { best_pr: "45/20", warmup: 20, feeler: 35 },
    "Standing Dip Belt Calf Raises": { best_pr: "90/15", warmup: 45, feeler: 75 },
  };

  const getExData = (ex, exKey) => {
    const swappedName = swaps[exKey];
    if (swappedName && exerciseDB[swappedName]) {
      return { ...ex, ...exerciseDB[swappedName], name: ex.name };
    }
    if (swappedName) {
      return { ...ex, best_pr: "0/0", warmup: null, feeler: null, lo_pr: undefined, name: ex.name };
    }
    return ex;
  };

  const normalizeExercise = (raw) => {
    const map = {
      "lat pulldown": "Pulldowns",
      "pulldown": "Pulldowns",
      "pull down": "Pulldowns",
      "pull ups": "Wide Grip Pullups",
      "chin up": "Chinups",
      "chin ups": "Chinups",
      "hammer curl": "Alternating DB Hammer Curl",
      "hammer curls": "Alternating DB Hammer Curl",
      "db curl": "Seated DB Curls",
      "db curls": "Seated DB Curls",
      "hip thrust": "Barbell Hip Thrusts",
      "hip thrusts": "Barbell Hip Thrusts",
      "front squat": "Heels Elevated Front Squats",
      "front squats": "Heels Elevated Front Squats",
      "lateral raise": "Standing DB Lateral Raises",
      "lateral raises": "Standing DB Lateral Raises",
      "lat raise": "Standing DB Lateral Raises",
      "reverse hyper": "Reverse Hypers",
      "reverse hypers": "Reverse Hypers",
      "calf raise": "Single Leg Calf Raises",
      "calf raises": "Single Leg Calf Raises",
      "pushdown": "Straight Bar Pushdowns",
      "pushdowns": "Straight Bar Pushdowns",
      "tricep pushdown": "Straight Bar Pushdowns",
    };
    const key = raw.trim().toLowerCase();
    const titleCase = raw.trim().split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
    return map[key] || titleCase;
  };

  const toggleInfo = (exKey) => {
    if (showInfo === exKey) {
      setShowInfo(null);
      setSubInput("");
    } else {
      setShowInfo(exKey);
      setSubInput("");
    }
  };

  const submitSwap = (exKey) => {
    if (subInput.trim()) {
      setSwaps((prev) => ({ ...prev, [exKey]: normalizeExercise(subInput) }));
      setSubInput("");
      setShowInfo(null);
    }
  };

  const revertSwap = (exKey) => {
    setSwaps((prev) => {
      const next = { ...prev };
      delete next[exKey];
      return next;
    });
    setShowInfo(null);
  };

  const handleInput = (workout, exercise, field, value) => {
    const key = `${workout}:${exercise}`;
    setInputs((prev) => ({
      ...prev,
      [key]: { ...prev[key], [field]: value },
    }));
  };

  return (
    <div
      style={{
        background: "#000",
        minHeight: "100vh",
        color: "#FFF",
        fontFamily: "'Roboto', sans-serif",
        maxWidth: 430,
        margin: "0 auto",
        padding: "0 16px 32px",
      }}
    >
      <link
        href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap"
        rel="stylesheet"
      />
      <style>{`input[type=number]::-webkit-inner-spin-button, input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; } input[type=number] { -moz-appearance: textfield; }`}</style>

      {/* Header */}
      <div style={{ paddingTop: 20, marginBottom: 24 }}>
        <div
          style={{
            fontSize: 11,
            letterSpacing: "0.15em",
            color: "#666",
            textTransform: "uppercase",
            marginBottom: 4,
          }}
        >
          Three Target Method
        </div>
        <h1
          style={{
            fontSize: 26,
            fontWeight: 700,
            margin: 0,
            letterSpacing: "-0.02em",
          }}
        >
          {data.username}'s Program
        </h1>
      </div>

      {/* Core Foods */}
      <div
        style={{
          background: "#0A0A0A",
          border: "1px solid #1C1C1E",
          borderRadius: 12,
          padding: "16px",
          marginBottom: 16,
        }}
      >
        <div
          onClick={handleLabelDoubleTap}
          style={{
            fontSize: 11,
            letterSpacing: "0.12em",
            color: "#555",
            textTransform: "uppercase",
            marginBottom: 14,
            cursor: "pointer",
            userSelect: "none",
            WebkitUserSelect: "none",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span>Core Foods {coreFoodsExpanded && <span style={{ fontSize: 9, color: "#333" }}>▼</span>}</span>
          {coreFoodsStreak > 0 && (
            <span style={{ fontSize: 11, color: "#34C759", fontWeight: 600, letterSpacing: "0.05em" }}>
              🔥 {coreFoodsStreak} day{coreFoodsStreak !== 1 ? "s" : ""}
            </span>
          )}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: 6,
          }}
        >
          {rollingDays.map((day) => {
            const isChecked = !!checkedDates[day.key];
            const isOld = !day.canLog;
            const isMissed = isOld && !isChecked;

            return (
              <div
                key={day.key}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 6,
                  opacity: isOld ? 0.3 : 1,
                }}
              >
                <span
                  style={{
                    fontSize: 10,
                    color: day.isToday ? "#FFF" : "#555",
                    fontWeight: day.isToday ? 600 : 400,
                  }}
                >
                  {day.label}
                </span>
                <div
                  onClick={() => !coreFoodsExpanded && handleCoreFoodTap(day.key, day.canLog)}
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: "50%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: day.canLog && !coreFoodsExpanded ? "pointer" : "default",
                    background: isChecked
                      ? "#34C759"
                      : day.isToday
                      ? "#1C1C1E"
                      : "#0A0A0A",
                    border: day.isToday && !isChecked
                      ? "1px solid #333"
                      : isChecked
                      ? "none"
                      : "1px solid #1C1C1E",
                    transition: "all 0.2s ease",
                  }}
                >
                  {isMissed ? (
                    <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                      <path
                        d="M2 2L8 8M8 2L2 8"
                        stroke="#555"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  ) : null}
                </div>
                <span style={{ fontSize: 9, color: "#444" }}>{day.date}</span>
              </div>
            );
          })}
        </div>

        {/* Expanded servings breakdown */}
        {coreFoodsExpanded && (() => {
          const activeDays = rollingDays.filter((d) => d.canLog);
          return (
            <div style={{ marginTop: 16, borderTop: "1px solid #1C1C1E", paddingTop: 14 }}>
              {activeDays.map((day) => {
                const s = getServings(day.key);
                const allDone = s.protein.every(Boolean) && s.veggie.every(Boolean);
                return (
                  <div key={day.key} style={{ marginBottom: 14 }}>
                    <div style={{ fontSize: 11, color: day.isToday ? "#FFF" : "#666", fontWeight: day.isToday ? 600 : 400, marginBottom: 8 }}>
                      {day.label} — {day.date} {allDone && <span style={{ color: "#34C759", fontSize: 10 }}>✓ Complete</span>}
                    </div>
                    <div style={{ display: "flex", gap: 16 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 9, color: "#444", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>
                          Protein / Fat
                        </div>
                        <div style={{ display: "flex", gap: 6 }}>
                          {s.protein.map((checked, i) => (
                            <div
                              key={i}
                              onClick={() => toggleServing(day.key, "protein", i)}
                              style={{
                                width: 28,
                                height: 28,
                                borderRadius: 6,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                                background: checked ? "#0A84FF" : "#1C1C1E",
                                border: checked ? "none" : "1px solid #333",
                                transition: "all 0.15s ease",
                              }}
                            />
                          ))}
                        </div>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 9, color: "#444", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 6 }}>
                          Vegetables
                        </div>
                        <div style={{ display: "flex", gap: 6 }}>
                          {s.veggie.map((checked, i) => (
                            <div
                              key={i}
                              onClick={() => toggleServing(day.key, "veggie", i)}
                              style={{
                                width: 28,
                                height: 28,
                                borderRadius: 6,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                cursor: "pointer",
                                background: checked ? "#34C759" : "#1C1C1E",
                                border: checked ? "none" : "1px solid #333",
                                transition: "all 0.15s ease",
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          );
        })()}
      </div>

      {/* Cycle Progress / Strength Gain - Swipeable */}
      <div
        onClick={() => toggleStatPanel(statPanel === 0 ? "left" : "right")}
        onTouchStart={(e) => setSwipeStart(e.touches[0].clientX)}
        onTouchEnd={(e) => {
          if (swipeStart === null) return;
          const diff = e.changedTouches[0].clientX - swipeStart;
          if (Math.abs(diff) > 40) {
            toggleStatPanel(diff < 0 ? "left" : "right");
          }
          setSwipeStart(null);
        }}
        style={{
          background: "#0A0A0A",
          border: "1px solid #1C1C1E",
          borderRadius: 12,
          padding: "16px",
          marginBottom: 16,
          cursor: "pointer",
          overflow: "hidden",
          userSelect: "none",
          WebkitUserSelect: "none",
        }}
      >
        <div style={{ position: "relative" }}>
          <div
            style={{
              transform: slideDir === "left" ? "translateX(-100%)" : slideDir === "right" ? "translateX(100%)" : "translateX(0)",
              opacity: slideDir ? 0 : 1,
              transition: slideDir ? "transform 0.2s ease, opacity 0.15s ease" : "none",
            }}
          >
          {statPanel === 0 ? (() => {
            const completed = Object.values(data.deload).reduce((a, b) => a + b, 0);
            const total = Object.keys(data.deload).length * 6;
            const pct = Math.round((completed / total) * 100);
            const isWarning = pct >= 83;
            const isDeload = pct >= 100;
            return (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <span style={{ fontSize: 11, letterSpacing: "0.12em", color: "#555", textTransform: "uppercase" }}>
                    Cycle Progress
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: isDeload ? "#FFD60A" : isWarning ? "#FF9500" : "#34C759" }}>
                    {isDeload ? "DELOAD" : `${pct}%`}
                  </span>
                </div>
                <div style={{ height: 5, background: "#1C1C1E", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{
                    width: `${Math.min(pct, 100)}%`,
                    height: "100%",
                    background: isDeload ? "#FFD60A" : isWarning ? "#FF9500" : "#34C759",
                    borderRadius: 3,
                    transition: "width 0.6s ease",
                  }} />
                </div>
                {autoDeloaded && (
                  <div style={{ fontSize: 10, color: "#FF9500", marginTop: 6, textAlign: "center" }}>
                    7+ days off — cycle reset
                  </div>
                )}
              </>
            );
          })() : (() => {
            const gain = parseFloat(avgStrengthGain);
            const isUp = gain >= 0;
            return (
              <>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <span style={{ fontSize: 11, letterSpacing: "0.12em", color: "#555", textTransform: "uppercase" }}>
                    Strength Gains This Cycle
                  </span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: isUp ? "#34C759" : "#FF3B30" }}>
                    {isUp ? "▲" : "▼"} {isUp ? "+" : ""}{avgStrengthGain}%
                  </span>
                </div>
                <div style={{ height: 5, background: "#1C1C1E", borderRadius: 3, overflow: "hidden" }}>
                  <div style={{
                    width: `${Math.min(Math.abs(gain) * 5, 100)}%`,
                    height: "100%",
                    background: isUp ? "#34C759" : "#FF3B30",
                    borderRadius: 3,
                    transition: "width 0.6s ease",
                  }} />
                </div>
              </>
            );
          })()}
          </div>
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 10 }}>
          <div style={{ width: 5, height: 5, borderRadius: "50%", background: statPanel === 0 ? "#FFF" : "#333" }} />
          <div style={{ width: 5, height: 5, borderRadius: "50%", background: statPanel === 1 ? "#FFF" : "#333" }} />
        </div>
      </div>

      {/* Workouts */}
      {Object.entries(data.workouts).map(([letter, exercises]) => {
        const isDeloadMode = data.deloadMode?.[letter];
        const isUpNext = data.upNext === letter && !isDeloadMode;
        const isBehind = data.behind?.[letter] && !isDeloadMode;
        return (
        <div
          key={letter}
          style={{
            background: "#0A0A0A",
            border: isUpNext ? "1px solid #34C759" : isBehind ? "1px solid #FF950040" : "1px solid #1C1C1E",
            borderRadius: 12,
            marginBottom: 8,
            overflow: "hidden",
            opacity: isDeloadMode ? 0.7 : isUpNext ? 1 : isBehind ? 0.7 : 0.5,
          }}
        >
          <div
            onClick={() => setExpanded(expanded === letter ? null : letter)}
            style={{
              padding: "14px 16px",
              cursor: "pointer",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              userSelect: "none",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span
                style={{
                  fontSize: 22,
                  fontWeight: 700,
                  letterSpacing: "-0.02em",
                }}
              >
                Workout {letter}
              </span>
              {isDeloadMode && (
                <span style={{
                  fontSize: 9,
                  fontWeight: 700,
                  color: "#FFD60A",
                  letterSpacing: "0.1em",
                  padding: "2px 6px",
                  background: "#FFD60A15",
                  borderRadius: 4,
                }}>
                  DELOAD
                </span>
              )}
              {isUpNext && (
                <span style={{
                  fontSize: 9,
                  fontWeight: 700,
                  color: "#34C759",
                  letterSpacing: "0.1em",
                  padding: "2px 6px",
                  background: "#34C75915",
                  borderRadius: 4,
                }}>
                  UP NEXT
                </span>
              )}
              {isBehind && (
                <span style={{
                  fontSize: 9,
                  fontWeight: 700,
                  color: "#FF9500",
                  letterSpacing: "0.1em",
                  padding: "2px 6px",
                  background: "#FF950015",
                  borderRadius: 4,
                }}>
                  BEHIND
                </span>
              )}
            </div>
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              style={{
                transform: expanded === letter ? "rotate(180deg)" : "rotate(0deg)",
                transition: "transform 0.2s ease",
              }}
            >
              <path
                d="M3 5L7 9L11 5"
                stroke="#555"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </div>

          {expanded === letter && (
            <div style={{ padding: "0 16px 16px" }}>
              {exercises.map((ex, idx) => {
                const inputKey = `${letter}:${ex.name}`;
                const exKey = `${letter}:${idx}`;
                const resolved = getExData(ex, exKey);
                const swappedName = swaps[exKey];
                const displayName = swappedName || ex.name;
                const isSwapped = !!swappedName;
                return (
                  <div
                    key={idx}
                    style={{
                      padding: "12px 0",
                      borderTop: "1px solid #1C1C1E",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        marginBottom: 8,
                      }}
                    >
                      <div
                        onClick={() => toggleInfo(exKey)}
                        style={{ cursor: "pointer", flex: 1, minWidth: 0 }}
                      >
                        <span style={{ fontSize: 14, fontWeight: 600 }}>
                          {displayName}
                        </span>
                        {isSwapped && (
                          <div style={{ fontSize: 10, color: "#444", fontStyle: "italic", marginTop: 2 }}>
                            prescribed: {ex.name}
                          </div>
                        )}
                      </div>
                      {(() => {
                        const isNew = resolved.best_pr === "0/0";
                        const weight = parseInt(resolved.best_pr.split("/")[0]);
                        const isHiLo = !isNew && weight > 0 && (5 / weight) > 0.15 && resolved.lo_pr;
                        const isTimed = resolved.special === "reps_as_seconds";
                        return (
                          <div
                            onClick={() => !isNew && setShowGraph(showGraph === ex.name ? null : ex.name)}
                            style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2, cursor: isNew ? "default" : "pointer" }}
                          >
                            {isNew ? (
                              <span
                                style={{
                                  fontSize: 13,
                                  fontWeight: 600,
                                  color: "#FF9500",
                                  fontStyle: "italic",
                                }}
                              >
                                new
                              </span>
                            ) : (
                              <>
                                <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                                  <span style={{ fontSize: 10, color: "#34C759", fontWeight: 400 }}>{"best"} <span style={{ fontSize: 9, color: "#444" }}>↗</span></span>
                                  <span
                                    style={{
                                      fontFamily: "'JetBrains Mono', monospace",
                                      fontSize: 14,
                                      fontWeight: 600,
                                      color: "#34C759",
                                    }}
                                  >
                                    {formatPR(resolved.best_pr, isTimed)}
                                  </span>
                                </div>
                                {isHiLo && (
                                  <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                                    <span style={{ fontSize: 10, color: "#34C759", fontWeight: 400 }}>or</span>
                                    <span
                                      style={{
                                        fontFamily: "'JetBrains Mono', monospace",
                                        fontSize: 13,
                                        fontWeight: 600,
                                        color: "#34C759",
                                      }}
                                    >
                                      {formatPR(resolved.lo_pr, isTimed)}
                                    </span>
                                  </div>
                                )}
                              </>
                            )}
                          </div>
                        );
                      })()}
                    </div>

                    {showInfo === exKey && (
                      <div
                        style={{
                          background: "#111",
                          borderRadius: 8,
                          padding: 12,
                          marginBottom: 10,
                          border: "1px solid #1C1C1E",
                        }}
                      >
                        {resolved.notes && (
                          <div style={{ fontSize: 12, color: "#888", marginBottom: 10 }}>
                            {resolved.notes}
                          </div>
                        )}

                        {isSwapped ? (
                          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                            <span style={{ fontSize: 11, color: "#555" }}>
                              Subbed for: <span style={{ color: "#888" }}>{swappedName}</span>
                            </span>
                            <button
                              onClick={() => revertSwap(exKey)}
                              style={{
                                padding: "4px 10px",
                                background: "#1C1C1E",
                                border: "1px solid #333",
                                borderRadius: 6,
                                color: "#FF9500",
                                fontSize: 11,
                                fontWeight: 600,
                                cursor: "pointer",
                                fontFamily: "'Roboto', sans-serif",
                              }}
                            >
                              Revert to prescribed
                            </button>
                          </div>
                        ) : (
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <input
                              type="text"
                              placeholder="Swap to..."
                              value={subInput}
                              onChange={(e) => setSubInput(e.target.value)}
                              onKeyDown={(e) => e.key === "Enter" && submitSwap(exKey)}
                              style={{
                                flex: 1,
                                padding: "6px 8px",
                                background: "#0A0A0A",
                                border: "1px solid #333",
                                borderRadius: 6,
                                color: "#FFF",
                                fontSize: 13,
                                fontFamily: "'Roboto', sans-serif",
                                outline: "none",
                              }}
                            />
                            {subInput.trim() && (
                              <button
                                onClick={() => submitSwap(exKey)}
                                style={{
                                  padding: "6px 10px",
                                  background: "#1C1C1E",
                                  border: "1px solid #333",
                                  borderRadius: 6,
                                  color: "#FFF",
                                  fontSize: 12,
                                  fontWeight: 600,
                                  cursor: "pointer",
                                  fontFamily: "'Roboto', sans-serif",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                Swap
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {resolved.best_pr === "0/0" ? (
                      <div
                        style={{
                          display: "flex",
                          flexDirection: "column",
                          gap: 6,
                          marginBottom: 10,
                          fontSize: 13,
                          color: "#555",
                        }}
                      >
                        <span>Warmup — <span style={{ color: "#888" }}>very light × 10-20</span></span>
                        <span>Feeler — <span style={{ color: "#888" }}>medium/easy × 5-8</span></span>
                        {!isDeloadMode && (
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span>Work —</span>
                          <input
                            type="number"
                            placeholder="wt"
                            value={inputs[inputKey]?.weight || ""}
                            onChange={(e) => handleInput(letter, ex.name, "weight", e.target.value)}
                            style={{
                              width: 52, padding: "4px 6px", background: "#111", border: "1px solid #333",
                              borderRadius: 6, color: "#FFF", fontSize: 13, fontFamily: "'JetBrains Mono', monospace",
                              textAlign: "center", outline: "none", MozAppearance: "textfield", WebkitAppearance: "none",
                            }}
                          />
                          <span style={{ color: "#555" }}>×</span>
                          <input
                            type="number"
                            placeholder="reps"
                            value={inputs[inputKey]?.reps || ""}
                            onChange={(e) => handleInput(letter, ex.name, "reps", e.target.value)}
                            style={{
                              width: 46, padding: "4px 6px", background: "#111", border: "1px solid #333",
                              borderRadius: 6, color: "#FFF", fontSize: 13, fontFamily: "'JetBrains Mono', monospace",
                              textAlign: "center", outline: "none", MozAppearance: "textfield", WebkitAppearance: "none",
                            }}
                          />
                          <span style={{ fontSize: 10, color: "#FF9500", whiteSpace: "nowrap" }}>10-25 reps</span>
                          <button
                            style={{
                              marginLeft: "auto", padding: "4px 12px", background: "#1C1C1E",
                              border: "1px solid #333", borderRadius: 6, color: "#FFF", fontSize: 12,
                              fontWeight: 600, cursor: "pointer", fontFamily: "'Roboto', sans-serif",
                            }}
                          >
                            Log
                          </button>
                        </div>
                        )}
                      </div>
                    ) : (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 6,
                        marginBottom: 10,
                        fontSize: 13,
                        color: "#555",
                      }}
                    >
                      {(() => {
                        const bestWeight = parseInt(resolved.best_pr.split("/")[0]);
                        const bestReps = parseInt(resolved.best_pr.split("/")[1]);
                        const isBW = bestWeight === 0;
                        const isTimed = resolved.special === "reps_as_seconds";
                        const warmupReps = Math.round(bestReps * 0.4);
                        const feelerReps = Math.round(bestReps * 0.3);
                        const unit = isTimed ? "s" : "";

                        if (isBW) {
                          return (
                            <>
                              <span>
                                Warmup —{" "}
                                <span style={{ color: "#888" }}>BW × {warmupReps}{unit} or easier variation × 10-20</span>
                              </span>
                              <span>
                                Feeler —{" "}
                                <span style={{ color: "#888" }}>BW × {feelerReps}{unit}</span>
                              </span>
                            </>
                          );
                        }
                        return (
                          <>
                            {resolved.warmup != null && (
                              <span>
                                Warmup —{" "}
                                <span style={{ color: "#888" }}>{resolved.warmup} × 10-20 reps</span>
                              </span>
                            )}
                            {resolved.feeler != null && (
                              <span>
                                Feeler —{" "}
                                <span style={{ color: "#888" }}>{resolved.feeler} × 5-8 reps</span>
                              </span>
                            )}
                          </>
                        );
                      })()}
                      {!isDeloadMode && (
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span>Work —</span>
                        {parseInt(resolved.best_pr.split("/")[0]) === 0 ? (
                          <span style={{ color: "#888", fontSize: 13, fontFamily: "'JetBrains Mono', monospace" }}>BW</span>
                        ) : (
                          <input
                            type="number"
                            value={inputs[inputKey]?.weight ?? (resolved.feeler || "")}
                            onChange={(e) =>
                              handleInput(letter, ex.name, "weight", e.target.value)
                            }
                            style={{
                              width: 52,
                              padding: "4px 6px",
                              background: "#111",
                              border: "1px solid #333",
                              borderRadius: 6,
                              color: "#FFF",
                              fontSize: 13,
                              fontFamily: "'JetBrains Mono', monospace",
                              textAlign: "center",
                              outline: "none",
                              MozAppearance: "textfield",
                              WebkitAppearance: "none",
                            }}
                          />
                        )}
                        <span style={{ color: "#555" }}>×</span>
                        <input
                          type="number"
                          placeholder={resolved.special === "reps_as_seconds" ? "secs" : "reps"}
                          value={inputs[inputKey]?.reps || ""}
                          onChange={(e) =>
                            handleInput(letter, ex.name, "reps", e.target.value)
                          }
                          style={{
                            width: 46,
                            padding: "4px 6px",
                            background: "#111",
                            border: "1px solid #333",
                            borderRadius: 6,
                            color: "#FFF",
                            fontSize: 13,
                            fontFamily: "'JetBrains Mono', monospace",
                            textAlign: "center",
                            outline: "none",
                            MozAppearance: "textfield",
                            WebkitAppearance: "none",
                          }}
                        />
                        {(() => {
                          const bestWeight = parseInt(resolved.best_pr.split("/")[0]);
                          const bestReps = parseInt(resolved.best_pr.split("/")[1]);
                          const workWeight = parseInt(inputs[inputKey]?.weight ?? (resolved.feeler || 0));
                          const isTimed = resolved.special === "reps_as_seconds";
                          const threshold = isTimed ? 60 : 17;
                          return bestReps < threshold && workWeight > bestWeight ? (
                            <span style={{ fontSize: 10, color: "#FF3B30", whiteSpace: "nowrap" }}>probably too heavy</span>
                          ) : null;
                        })()}
                        <button
                          style={{
                            marginLeft: "auto",
                            padding: "4px 12px",
                            background: "#1C1C1E",
                            border: "1px solid #333",
                            borderRadius: 6,
                            color: "#FFF",
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: "pointer",
                            fontFamily: "'Roboto', sans-serif",
                          }}
                        >
                          Log
                        </button>
                      </div>
                      )}
                    </div>
                    )}

                    {showGraph === ex.name && (() => {
                      const points = [40, 55, 50, 65, 60, 75, 70, 85, 80, 95, 90, 100];
                      const w = 280, h = 80, px = 8;
                      const graphW = w - px * 2;
                      const stepX = graphW / (points.length - 1);
                      const maxVal = Math.max(...points);
                      const minVal = Math.min(...points);
                      const range = maxVal - minVal || 1;
                      const coords = points.map((v, i) => ({
                        x: px + i * stepX,
                        y: 6 + (1 - (v - minVal) / range) * (h - 12),
                      }));
                      const linePath = coords.map((c, i) => `${i === 0 ? "M" : "L"}${c.x},${c.y}`).join(" ");
                      const areaPath = `${linePath} L${coords[coords.length - 1].x},${h} L${coords[0].x},${h} Z`;
                      const pctChange = ((points[points.length - 1] - points[0]) / points[0] * 100).toFixed(1);
                      const isUp = pctChange >= 0;
                      const last = coords[coords.length - 1];
                      return (
                        <div
                          style={{
                            background: "#111",
                            borderRadius: 8,
                            padding: "16px 12px 12px",
                            marginBottom: 10,
                            border: "1px solid #1C1C1E",
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                            <span style={{ fontSize: 11, color: "#444" }}>
                              PR History
                            </span>
                            <span style={{
                              fontSize: 12,
                              fontWeight: 700,
                              color: isUp ? "#34C759" : "#FF3B30",
                            }}>
                              {isUp ? "▲" : "▼"} {isUp ? "+" : ""}{pctChange}%
                            </span>
                          </div>
                          <svg width="100%" viewBox={`0 0 ${w} ${h}`} style={{ display: "block" }}>
                            <defs>
                              <linearGradient id={`grad-${ex.name.replace(/\s/g, "")}`} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="#34C759" stopOpacity="0.25" />
                                <stop offset="100%" stopColor="#34C759" stopOpacity="0" />
                              </linearGradient>
                            </defs>
                            <path d={areaPath} fill={`url(#grad-${ex.name.replace(/\s/g, "")})`} />
                            <path d={linePath} fill="none" stroke="#34C759" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                            <circle cx={last.x} cy={last.y} r="3.5" fill="#34C759" />
                            <circle cx={last.x} cy={last.y} r="6" fill="none" stroke="#34C759" strokeWidth="1" opacity="0.4" />
                          </svg>
                        </div>
                      );
                    })()}

                  </div>
                );
              })}
            </div>
          )}
        </div>
      ); })}

      {/* Bottom branding */}
      <div
        style={{
          textAlign: "center",
          marginTop: 32,
          fontSize: 10,
          color: "#333",
          letterSpacing: "0.1em",
        }}
      >
        THREE TARGET METHOD
        <div style={{ marginTop: 12, display: "flex", justifyContent: "center" }}>
          <a
            href="https://discord.com/channels/1447814676795756566/1459000944028028970"
            target="_blank"
            rel="noopener noreferrer"
            style={{ color: "#5865F2" }}
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.947 2.418-2.157 2.418z"/>
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
}
