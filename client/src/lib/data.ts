// EV Charging Platform - Mock Data
// Design: Modern Cartographic Theme - Electric Blue (#2563EB) primary

export interface ChargingStation {
  id: string;
  name: string;
  address: string;
  lat: number;
  lng: number;
  status: "available" | "occupied" | "partial";
  totalSlots: number;
  availableSlots: number;
  chargerTypes: ChargerType[];
  operatingHours: string;
  photo: string;
  rating: number;
  reviewCount: number;
  pricePerKwh: number;
}

export interface ChargerType {
  type: "DC콤보" | "CHAdeMO" | "AC3상" | "AC완속" | "DC차데모";
  count: number;
  maxKw: number;
  available: number;
}

export interface TimeSlot {
  hour: number;
  status: "available" | "occupied" | "selected" | "past" | "reserved";
}

export interface SeoulDistrict {
  name: string;
  lat: number;
  lng: number;
  zoom: number;
}

export const SEOUL_DISTRICTS: SeoulDistrict[] = [
  { name: "강남구", lat: 37.5172, lng: 127.0473, zoom: 14 },
  { name: "강동구", lat: 37.5301, lng: 127.1238, zoom: 14 },
  { name: "강북구", lat: 37.6396, lng: 127.0253, zoom: 14 },
  { name: "강서구", lat: 37.5509, lng: 126.8495, zoom: 14 },
  { name: "관악구", lat: 37.4784, lng: 126.9516, zoom: 14 },
  { name: "광진구", lat: 37.5385, lng: 127.0823, zoom: 14 },
  { name: "구로구", lat: 37.4954, lng: 126.8874, zoom: 14 },
  { name: "금천구", lat: 37.4569, lng: 126.8956, zoom: 14 },
  { name: "노원구", lat: 37.6542, lng: 127.0568, zoom: 14 },
  { name: "도봉구", lat: 37.6688, lng: 127.0471, zoom: 14 },
  { name: "동대문구", lat: 37.5744, lng: 127.0396, zoom: 14 },
  { name: "동작구", lat: 37.5124, lng: 126.9393, zoom: 14 },
  { name: "마포구", lat: 37.5663, lng: 126.9014, zoom: 14 },
  { name: "서대문구", lat: 37.5791, lng: 126.9368, zoom: 14 },
  { name: "서초구", lat: 37.4837, lng: 127.0324, zoom: 14 },
  { name: "성동구", lat: 37.5633, lng: 127.0371, zoom: 14 },
  { name: "성북구", lat: 37.5894, lng: 127.0167, zoom: 14 },
  { name: "송파구", lat: 37.5145, lng: 127.1059, zoom: 14 },
  { name: "양천구", lat: 37.5270, lng: 126.8561, zoom: 14 },
  { name: "영등포구", lat: 37.5264, lng: 126.8963, zoom: 14 },
  { name: "용산구", lat: 37.5311, lng: 126.981, zoom: 14 },
  { name: "은평구", lat: 37.6026, lng: 126.9291, zoom: 14 },
  { name: "종로구", lat: 37.5729, lng: 126.9793, zoom: 14 },
  { name: "중구", lat: 37.564, lng: 126.9975, zoom: 14 },
  { name: "중랑구", lat: 37.6063, lng: 127.0927, zoom: 14 },
];

export const EV_STATIONS: ChargingStation[] = [];
