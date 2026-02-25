# EV 충전소 예약 플랫폼 - 와이어프레임 디자인 아이디어

## 아이디어 1: 테크니컬 다크 대시보드

<response>
<idea>
**Design Movement**: 다크 테크 / 사이버네틱 인터페이스
**Core Principles**:
- 어두운 배경에 네온 강조색(에메랄드/시안)으로 기능적 계층 구조 표현
- 정보 밀도 우선 — 모든 요소가 기능적 목적을 가짐
- 격자 기반 레이아웃으로 데이터 시각화 강조
- 모노스페이스 + 산세리프 혼합 타이포그래피

**Color Philosophy**: 딥 네이비(#0A0F1E)를 베이스로, 에메랄드 그린(#00D4AA)을 주요 액션 색상으로 사용. 충전 상태를 표현하는 신호등 색상(초록/노랑/빨강)이 자연스럽게 녹아듦

**Layout Paradigm**: 전체 화면 지도를 배경으로, 플로팅 패널들이 레이어드 형태로 배치. 좌측 상단 컨트롤 패널, 우측 슬라이드인 모달

**Signature Elements**:
- 충전 핀에 펄스 애니메이션 효과
- 모달 테두리에 그라디언트 글로우 효과
- 예약 버튼 그리드에 히트맵 스타일 색상

**Interaction Philosophy**: 호버 시 즉각적인 피드백, 클릭 시 부드러운 슬라이드 전환

**Animation**: 지도 전환 시 줌 애니메이션, 모달 우측에서 슬라이드인, 핀 클릭 시 바운스

**Typography System**: JetBrains Mono(레이블/코드) + Pretendard(본문)
</idea>
<text>다크 테크 대시보드 스타일 — 어두운 배경에 에메랄드 네온 강조색</text>
<probability>0.07</probability>
</response>

## 아이디어 2: 클린 미니멀 유틸리티

<response>
<idea>
**Design Movement**: 스칸디나비안 미니멀리즘 / 기능주의
**Core Principles**:
- 흰 배경에 차분한 블루-그레이 팔레트
- 정보 계층 구조를 여백으로 표현
- 와이어프레임 특성을 살린 선명한 경계선과 박스
- 타이포그래피 중심의 정보 전달

**Color Philosophy**: 순백(#FFFFFF)과 연한 회색(#F5F7FA)의 배경, 딥 블루(#1A3A5C)를 주요 텍스트와 액션 색상으로. 예약 상태는 파스텔 톤으로 구분

**Layout Paradigm**: 지도를 전체 배경으로, 반투명 카드 패널들이 떠 있는 구조. 좌측 상단 드롭다운, 우측 고정 모달 패널

**Signature Elements**:
- 1px 선으로 구성된 와이어프레임 스타일 카드
- 충전기 타입 아이콘을 SVG 라인 아트로 표현
- 시간 그리드에 명확한 색상 코딩(가능/불가/선택)

**Interaction Philosophy**: 최소한의 애니메이션, 즉각적인 상태 변화, 명확한 클릭 피드백

**Animation**: 드롭다운 페이드인, 모달 슬라이드, 버튼 상태 전환

**Typography System**: Noto Sans KR(한국어 최적화) + 숫자는 tabular-nums 설정
</idea>
<text>클린 미니멀 유틸리티 스타일 — 흰 배경에 딥 블루 강조색</text>
<probability>0.08</probability>
</response>

## 아이디어 3: 모던 카토그래픽 (선택됨)

<response>
<idea>
**Design Movement**: 현대적 지도 인터페이스 / Material You 영향
**Core Principles**:
- 지도가 주인공 — UI 요소는 지도 위에 최소한으로 떠 있음
- 와이어프레임 특성을 살린 회색 계열 + 파란색 강조
- 카드 기반 정보 계층 구조, 그림자로 깊이 표현
- 한국어 타이포그래피에 최적화된 폰트 시스템

**Color Philosophy**: 지도 배경을 살리기 위해 UI는 흰색/연회색 카드. 주요 액션 색상은 EV 브랜드 연상의 일렉트릭 블루(#2563EB). 예약 가능은 초록, 예약 불가는 빨강, 선택 중은 파란색

**Layout Paradigm**: 전체 화면 지도 위에 플로팅 UI 요소들. 좌측 상단 컨트롤 패널(반투명 배경), 우측에서 슬라이드인하는 예약 모달(화면 높이의 100%)

**Signature Elements**:
- 충전소 핀: 번개 아이콘이 있는 원형 핀, 상태에 따라 색상 변화
- 지역 드롭다운: 토글 + 그리드 레이아웃의 서울 구 버튼들
- 예약 시간 그리드: 4열×6행의 색상 코딩된 버튼

**Interaction Philosophy**: 지도 중심의 탐색, 핀 클릭으로 상세 정보 접근, 직관적인 예약 플로우

**Animation**: 지도 이동 시 부드러운 pan/zoom, 모달 우측 슬라이드인(300ms ease), 드롭다운 아코디언 확장

**Typography System**: Pretendard(메인) — 한국어 가독성 최적화, 숫자는 tabular-nums
</idea>
<text>모던 카토그래픽 스타일 — 지도 중심 인터페이스, 일렉트릭 블루 강조색</text>
<probability>0.09</probability>
</response>
