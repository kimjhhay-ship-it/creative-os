import OpenAI from "openai";
import { NextResponse } from "next/server";

type Brief = {
  brand?: string; product?: string; objective?: string; target?: string; message?: string;
  media?: string; duration?: string; mandatory?: string; avoid?: string; tone?: string;
  references?: string; notes?: string;
};

function value(v: unknown, fallback: string) {
  return typeof v === "string" && v.trim() ? v.trim() : fallback;
}

function briefBasedDemo(brief: Brief) {
  const brand = value(brief.brand, "브랜드");
  const product = value(brief.product, "제품/서비스");
  const target = value(brief.target, "핵심 타깃");
  const objective = value(brief.objective, "캠페인 목표");
  const message = value(brief.message, "핵심 메시지");
  const media = value(brief.media, "선택 매체");
  const mandatory = value(brief.mandatory, "필수 요소");
  const tone = value(brief.tone, "브랜드 톤");
  const seed = Date.now().toString(36);

  return {
    summary: `${brand}의 ${product} 과제를 기준으로 타깃(${target}), 목표(${objective}), 핵심 메시지(${message}), 매체(${media})를 연결해 탐색 관점을 구성했습니다. Demo Mode에서도 현재 입력값을 반영하며, API 연결 시 같은 브리프를 AI가 더 깊게 해석합니다.`,
    insights: [
      { id:`consumer-${seed}`, type:"Consumer Insight", title:`${target}이 ${product}를 선택하기 직전에는 무엇이 행동을 멈추게 하는가?`, rationale:`타깃과 제품을 직접 연결해 실제 선택 장벽을 찾는 관점입니다. 목표는 “${objective}”입니다.` },
      { id:`human-${seed}`, type:"Human Truth", title:`사람은 자신에게 중요한 선택일수록 기능보다 ‘왜 지금 해야 하는지’에 대한 이유를 필요로 한다.`, rationale:`“${message}”를 단순 전달이 아니라 사람의 선택 이유와 연결하기 위한 출발점입니다.` },
      { id:`tension-${seed}`, type:"Tension", title:`${target}이 원하는 것과 실제 행동 사이에는 어떤 망설임이 존재할 수 있다.`, rationale:`광고가 해결해야 할 긴장을 찾고, ${product}가 그 간극을 어떻게 줄일지 탐색합니다.` },
      { id:`behavior-${seed}`, type:"Behavior", title:`${media}에서 짧게 마주치는 순간에도 즉시 이해되는 행동 장면이 필요하다.`, rationale:`매체 맥락을 반영해 설명보다 관찰 가능한 행동을 크리에이티브 출발점으로 삼습니다.` },
      { id:`brand-${seed}`, type:"Brand Truth", title:`${brand}는 ${product}를 통해 소비자의 기존 행동에 새로운 의미나 이름을 부여할 수 있다.`, rationale:`제품 기능만 말하지 않고 브랜드가 어떤 역할을 맡을 수 있는지 확장합니다.` },
      { id:`opportunity-${seed}`, type:"Opportunity", title:`“${message}”를 타깃의 일상 언어로 다시 번역하면 새로운 선택 이유를 만들 수 있다.`, rationale:`핵심 메시지를 광고 문구 이전 단계의 전략적 기회로 재구성합니다.` },
      { id:`barrier-${seed}`, type:"Barrier", title:`반드시 지켜야 할 “${mandatory}”가 메시지보다 먼저 보이면 설득력이 약해질 수 있다.`, rationale:`필수 요소를 억지로 삽입하지 않고 아이디어 구조 안에 자연스럽게 통합할 필요가 있습니다.` },
      { id:`tone-${seed}`, type:"Creative Lens", title:`${tone}의 톤을 유지하면서도 첫 순간에 시선을 붙잡는 대비가 필요하다.`, rationale:`브랜드 일관성과 광고적 후킹을 동시에 만족시키기 위한 표현 관점입니다.` }
    ]
  };
}

export async function POST(req: Request) {
  const brief = await req.json() as Brief;
  const hasContent = Object.values(brief).some(v => typeof v === "string" && v.trim());
  if (!hasContent) return NextResponse.json({ error:"분석할 브리프 내용이 없습니다." }, { status:400 });

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ ...briefBasedDemo(brief), mode:"demo" });
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const prompt = `당신은 광고·마케팅 크리에이티브 전략가다. 아래 STEP 01 브리프만을 근거로 Insight Explorer를 만든다.\n\nBRIEF:\n${JSON.stringify(brief, null, 2)}\n\n원칙:\n1) 브리프에 없는 브랜드/제품 사실을 임의로 만들지 않는다.\n2) 목표, 타깃, 핵심 메시지, 매체, 길이, 필수/금지 요소, 톤앤매너를 모두 고려한다.\n3) 정답 하나로 좁히지 말고 Consumer Insight, Human Truth, Desire, Barrier, Tension, Behavior, Category Insight, Cultural Insight, Brand Truth, Opportunity, Brand Role 후보를 균형 있게 최소 12개 발산한다.\n4) 각 rationale에는 브리프의 어떤 입력값과 연결되는지 명확히 설명한다.\n5) 사실 검증이 필요한 외부 정보는 추측하지 말고 '추가 리서치 필요'라고 표시한다.\n6) 결과는 광고 전략과 아이디어를 만들기 전 단계의 관찰/긴장/기회여야 한다.`;

  const response = await client.responses.create({
    model:"gpt-5.6-terra",
    input:prompt,
    text:{ format:{ type:"json_schema", name:"creative_brief_analysis", strict:true, schema:{
      type:"object", additionalProperties:false,
      properties:{
        summary:{type:"string"},
        insights:{type:"array",minItems:12,items:{type:"object",additionalProperties:false,properties:{id:{type:"string"},type:{type:"string"},title:{type:"string"},rationale:{type:"string"}},required:["id","type","title","rationale"]}}
      },
      required:["summary","insights"]
    }}}
  });
  return NextResponse.json({ ...JSON.parse(response.output_text), mode:"live" });
}
