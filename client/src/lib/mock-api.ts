// Mock API Functions for EV Charging Station Platform
// 실제 API 서버 없이 개발할 때 사용하는 목업 API

import { ChargingStation } from "./data";

// Mock 데이터
const mockStations: ChargingStation[] = [
    {
        id: "stn-001",
        name: "강남 코엑스 충전소",
        address: "서울 강남구 영동대로 513",
        lat: 37.5131,
        lng: 127.0596,
        status: "available",
        totalSlots: 8,
        availableSlots: 5,
        chargerTypes: [
            { type: "DC콤보", count: 4, maxKw: 100, available: 3 },
            { type: "CHAdeMO", count: 2, maxKw: 50, available: 1 },
            { type: "AC3상", count: 2, maxKw: 7, available: 1 },
        ],
        operatingHours: "24시간 운영",
        photo: "https://private-us-east-1.manuscdn.com/sessionFile/CL30WOLd8pbCUpEbYPccwp/sandbox/EAyGbMG1FHjp60bisLUYbi-img-1_1771996924000_na1fn_ZXYtc3RhdGlvbi1waG90bw.jpg",
        rating: 4.5,
        reviewCount: 128,
        pricePerKwh: 320,
    },
    {
        id: "stn-002",
        name: "서초 반포 충전소",
        address: "서울 서초구 반포대로 201",
        lat: 37.5044,
        lng: 127.0052,
        status: "partial",
        totalSlots: 6,
        availableSlots: 2,
        chargerTypes: [
            { type: "DC콤보", count: 3, maxKw: 200, available: 1 },
            { type: "AC완속", count: 3, maxKw: 7, available: 1 },
        ],
        operatingHours: "06:00 - 24:00",
        photo: "https://private-us-east-1.manuscdn.com/sessionFile/CL30WOLd8pbCUpEbYPccwp/sandbox/EAyGbMG1FHjp60bisLUYbi-img-1_1771996924000_na1fn_ZXYtc3RhdGlvbi1waG90bw.jpg",
        rating: 4.2,
        reviewCount: 87,
        pricePerKwh: 350,
    },
    {
        id: "stn-003",
        name: "마포 홍대 충전소",
        address: "서울 마포구 양화로 188",
        lat: 37.5563,
        lng: 126.9236,
        status: "occupied",
        totalSlots: 4,
        availableSlots: 0,
        chargerTypes: [
            { type: "DC콤보", count: 2, maxKw: 100, available: 0 },
            { type: "CHAdeMO", count: 2, maxKw: 50, available: 0 },
        ],
        operatingHours: "24시간 운영",
        photo: "https://private-us-east-1.manuscdn.com/sessionFile/CL30WOLd8pbCUpEbYPccwp/sandbox/EAyGbMG1FHjp60bisLUYbi-img-1_1771996924000_na1fn_ZXYtc3RhdGlvbi1waG90bw.jpg",
        rating: 3.9,
        reviewCount: 54,
        pricePerKwh: 310,
    },
];

const mockReservations = [
    {
        reserv_id: "01JNE2Z8Q6J9H6K0Q0P9A0BCDE",
        user_id: "01012345678",
        start_dt: "2026-02-24T11:00:00",
        end_dt: "2026-02-24T12:00:00",
        status: "READY",
    },
    {
        reserv_id: "01JNE2Z8Q6J9H6K0Q0P9A0BCDF",
        user_id: "01098765432",
        start_dt: "2026-02-24T14:00:00",
        end_dt: "2026-02-24T15:00:00",
        status: "CHARGING",
    },
];

// API 호출을 흉내 내는 딜레이 함수
const mockDelay = (ms: number = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API 함수들
export async function fetchStationsByDistrict(
    districtName: string
): Promise<ChargingStation[]> {
    console.log("MOCK API 호출: fetchStationsByDistrict");
    console.log("districtName:", districtName);

    await mockDelay(300);

    // 지역명에 따라 다른 데이터 반환
    if (districtName === "강남구") {
        return mockStations.filter(station => station.address.includes("강남"));
    } else if (districtName === "서초구") {
        return mockStations.filter(station => station.address.includes("서초"));
    } else if (districtName === "마포구") {
        return mockStations.filter(station => station.address.includes("마포"));
    }

    // 기본적으로 모든 목업 데이터 반환
    return mockStations;
}

export async function fetchStationsInBounds(
    bounds: { north: number; south: number; east: number; west: number }
): Promise<ChargingStation[]> {
    console.log("MOCK API 호출: fetchStationsInBounds");
    console.log("bounds:", bounds);

    await mockDelay(200);

    // 경계 내의 충전소만 필터링 (간단한 구현)
    return mockStations.filter(station => {
        return station.lat >= bounds.south &&
            station.lat <= bounds.north &&
            station.lng >= bounds.west &&
            station.lng <= bounds.east;
    });
}

export async function fetchStationReservations(
    statId: string
): Promise<Array<{
    reserv_id: string;
    user_id: string;
    start_dt: string;
    end_dt: string;
    status: string;
}>> {
    console.log("MOCK API 호출: fetchStationReservations");
    console.log("statId:", statId);

    await mockDelay(400);

    // 충전소 ID에 따라 예약 데이터 반환
    if (statId === "A00001" || statId === "stn-001") {
        return mockReservations;
    }

    // 기본적으로 빈 배열 반환
    return [];
}

// 실제 API와 동일한 인터페이스 유지
export interface Bounds {
    north: number;
    south: number;
    east: number;
    west: number;
}

export interface StationFromAPI {
    stat_id: string;
    stat_nm: string;
    addr: string;
    lat: number;
    lng: number;
}

export interface DistrictStationsResponse {
    city: string;
    regionName: string;
    stations: StationFromAPI[];
}

export interface Reservation {
    reserv_id: string;
    user_id: string;
    start_dt: string;
    end_dt: string;
    status: string;
}

export interface ReservationsResponse {
    stat_id: string;
    reservations: Reservation[];
}

export interface APIError {
    code: string;
    message: string;
}