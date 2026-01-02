import { Button } from "../ui/button";

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
    <div className="fixed top-20 right-6 z-50 max-w-sm bg-white border shadow-lg rounded-lg p-4 animate-in fade-in slide-in-from-top-2">
      <h3 className="font-semibold text-sm mb-1">{title}</h3>
      <p className="text-sm text-muted-foreground mb-4">{text}</p>

      {actions.length > 0 && (
        <div className="flex gap-2">
          {actions.map((action, idx) => (
            <Button
              key={idx}
              size="sm"
              variant={action.variant ?? "default"}
              onClick={action.onClick}
            >
              {action.label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
};
