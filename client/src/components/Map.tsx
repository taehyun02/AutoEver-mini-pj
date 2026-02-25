/**
 * MOCK MAP VIEW - 네이버 지도 연동 전 임시 목업
 * 
 * 나중에 네이버 지도 API 연동 시 이 파일을 수정하면 됩니다.
 * 현재는 서울 지역 배경과 클릭 가능한 마커를 DOM으로 직접 렌더링합니다.
 */

/// <reference types="@types/google.maps" />

import { useEffect, useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { EV_STATIONS, ChargingStation } from "@/lib/data";
import { Zap } from "lucide-react";

declare global {
  interface Window {
    google?: typeof google;
  }
}

// 서울 지도 좌표 범위 (대략적)
const SEOUL_BOUNDS = {
  minLat: 37.42,
  maxLat: 37.72,
  minLng: 126.75,
  maxLng: 127.20,
};

// 좌표를 화면 퍼센트 위치로 변환
function latLngToPercent(lat: number, lng: number) {
  const x = ((lng - SEOUL_BOUNDS.minLng) / (SEOUL_BOUNDS.maxLng - SEOUL_BOUNDS.minLng)) * 100;
  const y = ((SEOUL_BOUNDS.maxLat - lat) / (SEOUL_BOUNDS.maxLat - SEOUL_BOUNDS.minLat)) * 100;
  return { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) };
}

// 상태별 색상
const STATUS_COLORS = {
  available: { bg: "#10b981", border: "#059669", ring: "rgba(16,185,129,0.3)" },
  partial: { bg: "#f59e0b", border: "#d97706", ring: "rgba(245,158,11,0.3)" },
  occupied: { bg: "#ef4444", border: "#dc2626", ring: "rgba(239,68,68,0.3)" },
};

// 목업 Map 객체 (Home.tsx 호환용)
function createMockMap(
  container: HTMLDivElement,
  options: { center: { lat: number; lng: number }; zoom: number }
): google.maps.Map {
  let currentCenter = options.center;
  let currentZoom = options.zoom;
  const listeners: Map<string, Function[]> = new Map();

  const mockMap = {
    getCenter: () => ({ lat: () => currentCenter.lat, lng: () => currentCenter.lng }),
    setCenter: (latLng: { lat: number; lng: number }) => { currentCenter = latLng; },
    panTo: (latLng: { lat: number; lng: number }) => { currentCenter = latLng; },
    getZoom: () => currentZoom,
    setZoom: (zoom: number) => { currentZoom = zoom; },
    addListener: (event: string, callback: Function) => {
      if (!listeners.has(event)) listeners.set(event, []);
      listeners.get(event)!.push(callback);
      return { remove: () => { } };
    },
    getDiv: () => container,
    getBounds: () => ({
      getNorthEast: () => ({ lat: () => SEOUL_BOUNDS.maxLat, lng: () => SEOUL_BOUNDS.maxLng }),
      getSouthWest: () => ({ lat: () => SEOUL_BOUNDS.minLat, lng: () => SEOUL_BOUNDS.minLng }),
    }),
  } as unknown as google.maps.Map;

  return mockMap;
}

// 목업 AdvancedMarkerElement (Home.tsx 호환용)
function setupMockGoogleMaps() {
  if (typeof window !== "undefined" && !window.google) {
    (window as any).google = {
      maps: {
        Map: createMockMap,
        marker: {
          AdvancedMarkerElement: class {
            map: any;
            position: any;
            title: string;
            content: HTMLElement | null;
            private listeners: Map<string, Function[]> = new Map();

            constructor(opts: any) {
              this.map = opts.map;
              this.position = opts.position;
              this.title = opts.title || "";
              this.content = opts.content || null;
            }

            addListener(event: string, callback: Function) {
              if (!this.listeners.has(event)) this.listeners.set(event, []);
              this.listeners.get(event)!.push(callback);
              return { remove: () => { } };
            }
          },
        },
      },
    };
  }
}

interface MapViewProps {
  className?: string;
  initialCenter?: { lat: number; lng: number };
  initialZoom?: number;
  onMapReady?: (map: google.maps.Map) => void;
  onStationClick?: (station: ChargingStation) => void;
}

