# 기획뷰어 운영 정책

## 접근 제어
- 허용 계정: ALLOWED_EMAILS 환경변수에 명시된 이메일 (특정 구글 계정 포함)
- 허용 도메인: ALLOWED_DOMAINS 환경변수에 명시된 회사 도메인 2개
- 위 조건 외 모든 계정 → 접근 거부 화면 표시 후 로그아웃

## 데이터
- 열람 전용 — 산출물 파일 수정·삭제 불가
- OUTPUT_BASE_PATH 환경변수로 지정된 output/ 폴더 외 파일시스템 접근 금지

## 법적 동의 (대한민국)
- 필수: 이용약관, 개인정보처리방침
- 최초 로그인 시 동의 절차 진행 후 이력 저장
- 선택: 없음 (내부 도구, 마케팅 수신 없음)

## 환경 변수 목록
- OUTPUT_BASE_PATH: output/ 폴더 절대 경로
- ALLOWED_EMAILS: 허용 이메일 목록 (콤마 구분)
- ALLOWED_DOMAINS: 허용 도메인 목록 (콤마 구분)
- NEXTAUTH_SECRET: NextAuth 세션 암호화 키
- GOOGLE_CLIENT_ID: GCP OAuth 클라이언트 ID
- GOOGLE_CLIENT_SECRET: GCP OAuth 클라이언트 시크릿

## 운영
- 로컬 전용 — 외부 배포 환경 미지원
- Google OAuth Client ID·Secret: GCP Console에서 발급 필요
