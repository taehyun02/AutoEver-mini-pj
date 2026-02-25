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
  status: "available" | "occupied" | "selected" | "past";
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
  { name: "용산구", lat: 37.5311, lng: 126.9810, zoom: 14 },
  { name: "은평구", lat: 37.6026, lng: 126.9291, zoom: 14 },
  { name: "종로구", lat: 37.5729, lng: 126.9793, zoom: 14 },
  { name: "중구", lat: 37.5640, lng: 126.9975, zoom: 14 },
  { name: "중랑구", lat: 37.6063, lng: 127.0927, zoom: 14 },
];

export const EV_STATIONS: ChargingStation[] = [
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
    photo: "https://private-us-east-1.manuscdn.com/sessionFile/CL30WOLd8pbCUpEbYPccwp/sandbox/EAyGbMG1FHjp60bisLUYbi-img-1_1771996924000_na1fn_ZXYtc3RhdGlvbi1waG90bw.jpg?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvQ0wzMFdPTGQ4cGJDVXBFYllQY2N3cC9zYW5kYm94L0VBeUdiTUcxRkhqcDYwYmlzTFVZYmktaW1nLTFfMTc3MTk5NjkyNDAwMF9uYTFmbl9aWFl0YzNSaGRHbHZiaTF3YUc5MGJ3LmpwZz94LW9zcy1wcm9jZXNzPWltYWdlL3Jlc2l6ZSx3XzE5MjAsaF8xOTIwL2Zvcm1hdCx3ZWJwL3F1YWxpdHkscV84MCIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc5ODc2MTYwMH19fV19&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=lYKhUKagj6izu4H032IF8oiC1-hlwJCk4yh1fxFa44HAbvntV-fDI-zxy1eZ5fRUqi37AqxrL1F7dKK9fBO~2BxAq5A4X3nSfVbiUW6ySA83xn-pyorgMs~ikFqOiMM5yCFq~4y7Z-CZjyMBGI5KFZeIh5YAS8l7149Ht2xZD9RfiqhAC79kfY6KYe85Xaz3s-qFZ9Cgs8bLmbjH~MRj4GMi49-CYtvYcFNUs-eSKaC79eZLZ9hNPj2QQ77MqHB8X1IXr75y-E~-jruq2FADq~AY4zMNNrpli7xl9Ezo1ehoYc0vck2spy31wQe9iKph-M2EVqS3y47uhHLtunrP7g__",
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
    photo: "https://private-us-east-1.manuscdn.com/sessionFile/CL30WOLd8pbCUpEbYPccwp/sandbox/EAyGbMG1FHjp60bisLUYbi-img-1_1771996924000_na1fn_ZXYtc3RhdGlvbi1waG90bw.jpg?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvQ0wzMFdPTGQ4cGJDVXBFYllQY2N3cC9zYW5kYm94L0VBeUdiTUcxRkhqcDYwYmlzTFVZYmktaW1nLTFfMTc3MTk5NjkyNDAwMF9uYTFmbl9aWFl0YzNSaGRHbHZiaTF3YUc5MGJ3LmpwZz94LW9zcy1wcm9jZXNzPWltYWdlL3Jlc2l6ZSx3XzE5MjAsaF8xOTIwL2Zvcm1hdCx3ZWJwL3F1YWxpdHkscV84MCIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc5ODc2MTYwMH19fV19&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=lYKhUKagj6izu4H032IF8oiC1-hlwJCk4yh1fxFa44HAbvntV-fDI-zxy1eZ5fRUqi37AqxrL1F7dKK9fBO~2BxAq5A4X3nSfVbiUW6ySA83xn-pyorgMs~ikFqOiMM5yCFq~4y7Z-CZjyMBGI5KFZeIh5YAS8l7149Ht2xZD9RfiqhAC79kfY6KYe85Xaz3s-qFZ9Cgs8bLmbjH~MRj4GMi49-CYtvYcFNUs-eSKaC79eZLZ9hNPj2QQ77MqHB8X1IXr75y-E~-jruq2FADq~AY4zMNNrpli7xl9Ezo1ehoYc0vck2spy31wQe9iKph-M2EVqS3y47uhHLtunrP7g__",
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
    photo: "https://private-us-east-1.manuscdn.com/sessionFile/CL30WOLd8pbCUpEbYPccwp/sandbox/EAyGbMG1FHjp60bisLUYbi-img-1_1771996924000_na1fn_ZXYtc3RhdGlvbi1waG90bw.jpg?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvQ0wzMFdPTGQ4cGJDVXBFYllQY2N3cC9zYW5kYm94L0VBeUdiTUcxRkhqcDYwYmlzTFVZYmktaW1nLTFfMTc3MTk5NjkyNDAwMF9uYTFmbl9aWFl0YzNSaGRHbHZiaTF3YUc5MGJ3LmpwZz94LW9zcy1wcm9jZXNzPWltYWdlL3Jlc2l6ZSx3XzE5MjAsaF8xOTIwL2Zvcm1hdCx3ZWJwL3F1YWxpdHkscV84MCIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc5ODc2MTYwMH19fV19&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=lYKhUKagj6izu4H032IF8oiC1-hlwJCk4yh1fxFa44HAbvntV-fDI-zxy1eZ5fRUqi37AqxrL1F7dKK9fBO~2BxAq5A4X3nSfVbiUW6ySA83xn-pyorgMs~ikFqOiMM5yCFq~4y7Z-CZjyMBGI5KFZeIh5YAS8l7149Ht2xZD9RfiqhAC79kfY6KYe85Xaz3s-qFZ9Cgs8bLmbjH~MRj4GMi49-CYtvYcFNUs-eSKaC79eZLZ9hNPj2QQ77MqHB8X1IXr75y-E~-jruq2FADq~AY4zMNNrpli7xl9Ezo1ehoYc0vck2spy31wQe9iKph-M2EVqS3y47uhHLtunrP7g__",
    rating: 3.9,
    reviewCount: 54,
    pricePerKwh: 310,
  },
  {
    id: "stn-004",
    name: "종로 광화문 충전소",
    address: "서울 종로구 세종대로 172",
    lat: 37.5759,
    lng: 126.9768,
    status: "available",
    totalSlots: 10,
    availableSlots: 7,
    chargerTypes: [
      { type: "DC콤보", count: 5, maxKw: 200, available: 4 },
      { type: "CHAdeMO", count: 3, maxKw: 50, available: 2 },
      { type: "AC3상", count: 2, maxKw: 11, available: 1 },
    ],
    operatingHours: "24시간 운영",
    photo: "https://private-us-east-1.manuscdn.com/sessionFile/CL30WOLd8pbCUpEbYPccwp/sandbox/EAyGbMG1FHjp60bisLUYbi-img-1_1771996924000_na1fn_ZXYtc3RhdGlvbi1waG90bw.jpg?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvQ0wzMFdPTGQ4cGJDVXBFYllQY2N3cC9zYW5kYm94L0VBeUdiTUcxRkhqcDYwYmlzTFVZYmktaW1nLTFfMTc3MTk5NjkyNDAwMF9uYTFmbl9aWFl0YzNSaGRHbHZiaTF3YUc5MGJ3LmpwZz94LW9zcy1wcm9jZXNzPWltYWdlL3Jlc2l6ZSx3XzE5MjAsaF8xOTIwL2Zvcm1hdCx3ZWJwL3F1YWxpdHkscV84MCIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc5ODc2MTYwMH19fV19&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=lYKhUKagj6izu4H032IF8oiC1-hlwJCk4yh1fxFa44HAbvntV-fDI-zxy1eZ5fRUqi37AqxrL1F7dKK9fBO~2BxAq5A4X3nSfVbiUW6ySA83xn-pyorgMs~ikFqOiMM5yCFq~4y7Z-CZjyMBGI5KFZeIh5YAS8l7149Ht2xZD9RfiqhAC79kfY6KYe85Xaz3s-qFZ9Cgs8bLmbjH~MRj4GMi49-CYtvYcFNUs-eSKaC79eZLZ9hNPj2QQ77MqHB8X1IXr75y-E~-jruq2FADq~AY4zMNNrpli7xl9Ezo1ehoYc0vck2spy31wQe9iKph-M2EVqS3y47uhHLtunrP7g__",
    rating: 4.7,
    reviewCount: 203,
    pricePerKwh: 300,
  },
  {
    id: "stn-005",
    name: "송파 잠실 충전소",
    address: "서울 송파구 올림픽로 240",
    lat: 37.5142,
    lng: 127.1003,
    status: "partial",
    totalSlots: 6,
    availableSlots: 3,
    chargerTypes: [
      { type: "DC콤보", count: 4, maxKw: 100, available: 2 },
      { type: "AC완속", count: 2, maxKw: 7, available: 1 },
    ],
    operatingHours: "07:00 - 23:00",
    photo: "https://private-us-east-1.manuscdn.com/sessionFile/CL30WOLd8pbCUpEbYPccwp/sandbox/EAyGbMG1FHjp60bisLUYbi-img-1_1771996924000_na1fn_ZXYtc3RhdGlvbi1waG90bw.jpg?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvQ0wzMFdPTGQ4cGJDVXBFYllQY2N3cC9zYW5kYm94L0VBeUdiTUcxRkhqcDYwYmlzTFVZYmktaW1nLTFfMTc3MTk5NjkyNDAwMF9uYTFmbl9aWFl0YzNSaGRHbHZiaTF3YUc5MGJ3LmpwZz94LW9zcy1wcm9jZXNzPWltYWdlL3Jlc2l6ZSx3XzE5MjAsaF8xOTIwL2Zvcm1hdCx3ZWJwL3F1YWxpdHkscV84MCIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc5ODc2MTYwMH19fV19&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=lYKhUKagj6izu4H032IF8oiC1-hlwJCk4yh1fxFa44HAbvntV-fDI-zxy1eZ5fRUqi37AqxrL1F7dKK9fBO~2BxAq5A4X3nSfVbiUW6ySA83xn-pyorgMs~ikFqOiMM5yCFq~4y7Z-CZjyMBGI5KFZeIh5YAS8l7149Ht2xZD9RfiqhAC79kfY6KYe85Xaz3s-qFZ9Cgs8bLmbjH~MRj4GMi49-CYtvYcFNUs-eSKaC79eZLZ9hNPj2QQ77MqHB8X1IXr75y-E~-jruq2FADq~AY4zMNNrpli7xl9Ezo1ehoYc0vck2spy31wQe9iKph-M2EVqS3y47uhHLtunrP7g__",
    rating: 4.3,
    reviewCount: 96,
    pricePerKwh: 330,
  },
  {
    id: "stn-006",
    name: "용산 이태원 충전소",
    address: "서울 용산구 이태원로 177",
    lat: 37.5349,
    lng: 126.9947,
    status: "available",
    totalSlots: 5,
    availableSlots: 4,
    chargerTypes: [
      { type: "DC콤보", count: 3, maxKw: 150, available: 3 },
      { type: "AC완속", count: 2, maxKw: 7, available: 1 },
    ],
    operatingHours: "24시간 운영",
    photo: "https://private-us-east-1.manuscdn.com/sessionFile/CL30WOLd8pbCUpEbYPccwp/sandbox/EAyGbMG1FHjp60bisLUYbi-img-1_1771996924000_na1fn_ZXYtc3RhdGlvbi1waG90bw.jpg?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvQ0wzMFdPTGQ4cGJDVXBFYllQY2N3cC9zYW5kYm94L0VBeUdiTUcxRkhqcDYwYmlzTFVZYmktaW1nLTFfMTc3MTk5NjkyNDAwMF9uYTFmbl9aWFl0YzNSaGRHbHZiaTF3YUc5MGJ3LmpwZz94LW9zcy1wcm9jZXNzPWltYWdlL3Jlc2l6ZSx3XzE5MjAsaF8xOTIwL2Zvcm1hdCx3ZWJwL3F1YWxpdHkscV84MCIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc5ODc2MTYwMH19fV19&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=lYKhUKagj6izu4H032IF8oiC1-hlwJCk4yh1fxFa44HAbvntV-fDI-zxy1eZ5fRUqi37AqxrL1F7dKK9fBO~2BxAq5A4X3nSfVbiUW6ySA83xn-pyorgMs~ikFqOiMM5yCFq~4y7Z-CZjyMBGI5KFZeIh5YAS8l7149Ht2xZD9RfiqhAC79kfY6KYe85Xaz3s-qFZ9Cgs8bLmbjH~MRj4GMi49-CYtvYcFNUs-eSKaC79eZLZ9hNPj2QQ77MqHB8X1IXr75y-E~-jruq2FADq~AY4zMNNrpli7xl9Ezo1ehoYc0vck2spy31wQe9iKph-M2EVqS3y47uhHLtunrP7g__",
    rating: 4.1,
    reviewCount: 72,
    pricePerKwh: 340,
  },
  {
    id: "stn-007",
    name: "영등포 타임스퀘어 충전소",
    address: "서울 영등포구 영중로 15",
    lat: 37.5170,
    lng: 126.9016,
    status: "partial",
    totalSlots: 8,
    availableSlots: 3,
    chargerTypes: [
      { type: "DC콤보", count: 4, maxKw: 200, available: 2 },
      { type: "CHAdeMO", count: 2, maxKw: 50, available: 1 },
      { type: "AC완속", count: 2, maxKw: 7, available: 0 },
    ],
    operatingHours: "10:00 - 22:00",
    photo: "https://private-us-east-1.manuscdn.com/sessionFile/CL30WOLd8pbCUpEbYPccwp/sandbox/EAyGbMG1FHjp60bisLUYbi-img-1_1771996924000_na1fn_ZXYtc3RhdGlvbi1waG90bw.jpg?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvQ0wzMFdPTGQ4cGJDVXBFYllQY2N3cC9zYW5kYm94L0VBeUdiTUcxRkhqcDYwYmlzTFVZYmktaW1nLTFfMTc3MTk5NjkyNDAwMF9uYTFmbl9aWFl0YzNSaGRHbHZiaTF3YUc5MGJ3LmpwZz94LW9zcy1wcm9jZXNzPWltYWdlL3Jlc2l6ZSx3XzE5MjAsaF8xOTIwL2Zvcm1hdCx3ZWJwL3F1YWxpdHkscV84MCIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc5ODc2MTYwMH19fV19&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=lYKhUKagj6izu4H032IF8oiC1-hlwJCk4yh1fxFa44HAbvntV-fDI-zxy1eZ5fRUqi37AqxrL1F7dKK9fBO~2BxAq5A4X3nSfVbiUW6ySA83xn-pyorgMs~ikFqOiMM5yCFq~4y7Z-CZjyMBGI5KFZeIh5YAS8l7149Ht2xZD9RfiqhAC79kfY6KYe85Xaz3s-qFZ9Cgs8bLmbjH~MRj4GMi49-CYtvYcFNUs-eSKaC79eZLZ9hNPj2QQ77MqHB8X1IXr75y-E~-jruq2FADq~AY4zMNNrpli7xl9Ezo1ehoYc0vck2spy31wQe9iKph-M2EVqS3y47uhHLtunrP7g__",
    rating: 4.0,
    reviewCount: 61,
    pricePerKwh: 325,
  },
  {
    id: "stn-008",
    name: "노원 중계 충전소",
    address: "서울 노원구 동일로 1325",
    lat: 37.6543,
    lng: 127.0683,
    status: "available",
    totalSlots: 6,
    availableSlots: 6,
    chargerTypes: [
      { type: "DC콤보", count: 4, maxKw: 100, available: 4 },
      { type: "AC완속", count: 2, maxKw: 7, available: 2 },
    ],
    operatingHours: "24시간 운영",
    photo: "https://private-us-east-1.manuscdn.com/sessionFile/CL30WOLd8pbCUpEbYPccwp/sandbox/EAyGbMG1FHjp60bisLUYbi-img-1_1771996924000_na1fn_ZXYtc3RhdGlvbi1waG90bw.jpg?x-oss-process=image/resize,w_1920,h_1920/format,webp/quality,q_80&Expires=1798761600&Policy=eyJTdGF0ZW1lbnQiOlt7IlJlc291cmNlIjoiaHR0cHM6Ly9wcml2YXRlLXVzLWVhc3QtMS5tYW51c2Nkbi5jb20vc2Vzc2lvbkZpbGUvQ0wzMFdPTGQ4cGJDVXBFYllQY2N3cC9zYW5kYm94L0VBeUdiTUcxRkhqcDYwYmlzTFVZYmktaW1nLTFfMTc3MTk5NjkyNDAwMF9uYTFmbl9aWFl0YzNSaGRHbHZiaTF3YUc5MGJ3LmpwZz94LW9zcy1wcm9jZXNzPWltYWdlL3Jlc2l6ZSx3XzE5MjAsaF8xOTIwL2Zvcm1hdCx3ZWJwL3F1YWxpdHkscV84MCIsIkNvbmRpdGlvbiI6eyJEYXRlTGVzc1RoYW4iOnsiQVdTOkVwb2NoVGltZSI6MTc5ODc2MTYwMH19fV19&Key-Pair-Id=K2HSFNDJXOU9YS&Signature=lYKhUKagj6izu4H032IF8oiC1-hlwJCk4yh1fxFa44HAbvntV-fDI-zxy1eZ5fRUqi37AqxrL1F7dKK9fBO~2BxAq5A4X3nSfVbiUW6ySA83xn-pyorgMs~ikFqOiMM5yCFq~4y7Z-CZjyMBGI5KFZeIh5YAS8l7149Ht2xZD9RfiqhAC79kfY6KYe85Xaz3s-qFZ9Cgs8bLmbjH~MRj4GMi49-CYtvYcFNUs-eSKaC79eZLZ9hNPj2QQ77MqHB8X1IXr75y-E~-jruq2FADq~AY4zMNNrpli7xl9Ezo1ehoYc0vck2spy31wQe9iKph-M2EVqS3y47uhHLtunrP7g__",
    rating: 4.4,
    reviewCount: 45,
    pricePerKwh: 295,
  },
];

// Generate time slots for a station (mock data)
export function generateTimeSlots(stationId: string): TimeSlot[] {
  const now = new Date();
  const currentHour = now.getHours();

  // Seed-based pseudo-random for consistent demo data per station
  const seed = stationId.charCodeAt(stationId.length - 1);

  return Array.from({ length: 24 }, (_, i) => {
    // 현재 시간보다 이전의 모든 시간은 '지남'으로 표시
    if (i < currentHour) return { hour: i, status: "past" };
    // 현재 시간은 예약 불가 처리 (진행 중)
    if (i === currentHour) return { hour: i, status: "occupied" };

    // Pseudo-random based on hour + seed
    const rand = ((i * 7 + seed * 13) % 10) / 10;
    if (rand < 0.3) return { hour: i, status: "occupied" };
    return { hour: i, status: "available" };
  });
}