export function MapView({
  className,
  initialCenter = { lat: 37.5665, lng: 126.9780 },
  initialZoom = 12,
  onMapReady,
  onStationClick,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [hoveredStation, setHoveredStation] = useState<string | null>(null);

  useEffect(() => {
    setupMockGoogleMaps();

    if (containerRef.current && onMapReady) {
      const mockMap = createMockMap(containerRef.current, {
        center: initialCenter,
        zoom: initialZoom,
      });
      onMapReady(mockMap);
    }
  }, []);

  const handleMarkerClick = useCallback((station: ChargingStation) => {
    if (onStationClick) {
      onStationClick(station);
    }
    // Custom event도 발생시켜 Home.tsx에서 처리 가능
    window.dispatchEvent(new CustomEvent("mock-marker-click", { detail: station }));
  }, [onStationClick]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "w-full h-[500px] relative overflow-hidden",
        "bg-gradient-to-br from-slate-200 via-slate-100 to-slate-200",
        className
      )}
      style={{
        backgroundImage: `
          linear-gradient(rgba(148, 163, 184, 0.1) 1px, transparent 1px),
          linear-gradient(90deg, rgba(148, 163, 184, 0.1) 1px, transparent 1px),
          linear-gradient(135deg, #e2e8f0 0%, #f1f5f9 50%, #e2e8f0 100%)
        `,
        backgroundSize: "50px 50px, 50px 50px, 100% 100%",
      }}
    >
      {/* 서울 지역 표시 */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-slate-300 text-[200px] font-bold opacity-20 select-none">
          서울
        </div>
      </div>

      {/* 마커들 */}
      {EV_STATIONS.map((station) => {
        const pos = latLngToPercent(station.lat, station.lng);
        const colors = STATUS_COLORS[station.status];
        const isHovered = hoveredStation === station.id;

        return (
          <div
            key={station.id}
            className="absolute cursor-pointer transition-transform duration-200 z-10"
            style={{
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              transform: `translate(-50%, -100%) ${isHovered ? "scale(1.2)" : "scale(1)"}`,
              zIndex: isHovered ? 100 : 10,
            }}
            onClick={() => handleMarkerClick(station)}
            onMouseEnter={() => setHoveredStation(station.id)}
            onMouseLeave={() => setHoveredStation(null)}
          >
            {/* Ripple 효과 */}
            <div
              className="absolute top-1/2 left-1/2 w-9 h-9 rounded-full pointer-events-none"
              style={{
                transform: "translate(-50%, -50%)",
                background: colors.ring,
                animation: "ripple-anim 2s ease-out infinite",
              }}
            />

            {/* 핀 */}
            <div
              className="relative w-9 h-9 flex items-center justify-center"
              style={{
                borderRadius: "50% 50% 50% 0",
                transform: "rotate(-45deg)",
                background: colors.bg,
                border: `2.5px solid ${colors.border}`,
                boxShadow: `0 4px 12px ${colors.ring}, 0 2px 4px rgba(0,0,0,0.2)`,
              }}
            >
              <div style={{ transform: "rotate(45deg)" }}>
                <Zap className="w-3.5 h-3.5 text-white" fill="white" />
              </div>

              {/* 슬롯 수 배지 */}
              <div
                className="absolute -top-1.5 -right-1.5 w-4.5 h-4.5 rounded-full bg-white flex items-center justify-center text-[10px] font-extrabold"
                style={{
                  border: `1.5px solid ${colors.border}`,
                  color: colors.bg,
                  transform: "rotate(45deg)",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
                }}
              >
                {station.availableSlots}
              </div>
            </div>

            {/* 호버 시 이름 표시 */}
            {isHovered && (
              <div
                className="absolute left-1/2 -bottom-2 whitespace-nowrap px-2 py-1 bg-slate-800 text-white text-xs rounded-md shadow-lg"
                style={{ transform: "translateX(-50%) translateY(100%)" }}
              >
                {station.name}
              </div>
            )}
          </div>
        );
      })}

      {/* Ripple 애니메이션 스타일 */}
      <style>{`
        @keyframes ripple-anim {
          0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.6; }
          100% { transform: translate(-50%, -50%) scale(2); opacity: 0; }
        }
      `}</style>
    </div>
  );
}
