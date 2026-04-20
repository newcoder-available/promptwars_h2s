import { useState } from "react";
import "./index.css";

const CATEGORIES = [
  {
    id: "live",
    label: "Live Operations",
    icon: "🟢",
    color: "#10b981", // Enhanced from #0F6E56
    bg: "rgba(16, 185, 129, 0.1)", // Enhanced from #E1F5EE
    prompts: [
      {
        title: "Zone Status Snapshot",
        tag: "Real-time",
        input: `AntiGravity.run(\`
  QUERY live_zones
  SELECT zone_id, zone_name, occupancy_pct, status, wait_time_min
  FROM zones.current_state
  WHERE event_id = "EVT-2026-04"
  ORDER BY occupancy_pct DESC
  FORMAT dashboard_card
\`)`,
        output: `✅ LIVE SNAPSHOT — 14:38:22 IST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Zone           │ Density │ Wait  │ Status
───────────────┼─────────┼───────┼────────
Main Stage     │  88%    │ 18min │ 🔴 HIGH
Entry Gate     │  74%    │ 12min │ 🟡 MED
Parking        │  63%    │  6min │ 🟡 MED
Food Court     │  52%    │  3min │ 🟢 LOW
Workshop       │  41%    │  0min │ 🟢 LOW
Restrooms      │  35%    │  0min │ 🟢 LOW
Medic Bay      │  28%    │  0min │ 🟢 LOW
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Total visitors: 1,842  │  Alerts: 2 active`
      },
      {
        title: "Trigger Zone Alert",
        tag: "Alert",
        input: `AntiGravity.alert(\`
  TRIGGER zone_alert
  zone_id     = "MAIN_STAGE"
  threshold   = 85
  urgency     = P1
  notify      = [staff_app, digital_signage, ops_dashboard]
  message     = "Crowd density critical. Activate south exit corridor."
  auto_reroute = true
\`)`,
        output: `🚨 ALERT TRIGGERED — P1
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Zone         : Main Stage
Density      : 88% (threshold: 85%)
Urgency      : P1 — Safety Critical
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Staff app notified     → 6 field agents
✅ Digital signage updated → 4 screens
✅ Ops dashboard alerted  → 2 managers
✅ Auto-reroute activated → via south corridor
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Pub/Sub latency: 142ms  │  FCM delivery: 98%`
      },
      {
        title: "Real-Time Crowd Heatmap",
        tag: "Maps",
        input: `AntiGravity.maps(\`
  RENDER heatmap
  venue_id    = "VENUE-BLR-01"
  layer       = crowd_density
  refresh_sec = 5
  overlay     = [zone_labels, alert_pins, routing_arrows]
  color_scale = green_amber_red
  export_to   = looker_dashboard
\`)`,
        output: `🗺️ HEATMAP RENDERED — Maps Platform
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Venue        : VENUE-BLR-01 (Bengaluru)
Layer        : Crowd density (live)
Refresh      : Every 5 seconds
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Overlays active:
 • Zone labels        ✅
 • 2 alert pins       ✅ (Main Stage, Entry Gate)
 • 3 routing arrows   ✅ (AI-generated)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Exported to Looker Studio dashboard ✅
Maps API calls used: 12  │  Quota: 98% remaining`
      }
    ]
  },
  {
    id: "ai",
    label: "AI Predictions",
    icon: "🤖",
    color: "#f59e0b", // Enhanced from #854F0B
    bg: "rgba(245, 158, 11, 0.1)", // Enhanced from #FAEEDA
    prompts: [
      {
        title: "Predict Crowd Surge (15 min)",
        tag: "Vertex AI",
        input: `AntiGravity.predict(\`
  MODEL crowd_surge_v2
  FORECAST horizon = 15min
  zones    = ALL
  features = [current_density, hour_of_day, event_schedule, weather]
  confidence_interval = 90%
  alert_if_predicted > 85
\`)`,
        output: `🔮 SURGE FORECAST — Vertex AI (crowd_surge_v2)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Horizon: +15 minutes from 14:38 IST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Zone           │ Now  │ +15min │ Trend
───────────────┼──────┼────────┼──────
Main Stage     │  88% │  94%   │ ▲ SURGE RISK
Entry Gate     │  74% │  79%   │ ▲ Rising
Food Court     │  52% │  58%   │ → Stable
Workshop       │  41% │  39%   │ ▼ Easing
Parking        │  63% │  61%   │ → Stable
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️  AUTO-ALERT: Main Stage predicted >85% in 8 min
Recommendation: Begin reroute now — save ~14 min wait
Model accuracy (last 7 days): 91.4%`
      },
      {
        title: "AI Routing Suggestion",
        tag: "Routing",
        input: `AntiGravity.route(\`
  OPTIMISE crowd_flow
  FROM      = "ENTRY_GATE"
  avoid     = zones WHERE density > 80
  objective = minimise_wait_time
  suggest   = top_3_paths
  output    = [staff_instructions, signage_text, maps_overlay]
\`)`,
        output: `🧭 ROUTING SUGGESTIONS — Optimised
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Option 1 (RECOMMENDED — saves 11 min)
  Path   : Entry Gate → South Corridor → Workshop
  Walk   : 4 min  │  Wait: 0 min
  Signage: "Head south — Workshop open, no queue"

Option 2 (saves 7 min)
  Path   : Entry Gate → East Path → Food Court
  Walk   : 6 min  │  Wait: 3 min
  Signage: "Food Court via east — short walk, short wait"

Option 3 (saves 4 min)
  Path   : Entry Gate → Main Path → Parking overflow
  Walk   : 8 min  │  Wait: 6 min
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Deployed to 4 digital signs  │  ✅ Sent to 6 staff`
      },
      {
        title: "What-If Capacity Simulation",
        tag: "Simulation",
        input: `AntiGravity.simulate(\`
  SCENARIO capacity_change
  zone_id       = "MAIN_STAGE"
  reduce_capacity_to = 400
  current_capacity   = 500
  simulate_minutes   = 30
  show_ripple_effect = true
\`)`,
        output: `📊 SIMULATION RESULT — What-If Analysis
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Scenario: Main Stage capacity 500 → 400 (-20%)
Simulated over: 30 minutes
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Ripple effects:
 • Main Stage overflow  → +22% to Entry Gate queue
 • Food Court demand    → +14% (displaced visitors)
 • Workshop demand      → +8%  (nearest alternative)
 • Avg wait time delta  → +6 min across venue

Recommendation:
 Open auxiliary zone "Conference Hall B" to absorb
 ~80 displaced visitors — neutralises ripple effect.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Simulation confidence: 87%  │  Based on 42 past events`
      }
    ]
  },
  {
    id: "analytics",
    label: "Analytics",
    icon: "📊",
    color: "#3b82f6", // Enhanced from #185FA5
    bg: "rgba(59, 130, 246, 0.1)", // Enhanced from #E6F1FB
    prompts: [
      {
        title: "Peak Hour Analysis",
        tag: "BigQuery",
        input: `AntiGravity.analyse(\`
  QUERY peak_hours
  SELECT hour, zone_id, AVG(density_pct) as avg_density,
         MAX(density_pct) as peak_density,
         COUNT(alert_events) as alerts_triggered
  FROM bigquery.zone_density_log
  WHERE DATE = TODAY()
  GROUP BY hour, zone_id
  ORDER BY peak_density DESC
  VISUALISE bar_chart
\`)`,
        output: `📈 PEAK HOUR REPORT — Today (Apr 20, 2026)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Hour   │ Top Zone     │ Avg  │ Peak │ Alerts
───────┼──────────────┼──────┼──────┼───────
14:00  │ Main Stage   │ 84%  │ 92%  │  3
13:00  │ Entry Gate   │ 78%  │ 88%  │  2
12:00  │ Food Court   │ 71%  │ 83%  │  1
11:00  │ Parking      │ 61%  │ 70%  │  0
10:00  │ Entry Gate   │ 54%  │ 65%  │  0
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Busiest zone: Main Stage (84% avg today)
Calmest zone: Medic Bay  (28% avg today)
Chart exported to Looker Studio ✅`
      },
      {
        title: "Post-Event Flow Report",
        tag: "Reporting",
        input: `AntiGravity.report(\`
  GENERATE post_event_summary
  event_id   = "EVT-2026-04"
  sections   = [crowd_flow, peak_times, bottlenecks,
                ai_interventions, wait_time_reduction]
  format     = PDF
  send_to    = ["ops@venue.com", "safety@venue.com"]
\`)`,
        output: `📄 POST-EVENT REPORT GENERATED
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Event     : EVT-2026-04  │  Apr 20, 2026
Duration  : 09:00–18:00 IST  │  9 hours
Total visitors: 8,420
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Key metrics:
 • Peak density   : 92% (Main Stage, 14:12)
 • Avg wait time  : 9.4 min (↓31% vs last event)
 • AI reroutes    : 14 triggered, 13 successful
 • Alerts fired   : 6 total (4 resolved via AI)
 • Incidents      : 0 safety incidents ✅

Report PDF: 12 pages generated ✅
Sent to 2 recipients ✅  │  Saved to Drive ✅`
      }
    ]
  },
  {
    id: "coordination",
    label: "Staff Coordination",
    icon: "👥",
    color: "#8b5cf6", // Enhanced from #533AB7
    bg: "rgba(139, 92, 246, 0.1)", // Enhanced from #EEEDFE
    prompts: [
      {
        title: "Deploy Staff to Zone",
        tag: "FCM",
        input: `AntiGravity.dispatch(\`
  ASSIGN staff_to_zone
  zone_id    = "MAIN_STAGE"
  staff_count = 3
  role        = crowd_flow_assistant
  instruction = "Guide guests toward south exit.
                 Keep central aisle clear.
                 Report every 5 min via app."
  notify_via  = [firebase_push, wristband_buzz]
\`)`,
        output: `👥 STAFF DISPATCHED — Firebase FCM
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Zone        : Main Stage
Assigned    : 3 staff (Rahul K, Priya M, Arjun S)
Role        : Crowd flow assistant
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Instructions delivered:
 ✅ Firebase push sent    → 3/3 devices
 ✅ Wristband buzz        → 3/3 confirmed
 ✅ In-app task created   → visible on staff map
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ETA to zone : ~2 min  │  Check-in required: 5 min`
      },
      {
        title: "Broadcast Visitor Nudge",
        tag: "Signage",
        input: `AntiGravity.broadcast(\`
  PUSH visitor_nudge
  channel     = [digital_signage, mobile_app_banner]
  zones       = ["ENTRY_GATE", "MAIN_PATH"]
  message     = "Workshop Zone now open — skip the queue!
                 Head south for instant entry."
  display_sec = 30
  language    = [en, hi, kn]
\`)`,
        output: `📢 VISITOR NUDGE BROADCAST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Channels: Digital signage + Mobile banners
Zones   : Entry Gate, Main Path
Duration: 30 seconds
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Languages rendered:
 ✅ English  — "Workshop Zone now open — skip the queue!"
 ✅ Hindi    — "वर्कशॉप ज़ोन अब खुला है — कतार छोड़ें!"
 ✅ Kannada  — "ವರ್ಕ್ಶಾಪ್ ಜೋನ್ ಈಗ ತೆರೆದಿದೆ!"
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
4 screens updated ✅  │  Banner pushed to 312 devices ✅
Expected flow shift: ~40 visitors in next 5 min`
      }
    ]
  }
];

