# Creative OS v0.2

광고·마케팅 크리에이티브 기획을 `BRIEF → RESEARCH → INSIGHT → STRATEGY → IDEA → COPY → STORYBOARD → REVIEW` 순서로 진행하는 웹앱 프로토타입입니다.

## v0.2에서 추가된 기능
- 광고주 브리프 / 회의록 파일 업로드: PDF, DOCX, PPTX, TXT, MD
- OpenAI API 연결 시 업로드 문서를 읽고 Brief 필드 자동 구조화
- Demo Mode에서 TXT/MD의 라벨 기반 기본 추출
- Human Input 실제 저장
- `+ GENERATE MORE` 작동
- `MIX SELECTED INSIGHTS` → Insight Mixer 작동
- Insight Route 선택
- STEP 04 Strategy Engine 생성/선택
- localStorage v0.2 자동 저장
- Next.js 15.5.24 적용

## 실제 AI 연결
Vercel Project Settings → Environment Variables에 `OPENAI_API_KEY`를 추가하세요. 키는 GitHub 코드에 넣지 마세요.

API Key가 없으면 Demo Mode로 작동합니다. PDF/DOCX/PPTX의 실제 의미 분석은 API Key 연결 후 활성화됩니다.

## 다음 구현
1. STEP 02 Quick Research + 웹 검색 + 출처 선택
2. STEP 05 Big Idea Engine
3. STEP 06 Copy Engine
4. STEP 07 Storyboard
5. STEP 08 Creative Review
6. Supabase Project DB / Auth / Reference DB
