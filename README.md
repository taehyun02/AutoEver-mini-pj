# ⚡ Watt-up (왓업)
> **전기차 충전소 실시간 상태 확인 및 예약 플랫폼**

Watt-up은 사용자 주변의 전기차 충전소 정보를 Naver Maps API를 활용해 시각화하고, 실시간 가용 상태 확인 및 예약을 지원하는 현대적인 웹 애플리케이션입니다. 

---

## 🚀 Core Logic & Optimization (핵심 기술 로직)

이 프로젝트는 대량의 충전소 데이터를 효율적으로 처리하고 매끄러운 사용자 경험을 제공하기 위해 다음과 같은 핵심 로직을 설계에 반영했습니다.

### 1. Viewport-based Data Loading (영역 기반 데이터 로딩)
클라이언트와 서버의 부하를 최소화하기 위해 지도의 현재 영역(Viewport) 내에 포함된 충전소 정보만 선택적으로 불러옵니다.
- **동작 방식**: 지도의 `idle` 이벤트가 발생할 때마다 현재 화면의 경계값(`bounds`: north, south, east, west)을 서버로 전송합니다.
- **이점**: 초기 로딩 속도가 개선되며, 불필요한 데이터 통신을 줄여 성능을 최적화합니다.

### 2. Smart Clustering & Step-Zoom (지능형 클러스터링)
충전소가 밀집된 지역에서 마커가 겹쳐 가독성이 떨어지는 문제를 해결하기 위해 고도화된 클러스터링 방식을 사용합니다.
- **Dynamic Threshold**: `clusterMinZoom` 속성을 통해 줌 레벨에 따라 클러스터 해제 지점을 자유롭게 조정할 수 있습니다.
- **Natural Exploration**: 클러스터 마커를 클릭하면 해당 중심점으로 이동하며 **한 단계씩 점진적으로 확대**됩니다. 이는 데이터의 맥락을 유지하면서 상세 위치로 접근하게 하는 UX 디자인입니다.

### 3. Real-time Status Visualization (실시간 상태 시각화)
충전소의 가용 상태를 색상과 애니메이션을 통해 직관적으로 전달합니다.
- **Status Indicator**: 충전 가능 여부에 따라 '초록(가용)', '노랑(일부)', '빨강(만석)' 컬러 코드를 적용합니다.
- **Ripple Animation**: 이용 가능한 스테이션에는 시각적 리플 효과를 주어 가동 중임을 생생하게 표현합니다.

---

## ✨ 주요 기능

- **🗺️ Naver Maps Integration**: 네이버 지도 API를 완벽하게 통합한 직관적인 지도 인터페이스
- **📍 스마트 마커 & 클러스터링**: 수천 개의 충전소 데이터를 효율적으로 탐색할 수 있는 인터페이스
- **📋 상세 정보 슬라이드 모달**: 충전소 선택 시 우측에서 나타나는 상세 정보 패널 (충전기 타입, 요금, 실시간 현황 등)
- **📱 반응형 웹 디자인**: Tailwind CSS v4를 활용하여 모바일과 데스크톱 환경에 모두 최적화된 UI

---

## 🛠 Tech Stack

### Frontend
- **Core**: React 19 (TypeScript)
- **Build Tool**: Vite
- **State/Routing**: Wouter (Patched for lightweight navigation)
- **UI & Animation**: Tailwind CSS v4, Framer Motion, Shadcn UI, Lucide Icons
- **Maps API**: Naver Maps API

### Backend (Serving)
- **Server**: Node.js / Express
- **Bundler**: esbuild (Server-side bundling)

---

## 📂 Project Structure

```text
├── client/
│   ├── src/
│   │   ├── components/ # Map, StationModal, DistrictDropdown 등 핵심 UI
│   │   ├── hooks/      # Geolocation, Mobile 대응, PersistFn 등 커스텀 훅
│   │   ├── lib/        # API 호출(`api.ts`) 및 데이터 처리 로직
│   │   └── pages/      # Home(지도 메인), NotFound 등 페이지 구성
├── server/
│   └── index.ts        # 데이터 제공 API 엔드포인트 및 서버 설정
├── shared/             # 클라이언트-서버 공용 타입 및 상수 정의
└── package.json        # 프로젝트 의존성 및 통합 빌드 스크립트
```

---

## 📦 Getting Started

### 1. 의존성 설치
```bash
pnpm install
```

### 2. 개발 서버 실행
```bash
pnpm run dev
```

### 3. 빌드 및 프로덕션 실행
```bash
pnpm run build
pnpm run start
```

---
## 📄 License
MIT License
