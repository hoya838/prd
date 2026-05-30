# Screen_Specs — 기획뷰어 / user

## [SCR-U-001] 프로젝트 목록

### 목적
output/ 폴더의 전체 프로젝트를 사이드바에 나열하고 선택된 프로젝트의 산출물 탭을 메인 영역에 표시

### 주요 컴포넌트
- AppShell: 전체 레이아웃 래퍼 (props: children: ReactNode)
- ProjectSidebar: 왼쪽 프로젝트 목록 사이드바 (props: projects: Project[], activeProject: string, onSelect: (name: string) => void)
- ProjectListItem: 개별 프로젝트 항목 (props: name: string, isActive: boolean, artifactCount: number)
- ArtifactTabBar: 산출물 탭 바 (props: tabs: Tab[], activeTab: string, onTabChange: (tab: string) => void)
- ArtifactStatusBadge: 파일 상태 배지 (props: exists: boolean, lastModified: string)
- UserMenu: 우상단 사용자 메뉴 (props: userName: string, email: string, onSignOut: () => void)

### 인터랙션
- 사이드바 프로젝트 클릭 → 해당 프로젝트 산출물 탭 영역 로드
- 탭 클릭 → 해당 산출물 뷰 전환
- onSelect: 프로젝트 선택 및 URL 파라미터 갱신
- onTabChange: 탭 전환

### 파생 모달
없음

### UX 카피
- 페이지 타이틀: `기획뷰어`
- 사이드바 헤더: `프로젝트`
- 빈 상태(Empty State): `output/ 폴더에 프로젝트가 없습니다`
- 활성 프로젝트 배지: `활성`
- 주요 에러 메시지:
  - 폴더 읽기 실패: `프로젝트 목록을 불러올 수 없습니다. OUTPUT_BASE_PATH를 확인해주세요`

### 알림 트리거
없음

### 에러 케이스
- OUTPUT_BASE_PATH 미설정: 설정 안내 페이지 표시
- 폴더 접근 권한 없음: 에러 메시지 + 경로 표시

**Tailwind 레이아웃 힌트:** `flex h-screen overflow-hidden`

---

## [SCR-U-002] PRD 뷰

### 목적
선택된 프로젝트의 PRD.md를 렌더링된 마크다운으로 열람

### 주요 컴포넌트
- MarkdownRenderer: 마크다운 → HTML 렌더링 (props: content: string)
- ArtifactStatusBadge: 파일 상태 배지 (props: exists: boolean, lastModified: string)
- EmptyArtifact: 파일 미존재 안내 (props: artifactName: string)

### 인터랙션
- 탭 진입 시 PRD.md 서버에서 읽어 렌더링
- 파일 없으면 EmptyArtifact 표시

### 파생 모달
없음

### UX 카피
- 탭 레이블: `PRD`
- 빈 상태(Empty State): `PRD.md가 아직 생성되지 않았습니다`
- 성공 메시지: 없음 (바로 렌더링)
- 주요 에러 메시지:
  - 파일 읽기 오류: `PRD.md를 읽는 중 오류가 발생했습니다`

### 알림 트리거
없음

### 에러 케이스
- 파일 읽기 실패: 에러 메시지 + 재시도 버튼

**Tailwind 레이아웃 힌트:** `prose max-w-none p-6 overflow-y-auto`

---

## [SCR-U-003] IA 뷰

### 목적
IA_Structure.csv를 정렬·필터 가능한 테이블로 표시

### 주요 컴포넌트
- CsvTable: CSV 데이터 테이블 (props: rows: Row[], columns: Column[])
- ColumnFilter: 컬럼별 필터 입력 (props: column: string, value: string, onChange: (v: string) => void)
- RoleBadge: role 배지 (props: role: string)
- AuthBadge: auth_required 배지 (props: required: boolean)

### 인터랙션
- 컬럼 헤더 클릭 → 정렬
- 필터 입력 → 실시간 필터링
- role 배지 클릭 → 해당 role 필터 적용

### 파생 모달
없음

### UX 카피
- 탭 레이블: `IA`
- 빈 상태(Empty State): `IA_Structure.csv가 아직 생성되지 않았습니다`
- 필터 플레이스홀더: `화면명 검색...`
- 주요 에러 메시지:
  - 파싱 오류: `CSV 파일을 파싱하는 중 오류가 발생했습니다`

### 알림 트리거
없음

### 에러 케이스
- CSV 파싱 실패: 원본 텍스트 폴백 표시

**Tailwind 레이아웃 힌트:** `flex flex-col gap-4 p-6 overflow-auto`

---

## [SCR-U-004] 화면명세 뷰

### 목적
Screen_Specs_[role].md 파일들을 role 탭으로 구분해 렌더링된 마크다운으로 열람

### 주요 컴포넌트
- RoleTabBar: role별 서브 탭 (props: roles: string[], activeRole: string, onRoleChange: (role: string) => void)
- MarkdownRenderer: 마크다운 → HTML 렌더링 (props: content: string)
- EmptyArtifact: 파일 미존재 안내 (props: artifactName: string)

### 인터랙션
- role 탭 클릭 → 해당 Screen_Specs_[role].md 로드 및 렌더링
- 탭은 실제 존재하는 파일 기반으로 동적 생성

### 파생 모달
없음

### UX 카피
- 탭 레이블: `화면명세`
- role 탭 레이블: `user` / `admin` / `shared` (존재하는 파일 기준)
- 빈 상태(Empty State): `화면명세가 아직 생성되지 않았습니다`
- 주요 에러 메시지:
  - 파일 읽기 오류: `화면명세를 읽는 중 오류가 발생했습니다`

### 알림 트리거
없음

