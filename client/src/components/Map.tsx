/**
 * Naver Map View Component
 * 
 * Integrates Naver Maps API to display EV charging stations
 * with interactive markers and responsive controls
 */

import { useEffect, useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { ChargingStation } from "@/lib/data";

declare global {
  interface Window {
    naver?: any;
  }
}

interface MapViewProps {
  className?: string;
  initialCenter?: { lat: number; lng: number };
  initialZoom?: number;
  stations?: ChargingStation[];
  onMapReady?: (map: any) => void;
  onStationClick?: (station: ChargingStation) => void;
}

const STATUS_COLORS = {
  available: { bg: "#10b981", border: "#059669", text: "#fff", ring: "rgba(16,185,129,0.3)" },
  partial: { bg: "#f59e0b", border: "#d97706", text: "#fff", ring: "rgba(245,158,11,0.3)" },
  occupied: { bg: "#ef4444", border: "#dc2626", text: "#fff", ring: "rgba(239,68,68,0.3)" },
};

export function MapView({
  className,
  initialCenter = { lat: 37.5665, lng: 126.9780 },
  initialZoom = 12,
  stations = [],
  onMapReady,
  onStationClick,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [hoveredStation, setHoveredStation] = useState<string | null>(null);

  // Initialize map when Naver Maps API is available
  useEffect(() => {
    const checkNaverMaps = () => {
      if (typeof window !== "undefined" && window.naver?.maps) {
        if (containerRef.current && !mapRef.current) {
          const mapOptions = {
            center: new window.naver.maps.LatLng(initialCenter.lat, initialCenter.lng),
            zoom: initialZoom,
            minZoom: 10,
            maxZoom: 18,
            disableKineticPan: false,
          };

          const map = new window.naver.maps.Map(containerRef.current, mapOptions);
          mapRef.current = map;
          setMapLoaded(true);

          if (onMapReady) {
            onMapReady(map);
          }

          // Add markers for all stations
          addMarkers(map);
        }
      } else if (typeof window !== "undefined" && !window.naver) {
        // Naver Maps not loaded yet, try again
        setTimeout(checkNaverMaps, 100);
      }
    };

    checkNaverMaps();
  }, [initialCenter, initialZoom, onMapReady]);

  const createMarkerContent = (station: ChargingStation, isHovered: boolean = false) => {
    const colors = STATUS_COLORS[station.status];
    const container = document.createElement("div");
    container.style.cssText = `
      position: relative;
      cursor: pointer;
      transition: transform 0.2s ease;
      transform: ${isHovered ? "scale(1.2)" : "scale(1)"};
    `;

    // Ripple effect
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

    // Pin body
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

    // Icon
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

    // Badge
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
    container.appendChild(ripple);
    container.appendChild(pin);

    return container;
  };

  const addMarkers = useCallback((map: any) => {
    // Clear existing markers
    markersRef.current.forEach((marker: any) => marker.setMap(null));
    markersRef.current = [];

    // Add style for ripple animation if not already added
    if (!document.getElementById("naver-map-ripple-style")) {
      const styleElement = document.createElement("style");
      styleElement.id = "naver-map-ripple-style";
      styleElement.textContent = `
        @keyframes ripple-anim {
          0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.6; }
          100% { transform: translate(-50%, -50%) scale(2); opacity: 0; }
        }
      `;
      document.head.appendChild(styleElement);
    }

    // Create markers for each station
    stations.forEach((station) => {
      const position = new window.naver.maps.LatLng(station.lat, station.lng);
      const markerContent = createMarkerContent(station, hoveredStation === station.id);

      const marker = new window.naver.maps.Marker({
        position,
        map,
        icon: {
          content: markerContent,
          anchor: new window.naver.maps.Point(18, 36),
        },
        title: station.name,
      });

      // Click event
      window.naver.maps.Event.addListener(marker, "click", () => {
        if (onStationClick) {
          onStationClick(station);
        }
        // Dispatch custom event for marker click
        window.dispatchEvent(new CustomEvent("naver-marker-click", { detail: station }));
      });

      // Mouse over/out for hover effect
      window.naver.maps.Event.addListener(marker, "mouseover", () => {
        setHoveredStation(station.id);
        const newContent = createMarkerContent(station, true);
        marker.setIcon({
          content: newContent,
          anchor: new window.naver.maps.Point(18, 36),
        });
      });

      window.naver.maps.Event.addListener(marker, "mouseout", () => {
        setHoveredStation(null);
        const newContent = createMarkerContent(station, false);
        marker.setIcon({
          content: newContent,
          anchor: new window.naver.maps.Point(18, 36),
        });
      });

      markersRef.current.push(marker);
    });
  }, [stations, onStationClick, hoveredStation]);

  // Update markers when map is loaded or stations change
  useEffect(() => {
    if (mapLoaded && mapRef.current) {
      addMarkers(mapRef.current);
    }
  }, [mapLoaded, addMarkers]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "w-full h-full relative overflow-hidden bg-slate-100",
        className
      )}
    />
  );
}

