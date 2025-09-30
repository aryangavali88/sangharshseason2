import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";

interface PlayerStatsPopoverProps {
  roleNumber: string;
  playerName: string;
}

type PreviousYearStats = Tables<"PREVIOUS YEAR STATS">;

const PlayerStatsPopover = ({ roleNumber, playerName }: PlayerStatsPopoverProps) => {
  const [stats, setStats] = useState<PreviousYearStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const fetchStats = async () => {
    if (!roleNumber) return; // Only fetch if roleNumber is available
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error: fetchError } = await supabase
        .from("PREVIOUS YEAR STATS")
        .select("*")
        .eq("ROLE NO", roleNumber)
        .maybeSingle();

      if (fetchError) {
        throw fetchError;
      }

      setStats(data);
    } catch (err) {
      setError("Failed to fetch stats: " + (err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStats();
    }
  }, [isOpen, roleNumber]);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full">
          View Stats
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl p-0 bg-background">
        <div className="flex flex-col">
          {/* Header with back button */}
          <div className="flex items-center p-4 border-b">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => setIsOpen(false)}
              className="mr-2"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h2 className="text-lg font-bold">{playerName} - Previous Year Stats</h2>
          </div>

          {/* Content */}
          <div className="overflow-y-auto p-4 max-h-[70vh]">
            <div className="space-y-4">

          {isLoading && (
            <div className="text-center py-6">
              <p className="text-muted-foreground">Loading stats...</p>
            </div>
          )}

          {error && (
            <div className="text-center py-6">
              <p className="text-destructive">{error}</p>
            </div>
          )}

          {!isLoading && !error && !stats && (
            <div className="text-center py-6">
              <p className="text-muted-foreground">No previous year stats available</p>
            </div>
          )}

          {stats && (
            <div className="grid md:grid-cols-1 gap-4">
              {/* MVP Stats */}
              <Card className="h-fit">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-lg">MVP Performance</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-2 space-y-2">
                  <div className="flex justify-between py-1 border-b">
                    <span className="text-muted-foreground text-sm">MVP Rank:</span>
                    <span className="font-semibold">#{stats["MVP RANK"]}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b">
                    <span className="text-muted-foreground text-sm">Total MVP Points:</span>
                    <span className="font-semibold">{stats["TOTAL MVP POINTS"] || "N/A"}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground text-sm">Matches Played:</span>
                    <span className="font-semibold">{stats["MATCHES"] || "N/A"}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Batting Stats */}
              <Card className="h-fit">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-lg">Batting Performance</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-2 space-y-2">
                  <div className="flex justify-between py-1 border-b">
                    <span className="text-muted-foreground text-sm">Batting Rank:</span>
                    <span className="font-semibold">#{stats["BAT RANK"] || "N/A"}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b">
                    <span className="text-muted-foreground text-sm">Batting Runs:</span>
                    <span className="font-semibold">{stats["batting runs"] || "N/A"}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b">
                    <span className="text-muted-foreground text-sm">Highest Score:</span>
                    <span className="font-semibold">{stats["HIGEST"] || "N/A"}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b">
                    <span className="text-muted-foreground text-sm">Fifties:</span>
                    <span className="font-semibold">{stats["50s"] || "0"}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b">
                    <span className="text-muted-foreground text-sm">Fours:</span>
                    <span className="font-semibold">{stats["4s"] || "0"}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b">
                    <span className="text-muted-foreground text-sm">Sixes:</span>
                    <span className="font-semibold">{stats["6s"] || "0"}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground text-sm">Batting Style:</span>
                    <span className="font-semibold">{stats["BATTING STYLE"] || "N/A"}</span>
                  </div>
                </CardContent>
              </Card>

              {/* Bowling Stats */}
              <Card className="h-fit">
                <CardHeader className="p-4 pb-2">
                  <CardTitle className="text-lg">Bowling Performance</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-2 space-y-2">
                  <div className="flex justify-between py-1 border-b">
                    <span className="text-muted-foreground text-sm">Bowling Rank:</span>
                    <span className="font-semibold">#{stats["BOWL RANK"] || "N/A"}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b">
                    <span className="text-muted-foreground text-sm">Wickets:</span>
                    <span className="font-semibold">{stats["WICKETS"] || "0"}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b">
                    <span className="text-muted-foreground text-sm">Overs Bowled:</span>
                    <span className="font-semibold">{stats["OVERS"] || "0"}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b">
                    <span className="text-muted-foreground text-sm">Economy Rate:</span>
                    <span className="font-semibold">{stats["ECO"] || "N/A"}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b">
                    <span className="text-muted-foreground text-sm">Bowling Runs Considered:</span>
                    <span className="font-semibold">{stats["bowling runs considered"] || "N/A"}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-muted-foreground text-sm">Bowling Style:</span>
                    <span className="font-semibold">{stats["BOWL STYLE"] || "N/A"}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PlayerStatsPopover;