import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Users, Trophy, TrendingUp } from "lucide-react";
import { TeamDetailsDialog } from "@/components/TeamDetailsDialog";

interface Team {
  id: string;
  name: string;
  initial_points: number;
  created_at: string;
  updated_at: string;
}

interface TeamWithStats extends Team {
  used_points: number;
  remaining_points: number;
  players_count: number;
}

const Teams = () => {
  const [teams, setTeams] = useState<TeamWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState<{ name: string; initialPoints: number } | null>(null);
  const { toast } = useToast();

  const canonicalizeTeam = (name: string | null | undefined) => {
    const n = (name || '').toString().trim().toLowerCase().replace(/\s+/g, ' ');
    if (n === 'pathak panthers') return 'patil panthers';
    if (n === 'navagekar strikers') return 'navgekar strikers';
    if (n === 'navegekar stickers') return 'navgekar strikers';
    if (n === 'navegekar strikers') return 'navgekar strikers';
    if (n === 'navgekar stickers') return 'navgekar strikers';
    if (n === 'brije blasters') return 'birje blasters';
    return n;
  };

  const getDisplayTeamName = (name: string) => {
    if (name === "Brije Blasters") return "BIRJE BLASTERS";
    if (name === "Pathak Panthers") return "PATIL PANTHERS";
    if (name === "Navagekar Strikers") return "NAVGEKAR STRIKERS";
    if (name === "Navegekar Stickers") return "NAVGEKAR STRIKERS";
    return name.toUpperCase();
  };

  useEffect(() => {
    loadTeams();
  }, []);

  const loadTeams = async () => {
    try {
      setLoading(true);
      
      // Fetch teams
      const { data: teamsData, error: teamsError } = await supabase
        .from('teams')
        .select('*')
        .order('name');

      if (teamsError) throw teamsError;

      // Fetch all winning bids once and aggregate by canonical team name
      const { data: allWinningBids, error: bidsError } = await supabase
        .from('auction_bids')
        .select('team_name,bid_amount,is_winning_bid');
      if (bidsError) throw bidsError;

      const usedByTeam: Record<string, number> = {};
      const countByTeam: Record<string, number> = {};
      (allWinningBids || []).filter(b => b.is_winning_bid).forEach(b => {
        const key = canonicalizeTeam(b.team_name as string);
        usedByTeam[key] = (usedByTeam[key] || 0) + Number(b.bid_amount || 0);
        countByTeam[key] = (countByTeam[key] || 0) + 1;
      });

      const teamsWithStats = (teamsData || []).map(team => {
        const key = canonicalizeTeam(team.name);
        const usedPoints = usedByTeam[key] || 0;
        const playersCount = countByTeam[key] || 0;
        return {
          ...team,
          used_points: usedPoints,
          remaining_points: team.initial_points - usedPoints,
          players_count: playersCount
        } as TeamWithStats;
      });

      setTeams(teamsWithStats);
    } catch (error) {
      console.error('Error loading teams:', error);
      toast({
        title: "Error",
        description: "Failed to load teams data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleViewTeam = (team: TeamWithStats) => {
    setSelectedTeam({ name: getDisplayTeamName(team.name), initialPoints: team.initial_points });
  };

  if (loading) {
    return (
      <div className="px-6 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-48"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  const totalUsedPoints = teams.reduce((sum, team) => sum + team.used_points, 0);
  const totalPlayers = teams.reduce((sum, team) => sum + team.players_count, 0);

  return (
    <div className="px-3 sm:px-6 py-8 space-y-6">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-2">Teams</h1>
        <p className="text-muted-foreground">Track team performance and auction spending</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Teams</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teams.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Spent</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalUsedPoints.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">Auction points used</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Players Bought</CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPlayers}</div>
            <p className="text-xs text-muted-foreground">Across all teams</p>
          </CardContent>
        </Card>
      </div>

      {/* Teams Table */}
      <Card>
        <CardHeader>
          <CardTitle>Team Performance</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="min-w-[150px]">Team Name</TableHead>
                  <TableHead className="hidden sm:table-cell">Initial Points</TableHead>
                  <TableHead>Points Used</TableHead>
                  <TableHead className="hidden lg:table-cell">Players</TableHead>
                  <TableHead>Remaining Points</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {teams.map((team) => {
                  const percent = ((team.initial_points - team.remaining_points) / team.initial_points) * 100;
                  return (
                    <TableRow key={team.id}>
                      <TableCell className="font-medium">{getDisplayTeamName(team.name)}</TableCell>
                      <TableCell className="hidden sm:table-cell text-muted-foreground">
                        {team.initial_points.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <span className="font-medium">{team.used_points.toLocaleString()}</span>
                          <div className="w-full max-w-[120px]">
                            <div className="h-1.5 w-full rounded bg-gray-200">
                              <div className="h-1.5 rounded bg-green-500" style={{ width: `${Math.min(100, Math.max(0, percent))}%` }} />
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="hidden lg:table-cell">
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3 text-muted-foreground" />
                          <span>{team.players_count}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className={`font-medium ${
                          team.remaining_points < 1000 
                            ? 'text-destructive' 
                            : team.remaining_points < 5000 
                            ? 'text-yellow-600 dark:text-yellow-400' 
                            : 'text-green-600 dark:text-green-400'
                        }`}>
                          {team.remaining_points.toLocaleString()}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleViewTeam(team)}
                          className="text-primary hover:text-primary/80"
                        >
                          View Team
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Team Details Dialog */}
      <TeamDetailsDialog
        open={!!selectedTeam}
        onOpenChange={(open) => !open && setSelectedTeam(null)}
        teamName={selectedTeam?.name || ""}
        initialPoints={selectedTeam?.initialPoints || 0}
      />
    </div>
  );
};

export default Teams;