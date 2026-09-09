import OpenAI from "openai";
import { NextResponse } from "next/server";

const demoRoutes = [
  { id:"route-emotion", lens:"EMOTION", title:"소중한 사람의 범위를 나까지 넓힌다", synthesis:"선물은 소중한 사람에게 하는 행동이라는 익숙한 진실에서 출발해, 그 대상에 나도 포함시킨다.", tension:"남에게는 쉽게 선물하면서 나에게는 이유를 따진다.", opportunity:"자기 구매를 '소비'가 아니라 '선물'로 재명명한다.", propositionSeed:"아끼는 사람들 중에 나도 있으니까." },
  { id:"route-reframe", lens:"REFRAMING", title:"내가 나에게 주는 것도 선물이다", synthesis:"이미 하고 있던 자기 구매 행동을 브랜드가 새로운 언어로 정의해 의미를 바꾼다.", tension:"행동은 익숙하지만 '나에게 선물'이라는 이름은 아직 새롭다.", opportunity:"브랜드가 새로운 소비 습관의 명명자가 된다.", propositionSeed:"사고 싶어서가 아니라, 주고 싶어서." },
  { id:"route-contradiction", lens:"CONTRADICTION", title:"왜 나에게만 선물의 기준이 더 엄격할까", synthesis:"타인에게 쓰는 관대함과 자신에게 적용하는 엄격함의 모순을 드러낸다.", tension:"나를 위한 선택에는 유독 더 많은 명분이 필요하다.", opportunity:"자기 허락의 순간을 브랜드가 가볍게 밀어준다.", propositionSeed:"나에게도 선물할 이유는 충분하다." },
  { id:"route-behavior", lens:"BEHAVIOR", title:"장바구니에 넣고 미루는 순간을 선물의 순간으로 바꾼다", synthesis:"구매를 망설이는 실제 행동 장면을 포착해 새로운 버튼과 행동으로 전환시킨다.", tension:"욕구는 분명하지만 결제 직전에는 죄책감과 망설임이 생긴다.", opportunity:"브랜드 기능이 감정적 허들을 낮추는 트리거가 된다.", propositionSeed:"망설이던 나에게, 선물하기." }
];

export async function POST(req: Request) {
  const body = await req.json();
  if (!process.env.OPENAI_API_KEY) return NextResponse.json({ routes: demoRoutes, mode:"demo" });
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const response = await client.responses.create({ model:"gpt-5.6-terra", input:`선택된 인사이트와 Human Input을 섞어 서로 다른 전략적 관점의 Insight Route 5개를 만들어라. 단순 요약이 아니라 Emotion, Contradiction, Behavior, Culture, Brand/Reframing 등 서로 다른 렌즈를 사용하라. 아직 광고 아이디어나 카피를 만들지 말라.\n${JSON.stringify(body,null,2)}`, text:{format:{type:"json_schema",name:"insight_routes",strict:true,schema:{type:"object",additionalProperties:false,properties:{routes:{type:"array",items:{type:"object",additionalProperties:false,properties:{id:{type:"string"},lens:{type:"string"},title:{type:"string"},synthesis:{type:"string"},tension:{type:"string"},opportunity:{type:"string"},propositionSeed:{type:"string"}},required:["id","lens","title","synthesis","tension","opportunity","propositionSeed"]}}},required:["routes"]}}}});
  return NextResponse.json({ ...JSON.parse(response.output_text), mode:"live" });
}
