import { useState } from "react";
import { enablePush } from "../../lib/push";
import { Button } from "../ui/button";

export function PushPrompt() {
  const [answered, setAnswered] = useState(false);
  const show =
    "Notification" in window &&
    Notification.permission === "default" &&
    !localStorage.getItem("push_prompt_shown");
  console.log("PushPrompt show:", show);
  if (!show || answered === true) return null;

  const onEnable = async () => {
    localStorage.setItem("push_prompt_shown", "1");
    await enablePush();
    setAnswered(true);
  };

  const onDismiss = () => {
    localStorage.setItem("push_prompt_shown", "1");
    setAnswered(true);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 rounded-lg border bg-background p-4 shadow-lg">
      <h4 className="font-semibold">Enable notifications?</h4>
      <p className="text-sm text-muted-foreground mt-1">
        Get notified when you receive new messages.
      </p>

      <div className="mt-4 flex gap-2 justify-end">
        <Button variant="outline" onClick={onDismiss}>
          Not now
        </Button>
        <Button onClick={onEnable}>Enable</Button>
      </div>
    </div>
  );
}
