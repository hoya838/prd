# Screen_Specs — 브랜드 전용 인생네컷

## SCR-001 홈

**컴포넌트 트리**
```
HomePage
├── BrandHeader (logo: string, brandColor: string)
├── HeroSection (tagline: string)
└── ModeSelector
    ├── ModeCard (mode: "frame" | "ai", title: string, description: string, thumbnail: string, onClick: () => void)
    └── ModeCard
```

**Props**
- `BrandHeader.logo`: string (브랜드 로고 URL)
- `BrandHeader.brandColor`: string (hex, 헤더·배경 포인트 컬러)
- `ModeCard.mode`: "frame" | "ai"
- `ModeCard.onClick`: () => void → 해당 방식 진입 플로우로 이동

**레이아웃**
- `flex flex-col items-center min-h-screen` 전체 컨테이너
- ModeSelector: `grid grid-cols-1 gap-4 w-full max-w-sm px-6`
- 모바일(375px) 기준 단일 컬럼, ModeCard 높이 160px

**에러 상태**
- 브랜드 설정 미완료(로고 없음): 기본 플레이스홀더 로고 표시, 서비스 정상 진행
- 네트워크 오류로 브랜드 설정 로딩 실패: 전체 에러 화면(SCR-021)으로 이동

**접근성**
- ModeCard: `role="button"` + `aria-label="프레임으로 만들기"` / `aria-label="AI로 만들기"`
- BrandHeader logo: `alt="[브랜드명] 로고"`
- 포인트 컬러 대비율 4.5:1 이상 보장 필수

---

## SCR-002 프레임으로 만들기 (레이아웃 선택)

**컴포넌트 트리**
```
LayoutSelectPage
├── BrandHeader (logo: string)
├── PageTitle ("몇 컷으로 만들까요?")
├── LayoutOptionGroup
│   ├── LayoutOptionCard
│   │   (layout: "3-cut", label: "3컷", previewImage: string,
│   │    description: "사진 3장", isSelected: boolean, onClick: () => void)
│   └── LayoutOptionCard
│       (layout: "4-cut", label: "4컷", previewImage: string,
│        description: "사진 4장", isSelected: boolean, onClick: () => void)
├── InstructionRow ("8장을 찍고 마음에 드는 사진을 골라요")
├── StartButton (label: "촬영 시작하기", disabled: !selectedLayout, onClick: () => void)
└── BackButton (onClick: () => void)
```

**Props**
- `LayoutOptionCard.previewImage`: 3컷/4컷 레이아웃 프레임 썸네일 예시 이미지
- `StartButton.disabled`: 레이아웃 미선택 시 비활성
- 선택된 카드: `ring-2 ring-brand-primary scale-105` 강조

**레이아웃**
- `flex flex-col items-center gap-6 px-6 py-8`
- LayoutOptionGroup: `flex gap-4 w-full justify-center`
- LayoutOptionCard: `w-36 flex flex-col items-center gap-2 p-4 rounded-2xl border-2`

**에러 상태**
- 카메라 권한 거부 (StartButton 탭 시): "카메라 접근을 허용해야 촬영할 수 있어요" 모달 + 설정 열기 버튼
- 카메라 없는 기기: "카메라를 사용할 수 없는 기기예요" 안내

**접근성**
- LayoutOptionCard: `role="radio"` + `aria-checked={isSelected}` + `aria-label="3컷 레이아웃 선택"`

---

## SCR-003 카메라 촬영 (8장)

**컴포넌트 트리**
```
CameraShootPage
├── CameraViewfinder (stream: MediaStream, facingMode: "user" | "environment")
├── ShotCounter (current: 1-8, total: 8) ["3 / 8"]
├── TimerDisplay (mode: "auto" | "manual", secondsLeft: number)
│   ├── AutoMode: 8초 카운트다운 바 + 숫자 ["자동 8초"]
│   └── ManualMode: 1분 카운트다운 바 + 숫자 ["60초 내 직접 찍기"]
├── ShootButton (label: "찍기", onClick: () => void) [수동 모드에서만 탭 가능]
├── ModeToggle (mode: "auto" | "manual", onToggle: () => void)
│   ["자동" | "수동" 전환 버튼]
├── CameraFlipButton (onClick: () => void)
└── ThumbnailStrip (shots: string[], total: 8)
    └── ShotThumbnail (imageUrl: string | null, index: 0-7) × 8
```

