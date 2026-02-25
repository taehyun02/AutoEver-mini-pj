import { useState } from 'react';
import './Wireframe.css';

// 서울 지역구 목록
const seoulDistricts = [
    '강남구', '강동구', '강북구', '강서구', '관악구',
    '광진구', '구로구', '금천구', '노원구', '도봉구',
    '동대문구', '동작구', '마포구', '서대문구', '서초구',
    '성동구', '성북구', '송파구', '양천구', '영등포구',
    '용산구', '은평구', '종로구', '중구', '중랑구'
];

// 충전기 단자 타입
const chargerTypes = ['DC콤보', 'AC3상', 'DC차데모', 'AC완속'];

// 예약 시간 슬롯 (00시 ~ 23시)
const timeSlots = Array.from({ length: 24 }, (_, i) =>
    `${i.toString().padStart(2, '0')}:00`
);

function Wireframe() {
    const [isRegionDropdownOpen, setIsRegionDropdownOpen] = useState(false);
    const [selectedRegion, setSelectedRegion] = useState('강남구');
    const [isStationModalOpen, setIsStationModalOpen] = useState(false);
    const [selectedTimeSlots, setSelectedTimeSlots] = useState<number[]>([]);

    // 예약된 시간 슬롯 (예시 데이터)
    const reservedSlots = [2, 3, 7, 8, 9, 14, 15, 18];

    const handleRegionSelect = (region: string) => {
        setSelectedRegion(region);
        setIsRegionDropdownOpen(false);
    };

    const handleTimeSlotClick = (index: number) => {
        if (reservedSlots.includes(index)) return; // 이미 예약된 슬롯은 선택 불가

        setSelectedTimeSlots(prev =>
            prev.includes(index)
                ? prev.filter(i => i !== index)
                : [...prev, index]
        );
    };

    const handleStationPinClick = () => {
        setIsStationModalOpen(true);
        setSelectedTimeSlots([]);
    };

    return (
        <div className="wireframe-container">
            {/* 전체 지도 영역 */}
            <div className="map-container">
                <div className="map-placeholder">
                    <span className="map-label">네이버 맵 API</span>
                    <span className="map-sublabel">{selectedRegion} 지역 지도</span>

                    {/* 충전소 핀들 (예시) */}
                    <div className="station-pins">
                        <div
                            className="station-pin"
                            style={{ top: '30%', left: '40%' }}
                            onClick={handleStationPinClick}
                        >
                            <div className="pin-icon">⚡</div>
                        </div>
                        <div
                            className="station-pin"
                            style={{ top: '50%', left: '60%' }}
                            onClick={handleStationPinClick}
                        >
                            <div className="pin-icon">⚡</div>
                        </div>
                        <div
                            className="station-pin"
                            style={{ top: '70%', left: '35%' }}
                            onClick={handleStationPinClick}
                        >
                            <div className="pin-icon">⚡</div>
                        </div>
                        <div
                            className="station-pin"
                            style={{ top: '45%', left: '25%' }}
                            onClick={handleStationPinClick}
                        >
                            <div className="pin-icon">⚡</div>
                        </div>
                        <div
                            className="station-pin"
                            style={{ top: '25%', left: '70%' }}
                            onClick={handleStationPinClick}
                        >
                            <div className="pin-icon">⚡</div>
                        </div>
                    </div>
                </div>

                {/* 좌측 상단 지역 선택 버튼 */}
                <div className="region-selector">
                    <button
                        className="region-toggle-btn"
                        onClick={() => setIsRegionDropdownOpen(!isRegionDropdownOpen)}
                    >
                        지역 ▼
                    </button>

                    {isRegionDropdownOpen && (
                        <div className="region-dropdown">
                            <div className="region-grid">
                                {seoulDistricts.map((district) => (
                                    <button
                                        key={district}
                                        className={`region-btn ${selectedRegion === district ? 'active' : ''}`}
                                        onClick={() => handleRegionSelect(district)}
                                    >
                                        {district}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* 우측 충전소 정보 모달 */}
            {isStationModalOpen && (
                <div className="station-modal">
                    <button
                        className="modal-close-btn"
                        onClick={() => setIsStationModalOpen(false)}
                    >
                        ✕
                    </button>

                    <div className="modal-content">
                        {/* 충전소 사진 */}
                        <section className="modal-section">
                            <h3 className="section-title">충전소 사진</h3>
                            <div className="station-photo-placeholder">
                                <span>📷 충전소 이미지</span>
                            </div>
                        </section>

                        {/* 지원 충전기 단자 */}
                        <section className="modal-section">
                            <h3 className="section-title">지원 충전기 단자</h3>
                            <div className="charger-types">
                                {chargerTypes.map((type) => (
                                    <span key={type} className="charger-badge">
                                        {type}
                                    </span>
                                ))}
                            </div>
                        </section>

                        {/* 이용시간 */}
                        <section className="modal-section">
                            <h3 className="section-title">이용시간</h3>
                            <div className="operating-hours">
                                <span className="hours-badge">24시간 운영</span>
                            </div>
                        </section>

                        {/* 예약 현황 */}
                        <section className="modal-section">
                            <h3 className="section-title">예약 현황</h3>
                            <div className="time-legend">
                                <span className="legend-item">
                                    <span className="legend-color available"></span> 예약가능
                                </span>
                                <span className="legend-item">
                                    <span className="legend-color reserved"></span> 예약됨
                                </span>
                                <span className="legend-item">
                                    <span className="legend-color selected"></span> 선택됨
                                </span>
                            </div>
                            <div className="time-slots-grid">
                                {timeSlots.map((time, index) => (
                                    <button
                                        key={index}
                                        className={`time-slot-btn 
                      ${reservedSlots.includes(index) ? 'reserved' : ''}
                      ${selectedTimeSlots.includes(index) ? 'selected' : ''}
                    `}
                                        onClick={() => handleTimeSlotClick(index)}
                                        disabled={reservedSlots.includes(index)}
                                    >
                                        {time}
                                    </button>
                                ))}
                            </div>
                        </section>

                        {/* 예약 정보 입력 */}
                        <section className="modal-section">
                            <h3 className="section-title">예약 정보 입력</h3>
                            <div className="reservation-form">
                                <div className="form-group">
                                    <label>차량 번호</label>
                                    <input type="text" placeholder="12가 3456" />
                                </div>
                                <div className="form-group">
                                    <label>차량 종류</label>
                                    <select>
                                        <option>선택하세요</option>
                                        <option>테슬라 모델 3</option>
                                        <option>현대 아이오닉 5</option>
                                        <option>기아 EV6</option>
                                        <option>제네시스 GV60</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>충전기 타입</label>
                                    <select>
                                        <option>선택하세요</option>
                                        {chargerTypes.map(type => (
                                            <option key={type}>{type}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>연락처</label>
                                    <input type="tel" placeholder="010-0000-0000" />
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* 최종 예약 버튼 */}
                    <button className="confirm-reservation-btn">
                        ✓
                    </button>
                </div>
            )}
        </div>
    );
}

export default Wireframe;
