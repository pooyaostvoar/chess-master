import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useUser } from "../contexts/UserContext";
import { SlotStatus, updateSlotStatus } from "../services/schedule";

const ALLOWED_STATUS_STRINGS = new Set<string>(
  Object.values(SlotStatus).filter((v) => typeof v === "string")
);

function parseTargetStatus(raw: string | undefined): SlotStatus | null {
  if (!raw) return null;
  const s = raw.trim().toLowerCase();
  if (!ALLOWED_STATUS_STRINGS.has(s)) return null;
  return s as SlotStatus;
}

function updatingLabel(status: SlotStatus): string {
  switch (status) {
    case SlotStatus.Booked:
      return "Accepting request…";
    case SlotStatus.Free:
      return "Rejecting request…";
    case SlotStatus.Reserved:
      return "Updating session…";
    case SlotStatus.Paid:
      return "Updating payment…";
    default:
      return "Updating session…";
  }
}

type Phase = "idle" | "updating" | "success" | "error";

const UpdateSlotStatusPage: React.FC = () => {
  const { slotId: slotIdParam, newStatus: newStatusParam } = useParams<{
    slotId: string;
    newStatus: string;
  }>();
  const navigate = useNavigate();
  const { user } = useUser();

  const targetStatus = useMemo(
    () => parseTargetStatus(newStatusParam),
    [newStatusParam]
  );

  const slotNumericId = Number(slotIdParam);
  const slotIdValid = Number.isFinite(slotNumericId) && slotNumericId > 0;

  const paramsInvalid = !slotIdValid || !targetStatus;

  const [phase, setPhase] = useState<Phase>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const afterSuccessPath =
    user?.isMaster && user.id ? `/calendar/${user.id}` : "/bookings";

  useEffect(() => {
    if (paramsInvalid) {
      setPhase("idle");
      return;
    }

    setPhase("updating");
    setErrorMessage(null);

    const handle = window.setTimeout(() => {
      void (async () => {
        try {
          await updateSlotStatus(slotNumericId, targetStatus);
          setPhase("success");
        } catch (err: unknown) {
          const msg =
            err instanceof Error
              ? err.message
              : "Could not update slot status.";
          setErrorMessage(msg);
          setPhase("error");
        }
      })();
    }, 0);

    return () => {
      window.clearTimeout(handle);
    };
  }, [paramsInvalid, slotNumericId, targetStatus]);

  return (
    <div className="bg-[#FAF5EB] min-h-screen">
      <div className="bg-[#F4ECDD] border-b border-[#1F1109]/[0.08]">
        <div className="max-w-lg mx-auto px-5 sm:px-8 py-8 sm:py-10">
          <div
            className="text-xs italic text-[#7A2E2E] tracking-[0.04em] mb-2"
            style={{ fontFamily: "Georgia, serif" }}
          >
            Slot status
          </div>
          <h1
            className="text-2xl sm:text-3xl font-medium text-[#1F1109] leading-[1.1] tracking-[-0.01em]"
            style={{ fontFamily: "Georgia, 'Playfair Display', serif" }}
          >
            Update session status
          </h1>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-5 sm:px-8 py-8">
        <div className="bg-white border border-[#1F1109]/[0.12] rounded-xl p-6 shadow-sm">
          {paramsInvalid && (
            <div className="text-[13px] text-[#7A2E2E]">
              Invalid URL. Use{" "}
              <code className="text-[12px] bg-[#FAF5EB] px-1 rounded">
                /update-slot-status/&lt;id&gt;/&lt;status&gt;
              </code>{" "}
              where status is one of:{" "}
              {Array.from(ALLOWED_STATUS_STRINGS).join(", ")}.
            </div>
          )}

          {!paramsInvalid && phase !== "success" && phase !== "error" && (
            <div className="flex flex-col items-center py-10 gap-4">
              <div className="w-10 h-10 border-4 border-[#B8893D]/20 border-t-[#B8893D] rounded-full animate-spin" />
              <p
                className="text-[15px] text-[#3D2817] text-center font-medium"
                style={{ fontFamily: "Georgia, serif" }}
              >
                {targetStatus ? updatingLabel(targetStatus) : "Working…"}
              </p>
              <p className="text-[12px] text-[#6B5640] text-center max-w-[280px]">
                Slot #{slotNumericId}
                {targetStatus ? (
                  <>
                    {" "}
                    → <span className="font-medium text-[#1F1109]">{targetStatus}</span>
                  </>
                ) : null}
              </p>
            </div>
          )}

          {!paramsInvalid && phase === "error" && errorMessage && (
            <div className="space-y-4">
              <div className="px-3.5 py-3 rounded-lg bg-[#7A2E2E]/10 border border-[#7A2E2E]/20 text-[13px] text-[#7A2E2E]">
                {errorMessage}
              </div>
              <button
                type="button"
                onClick={() => navigate(afterSuccessPath)}
                className="w-full rounded-lg px-3.5 py-3 text-[13px] font-medium text-[#1F1109] bg-[#B8893D] hover:bg-[#A37728] transition-colors"
              >
                {user?.isMaster ? "Back to calendar" : "Back to bookings"}
              </button>
              <Link
                to="/dashboard"
                className="block text-center text-[13px] text-[#B8893D] font-medium hover:underline"
              >
                Dashboard
              </Link>
            </div>
          )}

          {!paramsInvalid && phase === "success" && (
            <div className="space-y-4">
              <p className="text-[13px] text-[#3D2817]">
                Slot status was updated successfully.
              </p>
              <button
                type="button"
                onClick={() => navigate(afterSuccessPath)}
                className="w-full rounded-lg px-3.5 py-3 text-[13px] font-medium text-[#1F1109] bg-[#B8893D] hover:bg-[#A37728] transition-colors"
              >
                {user?.isMaster ? "Go to my calendar" : "Go to my bookings"}
              </button>
              <Link
                to="/dashboard"
                className="block text-center text-[13px] text-[#B8893D] font-medium hover:underline"
              >
                Dashboard
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UpdateSlotStatusPage;