**촬영 동작 규칙**
| 모드 | 촬영 트리거 | 타이머 |
|---|---|---|
| 자동 (기본) | 8초 경과 시 자동 촬영 | 컷마다 8초 카운트다운 |
| 수동 | ShootButton 탭 시 즉시 촬영 | 1분 내 탭 없으면 자동 촬영 |

- 모드는 촬영 중 언제든 전환 가능 (전환 즉시 해당 컷의 타이머 리셋)
- 8장 촬영 완료 시 자동으로 SCR-004로 이동

**Props**
- `TimerDisplay.secondsLeft`: 자동 모드 8→0, 수동 모드 60→0
- `ThumbnailStrip`: 찍힌 컷 썸네일, 미촬영 컷 회색 빈 슬롯 (8개)

**레이아웃**
- CameraViewfinder: 전체 화면 (`position: fixed, inset: 0`)
- ShotCounter: 상단 중앙 오버레이
- TimerDisplay: 뷰파인더 하단 1/4 영역, 반투명 바 + 카운트다운
- ShootButton: 하단 중앙 `w-20 h-20 rounded-full bg-white border-4 border-brand-primary`
- ModeToggle: ShootButton 우측 `absolute bottom-8 right-8`
- ThumbnailStrip: 하단 ShootButton 좌측 `flex gap-1`

**Micro-interaction**
- 촬영 순간: 화면 전체 흰색 플래시 (100ms)
- 타이머 바: 남은 시간 비례로 줄어드는 progress bar (brand-primary 컬러)
- 카운트 3초 이하: 타이머 텍스트 빨간색으로 변환
- 수동 모드 30초 이하: 타이머 바 노란색으로 전환 + 진동(haptic)

**에러 상태**
- 카메라 스트림 중단: "카메라 연결이 끊겼어요" 토스트 + 타이머 일시 정지 + 재연결 시도
- 촬영 저장 실패: 해당 컷 재시도 (ShotCounter 유지)

**접근성**
- ShootButton: `aria-label="{current}번째 사진 찍기"`
- TimerDisplay: `role="timer"` + `aria-live="assertive"` + `aria-label="촬영까지 {n}초"`
- ModeToggle: `aria-pressed={mode === "manual"}`

---

## SCR-004 사진 선택 (8장 중 N장 고르기)

**컴포넌트 트리**
```
PhotoSelectPage
├── PageTitle ("마음에 드는 사진을 골라요")
├── SelectionGuide (required: number, selected: number)
│   ["3장을 골라주세요" | "4장을 골라주세요" + 현재 선택 수 표시]
├── PhotoGrid
│   └── SelectablePhoto
│       (index: 0-7, imageUrl: string, isSelected: boolean,
│        selectionOrder: number | null, onClick: () => void) × 8
├── ConfirmButton
│   (label: "선택 완료", disabled: selected !== required, onClick: () => void)
└── RetakeButton (label: "다시 찍기", onClick: () => void → SCR-003)
```

**Props**
- `SelectionGuide.required`: SCR-002에서 선택한 컷 수 (3 또는 4)
- `SelectablePhoto.selectionOrder`: 선택 순서 번호 (1, 2, 3…) — 선택 순서가 최종 배치 순서가 됨
- `ConfirmButton.disabled`: 선택 수 ≠ required일 때 비활성

**선택 동작**
- 사진 탭 → 선택됨: 순서 번호 배지 표시 + 테두리 강조
- 이미 selected === required 상태에서 새 사진 탭 → 가장 먼저 선택한 것이 해제되고 새 선택으로 교체
- 선택된 사진 재탭 → 선택 해제

**레이아웃**
- PhotoGrid: `grid grid-cols-4 gap-2 w-full px-4` (8장을 4열로 표시)
- SelectablePhoto: `aspect-square rounded-lg overflow-hidden relative`
- 선택됨: `ring-2 ring-brand-primary` + 좌상단 순서 번호 배지
- ConfirmButton: `w-full h-14 rounded-2xl` + 하단 고정

**Micro-interaction**
- 선택 시: scale-95 → scale-100 bounce (150ms)
- 선택 해제: 테두리·배지 fade-out (100ms)

**에러 상태**
- 없음 (8장 촬영 완료 상태에서만 진입 가능)

