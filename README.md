# Creative OS v0.1

광고·마케팅 크리에이티브 기획을 `BRIEF → RESEARCH → INSIGHT → STRATEGY → IDEA → COPY → STORYBOARD → REVIEW` 순서로 진행하는 웹앱 프로토타입입니다.

## 현재 구현
- 8단계 Creative OS 내비게이션
- STEP 01 Brief 입력
- 브라우저 localStorage 자동 저장
- Brief AI 분석 API
- STEP 03 Insight Explorer 카드 선택
- OpenAI API 키가 없으면 Demo Mode로 작동
- 반응형 UI: macOS / Windows / 모바일 브라우저

## 실행
1. Node.js 20 이상 설치
2. 폴더에서 `npm install`
3. `npm run dev`
4. 브라우저에서 `http://localhost:3000`

## 실제 AI 연결
`.env.example`을 `.env.local`로 복사하고 OpenAI API 키를 입력합니다.

```bash
cp .env.example .env.local
```

```env
OPENAI_API_KEY=...
```

API 키는 브라우저 코드에 절대 넣지 않고 서버 Route Handler에서만 사용합니다.

## 다음 구현
1. Quick Research + 웹 검색 + 출처
2. Insight Mixer + Human Input 저장
3. Strategy Engine
4. Big Idea Engine
5. Copy Engine
6. Storyboard
7. Creative Review
8. Supabase Auth / Project DB
9. Vercel 배포