export default function App() {
  const [activeCategory, setActiveCategory] = useState("live");
  const [running, setRunning] = useState(null);
  const [outputs, setOutputs] = useState({});
  const [copied, setCopied] = useState(null);

  const cat = CATEGORIES.find(c => c.id === activeCategory);

  function runPrompt(key, output) {
    setRunning(key);
    setOutputs(prev => ({ ...prev, [key]: "" }));
    let i = 0;
    const chars = output.split("");
    const iv = setInterval(() => {
      i += 3;
      setOutputs(prev => ({ ...prev, [key]: chars.slice(0, i).join("") }));
      if (i >= chars.length) {
        clearInterval(iv);
        setRunning(null);
      }
    }, 12);
  }

  function copyText(key, text) {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  }

  return (
    <div style={{ fontFamily: "var(--font-sans)", color: "var(--color-text-primary)", padding: "1rem 0" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 24, paddingBottom: 20, borderBottom: "1px solid var(--color-border-tertiary)" }}>
        <div style={{ 
          width: 44, height: 44, borderRadius: 12, 
          background: "linear-gradient(135deg, #2563eb, #7c3aed)", 
          display: "flex", alignItems: "center", justifyContent: "center", 
          fontSize: 22, boxShadow: "0 4px 14px rgba(124, 58, 237, 0.4)", flexShrink: 0 
        }}>
          ✨
        </div>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 600, margin: 0, letterSpacing: "-0.5px" }}>AntiGravity Prompt Console</h1>
          <div style={{ fontSize: 13, color: "var(--color-text-secondary)", marginTop: 4 }}>Interact with AI models to execute live operations. Click Run to simulate execution.</div>
        </div>
      </div>

      {/* Category tabs */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 24 }}>
        {CATEGORIES.map(c => (
          <button key={c.id} onClick={() => setActiveCategory(c.id)} style={{
            padding: "8px 16px", borderRadius: 24, border: "1px solid",
            borderColor: activeCategory === c.id ? c.color : "var(--color-border-tertiary)",
            background: activeCategory === c.id ? c.bg : "var(--color-background-secondary)",
            color: activeCategory === c.id ? c.color : "var(--color-text-secondary)",
            fontSize: 13, cursor: "pointer", display: "flex", alignItems: "center", gap: 6,
            fontWeight: activeCategory === c.id ? 600 : 500,
            boxShadow: activeCategory === c.id ? `0 0 0 1px ${c.color}20` : "none",
            transition: "all 0.2s ease"
          }}>
            {c.icon} {c.label}
          </button>
        ))}
      </div>

      {/* Prompt blocks */}
      <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
        {cat.prompts.map((pr, i) => {
          const key = `${activeCategory}-${i}`;
          const hasOutput = outputs[key] !== undefined;
          const isRunning = running === key;
          
          return (
            <div key={key} className="prompt-card fade-in" style={{ 
              border: "1px solid var(--color-border-secondary)", 
              borderRadius: 16, 
              overflow: "hidden",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
              background: "var(--color-background-primary)",
              transition: "transform 0.2s ease",
            }}>
              {/* Prompt header */}
              <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 18px", background: "var(--color-background-secondary)", borderBottom: "1px solid var(--color-border-tertiary)" }}>
                <span style={{ fontSize: 14, fontWeight: 600, color: "var(--color-text-primary)" }}>{pr.title}</span>
                <span style={{ fontSize: 11, padding: "3px 10px", borderRadius: 12, background: cat.bg, color: cat.color, fontWeight: 600, border: `1px solid ${cat.color}40` }}>{pr.tag}</span>
                <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                  <button onClick={() => copyText(key, pr.input)} style={{
                    padding: "6px 14px", borderRadius: 8, border: "1px solid var(--color-border-secondary)",
                    background: copied === key ? "rgba(34, 197, 94, 0.1)" : "var(--color-background-primary)",
                    color: copied === key ? "#22c55e" : "var(--color-text-secondary)",
                    fontSize: 12, cursor: "pointer", fontWeight: 500,
                    transition: "all 0.2s"
                  }}>{copied === key ? "✓ Copied" : "Copy"}</button>
                  <button onClick={() => runPrompt(key, pr.output)} disabled={isRunning} style={{
                    padding: "6px 16px", borderRadius: 8, border: "none",
                    background: isRunning ? "var(--color-border-tertiary)" : cat.color,
                    color: isRunning ? "var(--color-text-secondary)" : "white", 
                    fontSize: 12, cursor: isRunning ? "not-allowed" : "pointer", fontWeight: 600,
                    transition: "all 0.2s"
                  }}>{isRunning ? "Running…" : "▶ Run"}</button>
                </div>
              </div>

              {/* Input */}
              <div style={{ padding: "16px 18px", position: "relative" }}>
                <div style={{ fontSize: 10, color: "var(--color-text-tertiary)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "1px", fontWeight: 600 }}>Input Prompt</div>
                <div style={{ position: "relative" }}>
                  <pre style={{ margin: 0, padding: 16, borderRadius: 10, background: "var(--color-background-terminal)", fontSize: 13, lineHeight: 1.6, whiteSpace: "pre-wrap", color: "#e2e8f0", fontFamily: "var(--font-mono)", border: "1px solid var(--color-border-tertiary)", overflowX: "auto" }}><code style={{fontFamily: "var(--font-mono)"}}>{pr.input}</code></pre>
                </div>
              </div>

              {/* Output */}
              {(hasOutput || isRunning) && (
                <div className="output-panel" style={{ padding: "0 18px 18px", animation: "slideDown 0.3s ease-out forwards" }}>
                  <div style={{ fontSize: 10, color: "var(--color-text-tertiary)", marginBottom: 8, textTransform: "uppercase", letterSpacing: "1px", fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
                    Output System <span style={{display: "inline-block", width: 6, height: 6, borderRadius: "50%", background: isRunning ? "#f59e0b" : "#22c55e"}}></span>
                  </div>
                  <pre style={{ margin: 0, padding: 16, borderRadius: 10, background: "var(--color-background-terminal)", fontSize: 13, lineHeight: 1.6, whiteSpace: "pre-wrap", color: "#a5b4fc", fontFamily: "var(--font-mono)", border: "1px solid var(--color-border-tertiary)", minHeight: 80, overflowX: "auto", position: "relative" }}>
                    {outputs[key] || ""}
                    {isRunning && <span style={{ animation: "blink 1s step-end infinite", color: "#3b82f6" }}>▋</span>}
                  </pre>
                </div>
              )}
            </div>
          );
        })}
      </div>

      <style>{`
        @keyframes blink { 0%, 100% {opacity:1} 50% {opacity:0} }
        @keyframes slideDown { from {opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
        .prompt-card:hover { transform: translateY(-2px); border-color: var(--color-border-hover); box-shadow: 0 8px 16px -4px rgba(0,0,0,0.2) }
      `}</style>
    </div>
  );
}
