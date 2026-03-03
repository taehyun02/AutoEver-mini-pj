# ⚡ Watt-up - 전기차 충전소 실시간 예약 플랫폼

Watt-up은 사용자 주변의 전기차 충전소 위치를 확인하고, 실시간 상태 및 예약 가능 여부를 시각적으로 제공하는 현대적인 지도 기반 플랫폼입니다.

## ✨ 주요 기능

- **🗺️ Naver Maps 기반 인터페이스**: 네이버 지도 API를 완벽하게 통합하여 사용자 경험을 극대화한 직관적인 풀스크린 지도 인터페이스를 제공합니다.
- **📍 구 단위 충전소 확인 및 스마트 클러스터링**: 서울시 자치구별 충전소 분포를 한눈에 파악할 수 있으며, 지도 확대/축소 레벨에 따른 지능형 클러스터링 기술로 수많은 데이터를 효율적으로 탐색합니다.
- **📊 충전소 가용 상태 실시간 모니터링**: '이용 가능', '일부 가능', '만석' 등 충전소별 현재 상태를 컬러 코드와 리플(Ripple) 애니메이션 효과로 구현하여 즉각적인 정보 식별이 가능합니다.
- **📋 상세 정보 슬라이드 모달**: 특정 충전소 선택 시 우측에서 부드럽게 나타나는 전용 모달을 통해 상세 위치, 충전기 사양, 실시간 이용 현황 등 필수 정보를 제공합니다.
- **📅 실시간 충전소 예약 시스템**: 실시간 데이터를 기반으로 사용자가 원하는 충전소를 즉시 예약하고 관리할 수 있는 사용자 중심의 편리한 예약 프로세스를 지원합니다.

## 🛠 기술 스택

### Frontend
- **Framework**: React 19 (TypeScript)
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v4, Framer Motion (애니메이션)
- **UI Components**: Shadcn UI, Lucide React (아이콘)
- **Routing**: Wouter
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
# 클라이언트 및 서버 통합 빌드
pnpm run build

# 서버 실행
pnpm run start
```

## 📂 프로젝트 구조

```text
├── client/
│   ├── public/         # 정적 자산 (이미지, 파비콘 등)
│   └── src/
│       ├── components/ # 공용 및 UI 컴포넌트 (Map, Modal 등)
│       ├── hooks/      # 커스텀 훅 (Geolocation, Mobile 대응 등)
│       ├── lib/        # API 및 유틸리티 함수
│       └── pages/      # 메인 및 404 페이지
├── server/
│   └── index.ts        # Express 서버 및 API 엔드포인트
├── shared/             # 클라이언트-서버 공용 상수 및 타입
└── package.json        # 프로젝트 설정 및 스크립트
```

## 📄 라이선스
MIT License