**접근성**
- SelectablePhoto: `role="checkbox"` + `aria-checked={isSelected}` + `aria-label="{n}번 사진, {선택/미선택}"`
- SelectionGuide: `aria-live="polite"` (`"2 / 3장 선택됨"` 실시간 안내)

---

## SCR-005 프레임 선택

**컴포넌트 트리**
```
FrameSelectPage
├── StepIndicator (currentStep: 3, totalSteps: 4)
├── FrameList
│   └── FrameCard (frameId: string, thumbnailUrl: string, name: string, isSelected: boolean, onClick: () => void) × n
└── NextButton (onClick: () => void)
```

**레이아웃**
- FrameList: `grid grid-cols-2 gap-3 px-4`
- FrameCard: `aspect-square rounded-xl overflow-hidden relative`
- 선택됨: `ring-2 ring-offset-2 ring-brand-primary` + 우상단 체크 아이콘

**에러 상태**
- 프레임 0개(브랜드 미등록): 기본 흰색 프레임 자동 적용, 이 화면 Skip
- 이미지 로딩 실패: 회색 플레이스홀더 + 프레임 이름 텍스트

**접근성**
- FrameCard: `role="radio"` + `aria-checked={isSelected}` + `aria-label="{name} 프레임"`

---

## SCR-006 프레임 미리보기

**컴포넌트 트리**
```
FramePreviewPage
├── StepIndicator (currentStep: 4, totalSteps: 4)
├── PreviewCanvas (photoUrls: string[], frameUrl: string)
├── ActionRow
│   ├── RetryButton (label: "프레임 다시 선택", onClick: () => void)
│   └── ConfirmButton (label: "이대로 만들기", onClick: () => void, isLoading: boolean)
└── LoadingOverlay (visible: isLoading, message: "이미지를 만들고 있어요…")
```

**Props**
- `ConfirmButton.isLoading`: true일 때 스피너 + 텍스트 변경 ("만드는 중…")
- `LoadingOverlay.visible`: 서버 렌더링 중

**레이아웃**
- PreviewCanvas: `w-full max-w-sm aspect-square mx-auto`
- ActionRow: `flex gap-3 px-6 mt-6`

**에러 상태**
- 이미지 렌더링 실패: LoadingOverlay 해제 + 에러 토스트 "이미지 생성에 실패했어요. 다시 시도해주세요" + Retry 버튼 활성

**접근성**
- LoadingOverlay: `role="status"` + `aria-live="polite"` + `aria-label="이미지 생성 중"`

---

## SCR-007 AI로 만들기 (컨셉 선택)

**컴포넌트 트리**
```
AIConceptSelectPage
├── BrandHeader (logo: string)
├── PageTitle ("어떤 느낌으로 만들까요?")
├── ConceptCardList
│   └── ConceptCard
│       (conceptId: string, previewImageUrl: string, label: string,
│        description: string, isSelected: boolean, onClick: () => void) × 3
└── NextButton (label: "이 스타일로 찍기", disabled: !selectedConcept, onClick: () => void)
```

**Props**
- `ConceptCard.previewImageUrl`: 브랜드 관리자가 등록한 AI 완성 예시 이미지 (실제 결과물 샘플)
- `ConceptCard.label`: 예) "수채화 감성", "팝아트 무드", "필름 감성"
- `ConceptCard.description`: 한 줄 설명 (예) "부드럽고 따뜻한 수채화 스타일")
- `NextButton.disabled`: 아무것도 선택하지 않으면 비활성

**레이아웃**
- `flex flex-col gap-6 px-4 py-6`
- ConceptCardList: `flex flex-col gap-3`
- ConceptCard: `flex gap-4 items-center p-4 rounded-2xl border-2 h-24`
  - 좌측: 예시 이미지 `w-16 h-16 rounded-xl object-cover`
  - 우측: label + description 텍스트
- 선택됨: `border-brand-primary bg-brand-primary/5` + 우측 체크 아이콘

**에러 상태**
- 컨셉 목록 로딩 실패: 스켈레톤 3개 → "컨셉을 불러오지 못했어요" + 새로고침 버튼

**접근성**
- ConceptCard: `role="radio"` + `aria-checked={isSelected}` + `aria-label="{label} 스타일 선택"`

---

## SCR-008 AI 카메라 촬영 (1장)

