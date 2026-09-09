import OpenAI from "openai";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  if (!process.env.OPENAI_API_KEY) {
    const t = Date.now();
    return NextResponse.json({ mode: "demo", insights: [
      { id:`desire-${t}`, type:"Desire", title:"사람은 소비보다 '나를 챙겼다'는 감정을 사고 싶어 한다.", rationale:"물건의 효용보다 자기 돌봄의 의미를 키울 수 있습니다." },
      { id:`barrier-${t}`, type:"Barrier", title:"자기 자신에게 선물한다는 말은 아직 약간의 어색함을 동반한다.", rationale:"바로 그 어색함이 새로운 행동을 정의할 기회가 됩니다." },
      { id:`culture-${t}`, type:"Cultural Insight", title:"셀프케어는 사치보다 관리와 회복의 언어로 이동하고 있다.", rationale:"개인 보상 행동을 사회적으로 자연스러운 맥락에 놓을 수 있습니다." }
    ]});
  }
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const response = await client.responses.create({ model:"gpt-5.6-terra", input:`다음 광고 브리프와 이미 생성한 인사이트를 보고 겹치지 않는 새로운 인사이트 6개를 발산하라. Human Truth, Desire, Barrier, Tension, Behavior, Cultural/Category/Brand Insight를 다양하게 섞어라.\n${JSON.stringify(body,null,2)}`, text:{format:{type:"json_schema",name:"more_insights",strict:true,schema:{type:"object",additionalProperties:false,properties:{insights:{type:"array",items:{type:"object",additionalProperties:false,properties:{id:{type:"string"},type:{type:"string"},title:{type:"string"},rationale:{type:"string"}},required:["id","type","title","rationale"]}}},required:["insights"]}}}});
  return NextResponse.json({ ...JSON.parse(response.output_text), mode:"live" });
}
