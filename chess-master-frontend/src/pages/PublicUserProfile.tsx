import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { getPublicUser } from "../services/api/user.api";

const PublicUserProfile: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;

    const loadUser = async () => {
      try {
        const res = await getPublicUser(Number(id));
        setUser(res);
      } catch (err) {
        console.error(err);
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, [id]);

  const normalizeUrl = (url: string) =>
    url.startsWith("http://") || url.startsWith("https://")
      ? url
      : `https://${url}`;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-gray-200 border-t-primary rounded-full animate-spin mb-5" />
        <p className="text-muted-foreground">Loading profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-20 text-muted-foreground">
        User not found
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-5 py-12">
      <Card className="overflow-hidden shadow-lg">
        {/* HEADER */}
        <CardHeader className="relative text-center pb-10 bg-gradient-to-br from-primary/10 via-background to-primary/5">
          {user.isMaster && (
            <Badge className="absolute top-4 right-4">Master</Badge>
          )}

          {user.profilePicture ? (
            <img
              src={user.profilePicture}
              alt={user.username}
              className="w-32 h-32 rounded-full mx-auto object-cover
                         border-4 border-primary shadow-md"
            />
          ) : (
            <div
              className="w-32 h-32 rounded-full mx-auto flex items-center justify-center
                            bg-gradient-to-br from-primary to-primary/80
                            text-white text-4xl font-bold shadow-md"
            >
              {user.username.charAt(0).toUpperCase()}
            </div>
          )}

          <div className="mt-4">
            <CardTitle className="text-3xl">{user.username}</CardTitle>
            {user.title && (
              <CardDescription className="mt-1 text-base">
                {user.title}
              </CardDescription>
            )}
          </div>
        </CardHeader>

        {/* CONTENT */}
        <CardContent className="space-y-8 pt-8">
          {/* RATING */}
          {user.rating !== null && (
            <div className="flex items-center gap-3">
              <Badge variant="secondary">Rating</Badge>
              <span className="font-semibold">{user.rating}</span>
            </div>
          )}

          {/* LANGUAGE */}
          {user.languages && (
            <div className="space-y-2">
              <h3 className="font-semibold text-primary">Languages</h3>
              <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                {user.languages.join(", ")}
              </p>
            </div>
          )}

          {/* BIO */}
          {user.bio && (
            <div className="space-y-2">
              <h3 className="font-semibold text-primary">About</h3>
              <p className="text-muted-foreground whitespace-pre-line leading-relaxed">
                {user.bio}
              </p>
            </div>
          )}

          {/* CHESS LINKS */}
          {(user.chesscomUrl || user.lichessUrl) && (
            <div className="space-y-3">
              <h3 className="font-semibold text-primary">Chess Profiles</h3>
              <div className="flex gap-3 flex-wrap">
                {user.chesscomUrl && (
                  <Button variant="outline" asChild>
                    <a
                      href={normalizeUrl(user.chesscomUrl)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      ♟ Chess.com
                    </a>
                  </Button>
                )}

                {user.lichessUrl && (
                  <Button variant="outline" asChild>
                    <a
                      href={normalizeUrl(user.lichessUrl)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      ♞ Lichess
                    </a>
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* PRICING */}
          {user.isMaster && user.hourlyRate !== null && (
            <div className="border-t pt-6 bg-primary/5 rounded-lg p-4">
              <h3 className="font-semibold text-primary mb-1">Hourly Rate</h3>
              <p className="text-2xl font-bold text-primary">
                ${user.hourlyRate.toFixed(2)}
                <span className="text-sm font-normal text-muted-foreground">
                  {" "}
                  / hour
                </span>
              </p>
            </div>
          )}
          {/* ACTION BUTTONS */}
          <div className="flex flex-wrap justify-center gap-3 px-6 pb-6">
            <Button
              onClick={() => {
                navigate(`/chat/${user.id}`);
              }}
            >
              Send Message
            </Button>

            {user.isMaster && (
              <>
                <Button
                  variant="outline"
                  onClick={() => {
                    navigate(`/calendar/${user.id}`);
                  }}
                >
                  View Schedule
                </Button>

                <Button variant="secondary">Recorded Lessons</Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PublicUserProfile;
