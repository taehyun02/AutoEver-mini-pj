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
  const currentLocationMarkerRef = useRef<any>(null);
  const geoWatchIdRef = useRef<number | null>(null);
  const accuracyCircleRef = useRef<any>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [hoveredStation, setHoveredStation] = useState<string | null>(null);
  const [currentZoom, setCurrentZoom] = useState(initialZoom);

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

          // Listen to zoom changes
          window.naver.maps.Event.addListener(map, "zoom_changed", () => {
            setCurrentZoom(map.getZoom());
          });

          if (onMapReady) {
            onMapReady(map);
          }

          // Add markers for all stations
          addMarkers(map, map.getZoom());

          // Start geolocation marker
          startGeolocation(map);
        }
      } else if (typeof window !== "undefined" && !window.naver) {
        // Naver Maps not loaded yet, try again
        setTimeout(checkNaverMaps, 100);
      }
    };

    checkNaverMaps();
    // Listen for external start/stop geolocation requests
    const handleStart = () => {
      if (mapRef.current) startGeolocation(mapRef.current);
    };
    const handleStop = () => {
      stopGeolocation();
    };

    window.addEventListener("naver-start-geolocation", handleStart);
    window.addEventListener("naver-stop-geolocation", handleStop);

    return () => {
      // cleanup geolocation on unmount
      stopGeolocation();
      window.removeEventListener("naver-start-geolocation", handleStart);
      window.removeEventListener("naver-stop-geolocation", handleStop);
    };
  }, [initialCenter, initialZoom, onMapReady]);

  const createIndividualMarkerContent = (station: ChargingStation, isHovered: boolean = false) => {
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

    // Number
    const numberDisplay = document.createElement("div");
    numberDisplay.style.cssText = `
      transform: rotate(45deg);
      color: ${colors.text};
      font-size: 16px;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      font-family: 'Pretendard', sans-serif;
    `;
    numberDisplay.textContent = String(station.availableSlots);

    pin.appendChild(numberDisplay);
    container.appendChild(ripple);
    container.appendChild(pin);

    return container;
  };

  const createClusterMarkerContent = (availableStationCount: number, totalStationCount: number, zoom: number) => {
    // Determine marker size based on zoom
    let size = 36;
    if (zoom >= 12) size = 36;
    else if (zoom >= 11) size = 32;
    else size = 28;

    const container = document.createElement("div");
    container.style.cssText = `
      position: relative;
      cursor: pointer;
    `;

    // Determine color based on available station count (User-friendly logic)
    let colors = STATUS_COLORS.available;
    if (availableStationCount === 0) {
      colors = STATUS_COLORS.occupied;
    } else if (availableStationCount <= 2 || (availableStationCount / totalStationCount) < 0.3) {
      // 만약 이용 가능한 곳이 2개 이하이거나 전체의 30% 미만이면 주의(주황색) 표시
      colors = STATUS_COLORS.partial;
    } else {
      colors = STATUS_COLORS.available;
    }

    // Ripple effect
    const ripple = document.createElement("div");
    ripple.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      background: ${colors.ring};
      animation: ripple-anim 2s ease-out infinite;
      pointer-events: none;
    `;

    // Pin body
    const pin = document.createElement("div");
    pin.style.cssText = `
      position: relative;
      width: ${size}px;
      height: ${size}px;
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

    // Lightning icon
    const icon = document.createElement("div");
    icon.style.cssText = `
      transform: rotate(45deg);
      color: ${colors.text};
      font-size: ${size * 0.45}px;
      font-weight: bold;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
    `;
    icon.innerHTML = `<svg width="${size * 0.45}" height="${size * 0.45}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`;

    // Badge with number (available station count)
    const badge = document.createElement("div");
    badge.style.cssText = `
      position: absolute;
      top: ${-size * 0.2}px;
      right: ${-size * 0.2}px;
      width: ${size * 0.6}px;
      height: ${size * 0.6}px;
      border-radius: 50%;
      background: white;
      border: 1.5px solid ${colors.border};
      color: ${colors.bg};
      font-size: ${size * 0.25}px;
      font-weight: 800;
      display: flex;
      align-items: center;
      justify-content: center;
      font-family: 'Pretendard', sans-serif;
      transform: rotate(45deg);
      box-shadow: 0 1px 4px rgba(0,0,0,0.15);
    `;
    badge.textContent = String(availableStationCount);

    pin.appendChild(icon);
    pin.appendChild(badge);
    container.appendChild(ripple);
    container.appendChild(pin);

    return container;
  };

  const createCurrentLocationContent = (size = 18) => {
    const container = document.createElement("div");
    container.style.cssText = `
      position: relative;
      width: ${size}px;
      height: ${size}px;
      transform: translate(-50%, -50%);
      pointer-events: none;
    `;

    const outer = document.createElement("div");
    outer.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: ${size * 2}px;
      height: ${size * 2}px;
      border-radius: 50%;
      background: rgba(16,185,129,0.10);
      animation: pulse 2s infinite ease-out;
      pointer-events: none;
    `;

    const inner = document.createElement("div");
    inner.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: ${size}px;
      height: ${size}px;
      border-radius: 50%;
      background: #10b981;
      border: 2px solid #fff;
      box-shadow: 0 2px 6px rgba(0,0,0,0.2);
      pointer-events: none;
    `;

    container.appendChild(outer);
    container.appendChild(inner);

    // Ensure keyframes exist
    if (!document.getElementById("naver-current-pulse-style")) {
      const style = document.createElement("style");
      style.id = "naver-current-pulse-style";
      style.textContent = `
        @keyframes pulse {
          0% { transform: translate(-50%, -50%) scale(0.8); opacity: 0.6; }
          70% { transform: translate(-50%, -50%) scale(1.6); opacity: 0; }
          100% { transform: translate(-50%, -50%) scale(1.6); opacity: 0; }
        }
      `;
      document.head.appendChild(style);
    }

    return container;
  };

  const startGeolocation = (map: any) => {
    if (!navigator.geolocation || !map) return;

    // Stop previous watcher if any
    if (geoWatchIdRef.current != null) {
      navigator.geolocation.clearWatch(geoWatchIdRef.current);
      geoWatchIdRef.current = null;
    }

    geoWatchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const position = new window.naver.maps.LatLng(lat, lng);

        // Create marker if not exists
        if (!currentLocationMarkerRef.current) {
          const marker = new window.naver.maps.Marker({
            position,
            map,
            icon: {
              content: createCurrentLocationContent(18),
              anchor: new window.naver.maps.Point(9, 9),
            },
            clickable: false,
            zIndex: 9999,
          });
          currentLocationMarkerRef.current = marker;
        } else {
          currentLocationMarkerRef.current.setPosition(position);
          currentLocationMarkerRef.current.setIcon({
            content: createCurrentLocationContent(18),
            anchor: new window.naver.maps.Point(9, 9),
          });
        }

        // Optionally update accuracy circle using naver.maps.Circle if available
        try {
          if (pos.coords.accuracy && window.naver?.maps) {
            const radius = pos.coords.accuracy; // meters
            if (!accuracyCircleRef.current) {
              accuracyCircleRef.current = new window.naver.maps.Circle({
                map,
                center: position,
                radius,
                strokeColor: "rgba(16,185,129,0.2)",
                strokeOpacity: 0.8,
                strokeWeight: 1,
                fillColor: "rgba(16,185,129,0.06)",
                fillOpacity: 0.6,
              });
            } else {
              accuracyCircleRef.current.setCenter(position);
              accuracyCircleRef.current.setRadius(radius);
            }
          }
        } catch (e) {
          // ignore if naver.maps.Circle is not available
        }
      },
      (err) => {
        // ignore geolocation errors for now
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );
  };

  const stopGeolocation = () => {
    if (geoWatchIdRef.current != null && navigator.geolocation) {
      navigator.geolocation.clearWatch(geoWatchIdRef.current);
      geoWatchIdRef.current = null;
    }
    if (currentLocationMarkerRef.current) {
      try {
        currentLocationMarkerRef.current.setMap(null);
      } catch (e) { }
      currentLocationMarkerRef.current = null;
    }
    if (accuracyCircleRef.current) {
      try {
        accuracyCircleRef.current.setMap(null);
      } catch (e) { }
      accuracyCircleRef.current = null;
    }
  };


  const clusterStations = (stationsToCluster: ChargingStation[], map: any, zoom: number) => {
    // Calculate cluster radius based on zoom level (in pixels)
    const clusterRadiusPixels = 50;
    const clusters: Array<{
      position: { lat: number; lng: number };
      stations: ChargingStation[];
      availableStationCount: number;
    }> = [];
    const processed = new Set<string>();

    stationsToCluster.forEach((station) => {
      if (processed.has(station.id)) return;

      const cluster = {
        position: { lat: station.lat, lng: station.lng },
        stations: [station],
        availableStationCount: station.status !== "occupied" ? 1 : 0,
      };
      processed.add(station.id);

      // Find nearby stations
      stationsToCluster.forEach((otherStation) => {
        if (processed.has(otherStation.id)) return;

        const dist = Math.sqrt(
          Math.pow(station.lat - otherStation.lat, 2) +
          Math.pow(station.lng - otherStation.lng, 2)
        );

        // Adjust distance threshold based on zoom (lower zoom = larger clustering distance)
        // Much larger threshold to properly cluster stations at same location
        const distanceThreshold = (15 - zoom) * 0.006 + 0.006;

        if (dist < distanceThreshold) {
          cluster.stations.push(otherStation);
          if (otherStation.status !== "occupied") {
            cluster.availableStationCount += 1;
          }
          processed.add(otherStation.id);

          // Update cluster center
          cluster.position.lat = (cluster.position.lat * (cluster.stations.length - 1) + otherStation.lat) / cluster.stations.length;
          cluster.position.lng = (cluster.position.lng * (cluster.stations.length - 1) + otherStation.lng) / cluster.stations.length;
        }
      });

      clusters.push(cluster);
    });

    return clusters;
  };

  const addMarkers = useCallback((map: any, zoom: number) => {
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

    if (zoom >= 14) {
      // Show individual markers for all stations
      stations.forEach((station) => {
        const position = new window.naver.maps.LatLng(station.lat, station.lng);
        const markerContent = createIndividualMarkerContent(station, hoveredStation === station.id);

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
          window.dispatchEvent(new CustomEvent("naver-marker-click", { detail: station }));
        });

        // Mouse over/out for hover effect
        window.naver.maps.Event.addListener(marker, "mouseover", () => {
          setHoveredStation(station.id);
          const newContent = createIndividualMarkerContent(station, true);
          marker.setIcon({
            content: newContent,
            anchor: new window.naver.maps.Point(18, 36),
          });
        });

        window.naver.maps.Event.addListener(marker, "mouseout", () => {
          setHoveredStation(null);
          const newContent = createIndividualMarkerContent(station, false);
          marker.setIcon({
            content: newContent,
            anchor: new window.naver.maps.Point(18, 36),
          });
        });

        markersRef.current.push(marker);
      });
    } else {
      // Show clustered markers for all stations
      if (stations.length === 0) return;

      const clusters = clusterStations(stations, map, zoom);

      clusters.forEach((cluster) => {
        // Skip clusters with no available stations
        if (cluster.availableStationCount === 0) return;

        const position = new window.naver.maps.LatLng(
          cluster.position.lat,
          cluster.position.lng
        );

        // Determine marker size based on zoom
        let anchorX = 18;
        let anchorY = 36;
        if (zoom >= 12) {
          anchorX = 18;
          anchorY = 36;
        } else if (zoom >= 11) {
          anchorX = 16;
          anchorY = 32;
        } else {
          anchorX = 14;
          anchorY = 28;
        }

        const markerContent = createClusterMarkerContent(
          cluster.availableStationCount,
          cluster.stations.length,
          zoom
        );

        const marker = new window.naver.maps.Marker({
          position,
          map,
          icon: {
            content: markerContent,
            anchor: new window.naver.maps.Point(anchorX, anchorY),
          },
          title: `${cluster.stations.length} stations - ${cluster.availableStationCount} available`,
        });

        // Click event - show info about clustered stations
        window.naver.maps.Event.addListener(marker, "click", () => {
          // If only one station in cluster, show that station's details
          if (cluster.stations.length === 1 && onStationClick) {
            onStationClick(cluster.stations[0]);
          }
          window.dispatchEvent(
            new CustomEvent("naver-cluster-click", {
              detail: cluster.stations,
            })
          );
        });

        markersRef.current.push(marker);
      });
    }
  }, [stations, onStationClick, hoveredStation]);

  // Update markers when map is loaded, stations change, or zoom changes
  useEffect(() => {
    if (mapLoaded && mapRef.current) {
      addMarkers(mapRef.current, currentZoom);
    }
  }, [mapLoaded, addMarkers, currentZoom]);

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

