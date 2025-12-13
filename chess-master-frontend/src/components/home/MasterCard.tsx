import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { ExternalLink, Clock, DollarSign } from "lucide-react";
import type { User } from "../../services/auth";

interface MasterCardProps {
  master: User;
  onViewSchedule: (userId: number) => void;
}

export const MasterCard: React.FC<MasterCardProps> = ({
  master,
  onViewSchedule,
}) => {
  return (
    <Card className="cursor-pointer hover:shadow-lg transition-shadow flex flex-col">
      <CardHeader className="flex-1">
        <div className="flex items-center gap-4 mb-4">
          {master.profilePicture ? (
            <img
              src={master.profilePicture}
              alt={master.username}
              className="w-16 h-16 rounded-full object-cover border-2 border-primary"
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-primary/80 flex items-center justify-center text-white text-2xl font-bold">
              {master.username.charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex-1">
            <CardTitle className="text-xl">{master.username}</CardTitle>
            {master.title && (
              <Badge variant="default" className="mt-1">
                {master.title}
              </Badge>
            )}
          </div>
        </div>
        {master.rating && (
          <div className="mb-2">
            <span className="text-sm text-muted-foreground">Rating: </span>
            <span className="text-lg font-bold">{master.rating}</span>
          </div>
        )}
        {master.bio && (
          <CardDescription className="line-clamp-2 mb-3">
            {master.bio}
          </CardDescription>
        )}
        {(master.chesscomUrl || master.lichessUrl) && (
          <div className="flex gap-3 mt-3">
            {master.chesscomUrl && (
              <a
                href={
                  master.chesscomUrl.startsWith("http")
                    ? master.chesscomUrl
                    : `https://www.chess.com/member/${master.chesscomUrl}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline flex items-center gap-1"
                onClick={(e) => e.stopPropagation()}
              >
                Chess.com
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
            {master.lichessUrl && (
              <a
                href={
                  master.lichessUrl.startsWith("http")
                    ? master.lichessUrl
                    : `https://lichess.org/@/${master.lichessUrl.replace(
                        "@/",
                        ""
                      )}`
                }
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline flex items-center gap-1"
                onClick={(e) => e.stopPropagation()}
              >
                Lichess
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        )}

        {/* Pricing Display */}
        {master.pricing &&
          (master.pricing.price5min ||
            master.pricing.price10min ||
            master.pricing.price15min ||
            master.pricing.price30min ||
            master.pricing.price45min ||
            master.pricing.price60min) && (
            <div className="mt-4 pt-4 border-t">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="h-4 w-4 text-primary" />
                <span className="text-sm font-semibold">Session Rates</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {[
                  {
                    price: master.pricing.price5min,
                    label: "5min",
                  },
                  {
                    price: master.pricing.price10min,
                    label: "10min",
                  },
                  {
                    price: master.pricing.price15min,
                    label: "15min",
                  },
                  {
                    price: master.pricing.price30min,
                    label: "30min",
                  },
                  {
                    price: master.pricing.price45min,
                    label: "45min",
                  },
                  {
                    price: master.pricing.price60min,
                    label: "1hr",
                  },
                ]
                  .filter((p) => p.price)
                  .map(({ price, label }) => (
                    <Badge
                      key={label}
                      variant="outline"
                      className="text-xs font-medium"
                    >
                      <Clock className="h-3 w-3 mr-1" />
                      {label}: ${price?.toFixed(2)}
                    </Badge>
                  ))}
              </div>
            </div>
          )}
      </CardHeader>
      <CardContent>
        <Button className="w-full" onClick={() => onViewSchedule(master.id)}>
          View Schedule
        </Button>
      </CardContent>
    </Card>
  );
};
