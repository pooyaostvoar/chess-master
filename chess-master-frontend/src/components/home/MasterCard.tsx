import React from "react";
import { Card, CardContent, CardDescription, CardHeader } from "../ui/card";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { ExternalLink, Clock, DollarSign } from "lucide-react";
import type { User } from "../../services/auth";
import { AccountHeader } from "../profile/AccountHeader";

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
        <AccountHeader user={master} />
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

        {master.hourlyRate && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold">Session Rates</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="text-xs font-medium">
                <Clock className="h-3 w-3 mr-1" />
                60min: ${master.hourlyRate?.toFixed(2)}
              </Badge>
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
