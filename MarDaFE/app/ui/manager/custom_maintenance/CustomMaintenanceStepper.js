"use client";
import { Check, CircleDot } from "lucide-react";

export const STAGES = [
  { key: "PENDING_SURVEY_ASSIGNMENT", label: "ምዝገባ", labelEn: "Registered", dept: "Customer Service", order: 1 },
  { key: "SURVEY_IN_PROGRESS", label: "የዳሰሳ ጥናት", labelEn: "Surveying", dept: "Technical", order: 2 },
  { key: "PENDING_PAYMENT_APPROVAL", label: "ግምት ተልኳል", labelEn: "Estimation Sent", dept: "Revenue", order: 3 },
  { key: "PENDING_STORE_COLLECTION", label: "ክፍያ ጸድቋል", labelEn: "Paid / Store", dept: "Inventory Store", order: 4 },
  { key: "MATERIALS_COLLECTED", label: "ዕቃ ወጥቷል", labelEn: "Materials Issued", dept: "Inventory Store", order: 5 },
  { key: "MAINTENANCE_IN_PROGRESS", label: "ጥገና ላይ", labelEn: "In Maintenance", dept: "Technical", order: 6 },
  { key: "MAINTENANCE_COMPLETED", label: "ጥገና ተጠናቋል", labelEn: "Completed", dept: "Technical", order: 7 },
];

export function getStatusStageIndex(status) {
  const idx = STAGES.findIndex((s) => s.key === status);
  return idx >= 0 ? idx : 0;
}

export function getStatusBadge(status) {
  switch (status) {
    case "PENDING_SURVEY_ASSIGNMENT":
      return { text: "ባለሙያ በመጠባበቅ ላይ", color: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300" };
    case "SURVEY_IN_PROGRESS":
      return { text: "የዳሰሳ ጥናት ላይ", color: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300" };
    case "PENDING_PAYMENT_APPROVAL":
      return { text: "ክፍያ በመጠባበቅ ላይ", color: "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300" };
    case "PENDING_STORE_COLLECTION":
      return { text: "ዕቃ ከስቶር በመጠባበቅ ላይ", color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300" };
    case "MATERIALS_COLLECTED":
      return { text: "ዕቃ ተወስዷል / ጥገና ዝግጁ", color: "bg-teal-100 text-teal-800 dark:bg-teal-900/30 dark:text-teal-300" };
    case "MAINTENANCE_IN_PROGRESS":
      return { text: "የጥገና ስራ ላይ", color: "bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-300" };
    case "MAINTENANCE_COMPLETED":
      return { text: "ጥገና ተጠናቋል", color: "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300" };
    default:
      return { text: status, color: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300" };
  }
}

export default function CustomMaintenanceStepper({ currentStatus }) {
  const currentIdx = getStatusStageIndex(currentStatus);
  const isFinal = currentStatus === "MAINTENANCE_COMPLETED";

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 px-4 py-3 overflow-x-auto">
      <div className="flex items-center justify-between min-w-[680px] py-1">
        {STAGES.map((step, idx) => {
          const isDone = isFinal || idx < currentIdx;
          const isCurrent = !isFinal && idx === currentIdx;

          return (
            <div key={step.key} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center text-center">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                    isDone
                      ? "bg-emerald-500 text-white shadow-sm"
                      : isCurrent
                      ? "bg-indigo-600 text-white ring-4 ring-indigo-100 dark:ring-indigo-900/40 shadow-sm"
                      : "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500"
                  }`}
                >
                  {isDone ? <Check className="w-3.5 h-3.5" /> : isCurrent ? <CircleDot className="w-3.5 h-3.5" /> : idx + 1}
                </div>
                <span
                  className={`text-[11px] mt-1 whitespace-nowrap font-medium ${
                    isDone
                      ? "text-emerald-600 dark:text-emerald-400 font-semibold"
                      : isCurrent
                      ? "text-indigo-600 dark:text-indigo-400 font-semibold"
                      : "text-gray-400 dark:text-gray-500"
                  }`}
                >
                  {step.label}
                </span>
                <span className="text-[9px] text-gray-400 dark:text-gray-500 font-mono">
                  {step.dept}
                </span>
              </div>
              {idx < STAGES.length - 1 && (
                <div
                  className={`flex-1 h-0.5 mx-1.5 rounded-full ${
                    idx < currentIdx || isFinal
                      ? "bg-emerald-400 dark:bg-emerald-600"
                      : "bg-gray-200 dark:bg-gray-700"
                  }`}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
