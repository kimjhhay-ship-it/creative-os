import OpenAI from "openai";
import { NextResponse } from "next/server";

const fields = ["brand","product","objective","target","message","media","duration","mandatory","avoid","tone","references","notes"];

function demoFromText(text: string, filename: string) {
  const clean = text.replace(/\r/g, "").slice(0, 12000);
  const pick = (keys: string[]) => {
    for (const key of keys) {
      const re = new RegExp(`(?:^|\\n)\\s*${key}\\s*[:：-]\\s*(.+)`, "i");
      const m = clean.match(re); if (m?.[1]) return m[1].trim();
    }
    return "";
  };
  const brief = {
    brand: pick(["brand","브랜드","광고주"]), product: pick(["product","service","제품","서비스"]),
    objective: pick(["objective","목적","캠페인 목적"]), target: pick(["target","타깃","타겟"]),
    message: pick(["key message","message","핵심 메시지","메시지"]), media: pick(["media","매체"]),
    duration: pick(["duration","format","길이","포맷"]) || "15초", mandatory: pick(["mandatory","필수","필수 포함 요소"]),
    avoid: pick(["avoid","주의","금지"]), tone: pick(["tone","tone & manner","톤앤매너","톤앤매너"]),
    references: pick(["reference","references","레퍼런스","참고"]), notes: clean ? `업로드 파일 ${filename} 원문 요약용 텍스트가 로드되었습니다.\n${clean.slice(0,900)}` : ""
  };
  const missingFields = fields.filter(k => !brief[k as keyof typeof brief]);
  return { brief, summary: clean ? "Demo Mode에서는 TXT/MD의 명시적 라벨을 현재 브리프 양식에 매핑했습니다. API 연결 시 문서 전체 의미를 AI가 읽고 같은 양식을 자동으로 채웁니다." : "파일 업로드 UI는 정상입니다. 실제 문서 의미 분석은 API Key 연결 후 활성화됩니다.", missingFields };
}

export async function POST(req: Request) {
  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error:"파일이 없습니다." }, { status:400 });
  if (file.size > 20 * 1024 * 1024) return NextResponse.json({ error:"v0.2에서는 20MB 이하 파일을 사용해주세요." }, { status:400 });

  if (!process.env.OPENAI_API_KEY) {
    const ext = file.name.toLowerCase().split(".").pop();
    const text = ext === "txt" || ext === "md" ? await file.text() : "";
    if (ext !== "txt" && ext !== "md") {
      return NextResponse.json({ error:"PDF/DOCX/PPTX의 AI 문서 분석에는 OPENAI_API_KEY 연결이 필요합니다. TXT/MD는 Demo Mode에서도 라벨 기반 자동 입력을 테스트할 수 있습니다." }, { status:503 });
    }
    return NextResponse.json({ ...demoFromText(text, file.name), filename:file.name, mode:"demo" });
  }

  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  let uploadedId = "";
  try {
    const uploaded = await client.files.create({ file, purpose:"user_data", expires_after:{ anchor:"created_at", seconds:86400 } });
    uploadedId = uploaded.id;
    const response = await client.responses.create({
      model:"gpt-5.6-terra",
      input:[{ role:"user", content:[
        { type:"input_text", text:"이 파일은 광고주에게 받은 브리프, 내부 기획서 또는 회의록이다. 문서 전체를 읽고 광고 크리에이티브 기획에 필요한 정보를 추출해 정규화하라. 문서에 없는 내용은 추측하지 말고 빈 문자열로 둔다. 회의 중 나온 의견과 확정사항이 섞여 있으면 확정/필수사항을 우선한다. notes에는 모호한 점, 충돌하는 지시, 추가 확인이 필요한 내용을 간결히 남긴다." },
        { type:"input_file", file_id: uploaded.id }
      ] }],
      text:{format:{type:"json_schema",name:"brief_file_extract",strict:true,schema:{type:"object",additionalProperties:false,properties:{
        brief:{type:"object",additionalProperties:false,properties:{brand:{type:"string"},product:{type:"string"},objective:{type:"string"},target:{type:"string"},message:{type:"string"},media:{type:"string"},duration:{type:"string"},mandatory:{type:"string"},avoid:{type:"string"},tone:{type:"string"},references:{type:"string"},notes:{type:"string"}},required:fields},
        summary:{type:"string"},missingFields:{type:"array",items:{type:"string"}}
      },required:["brief","summary","missingFields"]}}}
    });
    return NextResponse.json({ ...JSON.parse(response.output_text), filename:file.name, mode:"live" });
  } catch (e) {
    return NextResponse.json({ error:e instanceof Error ? e.message : "문서 분석 중 오류가 발생했습니다." }, { status:500 });
  } finally {
    if (uploadedId) { try { await client.files.delete(uploadedId); } catch { /* expires automatically */ } }
  }
}