**컴포넌트 트리**
```
AICameraPage
├── CameraViewfinder (stream: MediaStream, facingMode: "user" | "environment")
├── SelectedConceptBadge (label: string) [선택한 컨셉 이름 상단 표시]
├── GuideOverlay (type: "face-frame") [얼굴 위치 가이드 프레임]
├── ShootButton (label: "찍기", onClick: () => void)
├── CameraFlipButton (onClick: () => void)
└── BackButton (label: "컨셉 다시 고르기", onClick: () => void → SCR-007)
```

**Props**
- `SelectedConceptBadge`: "수채화 감성으로 찍는 중" 형식으로 선택 컨셉 표시
- `GuideOverlay`: 얼굴 위치 가이드 원형 프레임 (반투명 오버레이)
- 촬영 즉시 → 촬영 결과 미리보기 모달로 전환

**촬영 후 결과 미리보기 (인라인 모달)**
```
ShotPreviewModal
├── PreviewImage (imageUrl: string)
├── RetakeButton (label: "다시 찍기", onClick: () => void)
└── ConfirmButton (label: "이 사진으로 할게요", onClick: () => void → SCR-009)
```

**레이아웃**
- CameraViewfinder: 전체 화면 (`position: fixed, inset: 0`)
- ShootButton: 하단 중앙 `w-20 h-20 rounded-full bg-white border-4 border-brand-primary`
- ShotPreviewModal: 하단 슬라이드업 시트 (`h-2/3, rounded-t-3xl`)

**Micro-interaction**
- 촬영 순간: 화면 플래시 (100ms)
- ShotPreviewModal: 하단에서 슬라이드업 (300ms ease-out)

**에러 상태**
- 카메라 권한 거부: "카메라 접근을 허용해야 촬영할 수 있어요" + 설정 열기 버튼
- 촬영 저장 실패: 에러 토스트 + 재촬영 유도

**접근성**
- ShootButton: `aria-label="사진 찍기"`
- ShotPreviewModal: `role="dialog"` + `aria-label="촬영 결과 확인"`

---

## SCR-009 AI 이미지 생성 중

**컴포넌트 트리**
```
AIGeneratingPage
├── ConceptPreviewThumb (conceptPreviewUrl: string, label: string)
├── AnimatedIllustration (type: "ai-painting")
├── ProgressMessage (messages: string[], intervalMs: 5000)
└── ElapsedIndicator (expectedSeconds: 30)
```

**Props**
- `ConceptPreviewThumb`: 선택한 컨셉 예시 이미지 + 이름 (사용자가 무엇을 선택했는지 상기)
- `ProgressMessage.messages`:
  ["AI가 사진을 분석하고 있어요", "스타일을 입히는 중이에요", "거의 완성됐어요!"]
- 5초마다 메시지 순환

**레이아웃**
- `flex flex-col items-center justify-center min-h-screen gap-8 px-6`
- ConceptPreviewThumb: `w-20 h-20 rounded-2xl` + 이름 텍스트

**에러 상태**
- 30초 초과 타임아웃: "AI 생성에 시간이 걸리고 있어요" 토스트 + SCR-008로 돌아가기 버튼
- API 오류: 동일 패턴

**접근성**
- `role="status"` + `aria-live="polite"` 진행 메시지

---

## SCR-010 AI 결과 확인

**컴포넌트 트리**
```
AIResultPage
├── PageTitle ("완성됐어요!")
├── ResultImage (imageUrl: string, alt: "AI로 완성된 사진")
├── ConceptLabel (label: string) [어떤 컨셉으로 만들었는지 표시]
├── ActionRow
│   ├── RetakeButton (label: "다시 찍기", onClick: () => void → SCR-008)
│   └── ConfirmButton (label: "QR로 저장하기", onClick: () => void → SCR-013)
└── BackButton (label: "컨셉 다시 고르기", onClick: () => void → SCR-007)
```

**Props**
- `ResultImage`: AI API가 반환한 완성 이미지 1장
- `RetakeButton`: SCR-008로 돌아가 사진만 다시 찍고 동일 컨셉으로 재생성
- `BackButton`: 컨셉 선택부터 다시 시작

**레이아웃**
- `flex flex-col items-center gap-6 px-6 py-8`
- ResultImage: `w-full max-w-sm aspect-square rounded-2xl object-cover`
- ActionRow: `flex gap-3 w-full`

**에러 상태**
- 이미지 로딩 실패: 회색 플레이스홀더 + "이미지를 불러오지 못했어요" + 재시도 버튼

