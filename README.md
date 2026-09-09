# Creative OS v0.3

광고·마케팅 크리에이티브 기획을 **BRIEF → RESEARCH → INSIGHT → STRATEGY → IDEA → COPY → STORYBOARD → REVIEW** 순서로 진행하는 웹앱 프로토타입입니다.

## v0.3 핵심 변경

1. **파일 브리프 → AI 분석 → 양식 자동 입력**
   - PDF, DOCX, PPTX, TXT, MD 업로드
   - OpenAI API 연결 시 문서 전체를 읽고 BRAND / PRODUCT / OBJECTIVE / TARGET / KEY MESSAGE / MEDIA / DURATION / MANDATORY / AVOID / TONE / REFERENCE / NOTES로 구조화
   - 자동 입력 후 사람이 직접 수정 가능
   - API Key가 없는 Demo Mode에서는 TXT/MD 라벨 기반 자동 입력만 테스트 가능

2. **수기 Brief 입력 유지**
   - 파일 없이 모든 항목을 직접 작성 가능
   - 파일 자동 입력 후 수정하면 `FILE + HUMAN EDIT`로 표시

3. **Insight Explorer를 STEP 01 Brief에 종속**
   - `ANALYZE THIS BRIEF` 실행 시 현재 폼의 전체 입력값을 API에 전달
   - 실제 AI 모드에서는 브리프에 없는 사실을 만들지 않고 최소 12개 관점을 발산
   - Demo Mode도 고정 샘플 대신 현재 입력한 브랜드/제품/타깃/메시지/매체를 반영
   - Brief를 수정하면 기존 Insight/Route/Strategy 결과를 초기화해 오래된 분석 결과가 남지 않도록 처리

4. v0.2 기능 유지
   - Human Input
   - Generate More
   - Insight Mixer
   - Insight Route 선택
   - STEP 04 Strategy Engine
   - localStorage 자동 저장
   - Next.js 15.5.24

## 실제 AI 연결

Vercel Project Settings → Environment Variables에 `OPENAI_API_KEY`를 추가하세요. API Key는 GitHub 코드에 넣지 마세요.
