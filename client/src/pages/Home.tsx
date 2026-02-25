// Home.tsx - EV Charging Station Reservation Platform
// Design: Modern Cartographic Theme
// - Full-screen Google Map as background
// - Floating UI panels over the map
// - Left top: District dropdown
// - Right side: Station detail modal (slide-in)
// - Map pins with status colors and pulse animation

import { useRef, useState, useEffect, useCallback } from "react";
import { MapView } from "@/components/Map";
import DistrictDropdown from "@/components/DistrictDropdown";
import StationModal from "@/components/StationModal";
import { EV_STATIONS, SEOUL_DISTRICTS, ChargingStation, SeoulDistrict } from "@/lib/data";
import { Zap, Search, Layers, Navigation, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

// Status color map for pins
const PIN_STATUS_COLORS = {
  available: { bg: "#10b981", border: "#059669", text: "#fff", ring: "rgba(16,185,129,0.3)" },
  partial: { bg: "#f59e0b", border: "#d97706", text: "#fff", ring: "rgba(245,158,11,0.3)" },
  occupied: { bg: "#ef4444", border: "#dc2626", text: "#fff", ring: "rgba(239,68,68,0.3)" },
};

export default function Home() {
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const [selectedStation, setSelectedStation] = useState<ChargingStation | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<SeoulDistrict | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [hoveredStation, setHoveredStation] = useState<string | null>(null);

  // 목업 마커 클릭 이벤트 수신
  useEffect(() => {
    const handleMockMarkerClick = (e: CustomEvent<ChargingStation>) => {
      setSelectedStation(e.detail);
    };
    window.addEventListener("mock-marker-click", handleMockMarkerClick as EventListener);
    return () => {
      window.removeEventListener("mock-marker-click", handleMockMarkerClick as EventListener);
    };
  }, []);

  // Create custom pin element
  const createPinElement = useCallback((station: ChargingStation, isHovered = false) => {
    const colors = PIN_STATUS_COLORS[station.status];
    const wrapper = document.createElement("div");
    wrapper.style.cssText = `
      position: relative;
      cursor: pointer;
      transition: transform 0.2s ease;
      transform: ${isHovered ? "scale(1.2)" : "scale(1)"};
    `;

    // Ripple ring
    const ripple = document.createElement("div");
    ripple.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 36px;
      height: 36px;
      border-radius: 50%;
      background: ${colors.ring};
      animation: ripple-anim 2s ease-out infinite;
      pointer-events: none;
    `;

    // Main pin body
    const pin = document.createElement("div");
    pin.style.cssText = `
      position: relative;
      width: 36px;
      height: 36px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      background: ${colors.bg};
      border: 2.5px solid ${colors.border};
      box-shadow: 0 4px 12px ${colors.ring}, 0 2px 4px rgba(0,0,0,0.2);
      display: flex;
      align-items: center;
      justify-content: center;
      transition: all 0.2s ease;
    `;

    // Icon inside pin
    const icon = document.createElement("div");
    icon.style.cssText = `
      transform: rotate(45deg);
      color: ${colors.text};
      font-size: 14px;
      font-weight: bold;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
    `;
    icon.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`;

    // Slot count badge
    const badge = document.createElement("div");
    badge.style.cssText = `
      position: absolute;
      top: -6px;
      right: -6px;
      width: 18px;
      height: 18px;
      border-radius: 50%;
      background: white;
      border: 1.5px solid ${colors.border};
      color: ${colors.bg};
      font-size: 10px;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Pretendard', sans-serif;
      transform: rotate(45deg);
      box-shadow: 0 1px 4px rgba(0,0,0,0.15);
    `;
    badge.textContent = String(station.availableSlots);

    pin.appendChild(icon);
    pin.appendChild(badge);
    wrapper.appendChild(ripple);
    wrapper.appendChild(pin);

    return wrapper;
  }, []);

  const handleMapReady = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    setMapReady(true);

    // Add ripple animation style
    const style = document.createElement("style");
    style.textContent = `
      @keyframes ripple-anim {
        0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.6; }
        100% { transform: translate(-50%, -50%) scale(2); opacity: 0; }
      }
    `;
    document.head.appendChild(style);

    // Place markers for all stations
    EV_STATIONS.forEach((station) => {
      const pinEl = createPinElement(station);

      const marker = new google.maps.marker.AdvancedMarkerElement({
        map,
        position: { lat: station.lat, lng: station.lng },
        title: station.name,
        content: pinEl,
      });

      marker.addListener("click", () => {
        setSelectedStation(station);
      });

      // Hover effects
      marker.addListener("mouseover", () => {
        setHoveredStation(station.id);
        (marker.content as HTMLElement).style.transform = "scale(1.2)";
        (marker.content as HTMLElement).style.zIndex = "100";
      });

      marker.addListener("mouseout", () => {
        setHoveredStation(null);
        (marker.content as HTMLElement).style.transform = "scale(1)";
        (marker.content as HTMLElement).style.zIndex = "1";
      });

      markersRef.current.push(marker);
    });
  }, [createPinElement]);

  const handleDistrictSelect = useCallback((district: SeoulDistrict) => {
    setSelectedDistrict(district);
    if (mapRef.current) {
      mapRef.current.panTo({ lat: district.lat, lng: district.lng });
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
          mapRef.current?.panTo({ lat: latitude, lng: longitude });
          mapRef.current?.setZoom(15);
          toast.success("현재 위치로 이동했습니다");
        },
        () => {
          // Fallback to Seoul center
          mapRef.current?.panTo({ lat: 37.5665, lng: 126.9780 });
          mapRef.current?.setZoom(12);
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
