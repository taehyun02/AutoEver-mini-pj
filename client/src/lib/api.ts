// API Functions for EV Charging Station Platform

import { ChargingStation } from "./data";

// API Response Types
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

export interface APIError {
    code: string;
    message: string;
}

// Convert API response to frontend ChargingStation format
export function convertAPIStationToChargingStation(
    apiStation: StationFromAPI
): ChargingStation {
    // 임시로 기본값 할당 (실제 API에서 추가 데이터 제공 시 수정)
    return {
        id: apiStation.stat_id,
        name: apiStation.stat_nm,
        address: apiStation.addr,
        lat: apiStation.lat,
        lng: apiStation.lng,
        status: "available", // 기본값, 실제로는 API에서 받아야 함
        totalSlots: 4,
        availableSlots: 2,
        chargerTypes: [
            { type: "DC콤보", count: 2, maxKw: 100, available: 1 },
            { type: "AC완속", count: 2, maxKw: 7, available: 1 },
        ],
        operatingHours: "24시간 운영",
        photo: "https://private-us-east-1.manuscdn.com/sessionFile/CL30WOLd8pbCUpEbYPccwp/sandbox/EAyGbMG1FHjp60bisLUYbi-img-1_1771996924000_na1fn_ZXYtc3RhdGlvbi1waG90bw.jpg",
        rating: 4.0,
        reviewCount: 50,
        pricePerKwh: 320,
    };
}

// Fetch stations by district name
export async function fetchStationsByDistrict(
    districtName: string
): Promise<ChargingStation[]> {
    const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";

    try {
        const response = await fetch(
            `${API_BASE_URL}/stations?region=${encodeURIComponent(districtName)}`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );

        if (!response.ok) {
            if (response.status === 404) {
                const error = (await response.json()) as APIError;
                throw new Error(error.message || "해당 지역의 충전소를 찾을 수 없습니다.");
            }
            throw new Error("충전소 정보를 불러오는데 실패했습니다.");
        }

        const data = (await response.json()) as DistrictStationsResponse;

        // Convert to frontend format
        return data.stations.map(convertAPIStationToChargingStation);
    } catch (error) {
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("네트워크 오류가 발생했습니다.");
    }
}
