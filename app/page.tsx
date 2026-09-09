"use client";

import { useEffect, useMemo, useState } from "react";

type Brief = {
  brand: string; product: string; objective: string; target: string;
  message: string; media: string; duration: string; mandatory: string;
  avoid: string; tone: string; references: string; notes: string;
};

type Insight = { id: string; type: string; title: string; rationale: string };

const emptyBrief: Brief = {
  brand: "", product: "", objective: "", target: "", message: "", media: "",
  duration: "15초", mandatory: "", avoid: "", tone: "", references: "", notes: ""
};

const steps = ["BRIEF", "RESEARCH", "INSIGHT", "STRATEGY", "IDEA", "COPY", "STORYBOARD", "REVIEW"];

export default function Home() {
  const [brief, setBrief] = useState<Brief>(emptyBrief);
  const [insights, setInsights] = useState<Insight[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"demo" | "live" | "">("");
  const [activeStep, setActiveStep] = useState(0);

  useEffect(() => {
    const saved = localStorage.getItem("creative-os-v01");
    if (saved) {
      const data = JSON.parse(saved);
      setBrief(data.brief || emptyBrief);
      setInsights(data.insights || []);
      setSelected(data.selected || []);
      setSummary(data.summary || "");
      setMode(data.mode || "");
      setActiveStep(data.activeStep || 0);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("creative-os-v01", JSON.stringify({ brief, insights, selected, summary, mode, activeStep }));
  }, [brief, insights, selected, summary, mode, activeStep]);

  const progress = useMemo(() => `${Math.max(1, activeStep + 1)}/8`, [activeStep]);

  const update = (key: keyof Brief, value: string) => setBrief((prev) => ({ ...prev, [key]: value }));

  const analyze = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(brief) });
      const data = await res.json();
      setInsights(data.insights || []);
      setSummary(data.summary || "");
      setMode(data.mode || "");
      setActiveStep(2);
    } finally { setLoading(false); }
  };

  const toggle = (id: string) => setSelected((prev) => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  return (
    <main className="shell">
      <aside className="sidebar">
        <div>
          <div className="eyebrow">AI CREATIVE PLANNING</div>
          <h1>CREATIVE<br/>OS</h1>
          <p className="version">v0.1 / Prototype</p>
        </div>
        <nav>
          {steps.map((step, i) => (
            <button key={step} className={`step ${i === activeStep ? "active" : ""} ${i > 2 ? "locked" : ""}`} onClick={() => i <= 2 && setActiveStep(i)}>
              <span>{String(i + 1).padStart(2, "0")}</span>{step}
            </button>
          ))}
        </nav>
        <div className="sidefoot"><span>PROGRESS</span><strong>{progress}</strong></div>
      </aside>

      <section className="workspace">
        {activeStep === 0 && <>
          <header className="topbar"><div><div className="eyebrow">STEP 01</div><h2>PROJECT BRIEF</h2></div><div className="status">AUTO SAVE</div></header>
          <p className="lead">좋은 아이디어보다 먼저, 좋은 질문을 만듭니다. 알고 있는 정보를 최대한 입력해주세요.</p>
          <div className="formgrid">
            <Field label="BRAND" value={brief.brand} onChange={v=>update("brand",v)} placeholder="예: 카카오" />
            <Field label="PRODUCT / SERVICE" value={brief.product} onChange={v=>update("product",v)} placeholder="예: 나에게 선물하기" />
            <Field label="CAMPAIGN OBJECTIVE" value={brief.objective} onChange={v=>update("objective",v)} placeholder="무엇을 변화시키고 싶은가요?" wide />
            <Field label="TARGET" value={brief.target} onChange={v=>update("target",v)} placeholder="핵심 타깃" />
            <Field label="KEY MESSAGE" value={brief.message} onChange={v=>update("message",v)} placeholder="반드시 남겨야 할 메시지" />
            <Field label="MEDIA" value={brief.media} onChange={v=>update("media",v)} placeholder="엘리베이터TV / SNS / OOH ..." />
            <Field label="DURATION / FORMAT" value={brief.duration} onChange={v=>update("duration",v)} placeholder="15초 / 9:16" />
            <Field label="MANDATORY" value={brief.mandatory} onChange={v=>update("mandatory",v)} placeholder="필수 포함 요소" wide />
            <Field label="AVOID" value={brief.avoid} onChange={v=>update("avoid",v)} placeholder="금지 / 주의 요소" />
            <Field label="TONE & MANNER" value={brief.tone} onChange={v=>update("tone",v)} placeholder="예: 위트, 미니멀, 신뢰감" />
            <Field label="REFERENCE" value={brief.references} onChange={v=>update("references",v)} placeholder="URL 또는 참고사항" wide />
            <Field label="ADDITIONAL NOTES" value={brief.notes} onChange={v=>update("notes",v)} placeholder="그 밖에 AI가 알아야 할 내용" wide />
          </div>
          <div className="actions"><button className="secondary" onClick={()=>setBrief(emptyBrief)}>CLEAR</button><button className="primary" onClick={analyze} disabled={loading}>{loading ? "ANALYZING..." : "ANALYZE BRIEF →"}</button></div>
        </>}

        {activeStep === 1 && <>
          <header className="topbar"><div><div className="eyebrow">STEP 02</div><h2>QUICK RESEARCH</h2></div><div className="status muted">NEXT BUILD</div></header>
          <div className="placeholder"><strong>Quick Research module</strong><p>Brand / Product / Consumer / Category / Competitor / Creative Reference를 조사하고 출처와 함께 보여주는 단계입니다.</p><div className="row"><button className="secondary" onClick={()=>setActiveStep(2)}>SKIP RESEARCH</button><button className="primary" disabled>RUN QUICK RESEARCH</button></div></div>
        </>}

        {activeStep === 2 && <>
          <header className="topbar"><div><div className="eyebrow">STEP 03</div><h2>INSIGHT EXPLORER</h2></div><div className={`status ${mode === "live" ? "live" : ""}`}>{mode === "live" ? "LIVE AI" : "DEMO MODE"}</div></header>
          <p className="lead">AI가 먼저 좁히지 않습니다. 가능한 관점을 펼쳐놓고, 사용자가 다음 단계로 가져갈 생각을 선택합니다.</p>
          {summary && <div className="summary"><span>BRIEF READ</span><p>{summary}</p></div>}
          <div className="insightgrid">
            {insights.map((item, i) => <article key={item.id} className={`card ${selected.includes(item.id) ? "selected" : ""}`} onClick={()=>toggle(item.id)}>
              <div className="cardtop"><span>{item.type.toUpperCase()}</span><b>{String(i+1).padStart(2,"0")}</b></div>
              <h3>{item.title}</h3><p>{item.rationale}</p><div className="cardfoot">{selected.includes(item.id) ? "✓ SELECTED" : "+ SELECT"}</div>
            </article>)}
          </div>
          <div className="human"><span>HUMAN INPUT</span><input placeholder="내가 발견한 생각이나 인사이트를 직접 추가합니다." /></div>
          <div className="actions sticky"><span className="selection">{selected.length} selected</span><button className="secondary">+ GENERATE MORE</button><button className="primary" disabled={selected.length===0}>MIX SELECTED INSIGHTS →</button></div>
        </>}
      </section>
    </main>
  );
}

function Field({label,value,onChange,placeholder,wide=false}:{label:string;value:string;onChange:(v:string)=>void;placeholder:string;wide?:boolean}) {
  return <label className={`field ${wide ? "wide" : ""}`}><span>{label}</span><textarea value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={wide?3:2}/></label>
}
