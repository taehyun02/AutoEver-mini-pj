import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { ChargingStation } from "@/lib/data";

declare global {
  interface Window {
    L?: any;
  }
}

interface MapViewProps {
  className?: string;
  initialCenter?: { lat: number; lng: number };
  initialZoom?: number;
  stations?: ChargingStation[];
  onMapReady?: (map: any) => void;
  onStationClick?: (station: ChargingStation) => void;
  clusterMinZoom?: number;
  onBoundsChanged?: (bounds: {
    north: number;
    south: number;
    east: number;
    west: number;
  }) => void;
}

const STATUS_COLORS = {
  available: "#10b981",
  partial: "#f59e0b",
  occupied: "#ef4444",
} as const;

const DEFAULT_CENTER = { lat: 37.5665, lng: 126.978 };

function ensureLeafletStyles() {
  if (document.getElementById("leaflet-custom-style")) return;

  const style = document.createElement("style");
  style.id = "leaflet-custom-style";
  style.textContent = `
    @keyframes leaflet-pulse {
      0% { transform: scale(0.7); opacity: 0.85; }
      100% { transform: scale(1.8); opacity: 0; }
    }

    .leaflet-container {
      width: 100%;
      height: 100%;
      background: #e2e8f0;
      font-family: Pretendard, sans-serif;
      z-index: 0;
    }

    .station-popup {
      min-width: 220px;
    }

    .station-popup h4 {
      margin: 0 0 6px;
      font-size: 14px;
      font-weight: 700;
      color: #0f172a;
    }

    .station-popup p {
      margin: 0 0 8px;
      font-size: 12px;
      line-height: 1.5;
      color: #475569;
    }

    .station-popup .meta {
      display: flex;
      gap: 8px;
      font-size: 12px;
      color: #334155;
    }
  `;
  document.head.appendChild(style);
}

function buildMarkerHtml(station: ChargingStation) {
  const color = STATUS_COLORS[station.status];
  return `
    <div style="
      width: 28px;
      height: 28px;
      border-radius: 9999px;
      background: ${color};
      border: 3px solid white;
      box-shadow: 0 4px 12px rgba(0,0,0,0.28);
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: 800;
      font-size: 12px;
    ">
      ${station.availableSlots}
    </div>
  `;
}

function buildCurrentLocationHtml() {
  return `
    <div style="position: relative; width: 22px; height: 22px;">
      <div style="
        position: absolute;
        inset: -9px;
        border-radius: 9999px;
        background: rgba(37,99,235,0.18);
        animation: leaflet-pulse 1.8s ease-out infinite;
      "></div>
      <div style="
        position: absolute;
        inset: 0;
        border-radius: 9999px;
        background: #2563eb;
        border: 3px solid white;
        box-shadow: 0 2px 10px rgba(37,99,235,0.45);
      "></div>
    </div>
  `;
}

export function MapView({
  className,
  initialCenter = DEFAULT_CENTER,
  initialZoom = 12,
  stations = [],
  onMapReady,
  onStationClick,
  onBoundsChanged,
}: MapViewProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const stationLayerRef = useRef<any>(null);
  const currentLocationMarkerRef = useRef<any>(null);
  const geoWatchIdRef = useRef<number | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    ensureLeafletStyles();

    if (!containerRef.current || mapRef.current || !window.L) return;

    const L = window.L;
    const map = L.map(containerRef.current, {
      zoomControl: false,
      minZoom: 10,
      maxZoom: 18,
    }).setView([initialCenter.lat, initialCenter.lng], initialZoom);

    L.control.zoom({ position: "bottomright" }).addTo(map);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    stationLayerRef.current = L.layerGroup().addTo(map);

    const adapter = {
      setCenter(latlng: { lat: number; lng: number }) {
        map.panTo([latlng.lat, latlng.lng]);
      },
      setZoom(zoom: number) {
        map.setZoom(zoom);
      },
      getZoom() {
        return map.getZoom();
      },
      raw: map,
    };

    mapRef.current = { map, adapter };
    setMapLoaded(true);
    onMapReady?.(adapter);

    const emitBounds = () => {
      const b = map.getBounds();
      onBoundsChanged?.({
        north: b.getNorth(),
        south: b.getSouth(),
        east: b.getEast(),
        west: b.getWest(),
      });
    };

    map.on("moveend zoomend", emitBounds);
    emitBounds();

    const startGeo = () => startGeolocation();
    const stopGeo = () => stopGeolocation();
    window.addEventListener("naver-start-geolocation", startGeo);
    window.addEventListener("naver-stop-geolocation", stopGeo);

    return () => {
      stopGeolocation();
      window.removeEventListener("naver-start-geolocation", startGeo);
      window.removeEventListener("naver-stop-geolocation", stopGeo);
      map.off("moveend zoomend", emitBounds);
      map.remove();
      mapRef.current = null;
    };
  }, [initialCenter.lat, initialCenter.lng, initialZoom, onBoundsChanged, onMapReady]);

  useEffect(() => {
    if (!mapLoaded || !stationLayerRef.current || !window.L) return;

    const L = window.L;
    const layer = stationLayerRef.current;
    layer.clearLayers();

    stations.forEach((station) => {
      const marker = L.marker([station.lat, station.lng], {
        icon: L.divIcon({
          html: buildMarkerHtml(station),
          className: "",
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        }),
      });

      marker.bindPopup(
        `
          <div class="station-popup">
            <h4>${station.name}</h4>
            <p>${station.address}</p>
            <div class="meta">
              <span>가용 ${station.availableSlots}/${station.totalSlots}</span>
              <span>평점 ${station.rating}</span>
            </div>
          </div>
        `,
      );

      marker.on("click", () => {
        onStationClick?.(station);
        window.dispatchEvent(new CustomEvent("naver-marker-click", { detail: station }));
      });

      layer.addLayer(marker);
    });
  }, [mapLoaded, onStationClick, stations]);

  function startGeolocation() {
    if (!navigator.geolocation || !mapRef.current || !window.L) return;
    if (geoWatchIdRef.current !== null) return;

    const L = window.L;
    const map = mapRef.current.map;

    geoWatchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const latlng = [pos.coords.latitude, pos.coords.longitude];

        if (!currentLocationMarkerRef.current) {
          currentLocationMarkerRef.current = L.marker(latlng, {
            icon: L.divIcon({
              html: buildCurrentLocationHtml(),
              className: "",
              iconSize: [22, 22],
              iconAnchor: [11, 11],
            }),
          }).addTo(map);
        } else {
          currentLocationMarkerRef.current.setLatLng(latlng);
        }
      },
      () => stopGeolocation(),
      {
        enableHighAccuracy: true,
        maximumAge: 10000,
        timeout: 10000,
      },
    );
  }

  function stopGeolocation() {
    if (geoWatchIdRef.current !== null) {
      navigator.geolocation.clearWatch(geoWatchIdRef.current);
      geoWatchIdRef.current = null;
    }

    if (currentLocationMarkerRef.current) {
      currentLocationMarkerRef.current.remove();
      currentLocationMarkerRef.current = null;
    }
  }

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <div ref={containerRef} className="h-full w-full" />
    </div>
  );
}
