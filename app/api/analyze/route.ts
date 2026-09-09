import OpenAI from "openai";
import { NextResponse } from "next/server";

const mock = {
  summary: "브리프의 핵심 목적, 타깃, 메시지와 제약조건을 구조화했습니다.",
  insights: [
    { id: "human-1", type: "Human Truth", title: "사람은 자신이 아끼는 대상에게 이유를 만들어 선물한다.", rationale: "보편적 감정에서 출발해 브랜드 메시지로 연결하기 쉽습니다." },
    { id: "tension-1", type: "Tension", title: "나를 위한 소비에는 이상하게 더 많은 명분이 필요하다.", rationale: "욕구와 행동 사이의 모순을 광고적 긴장으로 만들 수 있습니다." },
    { id: "behavior-1", type: "Behavior", title: "사고 싶은 것을 장바구니에 넣고 결제를 미루는 행동은 흔하다.", rationale: "실제 행동 장면으로 시각화하기 좋습니다." },
    { id: "brand-1", type: "Brand Truth", title: "브랜드가 기존 행동을 새로운 이름으로 다시 정의할 수 있다.", rationale: "기능 설명을 넘어 브랜드의 역할을 만들 수 있습니다." },
    { id: "opportunity-1", type: "Opportunity", title: "익숙한 행동을 다른 관점으로 부르면 새로운 선택 이유가 생긴다.", rationale: "리프레이밍 전략으로 확장하기 좋습니다." },
    { id: "consumer-1", type: "Consumer Insight", title: "사람들은 작은 보상도 '받을 자격'이 있다고 느껴질 때 더 쉽게 실행한다.", rationale: "셀프 리워드와 허락의 감정을 동시에 건드립니다." }
  ]
};

export async function POST(req: Request) {
  const brief = await req.json();

  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json({ ...mock, mode: "demo" });
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const prompt = `당신은 광고 마케팅 크리에이티브 전략가다. 아래 브리프를 분석하라.\n\n${JSON.stringify(brief, null, 2)}\n\n목표: AI가 정답을 하나 고르는 것이 아니라 사용자가 좁혀갈 수 있도록 다양한 관점을 충분히 발산한다. Consumer Insight, Human Truth, Desire, Barrier, Tension, Behavior, Category Insight, Cultural Insight, Brand Truth, Opportunity를 균형 있게 생성하라. 각 항목은 짧은 title과 왜 유효한지 rationale을 가진다. 최소 12개 이상 제안하라.`;

  const response = await client.responses.create({
    model: "gpt-5.6-terra",
    input: prompt,
    text: {
      format: {
        type: "json_schema",
        name: "creative_brief_analysis",
        strict: true,
        schema: {
          type: "object",
          additionalProperties: false,
          properties: {
            summary: { type: "string" },
            insights: {
              type: "array",
              items: {
                type: "object",
                additionalProperties: false,
                properties: {
                  id: { type: "string" },
                  type: { type: "string" },
                  title: { type: "string" },
                  rationale: { type: "string" }
                },
                required: ["id", "type", "title", "rationale"]
              }
            }
          },
          required: ["summary", "insights"]
        }
      }
    }
  });

  const parsed = JSON.parse(response.output_text);
  return NextResponse.json({ ...parsed, mode: "live" });
}
