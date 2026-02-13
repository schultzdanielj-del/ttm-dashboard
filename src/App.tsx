import { useState, useEffect } from "react";

const API = "https://ttm-metrics-api-production.up.railway.app";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [uniqueCode, setUniqueCode] = useState("");
  const [username, setUsername] = useState("");
  const [workouts, setWorkouts] = useState({});
  const [bestPRs, setBestPRs] = useState({});
  const [deload, setDeload] = useState({});
  const [checkedDates, setCheckedDates] = useState({});
  const [userNotes, setUserNotes] = useState({});
  const [swaps, setSwaps] = useState({});
  const [sessions, setSessions] = useState({});
  const [expanded, setExpanded] = useState(null);
  const [inputs, setInputs] = useState({});
  const [showGraph, setShowGraph] = useState(null);
  const [graphData, setGraphData] = useState(null);
  const [lastTap, setLastTap] = useState({ date: null, time: 0 });
  const [coreFoodsExpanded, setCoreFoodsExpanded] = useState(false);
  const [labelTap, setLabelTap] = useState(0);
  const [servings, setServings] = useState({});
  const [showInfo, setShowInfo] = useState(null);
  const [subInput, setSubInput] = useState("");
  const [statPanel, setStatPanel] = useState(0);
  const [swipeStart, setSwipeStart] = useState(null);
  const [slideDir, setSlideDir] = useState(null);
  const [logged, setLogged] = useState({});
  const [logFlash, setLogFlash] = useState({});
  const [prHits, setPrHits] = useState({});

  useEffect(() => {
    const path = window.location.pathname.replace(/^\//, "");
    const code = path || new URLSearchParams(window.location.search).get("code") || "";
    if (!code) { setError("No dashboard code found."); setLoading(false); return; }
    setUniqueCode(code);
    fetch(`${API}/api/dashboard/${code}/full`)
      .then((r) => { if (!r.ok) throw new Error("Invalid dashboard link"); return r.json(); })
      .then((d) => {
        setUsername(d.username);
        setWorkouts(d.workouts || {});
        setBestPRs(d.best_prs || {});
        setDeload(d.deload || {});
        setCheckedDates(d.core_foods || {});
        setUserNotes(d.notes || {});
        const sm = {};
        for (const [k, v] of Object.entries(d.swaps || {})) sm[k] = v.swapped;
        setSwaps(sm);
        const se = {};
        for (const [l, s] of Object.entries(d.sessions || {})) se[l] = { openedAt: new Date(s.opened_at), logCount: s.log_count };
        setSessions(se);
        const letters = Object.keys(d.workouts || {});
        if (letters.length > 0) setExpanded(letters[0]);
        setLoading(false);
      })
      .catch((e) => { setError(e.message); setLoading(false); });
  }, []);

  const today = new Date();
  const dayN = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
  const monN = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
  const rollingDays = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today); d.setDate(today.getDate() - (6 - i));
    const key = d.toISOString().split("T")[0];
    const ago = 6 - i;
    return { key, label: dayN[d.getDay()], date: `${monN[d.getMonth()]} ${d.getDate()}`, isToday: ago === 0, canLog: ago <= 2 };
  });
  const streak = (() => { let s = 0; const d = new Date(today); if (!checkedDates[d.toISOString().split("T")[0]]) d.setDate(d.getDate() - 1); while (checkedDates[d.toISOString().split("T")[0]]) { s++; d.setDate(d.getDate() - 1); } return s; })();
  const totalSlots = Object.keys(workouts).length * 6;
  const completedSlots = Object.values(deload).reduce((a, b) => a + Math.min(b, 6), 0);
  const deloadMode = {};
  for (const [l, c] of Object.entries(deload)) deloadMode[l] = c >= 6;
  const formatPR = (pr, timed) => { if (!pr) return "--"; const [w, r] = pr.split("/"); return timed ? `${w === "0" ? "BW" : w}/${r}s` : `${w === "0" ? "BW" : w}/${r}`; };
  const getExData = (ex, exKey) => { const name = swaps[exKey] || ex.name; return { ...ex, best_pr: bestPRs[name] || "0/0", special: ex.special_logging === "reps_as_seconds" ? "reps_as_seconds" : undefined, notes: ex.setup_notes }; };

  const handleCoreFoodTap = (dk, canLog) => {
    if (!canLog) return;
    const now = Date.now(); const isChecked = !!checkedDates[dk];
    if (isChecked) {
      if (lastTap.date === dk && now - lastTap.time < 400) {
        setCheckedDates((p) => { const n = { ...p }; delete n[dk]; return n; }); setLastTap({ date: null, time: 0 });
        fetch(`${API}/api/dashboard/${uniqueCode}/core-foods/toggle`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ date: dk }) });
      } else setLastTap({ date: dk, time: now });
    } else {
      setCheckedDates((p) => ({ ...p, [dk]: true }));
      fetch(`${API}/api/dashboard/${uniqueCode}/core-foods/toggle`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ date: dk }) });
    }
  };
  const toggleStat = (dir) => { setSlideDir(dir); setTimeout(() => { setStatPanel((p) => (p + 1) % 3); setSlideDir(null); }, 200); };
  const handleLabelDT = () => { const n = Date.now(); if (n - labelTap < 400) { setCoreFoodsExpanded((p) => !p); setLabelTap(0); } else setLabelTap(n); };
  const getServ = (dk) => servings[dk] || { protein: [false,false,false,false], veggie: [false,false,false] };
  const toggleServing = (dk, type, index) => {
    setServings((prev) => {
      const c = prev[dk] || { protein: [false,false,false,false], veggie: [false,false,false] };
      const u = { ...c, [type]: [...c[type]] }; u[type][index] = !u[type][index];
      if (u.protein.every(Boolean) && u.veggie.every(Boolean)) {
        setCheckedDates((p) => ({ ...p, [dk]: true }));
        fetch(`${API}/api/dashboard/${uniqueCode}/core-foods/toggle`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ date: dk }) });
      } else { setCheckedDates((p) => { const n = { ...p }; delete n[dk]; return n; }); }
      return { ...prev, [dk]: u };
    });
  };
  const toggleInfo = (ek) => { setShowInfo(showInfo === ek ? null : ek); setSubInput(""); };
  const submitSwap = (ek, orig) => {
    if (!subInput.trim()) return;
    const name = subInput.trim().split(" ").map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(" ");
    setSwaps((p) => ({ ...p, [ek]: name })); setSubInput(""); setShowInfo(null);
    const [l, i] = ek.split(":");
    fetch(`${API}/api/dashboard/${uniqueCode}/swaps`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ workout_letter: l, exercise_index: parseInt(i), original_exercise: orig, swapped_exercise: name }) });
  };
  const revertSwap = (ek) => {
    setSwaps((p) => { const n = { ...p }; delete n[ek]; return n; }); setShowInfo(null);
    const [l, i] = ek.split(":");
    fetch(`${API}/api/dashboard/${uniqueCode}/swaps`, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ workout_letter: l, exercise_index: parseInt(i) }) });
  };
  const handleInput = (wk, ex, idx, field, val) => { const k = `${wk}:${ex}:${idx}`; setInputs((p) => ({ ...p, [k]: { ...p[k], [field]: val } })); };
  const saveNote = (ex, note) => { fetch(`${API}/api/dashboard/${uniqueCode}/notes`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ exercise: ex, note }) }); };
  const handleLog = (inputKey, resolved, letter, idx, displayName) => {
    const bestW = parseInt((resolved.best_pr || "0/0").split("/")[0]) || 0;
    const weight = inputs[inputKey]?.weight ?? (bestW > 0 ? String(bestW) : "");
    const reps = inputs[inputKey]?.reps || "";
    if (!reps) return;
    const isBW = bestW === 0; const logW = isBW ? "BW" : (weight || "0");
    const numW = isBW ? 0 : parseInt(weight) || 0; const numR = parseInt(reps) || 0;
    setLogged((p) => ({ ...p, [inputKey]: { w: logW, r: reps, isPR: false } }));
    setLogFlash((p) => ({ ...p, [inputKey]: true }));
    setTimeout(() => setLogFlash((p) => ({ ...p, [inputKey]: false })), 1200);
    setSessions((p) => { const ex = p[letter]; if (ex && (new Date() - ex.openedAt) < 96*3600000) return { ...p, [letter]: { ...ex, logCount: ex.logCount + 1 } }; return { ...p, [letter]: { openedAt: new Date(), logCount: 1 } }; });
    const exName = displayName || inputKey.split(":")[1];
    fetch(`${API}/api/dashboard/${uniqueCode}/log`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ exercise: exName, weight: numW, reps: numR, workout_letter: letter }) })
      .then((r) => r.json()).then((res) => {
        if (res.is_pr) { setPrHits((p) => ({ ...p, [inputKey]: true })); setLogged((p) => ({ ...p, [inputKey]: { ...p[inputKey], isPR: true } })); }
        if (res.new_best_pr) setBestPRs((p) => ({ ...p, [exName]: res.new_best_pr }));
      }).catch(() => {});
  };
  const loadGraph = (exName, inputKey) => {
    if (showGraph === inputKey) { setShowGraph(null); setGraphData(null); return; }
    setShowGraph(inputKey);
    fetch(`${API}/api/dashboard/${uniqueCode}/pr-history/${encodeURIComponent(exName)}`).then((r) => r.json()).then(setGraphData).catch(() => setGraphData([]));
  };

  if (loading) return <div style={{ background: "#000", minHeight: "100vh", color: "#FFF", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Roboto', sans-serif" }}><div style={{ fontSize: 14, color: "#555" }}>Loading...</div></div>;
  if (error) return <div style={{ background: "#000", minHeight: "100vh", color: "#FFF", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Roboto', sans-serif" }}><div style={{ textAlign: "center", padding: 24 }}><div style={{ fontSize: 16, color: "#FF3B30", marginBottom: 8 }}>Error</div><div style={{ fontSize: 13, color: "#888" }}>{error}</div></div></div>;

  return (
    <div style={{ background: "#000", minHeight: "100vh", color: "#FFF", fontFamily: "'Roboto', sans-serif", maxWidth: 430, margin: "0 auto", padding: "0 16px 32px" }}>
      <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@400;500;600;700" rel="stylesheet" />
      <style>{`input[type=number]::-webkit-inner-spin-button,input[type=number]::-webkit-outer-spin-button{-webkit-appearance:none;margin:0}input[type=number]{-moz-appearance:textfield}body{margin:0;background:#000}`}</style>
      <div style={{ paddingTop: 20, marginBottom: 24 }}>
        <div style={{ fontSize: 11, letterSpacing: "0.15em", color: "#666", textTransform: "uppercase", marginBottom: 4 }}>Three Target Method</div>
        <h1 style={{ fontSize: 26, fontWeight: 700, margin: 0, letterSpacing: "-0.02em" }}>{username}'s Program</h1>
      </div>
      <div style={{ background: "#0A0A0A", border: "1px solid #1C1C1E", borderRadius: 12, padding: 16, marginBottom: 16 }}>
        <div onClick={handleLabelDT} style={{ fontSize: 11, letterSpacing: "0.12em", color: "#555", textTransform: "uppercase", marginBottom: 14, cursor: "pointer", userSelect: "none", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span>Core Foods {coreFoodsExpanded && <span style={{ fontSize: 9, color: "#333" }}>▼</span>}</span>
          {streak > 0 && <span style={{ fontSize: 11, color: "#34C759", fontWeight: 600 }}>{streak} day{streak !== 1 ? "s" : ""}</span>}
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: 6 }}>
          {rollingDays.map((day) => {
            const ck = !!checkedDates[day.key]; const old = !day.canLog; const missed = old && !ck;
            return (<div key={day.key} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, opacity: old ? 0.3 : 1 }}>
              <span style={{ fontSize: 10, color: day.isToday ? "#FFF" : "#555", fontWeight: day.isToday ? 600 : 400 }}>{day.label}</span>
              <div onClick={() => !coreFoodsExpanded && handleCoreFoodTap(day.key, day.canLog)} style={{ width: 32, height: 32, borderRadius: 8, background: ck ? "#34C759" : missed ? "#1C1C1E" : "#111", border: ck ? "1px solid #34C759" : day.isToday ? "1px solid #333" : "1px solid #1C1C1E", display: "flex", alignItems: "center", justifyContent: "center", cursor: day.canLog ? "pointer" : "default", transition: "all 0.2s ease" }}>
                {ck && <span style={{ color: "#000", fontSize: 16, fontWeight: 700 }}>✓</span>}
                {missed && <span style={{ color: "#333", fontSize: 12 }}>×</span>}
              </div>
              <span style={{ fontSize: 9, color: "#333" }}>{day.date}</span>
              {coreFoodsExpanded && day.canLog && (() => { const s = getServ(day.key); return (<div style={{ display: "flex", flexDirection: "column", gap: 3, marginTop: 4 }}>
                {s.protein.map((c, pi) => <div key={`p${pi}`} onClick={() => toggleServing(day.key, "protein", pi)} style={{ width: 18, height: 18, borderRadius: 4, background: c ? "#007AFF" : "#111", border: "1px solid #333", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>{c && <span style={{ fontSize: 10, color: "#FFF" }}>✓</span>}</div>)}
                {s.veggie.map((c, vi) => <div key={`v${vi}`} onClick={() => toggleServing(day.key, "veggie", vi)} style={{ width: 18, height: 18, borderRadius: 4, background: c ? "#34C759" : "#111", border: "1px solid #333", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>{c && <span style={{ fontSize: 10, color: "#FFF" }}>✓</span>}</div>)}
              </div>); })()}
            </div>);
          })}
        </div>
      </div>
      <div style={{ background: "#0A0A0A", border: "1px solid #1C1C1E", borderRadius: 12, padding: 16, marginBottom: 16, overflow: "hidden" }} onTouchStart={(e) => setSwipeStart(e.touches[0].clientX)} onTouchEnd={(e) => { if (swipeStart === null) return; const diff = e.changedTouches[0].clientX - swipeStart; if (Math.abs(diff) > 40) toggleStat(diff > 0 ? "right" : "left"); setSwipeStart(null); }} onClick={() => toggleStat("left")}>
        <div style={{ transition: "transform 0.2s ease", transform: slideDir === "left" ? "translateX(-20px)" : slideDir === "right" ? "translateX(20px)" : "none", opacity: slideDir ? 0.3 : 1 }}>
          {statPanel === 0 ? (() => { const pct = totalSlots > 0 ? Math.round((completedSlots / totalSlots) * 100) : 0; const warn = pct >= 83; const dl = pct >= 100; return (<><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}><span style={{ fontSize: 11, letterSpacing: "0.12em", color: "#555", textTransform: "uppercase" }}>Cycle Progress</span><span style={{ fontSize: 13, fontWeight: 700, color: dl ? "#FFD60A" : warn ? "#FF9500" : "#34C759" }}>{dl ? "DELOAD" : `${pct}%`}</span></div><div style={{ height: 5, background: "#1C1C1E", borderRadius: 3, overflow: "hidden" }}><div style={{ width: `${Math.min(pct, 100)}%`, height: "100%", background: dl ? "#FFD60A" : warn ? "#FF9500" : "#34C759", borderRadius: 3, transition: "width 0.6s ease" }} /></div></>); })()
          : statPanel === 1 ? (<><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}><span style={{ fontSize: 11, letterSpacing: "0.12em", color: "#555", textTransform: "uppercase" }}>Strength Gains This Cycle</span><span style={{ fontSize: 13, fontWeight: 700, color: "#555" }}>--</span></div><div style={{ fontSize: 11, color: "#333", textAlign: "center" }}>Tracked after first full cycle</div></>)
          : (() => { const tp = Object.keys(prHits).length; return (<><div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}><span style={{ fontSize: 11, letterSpacing: "0.12em", color: "#555", textTransform: "uppercase" }}>Cycle PRs</span><span style={{ fontSize: 13, fontWeight: 700, color: "#FFD60A" }}>{tp}</span></div><div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>{Object.keys(prHits).map((k) => <span key={k} style={{ fontSize: 9, fontWeight: 600, color: "#FFD60A", padding: "2px 6px", background: "#FFD60A15", borderRadius: 3 }}>{k.split(":")[1]}</span>)}{tp === 0 && <span style={{ fontSize: 11, color: "#333" }}>No PRs yet this cycle</span>}</div></>); })()}
        </div>
        <div style={{ display: "flex", justifyContent: "center", gap: 6, marginTop: 10 }}>{[0,1,2].map((i) => <div key={i} style={{ width: 5, height: 5, borderRadius: "50%", background: statPanel === i ? "#FFF" : "#333" }} />)}</div>
      </div>
      {Object.entries(workouts).map(([letter, exercises]) => {
        const isDL = deloadMode[letter]; const wLetters = Object.keys(workouts); const isUpNext = wLetters[0] === letter && !isDL;
        return (<div key={letter} style={{ background: "#0A0A0A", border: isUpNext ? "1px solid #34C759" : "1px solid #1C1C1E", borderRadius: 12, marginBottom: 8, overflow: "hidden", opacity: isDL ? 0.7 : isUpNext ? 1 : 0.5 }}>
          <div onClick={() => setExpanded(expanded === letter ? null : letter)} style={{ padding: "14px 16px", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", userSelect: "none" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-0.02em" }}>Workout {letter}</span>
              {isDL && <span style={{ fontSize: 9, fontWeight: 700, color: "#FFD60A", letterSpacing: "0.1em", padding: "2px 6px", background: "#FFD60A15", borderRadius: 4 }}>DELOAD</span>}
              {isUpNext && <span style={{ fontSize: 9, fontWeight: 700, color: "#34C759", letterSpacing: "0.1em", padding: "2px 6px", background: "#34C75915", borderRadius: 4 }}>UP NEXT</span>}
              {(() => { const total = exercises.length; if (!total) return null; const pc = Object.keys(prHits).filter((k) => k.startsWith(letter + ":")).length; if (!pc) return null; const s = sessions[letter]; if (!s) return null; const el = new Date() - s.openedAt; const sLen = 96*3600000; if (el >= sLen) return null; const fade = 1 - el / sLen; const pct = Math.round(pc / total * 100); const t = pct / 100; const r = 255, g = Math.round(214 - t*214), b = Math.round(10 + t*83); return <span style={{ fontSize: Math.round(9+t*9), fontWeight: 800, color: `rgba(${r},${g},${b},${fade.toFixed(2)})`, letterSpacing: "0.1em", padding: "2px 6px", background: `rgba(${r},${g},${b},${(fade*0.08).toFixed(3)})`, borderRadius: 4 }}>{pct >= 100 ? "FLAWLESS" : pct+"% PR"}</span>; })()}
            </div>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ transform: expanded === letter ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s ease" }}><path d="M3 5L7 9L11 5" stroke="#555" strokeWidth="1.5" strokeLinecap="round" /></svg>
          </div>
          {expanded === letter && (<div style={{ padding: "0 16px 16px" }}>
            {exercises.map((ex, idx) => {
              const inputKey = `${letter}:${ex.name}:${idx}`; const sa = sessions[letter] && (new Date() - sessions[letter].openedAt) < 96*3600000;
              const exKey = `${letter}:${idx}`; const res = getExData(ex, exKey); const swName = swaps[exKey]; const dName = swName || ex.name; const isSw = !!swName; const isTimed = res.special === "reps_as_seconds"; const isNew = res.best_pr === "0/0";
              return (<div key={idx} style={{ padding: "12px 0", borderTop: "1px solid #1C1C1E" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <div onClick={() => toggleInfo(exKey)} style={{ cursor: "pointer", flex: 1, minWidth: 0 }}>
                    <span style={{ fontSize: 14, fontWeight: 600 }}>{dName}</span>
                    {isSw && <div style={{ fontSize: 10, color: "#444", fontStyle: "italic", marginTop: 2 }}>prescribed: {ex.name}</div>}
                  </div>
                  <div onClick={() => !isNew && loadGraph(dName, inputKey)} style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 2, cursor: isNew ? "default" : "pointer" }}>
                    {isNew ? <span style={{ fontSize: 13, fontWeight: 600, color: "#FF9500", fontStyle: "italic" }}>new</span> : (
                      <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
                        <span style={{ fontSize: (sa && prHits[inputKey]) ? 18 : 10, color: (sa && prHits[inputKey]) ? "#FFD60A" : "#34C759", fontWeight: (sa && prHits[inputKey]) ? 800 : 400 }}>{(sa && prHits[inputKey]) ? "PR" : "best"}</span>
                        <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: (sa && prHits[inputKey]) ? 18 : 14, fontWeight: (sa && prHits[inputKey]) ? 800 : 600, color: (sa && prHits[inputKey]) ? "#FFD60A" : "#34C759", transition: "all 0.5s ease" }}>{formatPR(res.best_pr, isTimed)}</span>
                      </div>)}
                  </div>
                </div>
                {showInfo === exKey && (<div style={{ background: "#111", borderRadius: 8, padding: 12, marginBottom: 10, border: "1px solid #1C1C1E" }}>
                  {res.notes && <div style={{ fontSize: 12, color: "#888", marginBottom: 10 }}>{res.notes}</div>}
                  <textarea placeholder="Add notes..." value={userNotes[dName] || ""} onChange={(e) => setUserNotes((p) => ({ ...p, [dName]: e.target.value }))} onBlur={(e) => saveNote(dName, e.target.value)} style={{ width: "100%", minHeight: 36, padding: "6px 8px", background: "#0A0A0A", border: "1px solid #333", borderRadius: 6, color: "#FFF", fontSize: 12, fontFamily: "'Roboto', sans-serif", outline: "none", resize: "vertical", marginBottom: 10, boxSizing: "border-box" }} />
                  {isSw ? (<div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}><span style={{ fontSize: 11, color: "#555" }}>Subbed for: <span style={{ color: "#888" }}>{swName}</span></span><button onClick={() => revertSwap(exKey)} style={{ padding: "4px 10px", background: "#1C1C1E", border: "1px solid #333", borderRadius: 6, color: "#FF9500", fontSize: 11, fontWeight: 600, cursor: "pointer" }}>Revert</button></div>)
                  : (<div style={{ display: "flex", alignItems: "center", gap: 8 }}><input type="text" placeholder="Swap to..." value={subInput} onChange={(e) => setSubInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submitSwap(exKey, ex.name)} style={{ flex: 1, padding: "6px 8px", background: "#0A0A0A", border: "1px solid #333", borderRadius: 6, color: "#FFF", fontSize: 13, outline: "none" }} />{subInput.trim() && <button onClick={() => submitSwap(exKey, ex.name)} style={{ padding: "6px 10px", background: "#1C1C1E", border: "1px solid #333", borderRadius: 6, color: "#FFF", fontSize: 12, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap" }}>Swap</button>}</div>)}
                </div>)}
                {isNew ? (<div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 10, fontSize: 13, color: "#555" }}>
                  <span>Warmup — <span style={{ color: "#888" }}>very light × 10-20</span></span><span>Feeler — <span style={{ color: "#888" }}>medium/easy × 5-8</span></span>
                  {!isDL && <div style={{ display: "flex", alignItems: "center", gap: 6 }}><span>Work —</span><input type="number" placeholder="wt" value={inputs[inputKey]?.weight || ""} onChange={(e) => handleInput(letter, ex.name, idx, "weight", e.target.value)} style={{ width: 52, padding: "4px 6px", background: "#111", border: "1px solid #333", borderRadius: 6, color: "#FFF", fontSize: 13, fontFamily: "'JetBrains Mono', monospace", textAlign: "center", outline: "none" }} /><span style={{ color: "#555" }}>×</span><input type="number" placeholder="reps" value={inputs[inputKey]?.reps || ""} onChange={(e) => handleInput(letter, ex.name, idx, "reps", e.target.value)} style={{ width: 46, padding: "4px 6px", background: "#111", border: "1px solid #333", borderRadius: 6, color: "#FFF", fontSize: 13, fontFamily: "'JetBrains Mono', monospace", textAlign: "center", outline: "none" }} /><span style={{ fontSize: 10, color: "#FF9500", whiteSpace: "nowrap" }}>10-25 reps</span><button onClick={() => handleLog(inputKey, res, letter, idx, dName)} style={{ marginLeft: "auto", padding: "4px 12px", background: logFlash[inputKey] ? "#34C759" : "#1C1C1E", border: logFlash[inputKey] ? "1px solid #34C759" : "1px solid #333", borderRadius: 6, color: "#FFF", fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 0.2s ease" }}>{logFlash[inputKey] ? "Done" : "Log"}</button>{sa && logged[inputKey] && <span style={{ fontSize: 13, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace", color: "#34C759", marginLeft: 8, whiteSpace: "nowrap" }}>{logged[inputKey].w}/{logged[inputKey].r}</span>}</div>}
                </div>) : (<div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 10, fontSize: 13, color: "#555" }}>
                  {(() => { const bW = parseInt(res.best_pr.split("/")[0]); const bR = parseInt(res.best_pr.split("/")[1]); const u = isTimed ? "s" : "";
                    if (bW === 0) return (<><span>Warmup — <span style={{ color: "#888" }}>BW × {Math.round(bR*0.4)}{u} or easier variation × 10-20</span></span><span>Feeler — <span style={{ color: "#888" }}>BW × {Math.round(bR*0.3)}{u}</span></span></>);
                    return (<><span>Warmup — <span style={{ color: "#888" }}>{Math.round(bW*0.5/5)*5} × 10-20 reps</span></span><span>Feeler — <span style={{ color: "#888" }}>{Math.round(bW*0.75/5)*5} × 5-8 reps</span></span></>); })()}
                  {!isDL && <div style={{ display: "flex", alignItems: "center", gap: 6 }}><span>Work —</span><input type="number" placeholder={parseInt(res.best_pr.split("/")[0]) === 0 ? "BW" : ""} value={inputs[inputKey]?.weight ?? (parseInt(res.best_pr.split("/")[0]) > 0 ? String(parseInt(res.best_pr.split("/")[0])) : "")} onChange={(e) => handleInput(letter, ex.name, idx, "weight", e.target.value)} style={{ width: 52, padding: "4px 6px", background: "#111", border: "1px solid #333", borderRadius: 6, color: "#FFF", fontSize: 13, fontFamily: "'JetBrains Mono', monospace", textAlign: "center", outline: "none" }} /><span style={{ color: "#555" }}>×</span><input type="number" placeholder={isTimed ? "secs" : "reps"} value={inputs[inputKey]?.reps || ""} onChange={(e) => handleInput(letter, ex.name, idx, "reps", e.target.value)} style={{ width: 46, padding: "4px 6px", background: "#111", border: "1px solid #333", borderRadius: 6, color: "#FFF", fontSize: 13, fontFamily: "'JetBrains Mono', monospace", textAlign: "center", outline: "none" }} />{(() => { const bW = parseInt(res.best_pr.split("/")[0]); const bR = parseInt(res.best_pr.split("/")[1]); const wW = parseInt(inputs[inputKey]?.weight ?? 0); const th = isTimed ? 60 : 17; return bR < th && wW > bW ? <span style={{ fontSize: 10, color: "#FF3B30", whiteSpace: "nowrap" }}>probably too heavy</span> : null; })()}<button onClick={() => handleLog(inputKey, res, letter, idx, dName)} style={{ padding: "4px 12px", background: logFlash[inputKey] ? "#34C759" : "#1C1C1E", border: logFlash[inputKey] ? "1px solid #34C759" : "1px solid #333", borderRadius: 6, color: "#FFF", fontSize: 12, fontWeight: 600, cursor: "pointer", transition: "all 0.2s ease" }}>{logFlash[inputKey] ? "Done" : "Log"}</button>{sa && logged[inputKey] && <span style={{ fontSize: 13, fontWeight: 600, fontFamily: "'JetBrains Mono', monospace", color: "#34C759", marginLeft: 8, whiteSpace: "nowrap" }}>{logged[inputKey].w}/{logged[inputKey].r}</span>}</div>}
                </div>)}
                {showGraph === inputKey && graphData && graphData.length > 1 && (() => {
                  const pts = graphData.map((p) => p.estimated_1rm);
                  const w = 280, h = 80, px = 8, gW = w - px*2, sX = gW / (pts.length - 1);
                  const mx = Math.max(...pts), mn = Math.min(...pts), rng = mx - mn || 1;
                  const cds = pts.map((v, i) => ({ x: px + i*sX, y: 6 + (1 - (v-mn)/rng)*(h-12) }));
                  const lp = cds.map((c, i) => `${i === 0 ? "M" : "L"}${c.x},${c.y}`).join(" ");
                  const ap = `${lp} L${cds[cds.length-1].x},${h} L${cds[0].x},${h} Z`;
                  const pc = ((pts[pts.length-1] - pts[0]) / pts[0] * 100).toFixed(1);
                  const up = parseFloat(pc) >= 0; const last = cds[cds.length-1];
                  const gid = `g-${dName.replace(/[^a-zA-Z0-9]/g, "")}`;
                  return (<div style={{ background: "#111", borderRadius: 8, padding: "16px 12px 12px", marginBottom: 10, border: "1px solid #1C1C1E" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}><span style={{ fontSize: 11, color: "#444" }}>PR History</span><span style={{ fontSize: 12, fontWeight: 700, color: up ? "#34C759" : "#FF3B30" }}>{up ? "▲ +" : "▼ "}{pc}%</span></div>
                    <svg width="100%" viewBox={`0 0 ${w} ${h}`} style={{ display: "block" }}><defs><linearGradient id={gid} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#34C759" stopOpacity="0.25" /><stop offset="100%" stopColor="#34C759" stopOpacity="0" /></linearGradient></defs><path d={ap} fill={`url(#${gid})`} /><path d={lp} fill="none" stroke="#34C759" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><circle cx={last.x} cy={last.y} r="3.5" fill="#34C759" /><circle cx={last.x} cy={last.y} r="6" fill="none" stroke="#34C759" strokeWidth="1" opacity="0.4" /></svg>
                  </div>);
                })()}
              </div>);
            })}
          </div>)}
        </div>);
      })}
      <div style={{ textAlign: "center", marginTop: 32, fontSize: 10, color: "#333", letterSpacing: "0.1em" }}>THREE TARGET METHOD
        <div style={{ marginTop: 12, display: "flex", justifyContent: "center" }}><a href="https://discord.com/channels/1447814676795756566/1459000944028028970" target="_blank" rel="noopener noreferrer" style={{ color: "#5865F2" }}><svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.095 2.157 2.42 0 1.333-.947 2.418-2.157 2.418z"/></svg></a></div>
      </div>
    </div>
  );
}
