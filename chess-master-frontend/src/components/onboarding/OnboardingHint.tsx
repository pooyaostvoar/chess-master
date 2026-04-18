interface OnboardingAction {
  label: string;
  onClick: () => void;
  variant?: "default" | "outline" | "ghost";
}

interface OnboardingHintProps {
  title: string;
  text: string;
  actions?: OnboardingAction[];
}

export const OnboardingHint: React.FC<OnboardingHintProps> = ({
  title,
  text,
  actions = [],
}) => {
  return (
    <div className="fixed top-20 right-6 z-50 max-w-sm bg-[#FAF5EB] border border-[#1F1109]/[0.12] shadow-lg rounded-xl p-4 animate-in fade-in slide-in-from-top-2">
      <h3 className="font-medium text-sm text-[#1F1109] mb-1">{title}</h3>
      <p className="text-xs text-[#6B5640] mb-4 leading-relaxed">{text}</p>

      {actions.length > 0 && (
        <div className="flex gap-2">
          {actions.map((action, idx) => (
            <button
              key={idx}
              onClick={action.onClick}
              className={`text-xs font-medium px-3.5 py-2 rounded-lg transition-colors ${
                action.variant === "outline"
                  ? "border border-[#1F1109]/[0.15] text-[#3D2817] hover:bg-[#1F1109]/[0.04]"
                  : "bg-[#B8893D] text-[#1F1109] hover:bg-[#A37728]"
              }`}
            >
              {action.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
