import OpenAI from "openai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const brief = body.brief || {};
  if (!process.env.OPENAI_API_KEY) {
    const t = Date.now();
    const brand = brief.brand?.trim() || "브랜드";
    const product = brief.product?.trim() || "제품/서비스";
    const target = brief.target?.trim() || "타깃";
    const message = brief.message?.trim() || "핵심 메시지";
    return NextResponse.json({ mode:"demo", insights:[
      { id:`desire-${t}`, type:"Desire", title:`${target}은 ${product}를 통해 어떤 상태나 감정을 얻고 싶어 할까?`, rationale:`현재 브리프의 타깃과 제품에서 출발해 기능 뒤의 욕구를 더 깊게 탐색합니다.` },
      { id:`barrier-${t}`, type:"Barrier", title:`“${message}”가 맞는 말이어도 행동으로 이어지지 않는 이유는 무엇일까?`, rationale:`핵심 메시지와 실제 행동 사이의 장벽을 찾는 추가 관점입니다.` },
      { id:`brand-${t}`, type:"Brand Role", title:`${brand}가 소비자 대신 해석하거나 허락해줄 수 있는 것은 무엇일까?`, rationale:`브랜드가 단순 발신자가 아니라 행동을 돕는 역할을 갖도록 확장합니다.` }
    ]});
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const response = await client.responses.create({
    model:"gpt-5.6-terra",
    input:`STEP 01 브리프를 최우선 근거로 사용하고, 기존 Insight Explorer 결과와 겹치지 않는 새로운 인사이트 6개를 추가로 발산하라. 브리프에 없는 사실은 만들지 않는다. Human Truth, Desire, Barrier, Tension, Behavior, Cultural/Category/Brand Insight, Opportunity를 다양하게 섞어라. Human Input이 있으면 그것도 하나의 관점으로 활용하되 정답으로 취급하지 않는다.\n${JSON.stringify(body,null,2)}`,
    text:{format:{type:"json_schema",name:"more_insights",strict:true,schema:{type:"object",additionalProperties:false,properties:{insights:{type:"array",items:{type:"object",additionalProperties:false,properties:{id:{type:"string"},type:{type:"string"},title:{type:"string"},rationale:{type:"string"}},required:["id","type","title","rationale"]}}},required:["insights"]}}}
  });
  return NextResponse.json({ ...JSON.parse(response.output_text), mode:"live" });
}
