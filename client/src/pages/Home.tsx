// Home.tsx - EV Charging Station Reservation Platform
// Design: Modern Cartographic Theme
// - Full-screen Naver Map as background
// - Floating UI panels over the map
// - Left top: District dropdown
// - Right side: Station detail modal (slide-in)
// - Map pins with status colors and pulse animation

declare global {
  interface Window {
    naver?: any;
  }
}

import { useRef, useState, useEffect, useCallback } from "react";
import { MapView } from "@/components/Map";
import DistrictDropdown from "@/components/DistrictDropdown";
import StationModal from "@/components/StationModal";
import { EV_STATIONS, SEOUL_DISTRICTS, ChargingStation, SeoulDistrict } from "@/lib/data";
import { Zap, Search, Layers, Navigation, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function Home() {
  const mapRef = useRef<any>(null); // naver.maps.Map
  const [selectedStation, setSelectedStation] = useState<ChargingStation | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<SeoulDistrict | null>(null);
  const [mapReady, setMapReady] = useState(false);

  // Listen for marker click events from MapView
  useEffect(() => {
    const handleMarkerClick = (e: CustomEvent<ChargingStation>) => {
      setSelectedStation(e.detail);
    };
    window.addEventListener("naver-marker-click", handleMarkerClick as EventListener);
    return () => {
      window.removeEventListener("naver-marker-click", handleMarkerClick as EventListener);
    };
  }, []);

  // Create custom pin element
  const handleMapReady = useCallback((map: any) => {
    mapRef.current = map;
    setMapReady(true);
  }, []);

  const handleDistrictSelect = useCallback((district: SeoulDistrict) => {
    setSelectedDistrict(district);
    if (mapRef.current && window.naver) {
      mapRef.current.setCenter(new window.naver.maps.LatLng(district.lat, district.lng));
      mapRef.current.setZoom(district.zoom);
    }
    toast.success(`${district.name}으로 이동했습니다`, {
      description: `해당 지역의 충전소를 확인하세요`,
      duration: 2000,
    });
  }, []);

  const handleMyLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          if (mapRef.current && window.naver) {
            mapRef.current.setCenter(new window.naver.maps.LatLng(latitude, longitude));
            mapRef.current.setZoom(15);
          }
          toast.success("현재 위치로 이동했습니다");
        },
        () => {
          // Fallback to Seoul center
          if (mapRef.current && window.naver) {
            mapRef.current.setCenter(new window.naver.maps.LatLng(37.5665, 126.9780));
            mapRef.current.setZoom(12);
          }
          toast.info("위치 권한이 없어 서울 중심으로 이동합니다");
        }
      );
    }
  }, []);

  const stationCounts = {
    available: EV_STATIONS.filter(s => s.status === "available").length,
    partial: EV_STATIONS.filter(s => s.status === "partial").length,
    occupied: EV_STATIONS.filter(s => s.status === "occupied").length,
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-100">
      {/* ─── Full-Screen Map ─── */}
      <MapView
        className="absolute inset-0 w-full h-full"
        initialCenter={{ lat: 37.5665, lng: 126.9780 }}
        initialZoom={12}
        onMapReady={handleMapReady}
      />

      {/* ─── Top Left Controls ─── */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
        {/* Brand Logo */}
        <div className="flex items-center gap-2.5 px-3.5 py-2 bg-blue-600 rounded-xl shadow-lg shadow-blue-500/30">
          <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" fill="white" />
          </div>
          <div>
            <div className="text-white font-bold text-sm leading-none">ChargeNow</div>
            <div className="text-blue-200 text-[10px] leading-none mt-0.5">전기차 충전소 예약</div>
          </div>
        </div>

        {/* District Dropdown */}
        <DistrictDropdown
          selectedDistrict={selectedDistrict}
          onSelect={handleDistrictSelect}
        />
      </div>

      {/* ─── Top Right Controls ─── */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
        {/* Search Button */}
        <button
          onClick={() => toast.info("검색 기능은 준비 중입니다")}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/95 backdrop-blur-md shadow-lg border border-white/60 text-slate-600 hover:text-blue-600 hover:bg-white transition-all duration-200 hover:shadow-xl"
        >
          <Search className="w-4.5 h-4.5" />
        </button>

        {/* My Location */}
        <button
          onClick={handleMyLocation}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/95 backdrop-blur-md shadow-lg border border-white/60 text-slate-600 hover:text-blue-600 hover:bg-white transition-all duration-200 hover:shadow-xl"
        >
          <Navigation className="w-4.5 h-4.5" />
        </button>

        {/* Layers */}
        <button
          onClick={() => toast.info("레이어 기능은 준비 중입니다")}
          className="w-10 h-10 flex items-center justify-center rounded-xl bg-white/95 backdrop-blur-md shadow-lg border border-white/60 text-slate-600 hover:text-blue-600 hover:bg-white transition-all duration-200 hover:shadow-xl"
        >
          <Layers className="w-4.5 h-4.5" />
        </button>
      </div>

      {/* ─── Bottom Status Bar ─── */}
      <div className="absolute bottom-6 left-4 z-20">
        <div
          className="flex items-center gap-1 px-4 py-2.5 rounded-2xl bg-white/95 backdrop-blur-md shadow-xl border border-white/60"
          style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.12)" }}
        >
          {/* Total count */}
          <div className="flex items-center gap-1.5 pr-3 border-r border-slate-200">
            <Zap className="w-3.5 h-3.5 text-blue-600" fill="currentColor" />
            <span className="text-xs font-bold text-slate-700">충전소 {EV_STATIONS.length}개</span>
          </div>

          {/* Available */}
          <div className="flex items-center gap-1.5 px-3 border-r border-slate-200">
            <div className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-xs text-slate-600">이용가능 <strong className="text-emerald-600">{stationCounts.available}</strong></span>
          </div>

          {/* Partial */}
          <div className="flex items-center gap-1.5 px-3 border-r border-slate-200">
            <div className="w-2 h-2 rounded-full bg-amber-500" />
            <span className="text-xs text-slate-600">일부가능 <strong className="text-amber-600">{stationCounts.partial}</strong></span>
          </div>

          {/* Occupied */}
          <div className="flex items-center gap-1.5 pl-3">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-xs text-slate-600">만석 <strong className="text-red-600">{stationCounts.occupied}</strong></span>
          </div>
        </div>
      </div>

      {/* ─── Map Loading Overlay ─── */}
      {!mapReady && (
        <div className="absolute inset-0 z-40 bg-slate-100 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-300">
              <Zap className="w-8 h-8 text-white" fill="white" />
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-slate-800">ChargeNow</div>
              <div className="text-sm text-slate-500 mt-1">지도를 불러오는 중...</div>
            </div>
            <div className="flex gap-1">
              {[0, 1, 2].map(i => (
                <div
                  key={i}
                  className="w-2 h-2 rounded-full bg-blue-500"
                  style={{
                    animation: `bounce 1.2s ease-in-out ${i * 0.2}s infinite`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─── Station Detail Modal (Right Slide-in) ─── */}
      {selectedStation && (
        <>
          {/* Backdrop */}
          <div
            className="absolute inset-0 z-40 bg-black/10 backdrop-blur-[1px]"
            onClick={() => setSelectedStation(null)}
          />
          <div className="absolute inset-y-0 right-0 z-50">
            <StationModal
              station={selectedStation}
              onClose={() => setSelectedStation(null)}
            />
          </div>
        </>
      )}

      {/* ─── Bounce animation style ─── */}
      <style>{`
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0.8); opacity: 0.5; }
          40% { transform: scale(1.2); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
