import React from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import type { LucideIcon } from "lucide-react";

export interface SessionTypeCardProps {
  /** Unique ID for analytics tracking */
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  /** Optional CTA - when omitted, card is informational only */
  ctaLabel?: string;
  /** Route for CTA (required if ctaLabel is provided) */
  href?: string;
  /** Optional tags/chips for scannability */
  tags?: readonly string[];
}

export const SessionTypeCard: React.FC<SessionTypeCardProps> = ({
  id,
  title,
  description,
  icon: Icon,
  ctaLabel,
  href,
  tags = [],
}) => {
  const navigate = useNavigate();
  const hasCta = ctaLabel && href;

  const handleCtaClick = () => {
    if (href) navigate(href);
  };

  return (
    <Card
      className="group flex flex-col h-full transition-all duration-200 hover:shadow-lg hover:border-primary/30 hover:-translate-y-0.5"
    >
      <CardHeader className={hasCta ? "pb-3" : "pb-6"}>
        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
          <Icon className="h-6 w-6 text-primary" aria-hidden />
        </div>
        <h3 className="text-lg font-semibold mb-2">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3">
            {tags.map((tag) => (
              <Badge
                key={tag}
                variant="secondary"
                className="text-xs font-medium"
              >
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </CardHeader>
      {hasCta && (
        <CardContent className="mt-auto pt-0">
          <Button
            className="w-full"
            onClick={handleCtaClick}
            data-session-type={id}
            data-cta={`quickstart-${id}`}
          >
            {ctaLabel}
          </Button>
        </CardContent>
      )}
    </Card>
  );
};
