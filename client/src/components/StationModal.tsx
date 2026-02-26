// StationModal.tsx
// Design: Modern Cartographic Theme
// - Right-side slide-in modal panel
// - Station photo, charger types, operating hours
// - 4x6 time slot grid (00:00 - 24:00)
// - Reservation form with check button

import { useState, useEffect } from "react";
import {
  X, Clock, Zap, Star, MapPin, ChevronRight,
  Check, Phone, Calendar, Info,
  ZapOff, AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ChargingStation, TimeSlot, generateTimeSlots } from "@/lib/data";
import { toast } from "sonner";

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

export default function StationModal({ station, onClose }: StationModalProps) {
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedSlots, setSelectedSlots] = useState<number[]>([]);
  const [startHour, setStartHour] = useState<number | null>(null); // 시작 시간
  const [phone, setPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (station) {
      setTimeSlots(generateTimeSlots(station.id));
      setSelectedSlots([]);
      setStartHour(null);
      setPhone("");
    }
  }, [station]);

  // 매 분마다 현재 시간 기준으로 시간 슬롯 업데이트 (지남 상태 반영)
  useEffect(() => {
    if (!station) return;

    const updateTimeSlotsForCurrentTime = () => {
      const currentHour = new Date().getHours();
      setTimeSlots(prev => prev.map(slot => {
        // 이미 지난 시간이면 past로 변경
        if (slot.hour < currentHour && slot.status !== "past") {
          return { ...slot, status: "past" };
        }
        // 현재 시간이 되면 occupied로 변경 (선택된 상태는 유지)
        if (slot.hour === currentHour && slot.status === "available") {
          return { ...slot, status: "occupied" };
        }
        return slot;
      }));
      // 지난 시간 선택 해제
      setSelectedSlots(prev => prev.filter(h => h > currentHour));
      setStartHour(prev => (prev !== null && prev <= currentHour) ? null : prev);
    };

    // 다음 정시까지 남은 시간 계산
    const now = new Date();
    const msUntilNextHour = (60 - now.getMinutes()) * 60 * 1000 - now.getSeconds() * 1000;

    // 다음 정시에 첫 업데이트 후 매 시간마다 업데이트
    const timeout = setTimeout(() => {
      updateTimeSlotsForCurrentTime();
      const interval = setInterval(updateTimeSlotsForCurrentTime, 60 * 60 * 1000);
      return () => clearInterval(interval);
    }, msUntilNextHour);

    return () => clearTimeout(timeout);
  }, [station]);

  if (!station) return null;

  const toggleSlot = (hour: number) => {
    const slot = timeSlots.find(s => s.hour === hour);
    if (!slot || slot.status === "occupied" || slot.status === "past") return;

    // 이미 선택된 범위를 클릭하면 초기화
    if (selectedSlots.length > 0 && selectedSlots.includes(hour)) {
      setSelectedSlots([]);
      setStartHour(null);
      setTimeSlots(ts => ts.map(s =>
        s.status === "selected" ? { ...s, status: "available" } : s
      ));
      return;
    }

    if (startHour === null) {
      // 첫 번째 클릭: 시작 시간 설정
      setStartHour(hour);
      setSelectedSlots([hour]);
      setTimeSlots(ts => ts.map(s =>
        s.hour === hour ? { ...s, status: "selected" } :
          s.status === "selected" ? { ...s, status: "available" } : s
      ));
    } else {
      // 두 번째 클릭: 시작~끝 사이의 모든 시간 선택
      const minHour = Math.min(startHour, hour);
      const maxHour = Math.max(startHour, hour);

      // 범위 내에 occupied나 past 슬롯이 있는지 확인
      const hasBlockedSlot = timeSlots.some(s =>
        s.hour >= minHour && s.hour <= maxHour && (s.status === "occupied" || s.status === "past")
      );

      if (hasBlockedSlot) {
        toast.error("선택한 범위 내에 예약 불가능한 시간이 있습니다.");
        return;
      }

      // 범위 내 모든 시간 선택
      const newSelectedSlots: number[] = [];
      for (let h = minHour; h <= maxHour; h++) {
        newSelectedSlots.push(h);
      }

      setSelectedSlots(newSelectedSlots);
      setStartHour(null); // 선택 완료 후 리셋
      setTimeSlots(ts => ts.map(s => ({
        ...s,
        status: newSelectedSlots.includes(s.hour) ? "selected" :
          (s.status === "selected" ? "available" : s.status)
      })));
    }
  };

  const handleSubmit = async () => {
    if (selectedSlots.length === 0) {
      toast.error("예약 시간을 선택해주세요.");
      return;
    }

    // 전화번호 검증 (숫자만, 10-11자리)
    const cleanPhone = phone.replace(/[^0-9]/g, "");
    if (!cleanPhone || cleanPhone.length < 10 || cleanPhone.length > 11) {
      toast.error("올바른 연락처를 입력해주세요.");
      return;
    }

    // 연속된 시간 슬롯의 시작과 끝 계산
    const sortedSlots = [...selectedSlots].sort((a, b) => a - b);
    const startDt = sortedSlots[0];
    const endDt = sortedSlots[sortedSlots.length - 1] + 1; // 종료 시간은 마지막 슬롯 + 1

    const requestBody = {
      stat_id: station.id,
      user_id: cleanPhone,
      start_dt: startDt,
      end_dt: endDt,
    };

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/wattup/reservations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '예약 요청에 실패했습니다.');
      }

      const apiResponse = await response.json();

      console.log("예약 요청:", requestBody);
      console.log("예약 응답:", apiResponse);

      const timeRange = `${String(startDt).padStart(2, "0")}:00 ~ ${String(endDt).padStart(2, "0")}:00`;

      toast.success(`${apiResponse.message} ${timeRange}`, {
        description: `${station.name} · 예약번호: ${apiResponse.reserv_id.slice(-8)}`,
        duration: 4000,
      });

      onClose();
    } catch (error) {
      toast.error("예약 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatHour = (h: number) => `${String(h).padStart(2, "0")}:00`;

  const statusConfig = {
    available: { label: "이용 가능", color: "text-emerald-600", bg: "bg-emerald-500" },
    partial: { label: "일부 사용 중", color: "text-amber-600", bg: "bg-amber-500" },
    occupied: { label: "만석", color: "text-red-600", bg: "bg-red-500" },
  };

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
        boxShadow: "-8px 0 40px rgba(0,0,0,0.12), -2px 0 8px rgba(0,0,0,0.06)"
      }}
    >
      {/* ─── Header ─── */}
      <div className="relative flex-shrink-0">
        {/* Station Photo */}
        <div className="relative h-44 overflow-hidden">
          <img
            src={station.photo}
            alt={station.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 w-8 h-8 flex items-center justify-center rounded-full bg-black/40 backdrop-blur-sm text-white hover:bg-black/60 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Status Badge */}
          <div className="absolute top-3 left-3">
            <div className={cn(
              "flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold",
              "bg-white/90 backdrop-blur-sm",
              stationStatus.color
            )}>
              <div className={cn("w-1.5 h-1.5 rounded-full", stationStatus.bg)} />
              {stationStatus.label}
            </div>
          </div>

          {/* Station Name Overlay */}
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

        {/* Quick Info Bar */}
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

      {/* ─── Scrollable Content ─── */}
      <div className="flex-1 overflow-y-auto custom-scrollbar">

        {/* Charger Types Section */}
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
                    colors.bg, colors.border
                  )}
                >
                  <div className="flex items-center gap-2.5">
                    <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center", colors.bg, "border", colors.border)}>
                      <Zap className={cn("w-3.5 h-3.5", colors.text)} />
                    </div>
                    <div>
                      <div className={cn("text-sm font-bold", colors.text)}>{charger.type}</div>
                      <div className="text-xs text-slate-500">최대 {charger.maxKw}kW</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={cn("text-sm font-bold", colors.text)}>
                      {charger.available} <span className="font-normal text-slate-400">/ {charger.count}기</span>
                    </div>
                    <div className="text-xs text-slate-400">이용 가능</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Operating Hours */}
        <div className="px-4 pb-3">
          <div className={cn(
            "flex items-center gap-3 p-3 rounded-xl",
            "bg-slate-50 border border-slate-200"
          )}>
            <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
              <Clock className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-medium">이용 시간</div>
              <div className="text-sm font-bold text-slate-800">{station.operatingHours}</div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="mx-4 h-px bg-slate-100" />

        {/* Time Slot Grid Section */}
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

          {/* 4 columns × 6 rows = 24 time slots */}
          <div className="grid grid-cols-4 gap-1.5">
            {timeSlots.map((slot) => {
              const isPast = slot.status === "past";
              const isOccupied = slot.status === "occupied";
              const isSelected = slot.status === "selected";
              const isAvailable = slot.status === "available";

              return (
                <button
                  key={slot.hour}
                  onClick={() => toggleSlot(slot.hour)}
                  disabled={isPast || isOccupied}
                  className={cn(
                    "time-slot-btn relative py-2 px-1 rounded-lg text-xs font-medium",
                    "border transition-all duration-150",
                    "flex flex-col items-center justify-center gap-0.5",
                    isPast && "bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed",
                    isOccupied && "bg-red-50 border-red-200 text-red-400 cursor-not-allowed",
                    isAvailable && "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100 hover:border-emerald-400",
                    isSelected && "bg-blue-500 border-blue-500 text-white shadow-md shadow-blue-200"
                  )}
                >
                  <span className="font-bold tabular-nums">{String(slot.hour).padStart(2, "0")}</span>
                  <span className={cn(
                    "text-[9px]",
                    isPast && "text-slate-200",
                    isOccupied && "text-red-300",
                    isAvailable && "text-emerald-500",
                    isSelected && "text-blue-100"
                  )}>
                    {isPast ? "지남" : isOccupied ? "예약됨" : isSelected ? "선택" : "가능"}
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

          {/* Selected time summary */}
          {selectedSlots.length > 0 && (
            <div className="mt-2.5 p-2.5 bg-blue-50 border border-blue-200 rounded-xl">
              <div className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-blue-600" />
                <span className="text-xs font-semibold text-blue-700">
                  {selectedSlots.map(h => formatHour(h)).join(", ")} 선택됨
                </span>
              </div>
              <div className="text-xs text-blue-500 mt-0.5">
                총 {selectedSlots.length}시간 · 예상 비용 {(selectedSlots.length * station.pricePerKwh * 30).toLocaleString()}원~
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="mx-4 h-px bg-slate-100" />

        {/* Reservation Form */}
        <div className="px-4 pt-3 pb-4">
          <div className="flex items-center gap-2 mb-3">
            <Info className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-bold text-slate-800">예약 정보 입력</span>
          </div>

          <div className="space-y-2.5">
            {/* Phone (user_id) */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 mb-1">
                <Phone className="w-3 h-3" />
                연락처 <span className="text-red-400">*</span>
              </label>
              <input
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
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

        {/* Bottom padding for the floating button */}
        <div className="h-20" />
      </div>

      {/* ─── Floating Confirm Button ─── */}
      <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-white via-white/95 to-transparent pt-8">
        <div className="flex items-center justify-between">
          {/* Summary */}
          <div className="text-xs text-slate-500">
            {selectedSlots.length > 0 ? (
              <span className="font-semibold text-blue-600">
                {selectedSlots.length}시간 선택됨
              </span>
            ) : (
              <span>시간을 선택해주세요</span>
            )}
          </div>

          {/* Confirm Button */}
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
