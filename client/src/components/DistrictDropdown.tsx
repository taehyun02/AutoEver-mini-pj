// DistrictDropdown.tsx
// Design: Modern Cartographic Theme
// - Floating panel with backdrop blur
// - Toggle + grid layout for Seoul districts
// - Electric Blue (#2563EB) accent on selection

import { useState, useRef, useEffect } from "react";
import { ChevronDown, MapPin, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { SEOUL_DISTRICTS, SeoulDistrict } from "@/lib/data";

interface DistrictDropdownProps {
  selectedDistrict: SeoulDistrict | null;
  onSelect: (district: SeoulDistrict) => void;
}

export default function DistrictDropdown({ selectedDistrict, onSelect }: DistrictDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (district: SeoulDistrict) => {
    onSelect(district);
    setIsOpen(false);
  };

  return (
    <div ref={dropdownRef} className="relative z-30">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center gap-2 px-4 py-2.5 rounded-xl",
          "bg-white/95 backdrop-blur-md shadow-lg border border-white/60",
          "text-sm font-semibold text-slate-700",
          "transition-all duration-200 hover:shadow-xl hover:bg-white",
          "select-none",
          isOpen && "shadow-xl bg-white ring-2 ring-blue-500/30"
        )}
      >
        <MapPin className="w-4 h-4 text-blue-600" strokeWidth={2.5} />
        <span className="text-slate-800">
          {selectedDistrict ? selectedDistrict.name : "지역"}
        </span>
        <ChevronDown
          className={cn(
            "w-4 h-4 text-slate-500 transition-transform duration-200",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {/* Dropdown Panel */}
      {isOpen && (
        <div
          className={cn(
            "absolute top-full left-0 mt-2",
            "bg-white/97 backdrop-blur-xl shadow-2xl",
            "border border-slate-200/80 rounded-2xl",
            "w-[340px] p-4",
            "dropdown-open"
          )}
          style={{
            boxShadow: "0 20px 60px rgba(0,0,0,0.15), 0 4px 16px rgba(37,99,235,0.08)"
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-5 bg-blue-600 rounded-full" />
              <span className="text-sm font-bold text-slate-800">서울시 지역구 선택</span>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-slate-100 transition-colors"
            >
              <X className="w-3.5 h-3.5 text-slate-400" />
            </button>
          </div>

          {/* Divider */}
          <div className="h-px bg-slate-100 mb-3" />

          {/* District Grid - 5 columns */}
          <div className="grid grid-cols-5 gap-1.5">
            {SEOUL_DISTRICTS.map((district) => {
              const isSelected = selectedDistrict?.name === district.name;
              return (
                <button
                  key={district.name}
                  onClick={() => handleSelect(district)}
                  className={cn(
                    "px-1 py-2 rounded-lg text-xs font-medium",
                    "transition-all duration-150",
                    "border",
                    isSelected
                      ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-200"
                      : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700"
                  )}
                >
                  {district.name.slice(0, -1)}
                  <span className={cn("block text-[9px] mt-0.5", isSelected ? "text-blue-100" : "text-slate-400")}>
                    구
                  </span>
                </button>
              );
            })}
          </div>

          {/* Footer hint */}
          <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400" />
            <span className="text-[11px] text-slate-400">클릭 시 해당 지역으로 지도가 이동합니다</span>
          </div>
        </div>
      )}
    </div>
  );
}
