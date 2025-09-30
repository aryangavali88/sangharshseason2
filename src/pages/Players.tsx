import { useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import PlayerStatsPopover from "@/components/PlayerStatsPopover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type PlayerRow = Tables<"player_registrations">;

export default function Players() {
  const [query, setQuery] = useState("");
  const [allPlayers, setAllPlayers] = useState<PlayerRow[]>([]);

  // Top bids state
  const [topBids, setTopBids] = useState<Array<{ playerName: string; teamName: string; bidAmount: number; photoUrl?: string; position?: string }>>([]);
  const [topLoading, setTopLoading] = useState(true);
  const [topError, setTopError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPlayers = async () => {
      try {
        const { data, error } = await supabase.from("player_registrations").select("*");
        if (error) throw error;
        setAllPlayers(data || []);
      } catch (e) {
        console.error("Error fetching players:", e);
        setAllPlayers([]);
      }
    };
    fetchPlayers();
  }, []);

  useEffect(() => {
    const fetchTopWinningBids = async () => {
      try {
        setTopLoading(true);
        setTopError(null);
        // Get top 3 winning bids
        const { data: bids, error: bidsError } = await supabase
          .from('auction_bids')
          .select('player_name, team_name, bid_amount, is_winning_bid')
          .eq('is_winning_bid', true)
          .order('bid_amount', { ascending: false })
          .limit(3);
        if (bidsError) throw bidsError;

        const playerNames = Array.from(new Set((bids || []).map(b => b.player_name))).filter(Boolean) as string[];
        let playerMap: Record<string, { photo_url?: string; position?: string }> = {};
        if (playerNames.length > 0) {
          const { data: players, error: playersError } = await supabase
            .from('player_registrations')
            .select('name, photo_url, position')
            .in('name', playerNames);
          if (playersError) throw playersError;
          (players || []).forEach(p => {
            playerMap[p.name] = { photo_url: p.photo_url || undefined, position: p.position || undefined };
          });
        }

        const top = (bids || []).map(b => ({
          playerName: b.player_name,
          teamName: b.team_name,
          bidAmount: Number(b.bid_amount),
          photoUrl: playerMap[b.player_name]?.photo_url,
          position: playerMap[b.player_name]?.position,
        }));
        setTopBids(top);
      } catch (e: any) {
        console.error('Error fetching top bids:', e);
        setTopError(e?.message || 'Failed to load top bids');
      } finally {
        setTopLoading(false);
      }
    };
    fetchTopWinningBids();
  }, []);

  const rows = useMemo(() => {
    if (!query) return allPlayers;
    const q = query.toLowerCase();
    return allPlayers.filter((p) =>
      [p.name, p.position, p.season1_team].some((v) => v.toLowerCase().includes(q))
    );
  }, [query, allPlayers]);

  return (
    <div className="px-6 py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Players</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Explore the roster of talented cricketers participating in the tournament.
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search players"
          className="h-11 pl-10 rounded-xl bg-muted/40"
        />
      </div>

      {/* Highest Bid Players */}
      <section className="space-y-4">
        <h2 className="font-semibold text-foreground">Highest Bid Players</h2>
        {topLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="space-y-2 animate-pulse">
                <div className="w-56 h-56 rounded-lg bg-muted mx-auto" />
                <div className="h-4 bg-muted rounded w-40 mx-auto" />
                <div className="h-3 bg-muted rounded w-28 mx-auto" />
              </div>
            ))}
          </div>
        ) : topError ? (
          <p className="text-sm text-destructive">{topError}</p>
        ) : topBids.length === 0 ? (
          <p className="text-sm text-muted-foreground">No winning bids yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {topBids.map((p, idx) => (
              <div key={`${p.playerName}-${idx}`} className="space-y-2">
                <img
                  src={p.photoUrl || "/placeholder.svg"}
                  alt={p.playerName}
                  className="w-56 h-56 object-cover rounded-lg bg-muted mx-auto"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/placeholder.svg'; }}
                />
                <div className="text-center">
                  <div className="text-sm font-medium text-foreground">{p.playerName}</div>
                  <div className="text-xs text-muted-foreground">{p.position || '—'}</div>
                  <div className="text-xs text-muted-foreground">Team: {p.teamName}</div>
                  <div className="text-xs font-semibold text-primary">Bid: {p.bidAmount.toLocaleString()} pts</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* All Players Table */}
      <section className="space-y-4">
        <h2 className="font-semibold text-foreground">All Players</h2>
        <div className="rounded-lg border bg-card">
          <Table>
            <TableCaption className="sr-only">All players with key statistics</TableCaption>
            <TableHeader>
              <TableRow>
                <TableHead>Player</TableHead>
                <TableHead>Position</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Season 1 Team</TableHead>
                <TableHead>Stats</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((p) => (
                <TableRow key={p.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={p.photo_url || "/placeholder.svg"} alt={p.name} />
                        <AvatarFallback>{p.name.split(" ").map((n) => n[0]).join("")}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium text-foreground">{p.name}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{p.position}</TableCell>
                  <TableCell>
                    {p.is_unsold ? (
                      <Badge variant="destructive" className="text-xs">Unsold</Badge>
                    ) : (
                      <Badge variant="secondary" className="text-xs">Active</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{p.season1_team}</TableCell>
                  <TableCell>
                    <PlayerStatsPopover roleNumber={p.role_number} playerName={p.name} />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </section>
    </div>
  );
}