**접근성**
- ResultImage: `alt="[컨셉명] 스타일로 완성된 AI 사진"`

---

## SCR-013 이미지 완성·QR

**컴포넌트 트리**
```
CompletePage
├── CompletedImage (imageUrl: string, alt: "완성된 브랜드 4컷")
├── QRCodeDisplay
│   ├── QRCode (value: string, size: 200)
│   └── ExpiryNotice (expiresAt: Date)
├── ShareSection
│   ├── ShareButton (platform: "instagram" | "kakaotalk" | "copy", onClick: () => void) × 3
└── RestartButton (label: "처음으로 돌아가기", onClick: () => void)
```

**Props**
- `QRCode.value`: 서명된 이미지 URL (JWT 포함)
- `ExpiryNotice`: "이 QR은 24시간 후 만료됩니다"

**레이아웃**
- `flex flex-col items-center gap-6 px-6 py-8`
- QRCode: `w-48 h-48 mx-auto`
- ShareSection: `flex gap-3 justify-center`

**에러 상태**
- QR 생성 실패: 대신 "이미지 직접 저장" 버튼 표시 (Fallback)

**접근성**
- QRCode: `aria-label="완성된 사진을 저장할 수 있는 QR 코드"`
- ShareButton: `aria-label="{platform}으로 공유"`

---

## SCR-014 QR 저장 페이지 (모바일)

**컴포넌트 트리**
```
QRLandingPage
├── BrandHeader (logo: string)
├── CompletedImage (imageUrl: string)
├── SaveButton (label: "사진 저장하기", onClick: () => void)
├── ShareRow
│   └── ShareButton (platform: string, onClick: () => void) × 3
└── ExpiryBanner (expiresAt: Date) [만료 임박 시 표시]
```

**에러 상태**
- QR 만료(24시간 경과): 이미지 대신 "QR이 만료되었습니다" 안내 + 재방문 안내
- 이미지 URL 오류: "사진을 불러올 수 없어요" 안내

---

## SCR-021 에러 화면

**컴포넌트 트리**
```
ErrorPage
├── ErrorIllustration (type: "server" | "expired" | "notfound")
├── ErrorMessage (title: string, description: string)
├── PrimaryAction (label: string, onClick: () => void)
└── SecondaryAction (label: "처음으로", onClick: () => void) [조건부]
```

**에러 유형별 메시지**
| type | title | description | PrimaryAction |
|---|---|---|---|
| server | 잠시 문제가 생겼어요 | 잠시 후 다시 시도해주세요 | 다시 시도 |
| expired | QR이 만료되었어요 | 이 QR은 24시간만 유효해요 | 처음으로 돌아가기 |
| notfound | 찾을 수 없는 페이지예요 | 주소를 확인해주세요 | 홈으로 가기 |

**접근성**
- `role="main"` + `aria-labelledby="error-title"`

---

# 관리자 페이지

---

## SCR-022 관리자 로그인

**컴포넌트 트리**
```
AdminLoginPage
├── AdminHeader (logo: string, title: "관리자")
├── LoginForm (onSubmit: (email, password) => void)
│   ├── InputField (name: "email", type: "email", label: "이메일", placeholder: "brand@example.com")
│   ├── InputField (name: "password", type: "password", label: "비밀번호")
│   └── SubmitButton (label: "로그인", isLoading: boolean)
└── ErrorMessage (message: string | null)
```

**Props**
- `LoginForm.onSubmit`: 이메일+비밀번호 제출 → JWT 세션 발급 → SCR-016으로 이동
- `SubmitButton.isLoading`: 요청 중 스피너 + 버튼 비활성

**레이아웃**
- `flex flex-col items-center justify-center min-h-screen bg-gray-50`
- LoginForm: `w-full max-w-sm bg-white rounded-2xl shadow p-8 flex flex-col gap-4`

**에러 상태**
- 이메일/비밀번호 불일치: "이메일 또는 비밀번호를 확인해주세요" 인라인 에러
- 5회 이상 실패: "잠시 후 다시 시도해주세요 (30분 잠금)" 안내

**접근성**
- `autocomplete="email"`, `autocomplete="current-password"` 적용
- 에러 메시지: `role="alert"` + `aria-live="assertive"`

---

## SCR-016 브랜드 관리자 홈

