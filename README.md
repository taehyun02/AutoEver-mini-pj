# Watt-up - 전기차 충전소 예약 플랫폼 (FE)

Watt-up은 사용자 주변의 전기차 충전소 위치를 확인하고, 실시간 상태 및 예약 가능 여부를 시각적으로 제공하는 현대적인 지도 기반 플랫폼 프로토타입입니다.

## 🚀 주요 기능

- **Full-Screen Naver Map**: 네이버 지도 API를 활용한 전체 화면 지도 인터페이스.
- **실시간 충전소 상태**: 이용 가능, 일부 가능, 만석 등 상태별 컬러 핀 및 요약 바 제공.
- **지역별 필터링**: 서울시 내 자치구별 중심지 이동 기능.
- **상세 정보 슬라이드 모달**: 충전소 클릭 시 우측에서 나타나는 상세 정보 및 예약 UI.
- **내 위치 기반 서비스**: Geolocation API를 통한 현재 위치 중심 지도 이동.
- **반응형 디자인**: 다양한 해상도에 대응하는 플로팅 UI 및 모던한 컴포넌트 디자인.

## 🛠 기술 스택

### Frontend
- **Framework**: React 19 (TypeScript)
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v4, Framer Motion (애니메이션)
- **UI Components**: Shadcn UI (Radix UI 기반), Lucide React (아이콘)
- **State Management/Routing**: Wouter
- **Maps API**: Naver Maps API

### Backend (Serving)
- **Environment**: Node.js
- **Framework**: Express
- **Build**: esbuild (Server-side bundling)

## 📦 설치 및 실행 방법

### 1. 사전 준비
- [pnpm](https://pnpm.io/installation)이 설치되어 있어야 합니다.
- [Naver Cloud Platform](https://www.ncloud.com/)에서 Maps API Key를 발급받아야 합니다.

### 2. 의존성 설치
```bash
pnpm install
```

### 3. 개발 서버 실행
```bash
pnpm run dev
```

### 4. 빌드 및 프로덕션 실행
```bash
# 빌드 (Client & Server)
pnpm run build

# 서버 실행
pnpm run start
```

## 📂 프로젝트 구조

```text
├── client/
│   ├── public/         # 정적 자산
│   └── src/
│       ├── components/ # 공통 및 UI 컴포넌트
│       ├── contexts/   # 전역 상태 (Theme 등)
│       ├── hooks/      # 커스텀 훅
│       ├── lib/        # 데이터 및 유틸리티
│       └── pages/      # 페이지 구성 (Home, NotFound)
├── server/
│   └── index.ts        # Express 서버 설정
├── patches/            # 외부 라이브러리 패치
└── package.json        # 프로젝트 설정 및 스크립트
```

## 📝 참고 사항
- 본 프로젝트는 현재 프론트엔드 기능을 중심으로 구현된 프로토타입이며, 충전소 데이터는 `client/src/lib/data.ts`에서 더미 데이터를 사용하고 있습니다.
- 실제 Naver Maps API를 연동하려면 `index.html`에 클라이언트 ID를 추가해야 합니다.

## 📄 라이선스
MIT License
