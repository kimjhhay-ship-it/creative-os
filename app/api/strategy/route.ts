import OpenAI from "openai";
import { NextResponse } from "next/server";

const demoStrategies = [
  { id:"strategy-emotion", approach:"EMOTION", insight:"사람은 소중한 사람에게 선물하지만 자기 자신은 그 목록에서 자주 빠뜨린다.", pov:"'나를 위한 소비'를 정당화하지 말고, '소중한 사람에게 하는 선물'의 범위를 나까지 확장한다.", proposition:"가장 아끼는 사람들 가운데 나도 포함한다.", brandRole:"카카오는 타인에게 익숙했던 선물 행동을 나에게까지 자연스럽게 확장시키는 매개가 된다.", whyItWorks:"기존 선물하기의 자산을 버리지 않고 자기 선물이라는 새로운 행동을 같은 감정 문법 안에서 이해시킨다." },
  { id:"strategy-reframe", approach:"REFRAMING", insight:"자기 구매는 익숙하지만 '나에게 선물'이라는 이름은 새로운 의미를 만든다.", pov:"새 행동을 만들기보다 이미 존재하는 행동에 더 긍정적인 이름을 붙인다.", proposition:"내가 사는 것이 아니라, 나에게 선물한다.", brandRole:"브랜드가 자기 구매를 하나의 선물 문화로 재정의한다.", whyItWorks:"사용자가 새로운 습관을 배울 필요 없이 기존 행동의 의미만 전환하면 되기 때문에 진입장벽이 낮다." },
  { id:"strategy-tension", approach:"CONTRADICTION", insight:"남에게는 관대하지만 나에게 쓰는 돈에는 더 엄격한 기준을 적용한다.", pov:"자기 자신에게만 적용하는 이중 기준을 가볍게 드러내어 허락의 이유를 만든다.", proposition:"나에게도 선물할 이유는 충분하다.", brandRole:"브랜드가 망설임을 죄책감 없이 넘게 만드는 작은 허락 버튼이 된다.", whyItWorks:"소비를 부추기는 대신 이미 존재하는 심리적 모순을 보여주므로 공감과 행동 전환을 동시에 만들 수 있다." },
  { id:"strategy-behavior", approach:"BEHAVIOR", insight:"사고 싶은 것을 저장해두고 결제를 미루는 순간이 반복된다.", pov:"망설임이 발생하는 바로 그 순간을 '나에게 선물하기'라는 새로운 행동 트리거로 바꾼다.", proposition:"미루던 마음을 선물로 끝낸다.", brandRole:"브랜드 기능이 장바구니와 결제 사이의 감정적 장벽을 낮춘다.", whyItWorks:"구체적인 행동 장면을 기반으로 해 15초 영상과 UI 데모 모두로 확장하기 쉽다." }
];

export async function POST(req: Request) {
  const body = await req.json();
  if (!process.env.OPENAI_API_KEY) return NextResponse.json({ strategies: demoStrategies, mode:"demo" });
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const response = await client.responses.create({ model:"gpt-5.6-terra", input:`다음 Brief와 선택된 Insight Route를 기반으로 서로 다른 광고 전략 5개를 제안하라. 전략은 Creative Concept/Big Idea가 아니다. 각 카드에 INSIGHT, STRATEGIC POV, PROPOSITION, BRAND ROLE, WHY IT WORKS를 명확히 구분하고 Emotion, Reframing, Contradiction, Behavior, Logic, Culture, Brand Truth 등의 접근법을 다양화하라.\n${JSON.stringify(body,null,2)}`, text:{format:{type:"json_schema",name:"creative_strategies",strict:true,schema:{type:"object",additionalProperties:false,properties:{strategies:{type:"array",items:{type:"object",additionalProperties:false,properties:{id:{type:"string"},approach:{type:"string"},insight:{type:"string"},pov:{type:"string"},proposition:{type:"string"},brandRole:{type:"string"},whyItWorks:{type:"string"}},required:["id","approach","insight","pov","proposition","brandRole","whyItWorks"]}}},required:["strategies"]}}}});
  return NextResponse.json({ ...JSON.parse(response.output_text), mode:"live" });
}
