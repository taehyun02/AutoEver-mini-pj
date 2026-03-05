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
            `${API_BASE_URL}/wattup/map/${districtName}`,
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

// Fetch stations inside given viewport bounds to avoid loading entire dataset
export interface Bounds {
    north: number;
    south: number;
    east: number;
    west: number;
}

export async function fetchStationsInBounds(
    bounds: Bounds
): Promise<ChargingStation[]> {
    const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";
    const { north, south, east, west } = bounds;

    try {
        const response = await fetch(
            `${API_BASE_URL}/wattup/map/bounds?north=${north}&south=${south}&east=${east}&west=${west}`,
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            }
        );

        if (!response.ok) {
            throw new Error("충전소 정보를 불러오는데 실패했습니다.");
        }

        const data = (await response.json()) as { stations: StationFromAPI[] };
        return data.stations.map(convertAPIStationToChargingStation);
    } catch (error) {
        if (error instanceof Error) {
            throw error;
        }
        throw new Error("네트워크 오류가 발생했습니다.");
    }
}

// Generate mock reservation data for testing
function generateMockReservations(statId: string): Reservation[] {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return [
        {
            reserv_id: `MOCK-${statId}-001`,
            user_id: "010-1234-5678",
            start_dt: new Date(today.getTime() + 9 * 60 * 60 * 1000).toISOString(),
            end_dt: new Date(today.getTime() + 11 * 60 * 60 * 1000).toISOString(),
            status: "active",
        },
        {
            reserv_id: `MOCK-${statId}-002`,
            user_id: "010-2345-6789",
            start_dt: new Date(today.getTime() + 14 * 60 * 60 * 1000).toISOString(),
            end_dt: new Date(today.getTime() + 16 * 60 * 60 * 1000).toISOString(),
            status: "active",
        },
        {
            reserv_id: `MOCK-${statId}-003`,
            user_id: "010-3456-7890",
            start_dt: new Date(today.getTime() + 18 * 60 * 60 * 1000).toISOString(),
            end_dt: new Date(today.getTime() + 20 * 60 * 60 * 1000).toISOString(),
            status: "active",
        },
    ];
}

// Fetch reservations for a specific station
export async function fetchStationReservations(
    statId: string
): Promise<Reservation[]> {
    const API_BASE_URL = import.meta.env.VITE_API_URL || "/api";
    const url = `${API_BASE_URL}/wattup/stations/${statId}/reservations`;

    try {
        console.log(`Fetching reservations from: ${url}`);

        const response = await fetch(url, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        console.log(`Response status: ${response.status}, OK: ${response.ok}`);

        if (!response.ok) {
            if (response.status === 404) {
                console.warn(`No reservations found for station ${statId}, using mock data`);
                return generateMockReservations(statId);
            }

            // Try to get error details
            const contentType = response.headers.get("content-type");
            if (contentType?.includes("application/json")) {
                try {
                    const errorData = await response.json();
                    console.error("API Error Response:", errorData);
                    console.log("Using mock data instead");
                    return generateMockReservations(statId);
                } catch {
                    console.log("Using mock data instead");
                    return generateMockReservations(statId);
                }
            } else {
                const textResponse = await response.text();
                console.error("Non-JSON Response:", textResponse.substring(0, 200));
                console.log("Using mock data instead");
                return generateMockReservations(statId);
            }
        }

        const contentType = response.headers.get("content-type");
        if (!contentType?.includes("application/json")) {
            const textResponse = await response.text();
            console.error("Expected JSON but got:", textResponse.substring(0, 200));
            console.log("Using mock data instead");
            return generateMockReservations(statId);
        }

        const data = (await response.json()) as ReservationsResponse;
        console.log(`Successfully loaded ${data.reservations.length} reservations`);
        return data.reservations;
    } catch (error) {
        console.error("Reservation fetch error:", error);
        console.log("Using mock data instead");
        return generateMockReservations(statId);
    }
}
