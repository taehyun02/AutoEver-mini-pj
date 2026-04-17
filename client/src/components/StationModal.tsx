// StationModal.tsx
// Design: Modern Cartographic Theme
// - Right-side slide-in modal panel
// - Station photo, charger types, operating hours
// - 4x6 time slot grid (00:00 - 24:00)
// - Reservation form with check button

import { useEffect, useState } from "react";
import { X, Clock, Zap, Star, MapPin, Check, Phone, Calendar, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { ChargingStation, TimeSlot } from "@/lib/data";
import { toast } from "sonner";
import { fetchStationReservations, Reservation } from "@/lib/api";

interface StationModalProps {
  station: ChargingStation | null;
  onClose: () => void;
}

const CHARGER_TYPE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  "DC콤보": { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  "CHAdeMO": { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
  "AC3상": { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" },
  "AC완속": { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" },
  "DC차데모": { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200" },
};

function buildBaseTimeSlots(now: Date = new Date()): TimeSlot[] {
  const currentHour = now.getHours();

  return Array.from({ length: 24 }, (_, hour) => {
    if (hour < currentHour) {
      return { hour, status: "past" as const };
    }

    if (hour === currentHour) {
      return { hour, status: "occupied" as const };
    }

    return { hour, status: "available" as const };
  });
}

function applyReservationStatuses(
  baseSlots: TimeSlot[],
  reservations: Reservation[],
  selectedHours: number[] = []
): TimeSlot[] {
  const reservedHours = new Set<number>();

  reservations.forEach((reservation) => {
    const startHour = new Date(reservation.start_dt).getHours();
    const endHour = new Date(reservation.end_dt).getHours();

    for (let hour = startHour; hour < endHour; hour += 1) {
      reservedHours.add(hour);
    }
  });

  return baseSlots.map((slot) => {
    if (selectedHours.includes(slot.hour)) {
      return { ...slot, status: "selected" };
    }

    if (reservedHours.has(slot.hour) && slot.status !== "past" && slot.status !== "occupied") {
      return { ...slot, status: "reserved" };
    }

    return slot;
  });
}

export default function StationModal({ station, onClose }: StationModalProps) {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedSlots, setSelectedSlots] = useState<number[]>([]);
  const [startHour, setStartHour] = useState<number | null>(null);
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [reservations, setReservations] = useState<Reservation[]>([]);

  useEffect(() => {
    if (!station) {
      return;
    }

    setSelectedSlots([]);
    setStartHour(null);
    setPhone("");
    setReservations([]);
    setTimeSlots(buildBaseTimeSlots());

    const loadReservations = async () => {
      try {
        const data = await fetchStationReservations(station.id);
        setReservations(data);
      } catch (error) {
        console.error("[MODAL] reservation fetch failed", error);
        setReservations([]);
      }
    };

    loadReservations();
  }, [station]);

  useEffect(() => {
    if (!station) {
      return;
    }

    const updateTimeSlots = () => {
      const baseSlots = buildBaseTimeSlots();
      const validSelectedSlots = selectedSlots.filter((hour) => {
        const slot = baseSlots.find((candidate) => candidate.hour === hour);
        return slot?.status === "available";
      });

      setSelectedSlots(validSelectedSlots);
      setStartHour((prev) => (prev !== null && validSelectedSlots.includes(prev) ? prev : null));
      setTimeSlots(applyReservationStatuses(baseSlots, reservations, validSelectedSlots));
    };

    updateTimeSlots();

    const now = new Date();
    const msUntilNextHour =
      (60 - now.getMinutes()) * 60 * 1000 - now.getSeconds() * 1000 - now.getMilliseconds();

    let intervalId: ReturnType<typeof setInterval> | null = null;
    const timeoutId = setTimeout(() => {
      updateTimeSlots();
      intervalId = setInterval(updateTimeSlots, 60 * 60 * 1000);
    }, msUntilNextHour);

    return () => {
      clearTimeout(timeoutId);
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [station, reservations, selectedSlots]);

  if (!station) {
    return null;
  }

  const toggleSlot = (hour: number) => {
    const slot = timeSlots.find((candidate) => candidate.hour === hour);
    if (!slot || slot.status === "occupied" || slot.status === "past" || slot.status === "reserved") {
      return;
    }

    if (selectedSlots.length > 0 && selectedSlots.includes(hour)) {
      setSelectedSlots([]);
      setStartHour(null);
      setTimeSlots(applyReservationStatuses(buildBaseTimeSlots(), reservations));
      return;
    }

    if (startHour === null) {
      setStartHour(hour);
      setSelectedSlots([hour]);
      setTimeSlots(applyReservationStatuses(buildBaseTimeSlots(), reservations, [hour]));
      return;
    }

    const minHour = Math.min(startHour, hour);
    const maxHour = Math.max(startHour, hour);
    const hasBlockedSlot = timeSlots.some(
      (candidate) =>
        candidate.hour >= minHour &&
        candidate.hour <= maxHour &&
        (candidate.status === "occupied" ||
          candidate.status === "past" ||
          candidate.status === "reserved")
    );

    if (hasBlockedSlot) {
      toast.error("선택한 범위 내에 예약 불가능한 시간이 있습니다.");
      return;
    }

    const nextSelectedSlots = Array.from(
      { length: maxHour - minHour + 1 },
      (_, index) => minHour + index
    );

    setSelectedSlots(nextSelectedSlots);
    setStartHour(null);
    setTimeSlots(applyReservationStatuses(buildBaseTimeSlots(), reservations, nextSelectedSlots));
  };

  const handleSubmit = async () => {
    if (selectedSlots.length === 0) {
      toast.error("예약 시간을 선택해주세요.");
      return;
    }

    const cleanPhone = phone.replace(/[^0-9]/g, "");
    if (!cleanPhone || cleanPhone.length < 10 || cleanPhone.length > 11) {
      toast.error("올바른 연락처를 입력해주세요.");
      return;
    }

    const sortedSlots = [...selectedSlots].sort((a, b) => a - b);
    const startDt = sortedSlots[0];
    const endDt = sortedSlots[sortedSlots.length - 1] + 1;

    const requestBody = {
      stat_id: station.id,
      user_id: cleanPhone,
      start_dt: startDt,
      end_dt: endDt,
    };

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/wattup/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const responseBody = await response.json();
      if (!response.ok) {
        throw new Error(responseBody.detail || responseBody.error || "예약 요청에 실패했습니다.");
      }

      const nextReservations: Reservation[] = [
        ...reservations,
        {
          reserv_id: responseBody.reserv_id,
          user_id: cleanPhone,
          start_dt: new Date(2000, 0, 1, startDt).toISOString(),
          end_dt: new Date(2000, 0, 1, endDt).toISOString(),
          status: responseBody.status ?? "READY",
        },
      ];

      setReservations(nextReservations);
      setSelectedSlots([]);
      setStartHour(null);
      setTimeSlots(applyReservationStatuses(buildBaseTimeSlots(), nextReservations));

      const timeRange = `${String(startDt).padStart(2, "0")}:00 ~ ${String(endDt).padStart(2, "0")}:00`;
      toast.success(`예약이 완료되었습니다. ${timeRange}`, {
        description: `${station.name} · 예약번호: ${String(responseBody.reserv_id).slice(-8)}`,
        duration: 4000,
      });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "예약 중 오류가 발생했습니다. 다시 시도해주세요.";
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatHour = (hour: number) => `${String(hour).padStart(2, "0")}:00`;

  const statusConfig = {
    available: { label: "이용 가능", color: "text-emerald-600", bg: "bg-emerald-500" },
    partial: { label: "일부 사용 중", color: "text-amber-600", bg: "bg-amber-500" },
    occupied: { label: "만석", color: "text-red-600", bg: "bg-red-500" },
  } as const;

  const stationStatus = statusConfig[station.status];

  return (
    <div
      className={cn(
        "fixed right-0 top-0 h-full w-[420px] z-50",
        "bg-white shadow-2xl",
        "flex flex-col",
        "modal-slide-in"
      )}
      style={{
        boxShadow: "-8px 0 40px rgba(0,0,0,0.12), -2px 0 8px rgba(0,0,0,0.06)",
      }}
    >
      <div className="relative flex-shrink-0">
        <div className="relative h-44 overflow-hidden bg-slate-200 flex items-center justify-center">
          {station.photo ? (
            <img
              src={station.photo}
              alt={station.name}
              className="w-full h-full object-cover"
              onError={(event) => {
                const target = event.target as HTMLImageElement;
                target.src = "/default-station.jpg";
                target.onerror = null;
              }}
            />
          ) : (
            <img
              src="/default-station.jpg"
              alt="Default Station"
              className="w-full h-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-sm text-white hover:bg-black/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="absolute top-3 left-3">
            <div
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold",
                "bg-white/90 backdrop-blur-sm",
                stationStatus.color
              )}
            >
              <div className={cn("w-1.5 h-1.5 rounded-full", stationStatus.bg)} />
              {stationStatus.label}
            </div>
          </div>

          <div className="absolute bottom-3 left-4 right-4">
            <h2 className="text-white font-bold text-lg leading-tight drop-shadow-lg">
              {station.name}
            </h2>
            <div className="flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 text-white/80" />
              <span className="text-white/80 text-xs">{station.address}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center divide-x divide-slate-100 border-b border-slate-100 bg-slate-50/80">
          <div className="flex-1 flex items-center justify-center gap-1.5 py-2.5">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span className="text-sm font-semibold text-slate-700">{station.rating}</span>
            <span className="text-xs text-slate-400">({station.reviewCount})</span>
          </div>
          <div className="flex-1 flex items-center justify-center gap-1.5 py-2.5">
            <Zap className="w-3.5 h-3.5 text-blue-500" />
            <span className="text-sm font-semibold text-slate-700">{station.availableSlots}</span>
            <span className="text-xs text-slate-400">/ {station.totalSlots}기</span>
          </div>
          <div className="flex-1 flex items-center justify-center gap-1.5 py-2.5">
            <span className="text-xs font-bold text-blue-600">{station.pricePerKwh}원</span>
            <span className="text-xs text-slate-400">/kWh</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <div className="px-4 pt-4 pb-3">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-bold text-slate-800">지원 충전기 단자</span>
          </div>
          <div className="space-y-2">
            {station.chargerTypes.map((charger) => {
              const colors = CHARGER_TYPE_COLORS[charger.type] || CHARGER_TYPE_COLORS["DC콤보"];

              return (
                <div
                  key={charger.type}
                  className={cn(
                    "flex items-center justify-between p-3 rounded-xl border",
                    colors.bg,
                    colors.border
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className={cn(
                        "w-7 h-7 rounded-lg flex items-center justify-center",
                        colors.bg,
                        "border",
                        colors.border
                      )}
                    >
                      <Zap className={cn("w-3.5 h-3.5", colors.text)} />
                    </div>
                    <div>
                      <div className={cn("text-sm font-bold", colors.text)}>{charger.type}</div>
                      <div className="text-xs text-slate-500">최대 {charger.maxKw}kW</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={cn("text-sm font-bold", colors.text)}>
                      {charger.available}{" "}
                      <span className="font-normal text-slate-400">/ {charger.count}기</span>
                    </div>
                    <div className="text-xs text-slate-400">이용 가능</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="px-4 pb-3">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200">
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
              <Clock className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">이용 시간</div>
              <div className="text-sm font-bold text-slate-800">{station.operatingHours}</div>
            </div>
          </div>
        </div>

        <div className="mx-4 h-px bg-slate-100" />

        <div className="px-4 pt-3 pb-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-bold text-slate-800">예약 현황</span>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-2.5 h-2.5 rounded-sm bg-emerald-100 border border-emerald-300" />
                <span className="text-slate-500">가능</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2.5 h-2.5 rounded-sm bg-red-100 border border-red-300" />
                <span className="text-slate-500">불가</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-2.5 h-2.5 rounded-sm bg-blue-500" />
                <span className="text-slate-500">선택</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-1.5">
            {timeSlots.map((slot) => {
              const isPast = slot.status === "past";
              const isOccupied = slot.status === "occupied";
              const isReserved = slot.status === "reserved";
              const isSelected = slot.status === "selected";
              const isAvailable = slot.status === "available";

              return (
                <button
                  key={slot.hour}
                  onClick={() => toggleSlot(slot.hour)}
                  disabled={isPast || isOccupied || isReserved}
                  className={cn(
                    "time-slot-btn relative py-2 px-1 rounded-lg text-xs font-medium",
                    "border transition-all duration-150",
                    "flex flex-col items-center justify-center gap-0.5",
                    isPast && "bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed",
                    isOccupied && "bg-red-50 border-red-200 text-red-400 cursor-not-allowed",
                    isReserved && "bg-red-50 border-red-200 text-red-400 cursor-not-allowed",
                    isAvailable &&
                      "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-400",
                    isSelected && "bg-blue-500 border-blue-500 text-white shadow-md shadow-blue-200"
                  )}
                >
                  <span className="font-bold tabular-nums">{String(slot.hour).padStart(2, "0")}</span>
                  <span
                    className={cn(
                      "text-[9px]",
                      isPast && "text-slate-200",
                      (isOccupied || isReserved) && "text-red-300",
                      isAvailable && "text-emerald-500",
                      isSelected && "text-blue-100"
                    )}
                  >
                    {isPast ? "지남" : isOccupied || isReserved ? "예약됨" : isSelected ? "선택" : "가능"}
                  </span>
                  {isSelected && (
                    <div className="absolute top-0.5 right-0.5 w-3 h-3 bg-white/30 rounded-full flex items-center justify-center">
                      <Check className="w-2 h-2 text-white" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {selectedSlots.length > 0 && (
            <div className="mt-2.5 p-2.5 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-blue-600" />
                <span className="text-xs font-semibold text-blue-700">
                  {selectedSlots.map((hour) => formatHour(hour)).join(", ")} 선택됨
                </span>
              </div>
              <div className="text-xs text-blue-500 mt-0.5">
                총 {selectedSlots.length}시간 · 예상 비용{" "}
                {(selectedSlots.length * station.pricePerKwh * 30).toLocaleString()}원~
              </div>
            </div>
          )}
        </div>

        <div className="mx-4 h-px bg-slate-100" />

        <div className="px-4 pt-3 pb-4">
          <div className="flex items-center gap-2 mb-3">
            <Info className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-bold text-slate-800">예약 정보 입력</span>
          </div>

          <div className="space-y-2.5">
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 mb-1">
                <Phone className="w-3 h-3" />
                연락처 <span className="text-red-400">*</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
                placeholder="01012345678"
                maxLength={13}
                className={cn(
                  "w-full px-3 py-2.5 rounded-xl text-sm",
                  "border border-slate-200 bg-slate-50",
                  "focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400",
                  "placeholder:text-slate-300 text-slate-800",
                  "transition-all duration-150"
                )}
              />
              <p className="text-xs text-slate-400 mt-1">예약 확인 및 안내에 사용됩니다</p>
            </div>
          </div>
        </div>

        <div className="h-20" />
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white/95 to-transparent pt-8">
        <div className="flex items-center justify-between">
          <div className="text-xs text-slate-500">
            {selectedSlots.length > 0 ? (
              <span className="font-semibold text-blue-600">{selectedSlots.length}시간 선택됨</span>
            ) : (
              <span>시간을 선택해주세요</span>
            )}
          </div>

          <button
            onClick={handleSubmit}
            disabled={isSubmitting || selectedSlots.length === 0 || !phone}
            className={cn(
              "w-14 h-14 rounded-full flex items-center justify-center",
              "shadow-xl transition-all duration-200",
              "disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-md",
              selectedSlots.length > 0 && phone
                ? "bg-blue-600 hover:bg-blue-700 hover:scale-105 shadow-blue-300"
                : "bg-slate-300"
            )}
          >
            {isSubmitting ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Check className="w-6 h-6 text-white" strokeWidth={2.5} />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
