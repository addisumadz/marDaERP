"use client";
import { useState, useEffect } from "react";
import { X, Wrench, Loader2, UserCheck, Printer, GripHorizontal } from "lucide-react";
import { toast } from "react-toastify";
import customMaintenanceService from "../../../lib/customMaintenanceService";
import { generateSurveyChecklistPdf } from "./customMaintenancePdf";

export default function CustomMaintenancePlumberAssignModal({
  isOpen,
  onClose,
  onSuccess,
  request,
  mode = "survey",
}) {
  const [plumbers, setPlumbers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedPlumberId, setSelectedPlumberId] = useState("");
  const [notes, setNotes] = useState("");

  // Movable / Draggable Modal State
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (isOpen) {
      setPosition({ x: 0, y: 0 });
    }
  }, [isOpen]);

  const handleMouseDown = (e) => {
    if (
      e.button !== 0 ||
      e.target.closest("button") ||
      e.target.closest("input") ||
      e.target.closest("select") ||
      e.target.closest("textarea")
    ) {
      return;
    }
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isDragging) return;
      setPosition({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y,
      });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging, dragStart]);

  const isSurvey = mode === "survey";

  useEffect(() => {
    if (isOpen) {
      loadPlumbers();
      setSelectedPlumberId("");
      setNotes("");
    }
  }, [isOpen, request]);

  const loadPlumbers = async () => {
    setLoading(true);
    try {
      const branchId = request?.branch?.id;
      const data = await customMaintenanceService.getAvailablePlumbers(branchId);
      setPlumbers(data || []);
      if (data && data.length > 0) {
        setSelectedPlumberId(String(data[0].id));
      }
    } catch (e) {
      console.error(e);
      toast.error("የባለሙያዎችን ዝርዝር ማግኘት አልተቻለም");
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedPlumberId) {
      toast.error("እባክዎ ባለሙያ ይምረጡ");
      return;
    }

    setSubmitting(true);
    try {
      if (isSurvey) {
        await customMaintenanceService.assignSurveyPlumber(request.id, {
          plumberId: Number(selectedPlumberId),
          notes,
        });
        toast.success("ለዳሰሳ ጥናትና ምርመራ ባለሙያ በተሳካ ሁኔታ ተመድቧል");

        // Trigger checklist PDF print for the plumber
        try {
          const assignedPlumber = plumbers.find((p) => String(p.id) === String(selectedPlumberId));
          const enrichedReq = {
            ...request,
            surveyPlumber: assignedPlumber
              ? {
                  firstName: assignedPlumber.fullName?.split(" ")[0] || assignedPlumber.userName,
                  lastName: assignedPlumber.fullName?.split(" ").slice(1).join(" ") || "",
                  userName: assignedPlumber.userName,
                  phoneNumber: assignedPlumber.phoneNumber,
                }
              : request.surveyPlumber,
            surveyPlumberNotes: notes || request.surveyPlumberNotes,
          };
          await generateSurveyChecklistPdf([], enrichedReq);
        } catch (pdfErr) {
          console.warn("Survey checklist PDF auto-print warning:", pdfErr);
        }
      } else {
        await customMaintenanceService.assignMaintenancePlumber(request.id, {
          plumberId: Number(selectedPlumberId),
          notes,
        });
        toast.success("ለጥገና ስራ ባለሙያ በተሳካ ሁኔታ ተመድቧል");
      }
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "ባለሙያ መመደብ አልተቻለም");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !request) return null;

  return (
    <div className="fixed inset-0 z-99999 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 pt-8 sm:pt-14 overflow-y-auto">
      <div
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`,
          transition: isDragging ? "none" : "transform 0.08s ease-out",
        }}
        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-700 w-full max-w-lg my-8 overflow-hidden animate-in fade-in zoom-in duration-200"
      >
        {/* Header - Movable */}
        <div
          onMouseDown={handleMouseDown}
          className="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-gradient-to-r from-blue-700 via-indigo-700 to-sky-700 text-white cursor-move select-none"
          title="ተጭነው ያንቀሳቅሱ (Click & drag to move modal)"
        >
          <div className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-blue-200" />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold">
                  {isSurvey ? "ለዳሰሳ ጥናት ባለሙያ መድብ" : "ለጥገና ስራ ባለሙያ መድብ"}
                </h2>
                <span className="flex items-center gap-1 text-[10px] text-blue-100 bg-white/10 px-2 py-0.5 rounded border border-white/20">
                  <GripHorizontal className="w-3 h-3" /> Move
                </span>
              </div>
              <span className="text-[11px] text-blue-200 font-mono block">
                {isSurvey ? "[ደረጃ 2: የዳሰሳ ጥናትና ግምት]" : "[ደረጃ 6: የተግባር ጥገና አፈፃፀም]"}
              </span>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/20 text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleAssign} className="p-6 space-y-4">
          {/* Stage Explanatory Banner */}
          {isSurvey ? (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800 text-xs text-amber-900 dark:text-amber-200 flex items-start gap-2">
              <Wrench className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <div>
                <strong>ደረጃ 2: የዳሰሳ ጥናትና ግምት ምደባ:</strong>
                <p className="text-[11px] text-amber-800 dark:text-amber-300 mt-0.5">
                  ባለሙያው ወደ ደንበኛው ቦታ በአካል በመሄድ የችግሩን ሁኔታ ያጣራል፣ የቧንቧውን ጉዳት ይለካል፣ የሚያስፈልጉ ዕቃዎችና የዋጋ ግምት ያዘጋጃል።
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="p-3 bg-cyan-50 dark:bg-cyan-950/40 rounded-xl border border-cyan-200 dark:border-cyan-800 text-xs text-cyan-900 dark:text-cyan-200 flex items-start gap-2">
                <Wrench className="w-4 h-4 text-cyan-600 shrink-0 mt-0.5" />
                <div>
                  <strong>ደረጃ 6: የተግባር ጥገና አፈፃፀም ምደባ:</strong>
                  <p className="text-[11px] text-cyan-800 dark:text-cyan-300 mt-0.5">
                    ዕቃዎቹ ከመደብር ስለወጡ ጥገናውን በአካል ቆፍሮና ገጣጥሞ የሚያከናውን እንዲሁም የውሃ አገልግሎቱን የሚያስመልስ ባለሙያ ይመድቡ።
                  </p>
                </div>
              </div>

              {/* Shortcut: Option to assign the same survey plumber */}
              {request.surveyPlumber && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/30 rounded-xl border border-blue-200 dark:border-blue-800 flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[11px] text-blue-700 dark:text-blue-300 block">ቀደም ሲል ዳሰሳ ያደረገው ባለሙያ:</span>
                    <strong className="text-xs text-blue-950 dark:text-blue-100">
                      {request.surveyPlumber.firstName} {request.surveyPlumber.lastName} ({request.surveyPlumber.userName})
                    </strong>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedPlumberId(String(request.surveyPlumber.id))}
                    className="px-2.5 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold shadow-sm flex items-center gap-1 shrink-0"
                  >
                    ይሄንኑ ባለሙያ ምረጥ ✓
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Customer Summary Card */}
          <div className="bg-gray-50 dark:bg-gray-700/40 rounded-xl p-3 border border-gray-200 dark:border-gray-600 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">የጥገና ቁጥር:</span>
              <span className="font-mono font-bold text-gray-800 dark:text-gray-200">{request.requestNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">የደንበኛ ስም:</span>
              <span className="font-semibold text-gray-800 dark:text-gray-200">{request.customerFullName}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">የሂሳብ ቁጥር:</span>
              <span className="font-mono text-gray-800 dark:text-gray-200">{request.accountNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">የጥገና ዓይነት:</span>
              <span className="font-semibold text-blue-600 dark:text-blue-400">
                {request.maintenanceType?.typeNameAm || "አጠቃላይ ጥገና"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500 dark:text-gray-400">ቅርንጫፍ:</span>
              <span className="font-semibold text-gray-800 dark:text-gray-200">{request.branch?.branchName || "—"}</span>
            </div>
            {request.problemDescription && (
              <div className="pt-1 border-t border-gray-200 dark:border-gray-600 text-[11px] text-gray-600 dark:text-gray-300">
                <strong>ያጋጠመው ችግር:</strong> {request.problemDescription}
              </div>
            )}
          </div>

          {/* Plumber Select */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              የቴክኒክ ባለሙያ (Plumber) <span className="text-red-500">*</span>
            </label>
            {loading ? (
              <div className="flex items-center gap-2 text-xs text-gray-500 py-2">
                <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                ባለሙያዎችን በመጫን ላይ...
              </div>
            ) : plumbers.length === 0 ? (
              <div className="text-xs text-amber-600 bg-amber-50 dark:bg-amber-950/40 p-2.5 rounded-lg border border-amber-200 dark:border-amber-800">
                በዚህ ቅርንጫፍ ንቁ የ <strong>CUSTOM_PLUMBER</strong> ሚና ያላቸው ባለሙያዎች አልተገኙም። እባክዎ በአስተዳዳሪ ቅንብር ያረጋግጡ።
              </div>
            ) : (
              <select
                value={selectedPlumberId}
                onChange={(e) => setSelectedPlumberId(e.target.value)}
                required
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/50 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
              >
                {plumbers.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.fullName} ({p.userName}) — {p.phoneNumber || p.roleName}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              ለባለሙያው የሚሰጥ መመሪያ ወይም ማስታወሻ (Instructions/Notes)
            </label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="ለምሳሌ: ደንበኛው ከሰዓት በኋላ ይገኛል..."
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700/50 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-between items-center pt-3 border-t border-gray-100 dark:border-gray-700">
            {isSurvey ? (
              <button
                type="button"
                onClick={() => generateSurveyChecklistPdf([], request)}
                className="px-3 py-1.5 text-xs text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-lg flex items-center gap-1.5 transition-colors font-medium"
              >
                <Printer className="w-3.5 h-3.5" />
                ቅጽ አትም (Checklist PDF)
              </button>
            ) : <div />}

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
              >
                ሰርዝ
              </button>
              <button
                type="submit"
                disabled={submitting || plumbers.length === 0}
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm flex items-center gap-1.5 transition-colors disabled:opacity-50"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserCheck className="w-4 h-4" />}
                {isSurvey ? "መድብ እና ቅጽ አትም" : "ባለሙያውን መድብ"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
