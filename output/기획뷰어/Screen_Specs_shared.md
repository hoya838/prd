# Screen_Specs — 기획뷰어 / shared

## [SCR-SH-001] 로그인

### 목적
허용된 Google 계정만 뷰어에 접근하도록 OAuth 인증 진입점 제공

### 주요 컴포넌트
- LoginCard: 로그인 카드 레이아웃 (props: appName: string, logoUrl: string)
- GoogleSignInButton: Google OAuth 로그인 버튼 (props: onSignIn: () => void, isLoading: boolean)
- AppLogo: 서비스 로고 표시 (props: src: string, alt: string)

### 인터랙션
- Google 로그인 버튼 클릭 → Google OAuth 팝업 오픈
- OAuth 완료 → 이메일 화이트리스트 검증 → 통과 시 최초 로그인이면 SCR-SH-003, 아니면 SCR-U-001로 리다이렉트
- OAuth 완료 → 화이트리스트 실패 → SCR-SH-002로 리다이렉트
- onSignIn: Google OAuth 플로우 시작

### 파생 모달
없음

### UX 카피
- 페이지 타이틀: `기획뷰어`
- CTA 버튼: `Google로 로그인`
- 부제목: `허용된 계정만 접근 가능합니다`
- 로딩 중: `인증 중...`
- 주요 에러 메시지:
  - 팝업 차단: `팝업이 차단되었습니다. 팝업 허용 후 다시 시도해주세요`

### 알림 트리거
없음

### 에러 케이스
- 팝업 차단: 팝업 허용 안내 토스트 표시
- OAuth 서버 오류: "로그인에 실패했습니다. 다시 시도해주세요" 표시

**Tailwind 레이아웃 힌트:** `flex flex-col items-center justify-center min-h-screen bg-gray-50`

---

## [SCR-SH-002] 접근 거부

### 목적
화이트리스트에 없는 계정으로 로그인 시도 시 접근 불가를 명확히 안내하고 로그아웃 처리

### 주요 컴포넌트
- AccessDeniedCard: 접근 거부 안내 카드 (props: userEmail: string)
- SignOutButton: 로그아웃 버튼 (props: onSignOut: () => void)
- ContactInfo: 문의 안내 텍스트 (props: contactEmail: string)

### 인터랙션
- 페이지 진입 시 자동으로 세션 무효화
- 로그아웃 버튼 클릭 → SCR-SH-001로 리다이렉트
- onSignOut: 세션 삭제 후 로그인 페이지 이동

### 파생 모달
없음

### UX 카피
- 페이지 타이틀: `접근 권한 없음`
- 본문: `{userEmail}은 접근이 허용되지 않은 계정입니다`
- CTA 버튼: `다른 계정으로 로그인`
- 안내: `접근 권한이 필요하다면 관리자에게 문의해주세요`
- 주요 에러 메시지:
  - 없음

### 알림 트리거
없음

### 에러 케이스
- 로그아웃 실패: 강제 새로고침 후 재시도

**Tailwind 레이아웃 힌트:** `flex flex-col items-center justify-center min-h-screen gap-4`

---

## [SCR-SH-003] 이용약관 동의

### 목적
최초 로그인 사용자의 이용약관·개인정보처리방침 동의를 받고 이력을 저장 (개인정보보호법 제15조)

### 주요 컴포넌트
- ConsentCard: 동의 카드 전체 레이아웃 (props: userName: string)
- ConsentItem: 개별 동의 항목 (props: label: string, required: boolean, checked: boolean, onChange: (v: boolean) => void)
- ConsentDocument: 약관 본문 스크롤 영역 (props: title: string, content: string)
- AgreeAllCheckbox: 전체 동의 체크박스 (props: checked: boolean, onChange: (v: boolean) => void)
- SubmitButton: 동의 완료 버튼 (props: disabled: boolean, onSubmit: () => void)

### 인터랙션
- 필수 항목 미체크 시 SubmitButton disabled
- 전체 동의 체크 → 모든 항목 자동 체크
- 동의 완료 → ConsentLog 저장 → SCR-U-001로 리다이렉트
- onSubmit: 동의 이력 API 호출 후 리다이렉트

### 파생 모달
- ConsentDocModal: "내용 보기" 클릭 — 약관 전문 표시
  - 주요 액션: `확인` / 닫기(X)

### UX 카피
- 페이지 타이틀: `서비스 이용 동의`
- 부제목: `기획뷰어 이용을 위해 아래 항목에 동의해주세요`
- 전체 동의 레이블: `전체 동의`
- 필수 항목 1: `[필수] 이용약관 동의`
- 필수 항목 2: `[필수] 개인정보처리방침 동의`
- CTA 버튼: `동의하고 시작하기`
- 성공 메시지: `동의가 완료되었습니다`
- 주요 에러 메시지:
  - 필수 미동의: `필수 항목에 모두 동의해야 합니다`

### 알림 트리거
없음

### 에러 케이스
- 동의 저장 실패: "저장에 실패했습니다. 다시 시도해주세요" 토스트 표시

**Tailwind 레이아웃 힌트:** `flex flex-col max-w-lg mx-auto py-8 gap-6`