**컴포넌트 트리**
```
AdminHomePage
├── AdminTopBar (brandName: string, onLogout: () => void)
├── SummaryRow
│   ├── StatCard (label: "오늘 세션", value: number, trend: "up" | "down" | "flat")
│   ├── StatCard (label: "QR 저장율", value: string, trend)
│   └── StatCard (label: "이번 주 완성", value: number, trend)
└── AdminNavGrid
    ├── AdminNavCard (icon, title: "프레임 관리", description: string, href: "/admin/frames")
    ├── AdminNavCard (title: "AI 스타일 관리", href: "/admin/ai-styles")
    ├── AdminNavCard (title: "브랜드 설정", href: "/admin/settings")
    └── AdminNavCard (title: "통계", href: "/admin/stats")
```

**레이아웃**
- SummaryRow: `grid grid-cols-3 gap-3 px-4`
- AdminNavGrid: `grid grid-cols-2 gap-3 px-4 mt-6`
- StatCard: `bg-white rounded-xl p-4 flex flex-col gap-1`

**에러 상태**
- 통계 로딩 실패: StatCard 값 대신 "—" 표시, 전체 기능은 정상 동작

---

## SCR-017 프레임 관리

**컴포넌트 트리**
```
FrameManagePage
├── AdminTopBar (title: "프레임 관리", backHref: "/admin")
├── FrameCount (current: number, max: 10)
├── FrameList (draggable)
│   └── FrameListItem (frameId: string, thumbnailUrl: string, name: string, order: number,
│                       onDelete: () => void, onDragReorder: () => void) × n
├── AddFrameButton (disabled: count >= 10, onClick: () => void → SCR-023)
└── EmptyState [count === 0일 때]
```

**Props**
- `FrameCount`: "3 / 10개 등록됨" 형식
- `AddFrameButton.disabled`: 10개 초과 시 비활성 + "최대 10개까지 등록 가능해요" 툴팁
- `FrameListItem` 드래그: 순서 변경 후 자동 저장

**레이아웃**
- FrameList: `flex flex-col gap-2 px-4`
- FrameListItem: `flex items-center gap-3 bg-white rounded-xl p-3`
- 썸네일: `w-16 h-16 rounded-lg object-cover`

**에러 상태**
- 삭제 확인 모달: "이 프레임을 삭제하면 복구할 수 없어요. 삭제하시겠어요?"
- 삭제 실패: 에러 토스트 "삭제에 실패했어요. 다시 시도해주세요"

---

## SCR-023 프레임 업로드

**컴포넌트 트리**
```
FrameUploadPage
├── AdminTopBar (title: "프레임 추가", backHref: "/admin/frames")
├── FileDropzone (accept: "image/png", maxSize: 5MB, onFileSelect: (file) => void)
├── FramePreview (frameUrl: string | null)
│   └── MockPhotoGrid (placeholder: true)
├── FrameNameInput (value: string, onChange: () => void, maxLength: 20)
└── SaveButton (disabled: !file || !name, label: "저장하기", isLoading: boolean)
```

**Props**
- `FileDropzone.accept`: PNG만 허용 (투명 배경 지원)
- `FramePreview`: 업로드한 프레임을 회색 더미 4컷 위에 오버레이하여 미리보기
- `FrameNameInput.maxLength`: 20자

**레이아웃**
- `flex flex-col gap-6 px-4 py-6`
- FramePreview: `w-full max-w-xs mx-auto aspect-square relative`
- FileDropzone: 파일 선택 전 점선 테두리 + 업로드 아이콘

**에러 상태**
- PNG 외 형식 업로드: "PNG 파일만 업로드 가능해요 (투명 배경 지원)"
- 5MB 초과: "파일 크기는 5MB 이하만 가능해요"
- 저장 실패: 에러 토스트 + SaveButton 재활성

---

## SCR-018 AI 스타일 관리

**컴포넌트 트리**
```
AIStyleManagePage
├── AdminTopBar (title: "AI 스타일 관리", backHref: "/admin")
├── StyleCount (current: number, max: 12)
├── StyleGrid
│   └── StyleManageCard (styleId: string, keyword: string, moodImageUrl: string,
│                         onEdit: () => void, onDelete: () => void) × n
├── AddStyleButton (disabled: count >= 12, onClick: () => void → SCR-024)
└── EmptyState [count === 0일 때]
```

