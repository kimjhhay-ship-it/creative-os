"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";

type Brief = {
  brand: string; product: string; objective: string; target: string;
  message: string; media: string; duration: string; mandatory: string;
  avoid: string; tone: string; references: string; notes: string;
};

type Insight = { id: string; type: string; title: string; rationale: string };
type InsightRoute = {
  id: string; lens: string; title: string; synthesis: string;
  tension: string; opportunity: string; propositionSeed: string;
};
type Strategy = {
  id: string; approach: string; insight: string; pov: string;
  proposition: string; brandRole: string; whyItWorks: string;
};

type UploadResult = {
  filename: string; summary: string; missingFields: string[]; mode: "demo" | "live";
};

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
  const [humanInput, setHumanInput] = useState("");
  const [routes, setRoutes] = useState<InsightRoute[]>([]);
  const [selectedRoutes, setSelectedRoutes] = useState<string[]>([]);
  const [strategies, setStrategies] = useState<Strategy[]>([]);
  const [selectedStrategies, setSelectedStrategies] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [generatingMore, setGeneratingMore] = useState(false);
  const [mixing, setMixing] = useState(false);
  const [buildingStrategy, setBuildingStrategy] = useState(false);
  const [mode, setMode] = useState<"demo" | "live" | "">("");
  const [activeStep, setActiveStep] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("creative-os-v02");
    if (!saved) return;
    try {
      const data = JSON.parse(saved);
      setBrief(data.brief || emptyBrief);
      setInsights(data.insights || []);
      setSelected(data.selected || []);
      setSummary(data.summary || "");
      setHumanInput(data.humanInput || "");
      setRoutes(data.routes || []);
      setSelectedRoutes(data.selectedRoutes || []);
      setStrategies(data.strategies || []);
      setSelectedStrategies(data.selectedStrategies || []);
      setMode(data.mode || "");
      setActiveStep(data.activeStep || 0);
      setUploadResult(data.uploadResult || null);
    } catch { /* ignore malformed old state */ }
  }, []);

  useEffect(() => {
    localStorage.setItem("creative-os-v02", JSON.stringify({
      brief, insights, selected, summary, humanInput, routes, selectedRoutes,
      strategies, selectedStrategies, mode, activeStep, uploadResult
    }));
  }, [brief, insights, selected, summary, humanInput, routes, selectedRoutes, strategies, selectedStrategies, mode, activeStep, uploadResult]);

  const progress = useMemo(() => `${Math.max(1, activeStep + 1)}/8`, [activeStep]);
  const selectedInsightObjects = useMemo(() => insights.filter(x => selected.includes(x.id)), [insights, selected]);
  const selectedRouteObjects = useMemo(() => routes.filter(x => selectedRoutes.includes(x.id)), [routes, selectedRoutes]);
  const maxUnlocked = strategies.length > 0 ? 3 : insights.length > 0 ? 2 : 1;

  const update = (key: keyof Brief, value: string) => setBrief((prev) => ({ ...prev, [key]: value }));
  const toggle = (id: string) => setSelected((prev) => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const toggleRoute = (id: string) => setSelectedRoutes((prev) => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const toggleStrategy = (id: string) => setSelectedStrategies((prev) => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const analyze = async () => {
    setLoading(true); setError("");
    try {
      const res = await fetch("/api/analyze", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(brief) });
      if (!res.ok) throw new Error("Brief 분석에 실패했습니다.");
      const data = await res.json();
      setInsights(data.insights || []);
      setSelected([]); setRoutes([]); setSelectedRoutes([]); setStrategies([]); setSelectedStrategies([]);
      setSummary(data.summary || ""); setMode(data.mode || ""); setActiveStep(2);
    } catch (e) { setError(e instanceof Error ? e.message : "Brief 분석에 실패했습니다."); }
    finally { setLoading(false); }
  };

  const analyzeUploadedBrief = async () => {
    if (!file) return;
    setUploading(true); setError("");
    try {
      const form = new FormData(); form.append("file", file);
      const res = await fetch("/api/brief-file", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "파일 분석에 실패했습니다.");
      setBrief(prev => ({ ...prev, ...data.brief }));
      setUploadResult({ filename: data.filename, summary: data.summary, missingFields: data.missingFields || [], mode: data.mode });
      setMode(data.mode || "");
    } catch (e) { setError(e instanceof Error ? e.message : "파일 분석에 실패했습니다."); }
    finally { setUploading(false); }
  };

  const handleFile = (e: ChangeEvent<HTMLInputElement>) => {
    const next = e.target.files?.[0] || null;
    setFile(next); setUploadResult(null); setError("");
  };

  const generateMore = async () => {
    setGeneratingMore(true); setError("");
    try {
      const res = await fetch("/api/insights-more", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brief, existingInsights: insights, humanInput })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "추가 인사이트 생성에 실패했습니다.");
      setInsights(prev => [...prev, ...(data.insights || [])]); setMode(data.mode || mode);
    } catch (e) { setError(e instanceof Error ? e.message : "추가 인사이트 생성에 실패했습니다."); }
    finally { setGeneratingMore(false); }
  };

  const mixSelected = async () => {
    if (selectedInsightObjects.length === 0 && !humanInput.trim()) return;
    setMixing(true); setError("");
    try {
      const res = await fetch("/api/mix", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brief, insights: selectedInsightObjects, humanInput })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Insight Mixer 실행에 실패했습니다.");
      setRoutes(data.routes || []); setSelectedRoutes([]); setMode(data.mode || mode);
    } catch (e) { setError(e instanceof Error ? e.message : "Insight Mixer 실행에 실패했습니다."); }
    finally { setMixing(false); }
  };

  const buildStrategy = async () => {
    if (selectedRouteObjects.length === 0) return;
    setBuildingStrategy(true); setError("");
    try {
      const res = await fetch("/api/strategy", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ brief, routes: selectedRouteObjects, insights: selectedInsightObjects, humanInput })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Strategy 생성에 실패했습니다.");
      setStrategies(data.strategies || []); setSelectedStrategies([]); setMode(data.mode || mode); setActiveStep(3);
    } catch (e) { setError(e instanceof Error ? e.message : "Strategy 생성에 실패했습니다."); }
    finally { setBuildingStrategy(false); }
  };

  const clearAll = () => {
    setBrief(emptyBrief); setInsights([]); setSelected([]); setSummary(""); setHumanInput("");
    setRoutes([]); setSelectedRoutes([]); setStrategies([]); setSelectedStrategies([]);
    setMode(""); setActiveStep(0); setUploadResult(null); setFile(null); setError("");
    localStorage.removeItem("creative-os-v02");
  };

  return (
    <main className="shell">
      <aside className="sidebar">
        <div>
          <div className="eyebrow">AI CREATIVE PLANNING</div>
          <h1>CREATIVE<br/>OS</h1>
          <p className="version">v0.2 / Working Prototype</p>
        </div>
        <nav>
          {steps.map((step, i) => (
            <button key={step} className={`step ${i === activeStep ? "active" : ""} ${i > maxUnlocked ? "locked" : ""}`}
              onClick={() => i <= maxUnlocked && setActiveStep(i)}>
              <span>{String(i + 1).padStart(2, "0")}</span>{step}
            </button>
          ))}
        </nav>
        <div className="sidefoot"><span>PROGRESS</span><strong>{progress}</strong></div>
      </aside>

      <section className="workspace">
        {error && <div className="errorbar">{error}<button onClick={()=>setError("")}>×</button></div>}

        {activeStep === 0 && <>
          <header className="topbar"><div><div className="eyebrow">STEP 01</div><h2>PROJECT BRIEF</h2></div><div className="status">AUTO SAVE</div></header>
          <p className="lead">좋은 아이디어보다 먼저, 좋은 질문을 만듭니다. 직접 입력하거나 광고주 브리프·회의록 파일을 올려 AI가 먼저 구조화하게 할 수 있습니다.</p>

          <section className="uploadbox">
            <div className="uploadcopy">
              <div className="eyebrow">BRIEF IMPORT</div>
              <h3>광고주 브리프 / 회의록 업로드</h3>
              <p>PDF, DOCX, PPTX, TXT, MD 파일에서 브랜드·목표·타깃·메시지·제약조건을 추출해 아래 Brief 필드에 자동 반영합니다.</p>
            </div>
            <div className="uploadcontrols">
              <label className="filepick">
                <input type="file" accept=".pdf,.docx,.pptx,.txt,.md,text/plain,application/pdf" onChange={handleFile}/>
                <span>{file ? file.name : "CHOOSE FILE"}</span>
              </label>
              <button className="primary" disabled={!file || uploading} onClick={analyzeUploadedBrief}>{uploading ? "READING FILE..." : "ANALYZE UPLOADED BRIEF →"}</button>
            </div>
            {uploadResult && <div className="uploadresult">
              <div><b>{uploadResult.filename}</b><span className={`pill ${uploadResult.mode}`}>{uploadResult.mode === "live" ? "AI ANALYZED" : "DEMO"}</span></div>
              <p>{uploadResult.summary}</p>
              {uploadResult.missingFields.length > 0 && <small>추가 확인 권장: {uploadResult.missingFields.join(" · ")}</small>}
            </div>}
          </section>

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
          <div className="actions"><button className="secondary" onClick={clearAll}>CLEAR</button><button className="primary" onClick={analyze} disabled={loading}>{loading ? "ANALYZING..." : "ANALYZE BRIEF →"}</button></div>
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
          <div className="human"><span>HUMAN INPUT</span><input value={humanInput} onChange={e=>setHumanInput(e.target.value)} placeholder="내가 발견한 생각이나 인사이트를 직접 추가합니다." /></div>
          <div className="actions sticky"><span className="selection">{selected.length} selected</span><button className="secondary" onClick={generateMore} disabled={generatingMore}>{generatingMore ? "GENERATING..." : "+ GENERATE MORE"}</button><button className="primary" onClick={mixSelected} disabled={(selected.length===0 && !humanInput.trim()) || mixing}>{mixing ? "MIXING..." : "MIX SELECTED INSIGHTS →"}</button></div>

          {routes.length > 0 && <section className="mixer">
            <div className="sectionhead"><div><div className="eyebrow">INSIGHT MIXER</div><h3>Choose a route, not an answer.</h3></div><span>{routes.length} ROUTES</span></div>
            <div className="routegrid">
              {routes.map((route, i) => <article key={route.id} className={`routecard ${selectedRoutes.includes(route.id) ? "selected" : ""}`} onClick={()=>toggleRoute(route.id)}>
                <div className="routehead"><span>{route.lens}</span><b>{String(i+1).padStart(2,"0")}</b></div>
                <h4>{route.title}</h4><p className="synthesis">{route.synthesis}</p>
                <dl><div><dt>TENSION</dt><dd>{route.tension}</dd></div><div><dt>OPPORTUNITY</dt><dd>{route.opportunity}</dd></div><div><dt>PROPOSITION SEED</dt><dd>{route.propositionSeed}</dd></div></dl>
                <div className="cardfoot">{selectedRoutes.includes(route.id) ? "✓ ROUTE SELECTED" : "+ SELECT ROUTE"}</div>
              </article>)}
            </div>
            <div className="actions"><span className="selection">{selectedRoutes.length} route selected</span><button className="primary" onClick={buildStrategy} disabled={selectedRoutes.length===0 || buildingStrategy}>{buildingStrategy ? "BUILDING STRATEGY..." : "BUILD STRATEGY →"}</button></div>
          </section>}
        </>}

        {activeStep === 3 && <>
          <header className="topbar"><div><div className="eyebrow">STEP 04</div><h2>STRATEGY ENGINE</h2></div><div className={`status ${mode === "live" ? "live" : ""}`}>{mode === "live" ? "LIVE AI" : "DEMO MODE"}</div></header>
          <p className="lead">Insight를 광고 아이디어로 바로 점프시키지 않고, 먼저 “어떤 관점으로 설득할 것인가”를 정합니다. 전략과 크리에이티브 콘셉트는 분리합니다.</p>
          <div className="strategygrid">
            {strategies.map((s, i) => <article key={s.id} className={`strategycard ${selectedStrategies.includes(s.id) ? "selected" : ""}`} onClick={()=>toggleStrategy(s.id)}>
              <div className="strategytop"><span>{s.approach}</span><b>{String(i+1).padStart(2,"0")}</b></div>
              <div className="strategyrow"><span>INSIGHT</span><p>{s.insight}</p></div>
              <div className="strategyrow hero"><span>STRATEGIC POV</span><p>{s.pov}</p></div>
              <div className="strategyrow"><span>PROPOSITION</span><p>{s.proposition}</p></div>
              <div className="strategyrow"><span>BRAND ROLE</span><p>{s.brandRole}</p></div>
              <div className="strategyrow"><span>WHY IT WORKS</span><p>{s.whyItWorks}</p></div>
              <div className="cardfoot">{selectedStrategies.includes(s.id) ? "✓ SELECTED" : "+ SELECT STRATEGY"}</div>
            </article>)}
          </div>
          <div className="actions sticky"><span className="selection">{selectedStrategies.length} selected</span><button className="secondary" onClick={()=>setActiveStep(2)}>← BACK TO INSIGHT</button><button className="primary" disabled>DEVELOP BIG IDEA →</button></div>
          <p className="nextnote">STEP 05 IDEA는 다음 빌드에서 연결합니다. 선택한 Strategy는 자동 저장됩니다.</p>
        </>}
      </section>
    </main>
  );
}

function Field({label,value,onChange,placeholder,wide=false}:{label:string;value:string;onChange:(v:string)=>void;placeholder:string;wide?:boolean}) {
  return <label className={`field ${wide ? "wide" : ""}`}><span>{label}</span><textarea value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} rows={wide?3:2}/></label>;
}
