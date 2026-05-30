# 기획뷰어 PRD

## 1. Vision
ai_pm_editor 멀티에이전트 기획 시스템이 생성한 산출물(PRD·IA·화면명세·스프린트백로그·ERD·운영정책)을 프로젝트별로 열람하고, 산출물 간 연결 관계를 n8n 스타일 워크플로우 뷰로 시각화하는 내부 전용 Next.js 뷰어 앱이다. 기획자·개발자가 기획서를 즉시 확인하고 산출물 간 맥락을 파악할 수 있게 한다.

## 2. Problem
- 기획 산출물이 마크다운·CSV·JSON 등 여러 형식으로 분산되어 한눈에 파악하기 어렵다
- FR→SCR→TICKET 연결 관계가 텍스트로만 존재해 파급 범위를 직관적으로 이해하기 힘들다
- 팀원 공유 시 파일을 직접 전달해야 하므로 접근 통제가 없고 최신 버전 관리가 어렵다

## 3. User Stories
- As a PM, I want to browse all project artifacts in one place, so that I can quickly review planning outputs without switching files
- As a PM, I want to see how FR connects to SCR and TICKET, so that I can understand impact scope at a glance
- As a developer, I want to view Screen_Specs with rendered markdown, so that I can understand UI requirements clearly
- As a team member, I want to log in with Google, so that I can access the viewer without separate account creation
- As an admin, I want to control access by email whitelist, so that only authorized people can view internal planning docs
- As a PM, I want to see artifact status (exists/last modified), so that I can know which outputs are ready

## 4. 기능 요구사항
- FR-001: 프로젝트 목록 조회 — output/ 폴더 기반 프로젝트 목록을 왼쪽 사이드바에 표시, 현재 활성 프로젝트 강조
- FR-002: 산출물 탭 열람 — 프로젝트 선택 시 PRD·IA·화면명세·스프린트백로그·ERD·정책 6개 탭으로 산출물 열람
- FR-003: 마크다운 렌더링 — PRD·화면명세·ERD·정책 .md 파일을 HTML로 렌더링
- FR-004: CSV 테이블 뷰 — IA_Structure.csv를 컬럼 정렬·필터 가능한 테이블로 표시
- FR-005: JSON 뷰어 — Sprint_Backlog.json을 구조화된 카드 목록으로 표시 (priority·type·story_points 배지)
- FR-006: 산출물 상태 표시 — 각 탭에 파일 존재 여부·마지막 수정일 배지 표시
- FR-007: 워크플로우 뷰 — n8n 스타일 노드 플로우로 PRD→IA→화면명세→백로그→ERD 연결 시각화, framer-motion 애니메이션
- FR-008: 노드 상세 슬라이드 패널 — 워크플로우 노드 클릭 시 해당 산출물 상세를 우측 슬라이드 패널로 표시
- FR-009: FR-SCR-TICKET 연결선 — 워크플로우 뷰에서 FR-NNN → SCR-NNN → TICKET-NNN 파급 관계 연결선 표시
- FR-010: Google OAuth 로그인 — NextAuth.js 기반 구글 소셜 로그인
- FR-011: 이메일 화이트리스트 접근 제어 — ALLOWED_EMAILS(특정 계정 1개+)·ALLOWED_DOMAINS(도메인 2개) 환경변수로 접근 제어
- FR-012: 접근 거부 화면 — 미허용 계정 로그인 시 안내 페이지 표시 및 로그아웃 처리
- FR-013: 이용약관 동의 — 최초 로그인 시 이용약관·개인정보처리방침 확인 절차 (개인정보보호법 제15조 기반)
- FR-014: 개인정보처리방침 동의 — 개인정보처리방침 동의 이력 저장

## 5. 비기능 요구사항
- NFR-001: 로컬 파일시스템 읽기 전용 — fs 모듈 사용, 산출물 쓰기·삭제 작업 금지
- NFR-002: OUTPUT_BASE_PATH 환경변수 필수 — output/ 폴더 절대 경로 지정, 누락 시 앱 시작 거부
- NFR-003: ALLOWED_EMAILS·ALLOWED_DOMAINS 환경변수 누락 시 앱 시작 거부
- NFR-004: 로컬 전용 내부 도구 — 외부 배포 불필요, localhost 실행 기준
- NFR-005: 페이지 초기 로드 2초 이내 (로컬 fs 읽기 기준)