**레이아웃**
- StyleGrid: `grid grid-cols-2 gap-3 px-4`
- StyleManageCard: `rounded-2xl overflow-hidden relative h-32`
- 카드 하단: 반투명 바 + 키워드 텍스트 + 편집/삭제 아이콘

**에러 상태**
- 삭제 확인 모달 동일 패턴 (SCR-017 참조)

---

## SCR-024 AI 스타일 등록·수정

**컴포넌트 트리**
```
AIStyleEditPage
├── AdminTopBar (title: "스타일 추가" | "스타일 수정", backHref: "/admin/ai-styles")
├── KeywordInput (value: string, label: "스타일 키워드", placeholder: "예: 봄날의 피크닉", maxLength: 15)
├── MoodImageDropzone (accept: "image/*", maxSize: 5MB, currentImageUrl: string | null)
├── StylePreviewCard (keyword: string, moodImageUrl: string | null)
└── SaveButton (disabled: !keyword || !moodImage, label: "저장하기", isLoading: boolean)
```

**Props**
- `KeywordInput`: 방문자 화면에서 스타일 카드에 표시되는 텍스트
- `StylePreviewCard`: 실제 방문자에게 보여지는 모습을 미리 확인

**에러 상태**
- 이미지 업로드 실패: 에러 토스트
- 키워드 15자 초과: 실시간 글자 수 카운터 + 빨간 테두리

---

## SCR-019 브랜드 설정

**컴포넌트 트리**
```
BrandSettingsPage
├── AdminTopBar (title: "브랜드 설정", backHref: "/admin")
├── SettingsForm
│   ├── LogoUploadSection
│   │   ├── CurrentLogo (imageUrl: string | null)
│   │   └── LogoDropzone (accept: "image/png,image/svg+xml", maxSize: 2MB)
│   ├── ColorPickerSection
│   │   ├── ColorInput (label: "포인트 컬러", value: string, onChange: (hex) => void)
│   │   └── ColorPreview (color: string)
│   ├── ServiceNameInput (value: string, label: "서비스 표시 이름", maxLength: 20)
│   └── LivePreviewCard (logo, color, name)
└── SaveButton (label: "저장하기", isLoading: boolean)
```

**Props**
- `ColorInput`: HEX 직접 입력 또는 컬러 피커
- `LivePreviewCard`: 설정값이 바뀔 때마다 방문자 홈 화면 미리보기 실시간 반영

**레이아웃**
- `flex flex-col gap-6 px-4 py-6`
- LivePreviewCard: 홈 화면(SCR-001) 축소 버전, 변경사항 즉시 반영

**에러 상태**
- PNG/SVG 외 형식: "PNG 또는 SVG 파일만 업로드 가능해요"
- 저장 중 네트워크 오류: 에러 토스트 + 이전 값 유지

**접근성**
- ColorInput: `aria-label="포인트 컬러 HEX 값 입력"` + 색상 대비율 실시간 경고 (4.5:1 미만 시 주의 표시)

---

## SCR-020 통계 대시보드

**컴포넌트 트리**
```
StatsDashboardPage
├── AdminTopBar (title: "통계", backHref: "/admin")
├── DateRangeFilter (preset: "7d" | "30d" | "custom", onChange: () => void)
├── KPIRow
│   ├── KPICard (label: "총 세션", value: number)
│   ├── KPICard (label: "QR 저장 완료", value: number)
│   └── KPICard (label: "저장 완료율", value: string, highlight: boolean)
├── SessionChart (type: "line", data: DailySession[], xKey: "date", yKey: "count")
├── ModeRatioChart (type: "donut", data: {frame: number, ai: number})
└── FunnelTable (steps: FunnelStep[])
```

**Props**
- `DateRangeFilter` 기본값: 최근 7일
- `FunnelTable.steps`: 홈 진입 → 방식 선택 → 이미지 완성 → QR 저장 단계별 이탈율

**레이아웃**
- KPIRow: `grid grid-cols-3 gap-3 px-4`
- SessionChart: `w-full h-48 px-4`
- ModeRatioChart: `w-40 h-40 mx-auto`

**에러 상태**
- 데이터 없음(첫 사용): EmptyState "아직 데이터가 없어요. 방문자가 서비스를 이용하면 여기에 표시됩니다"
- 차트 로딩 실패: 스켈레톤 유지 + "데이터를 불러오지 못했어요" + 새로고침 버튼