### 에러 케이스
- 특정 role 파일 없음: 해당 탭 비활성화

**Tailwind 레이아웃 힌트:** `flex flex-col gap-2 p-6 overflow-y-auto`

---

## [SCR-U-005] 스프린트백로그 뷰

### 목적
Sprint_Backlog.json을 우선순위·타입별 카드 목록으로 표시

### 주요 컴포넌트
- TicketCard: 티켓 카드 (props: ticket: Ticket)
- PriorityBadge: 우선순위 배지 (props: priority: "P1"|"P2"|"P3")
- TypeBadge: 티켓 타입 배지 (props: type: "feature"|"notification"|"legal"|"policy")
- StoryPointBadge: 스토리 포인트 배지 (props: points: number)
- TicketFilter: 필터 바 (props: filters: Filter[], onChange: (filters: Filter[]) => void)

### 인터랙션
- 필터 바에서 priority·type·status 필터 적용
- deprecated 티켓은 흐리게 표시
- onFilter: 필터 상태 변경

### 파생 모달
- TicketDetailModal: 티켓 카드 클릭 — 수락 기준 전체 표시
  - 주요 액션: 닫기(X)

### UX 카피
- 탭 레이블: `스프린트백로그`
- 빈 상태(Empty State): `Sprint_Backlog.json이 아직 생성되지 않았습니다`
- deprecated 배지: `DEPRECATED`
- 주요 에러 메시지:
  - 파싱 오류: `백로그 파일을 읽는 중 오류가 발생했습니다`

### 알림 트리거
없음

### 에러 케이스
- JSON 파싱 실패: 원본 텍스트 폴백 표시

**Tailwind 레이아웃 힌트:** `grid grid-cols-1 md:grid-cols-2 gap-4 p-6`

---

## [SCR-U-006] ERD 뷰

### 목적
ERD.md를 렌더링하고 Mermaid erDiagram 블록을 인터랙티브 다이어그램으로 표시

### 주요 컴포넌트
- MarkdownRenderer: 마크다운 렌더링 (props: content: string)
- MermaidDiagram: Mermaid erDiagram 렌더링 (props: code: string)
- EmptyArtifact: 파일 미존재 안내 (props: artifactName: string)

### 인터랙션
- Mermaid 블록 자동 감지 → 다이어그램으로 렌더링
- 다이어그램 줌/패닝 지원

### 파생 모달
없음

### UX 카피
- 탭 레이블: `ERD`
- 빈 상태(Empty State): `ERD.md가 아직 생성되지 않았습니다`
- 주요 에러 메시지:
  - Mermaid 파싱 오류: `다이어그램을 렌더링할 수 없습니다`

### 알림 트리거
없음

### 에러 케이스
- Mermaid 파싱 실패: 코드블록 원문 폴백 표시

**Tailwind 레이아웃 힌트:** `flex flex-col gap-6 p-6 overflow-y-auto`

---

## [SCR-U-007] 정책 뷰

### 목적
Policy.md를 렌더링된 마크다운으로 열람

### 주요 컴포넌트
- MarkdownRenderer: 마크다운 렌더링 (props: content: string)
- EmptyArtifact: 파일 미존재 안내 (props: artifactName: string)

### 인터랙션
- 탭 진입 시 Policy.md 서버에서 읽어 렌더링

### 파생 모달
없음

### UX 카피
- 탭 레이블: `정책`
- 빈 상태(Empty State): `Policy.md가 아직 생성되지 않았습니다`
- 주요 에러 메시지:
  - 파일 읽기 오류: `정책 파일을 읽는 중 오류가 발생했습니다`

### 알림 트리거
없음

### 에러 케이스
- 파일 읽기 실패: 에러 메시지 + 재시도 버튼

**Tailwind 레이아웃 힌트:** `prose max-w-none p-6 overflow-y-auto`

---

## [SCR-U-008] 워크플로우 뷰

### 목적
PRD→IA→화면명세→백로그→ERD 산출물 간 연결 관계를 n8n 스타일 노드 플로우로 시각화하고 FR-SCR-TICKET 파급 관계 탐색

### 주요 컴포넌트
- WorkflowCanvas: 노드 플로우 캔버스 (props: nodes: WorkflowNode[], edges: Edge[])
- ArtifactNode: 산출물 노드 블록 (props: name: string, status: "ready"|"missing", itemCount: number, onClick: () => void)
- ConnectionEdge: 노드 간 연결선 (props: from: string, to: string, animated: boolean)
- SlidePanel: 노드 클릭 시 상세 슬라이드 패널 (props: isOpen: boolean, content: ReactNode, onClose: () => void)
- RelationBadge: FR-SCR-TICKET 연결 표시 배지 (props: frId: string, scrId: string, ticketId: string)

### 인터랙션
- 노드 클릭 → 우측 SlidePanel 오픈 with 해당 산출물 요약
- 연결선 hover → 파급 관계 하이라이트 (FR→SCR→TICKET)
- framer-motion으로 노드 진입 애니메이션·연결선 흐름 표시
- onClose: 슬라이드 패널 닫기

### 파생 모달
없음

### UX 카피
- 탭 레이블: `워크플로우`
- 노드 상태 — 준비: `✓ [N]개 항목`
- 노드 상태 — 미생성: `미생성`
- 빈 상태(Empty State): `산출물이 없습니다. /기획으로 시작하세요`
- 주요 에러 메시지:
  - 데이터 로드 오류: `워크플로우 데이터를 불러올 수 없습니다`

### 알림 트리거
없음

### 에러 케이스
- 산출물 파일 전체 없음: 빈 캔버스 + 안내 텍스트

**Tailwind 레이아웃 힌트:** `relative w-full h-full overflow-hidden bg-gray-50`
