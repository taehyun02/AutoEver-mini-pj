import { useRef, useState, useEffect, useCallback } from "react";
import { MapView } from "@/components/Map";
import DistrictDropdown from "@/components/DistrictDropdown";
import StationModal from "@/components/StationModal";
import { ChargingStation, SeoulDistrict } from "@/lib/data";
import { fetchStationsByDistrict } from "@/lib/api";
import { Zap, Search, Layers, Navigation, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function Home() {
  const mapRef = useRef<any>(null);
  const [selectedStation, setSelectedStation] = useState<ChargingStation | null>(null);
  const [selectedDistrict, setSelectedDistrict] = useState<SeoulDistrict | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [stations, setStations] = useState<ChargingStation[]>([]); // 초기값으로 빈 배열 사용
  const fetchTimeoutRef = useRef<number | null>(null);
  const [isLoadingStations, setIsLoadingStations] = useState(false);

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

  const handleDistrictSelect = useCallback(async (district: SeoulDistrict) => {
    setSelectedDistrict(district);
    if (mapRef.current) {
      mapRef.current.setCenter({ lat: district.lat, lng: district.lng });
      mapRef.current.setZoom(district.zoom);
    }
    setIsLoadingStations(true);
    try {
      const fetched = await fetchStationsByDistrict(district.name);
      setStations(fetched ?? []);
    } catch (err) {
      toast.error("충전소 정보를 불러오는데 실패했습니다.");
      setStations([]);
    } finally {
      setIsLoadingStations(false);
    }
  }, []);



  // cleanup timer when unmounting
  useEffect(() => {
    return () => {
      if (fetchTimeoutRef.current) {
        window.clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, []);

  const handleMyLocation = useCallback(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          if (mapRef.current) {
            mapRef.current.setCenter({ lat: latitude, lng: longitude });
            mapRef.current.setZoom(15);
          }
          // Request Map to start continuous geolocation (show marker)
          try {
            window.dispatchEvent(new CustomEvent("naver-start-geolocation"));
          } catch (e) { }
          toast.success("현재 위치로 이동했습니다");
        },
        () => {
          // Fallback to Seoul center
          if (mapRef.current) {
            mapRef.current.setCenter({ lat: 37.5665, lng: 126.9780 });
            mapRef.current.setZoom(12);
          }
          try {
            window.dispatchEvent(new CustomEvent("naver-stop-geolocation"));
          } catch (e) { }
          toast.info("위치 권한이 없어 서울 중심으로 이동합니다");
        }
      );
    }
  }, []);

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-100">
      {/* ─── Full-Screen Map ─── */}
      <MapView
        className="absolute inset-0 w-full h-full"
        initialCenter={{ lat: 37.5665, lng: 126.9780 }}
        initialZoom={12}
        stations={stations}
        onMapReady={handleMapReady}
      />

      {/* ─── Top Left Controls ─── */}
      <div className="absolute top-4 left-4 z-[1000] flex flex-col gap-2">
        {/* Brand Logo */}
        <div className="flex items-center gap-2.5 px-3.5 py-2 bg-blue-600 rounded-xl shadow-lg shadow-blue-500/30">
          <div className="w-6 h-6 bg-white/20 rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" fill="white" />
          </div>
          <div>
            <div className="text-white font-bold text-sm leading-none">Watt-up</div>
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
      <div className="absolute top-4 right-4 z-[1000] flex flex-col gap-2">
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

      {/* ─── Map Loading Overlay ─── */}
      {!mapReady && (
        <div className="absolute inset-0 z-[1100] bg-slate-100 flex items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-xl shadow-blue-300">
              <Zap className="w-8 h-8 text-white" fill="white" />
            </div>
            <div className="text-center">
              <div className="text-lg font-bold text-slate-800">Watt-up</div>
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

      {/* ─── Stations Fetching Indicator ─── */}
      {isLoadingStations && (
        <div className="absolute bottom-4 left-1/2 z-[1050] -translate-x-1/2 transform">
          <div className="px-3 py-1 bg-white/90 rounded-lg shadow">충전소 정보를 불러오는 중...</div>
        </div>
      )}

      {/* ─── Station Detail Modal (Right Slide-in) ─── */}
      {selectedStation && (
        <>
          {/* Backdrop */}
          <div
            className="absolute inset-0 z-[1150] bg-black/10 backdrop-blur-[1px]"
            onClick={() => setSelectedStation(null)}
          />
          <div className="absolute inset-y-0 right-0 z-[1200]">
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
