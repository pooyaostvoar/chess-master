import React from "react";

const LichessIcon: React.FC<{ size?: number }> = ({ size = 20 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden
  >
    <path
      d="M12.39 2.12c-.95 1.35-2.16 2.7-3.77 3.86-.48.34-.68.95-.49 1.51l.47 1.41-2.7 4.04c-.33.49-.38 1.12-.13 1.66l2.7 5.89c.24.53.77.88 1.35.88h4.85c.59 0 1.12-.35 1.36-.88l2.69-5.89c.25-.54.2-1.17-.13-1.66l-2.69-4.04.47-1.41c.19-.56-.01-1.17-.49-1.51-1.6-1.16-2.81-2.51-3.76-3.86-.4-.57-1.25-.57-1.65 0Zm-.39 7.13c1.47 0 2.66 1.18 2.66 2.64S13.47 14.52 12 14.52s-2.66-1.18-2.66-2.63 1.19-2.64 2.66-2.64Zm-2.8 8.72 1.16-2.53a4.69 4.69 0 0 0 3.28 0l1.16 2.53H9.2Z"
      fill="#111827"
    />
  </svg>
);

interface LichessAuthButtonProps {
  label: "Sign in with Lichess" | "Sign up with Lichess";
  onClick: () => void;
  disabled?: boolean;
}

const buttonStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "12px",
  width: "100%",
  padding: "12px 16px",
  fontSize: "15px",
  fontWeight: 600,
  color: "#111827",
  background: "#f8fafc",
  border: "1px solid #cbd5e1",
  borderRadius: "8px",
  cursor: "pointer",
  transition: "background 0.2s, box-shadow 0.2s, border-color 0.2s",
  boxShadow: "0 1px 2px rgba(15,23,42,0.06)",
};

export const LichessAuthButton: React.FC<LichessAuthButtonProps> = ({
  label,
  onClick,
  disabled,
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        ...buttonStyle,
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          e.currentTarget.style.background = "#f1f5f9";
          e.currentTarget.style.boxShadow = "0 1px 4px rgba(15,23,42,0.08)";
          e.currentTarget.style.borderColor = "#94a3b8";
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "#f8fafc";
        e.currentTarget.style.boxShadow = "0 1px 2px rgba(15,23,42,0.06)";
        e.currentTarget.style.borderColor = "#cbd5e1";
      }}
      onFocus={(e) => {
        e.currentTarget.style.outline = "2px solid #0f172a";
        e.currentTarget.style.outlineOffset = "2px";
      }}
      onBlur={(e) => {
        e.currentTarget.style.outline = "none";
        e.currentTarget.style.outlineOffset = "0";
      }}
    >
      <LichessIcon size={20} />
      {label}
    </button>
  );
};
