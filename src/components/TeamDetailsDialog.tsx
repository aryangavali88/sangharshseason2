import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Users, Trophy, TrendingUp, Star } from "lucide-react";

interface TeamPlayer {
  player_name: string;
  bid_amount: number;
  created_at: string;
}

interface TeamDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  teamName: string;
  initialPoints: number;
}

export function TeamDetailsDialog({ open, onOpenChange, teamName, initialPoints }: TeamDetailsDialogProps) {
  const [players, setPlayers] = useState<TeamPlayer[]>([]);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    if (open && teamName) {
      loadTeamPlayers();
    }
  }, [open, teamName]);

  const loadTeamPlayers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('auction_bids')
        .select('player_name, bid_amount, created_at')
        .eq('team_name', teamName)
        .eq('is_winning_bid', true)
        .order('bid_amount', { ascending: false });

      if (error) throw error;
      setPlayers(data || []);
    } catch (error) {
      console.error('Error loading team players:', error);
      toast({
        title: "Error",
        description: "Failed to load team players",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const totalSpent = players.reduce((sum, player) => sum + Number(player.bid_amount), 0);
  const remainingPoints = initialPoints - totalSpent;
  const averageBid = players.length > 0 ? totalSpent / players.length : 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-primary" />
            {teamName}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Team Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  Players
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-2xl font-bold">{players.length}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  Total Spent
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-2xl font-bold">{totalSpent.toLocaleString()}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm">Remaining</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className={`text-2xl font-bold ${
                  remainingPoints < 1000 
                    ? 'text-destructive' 
                    : remainingPoints < 5000 
                    ? 'text-yellow-600' 
                    : 'text-green-600'
                }`}>
                  {remainingPoints.toLocaleString()}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-1">
                  <Star className="h-3 w-3" />
                  Avg Bid
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-2xl font-bold">{Math.round(averageBid).toLocaleString()}</div>
              </CardContent>
            </Card>
          </div>

          {/* Players List */}
          <Card>
            <CardHeader>
              <CardTitle>Squad Players</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse flex justify-between items-center p-3 bg-muted rounded">
                      <div className="h-4 bg-muted-foreground/20 rounded w-32"></div>
                      <div className="h-4 bg-muted-foreground/20 rounded w-20"></div>
                    </div>
                  ))}
                </div>
              ) : players.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No players acquired yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {players.map((player, index) => (
                    <div key={`${player.player_name}-${index}`} 
                         className="flex justify-between items-center p-3 bg-muted/50 rounded-lg hover:bg-muted transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{player.player_name}</span>
                          {index === 0 && (
                            <Badge variant="secondary" className="text-xs">
                              Highest Bid
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">{Number(player.bid_amount).toLocaleString()}</div>
                        <div className="text-xs text-muted-foreground">
                          {new Date(player.created_at).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
}