import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import cricketPlayerAction from "@/assets/cricket-player-action.jpg";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/types";
import PlayerStatsPopover from "@/components/PlayerStatsPopover";
import { useAuth } from "@/contexts/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const LiveAuction = () => {
  const { user } = useAuth();
  type Player = Tables<"player_registrations"> & Partial<Tables<"PREVIOUS YEAR STATS">>;
  const [bidAmount, setBidAmount] = useState("");
  const [currentBiddingTeam, setCurrentBiddingTeam] = useState("");
  const [winningTeam, setWinningTeam] = useState("");
  const [winningBids, setWinningBids] = useState<Array<{ playerName: string; teamName: string; bidAmount: number }>>([]);
  const [activePlayer, setActivePlayer] = useState<Player | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [allBids, setAllBids] = useState<Array<{ playerName: string; bidAmount: number; teamName: string | null }>>([]);
  const [currentAuctionPlayer, setCurrentAuctionPlayer] = useState<Tables<"current_auction_player"> | null>(null);
  
  // Unsold Round state
  const [currentRound, setCurrentRound] = useState<'main' | 'unsold'>('main');
  const [showCongratulation, setShowCongratulation] = useState(false);
  const [soldPlayerDetails, setSoldPlayerDetails] = useState<{
    playerName: string;
    teamName: string;
    bidAmount: number;
  } | null>(null);

  // Summary dialog state
  const [showSummary, setShowSummary] = useState(false);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [remainingByRole, setRemainingByRole] = useState<{ batsman: number; bowler: number; wicketKeeper: number; allRounder: number; total: number }>({ batsman: 0, bowler: 0, wicketKeeper: 0, allRounder: 0, total: 0 });
  const [highestBidSoFar, setHighestBidSoFar] = useState<{ playerName: string; teamName: string; bidAmount: number } | null>(null);

  // Remaining points per team
  const [teamRemainingPoints, setTeamRemainingPoints] = useState<Record<string, number>>({});
  const [teamInitialPoints, setTeamInitialPoints] = useState<Record<string, number>>({});
  const [remainingGirls, setRemainingGirls] = useState<number>(0);

  // Image preview state
  const [showImagePreview, setShowImagePreview] = useState(false);

  // Load bids, current player, team remaining points, and current round
  useEffect(() => {
    loadBids();
    loadCurrentAuctionPlayer();
    loadTeamsRemaining();
    loadCurrentRound();

    // Subscribe to current auction player changes
    const auctionPlayerChannel = supabase
      .channel('current-auction-player-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'current_auction_player' }, 
        () => {
          loadCurrentAuctionPlayer();
        }
      )
      .subscribe();

    // Subscribe to auction bids changes for real-time updates
    const bidsChannel = supabase
      .channel('auction-bids-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'auction_bids' }, 
        () => {
          loadBids();
          loadTeamsRemaining();
        }
      )
      .subscribe();

    // Subscribe to auction rounds changes
    const roundsChannel = supabase
      .channel('auction-rounds-changes')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'auction_rounds' }, 
        () => {
          loadCurrentRound();
        }
      )
      .subscribe();
 
    return () => {
      supabase.removeChannel(auctionPlayerChannel);
      supabase.removeChannel(bidsChannel);
      supabase.removeChannel(roundsChannel);
    };
  }, []);

  const teams = [
    "NAVGEKAR STRIKERS",
    "PATIL PANTHERS",
    "JOSHI WARRIORS",
    "THE AURWADKARS",
    "GUPTE GLADIATORS",
    "BIRJE BLASTERS"
  ];

  const canonicalizeTeam = (name: string | null | undefined) => {
    const n = (name || '').toString().trim().toLowerCase().replace(/\s+/g, ' ');
    if (n === 'pathak panthers') return 'patil panthers';
    // Normalize Navgekar Strikers misspellings
    if (n === 'navagekar strikers') return 'navgekar strikers';
    if (n === 'navegekar stickers') return 'navgekar strikers';
    if (n === 'navegekar strikers') return 'navgekar strikers';
    if (n === 'navgekar stickers') return 'navgekar strikers';
    return n;
  };

  const loadCurrentRound = async () => {
    try {
      const { data: rounds, error } = await supabase
        .from('auction_rounds')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (error) throw error;
      
      if (rounds && rounds.length > 0) {
        setCurrentRound(rounds[0].round_type as 'main' | 'unsold');
      } else {
        setCurrentRound('main');
      }
    } catch (e) {
      console.error('Error loading current round:', e);
    }
  };

  const loadBids = async () => {
    try {
      const { data: bids, error } = await supabase
        .from('auction_bids')
        .select('*')
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      
      if (bids) {
        const winningBidsData = bids
          .filter(bid => bid.is_winning_bid)
          .map(bid => ({
            playerName: bid.player_name,
            teamName: bid.team_name,
            bidAmount: Number(bid.bid_amount)
          }));
        
        const allBidsData = bids.map(bid => ({
          playerName: bid.player_name,
          teamName: bid.team_name,
          bidAmount: Number(bid.bid_amount)
        }));
        
        setWinningBids(winningBidsData);
        setAllBids(allBidsData);
      }
    } catch (err) {
      console.error('Error loading bids:', err);
    }
  };

  const loadCurrentAuctionPlayer = async () => {
    try {
      const { data: currentPlayer, error } = await supabase
        .from('current_auction_player')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1);
      
      if (error) throw error;
      
      if (currentPlayer && currentPlayer.length > 0) {
        const player = currentPlayer[0];
        setCurrentAuctionPlayer(player);
        
        // Fetch full player details and stats
        const { data: fullPlayer, error: playerError } = await supabase
          .from("player_registrations")
          .select("*")
          .eq("role_number", player.role_number)
          .single();

        if (playerError) throw playerError;

        const { data: stats, error: statsError } = await supabase
          .from("PREVIOUS YEAR STATS")
          .select("*")
          .eq("ROLE NO", player.role_number) 
          .single();

        if (statsError && statsError.code !== "PGRST116") {
          throw statsError;
        }

        setActivePlayer({ ...fullPlayer, ...stats });
      } else {
        setCurrentAuctionPlayer(null);
        setActivePlayer(null);
      }
    } catch (err) {
      console.error('Error loading current auction player:', err);
    }
  };

  const loadTeamsRemaining = async () => {
    try {
      // Fetch teams
      const { data: teamsData, error: teamsError } = await supabase
        .from('teams')
        .select('*');
      if (teamsError) throw teamsError;

      const initialMap: Record<string, number> = {};
      (teamsData || []).forEach(t => {
        const key = canonicalizeTeam(t.name);
        initialMap[key] = Number(t.initial_points) || 0;
      });
      setTeamInitialPoints(initialMap);

      // Fetch all winning bids once
      const { data: bidsData, error: bidsError } = await supabase
        .from('auction_bids')
        .select('team_name,bid_amount,is_winning_bid');
      if (bidsError) throw bidsError;

      const usedByTeam: Record<string, number> = {};
      (bidsData || []).filter(b => b.is_winning_bid).forEach(b => {
        const teamKey = canonicalizeTeam(b.team_name || '');
        usedByTeam[teamKey] = (usedByTeam[teamKey] || 0) + Number(b.bid_amount || 0);
      });

      const remaining: Record<string, number> = {};
      teams.forEach(displayName => {
        const key = canonicalizeTeam(displayName);
        remaining[displayName] = Math.max(0, (initialMap[key] || 0) - (usedByTeam[key] || 0));
      });
      setTeamRemainingPoints(remaining);
    } catch (e) {
      console.error('Error loading teams remaining:', e);
    }
  };

  // Summary derivations
  useEffect(() => {
    const computeSummary = async () => {
      try {
        setSummaryError(null);
        // Highest bid so far (from winning bids)
        if (winningBids.length > 0) {
          const top = [...winningBids].sort((a, b) => b.bidAmount - a.bidAmount)[0];
          setHighestBidSoFar(top);
        } else {
          setHighestBidSoFar(null);
        }

        // Remaining players by role (not sold yet)
        const soldNames = winningBids.map(b => b.playerName).filter(Boolean);
        const { count: batsCount, error: batsErr } = await supabase
          .from('player_registrations')
          .select('*', { count: 'exact', head: true })
          .eq('position', 'batsman')
          .not('name', 'in', `(${soldNames.join(',') || ''})`);
        if (batsErr) throw batsErr;
        const { count: bowlCount, error: bowlErr } = await supabase
          .from('player_registrations')
          .select('*', { count: 'exact', head: true })
          .eq('position', 'bowler')
          .not('name', 'in', `(${soldNames.join(',') || ''})`);
        if (bowlErr) throw bowlErr;
        const { count: wkCount, error: wkErr } = await supabase
          .from('player_registrations')
          .select('*', { count: 'exact', head: true })
          .eq('position', 'wicket-keeper')
          .not('name', 'in', `(${soldNames.join(',') || ''})`);
        if (wkErr) throw wkErr;
        const { count: arCount, error: arErr } = await supabase
          .from('player_registrations')
          .select('*', { count: 'exact', head: true })
          .eq('position', 'all-rounder')
          .not('name', 'in', `(${soldNames.join(',') || ''})`);
        if (arErr) throw arErr;
        const remainingTotal = (batsCount || 0) + (bowlCount || 0) + (wkCount || 0) + (arCount || 0);
        setRemainingByRole({ batsman: batsCount || 0, bowler: bowlCount || 0, wicketKeeper: wkCount || 0, allRounder: arCount || 0, total: remainingTotal });

        // Remaining girls (flag-based)
        const { count: girlsCount, error: girlsErr } = await supabase
          .from('player_registrations')
          .select('*', { count: 'exact', head: true })
          .eq('is_girl', true)
          .not('name', 'in', `(${soldNames.join(',') || ''})`);
        if (girlsErr) throw girlsErr;
        setRemainingGirls(girlsCount || 0);
      } catch (e: any) {
        console.error('Error computing summary:', e);
        setSummaryError(e?.message || 'Failed to compute auction summary.');
      }
    };
    computeSummary();
  }, [winningBids]);

  const currentPlayer = {
    name: activePlayer?.name || "",
    role: activePlayer?.position || "",
    auctionNumber: activePlayer?.auction_number,
    achievement: activePlayer?.achievement || "",
    basePrice: 100,
    image: activePlayer?.photo_url || cricketPlayerAction,
    rankings: {
      mvp: activePlayer?.["MVP RANK"] || 0,
      batting: activePlayer?.["BAT RANK"] || 0,
      bowling: activePlayer?.["BOWL RANK"] || 0
    }
  };

  const handleBid = async () => {
    if (!user) return; // Only authenticated users can bid
    
    if (bidAmount && currentPlayer.name && currentBiddingTeam) {
      try {
        const { error } = await supabase
          .from('auction_bids')
          .insert({
            player_name: currentPlayer.name,
            team_name: currentBiddingTeam,
            bid_amount: parseFloat(bidAmount),
            is_winning_bid: false
          });
        
        if (error) throw error;
        
        setAllBids(prevBids => [...prevBids, { 
          playerName: currentPlayer.name, 
          bidAmount: parseFloat(bidAmount), 
          teamName: currentBiddingTeam 
        }]);
      } catch (err) {
        console.error('Error placing bid:', err);
      }
    }
    setBidAmount("");
  };

  const handleSold = async () => {
    if (!user) return; // Only authenticated users can mark as sold
    
    if (winningTeam && bidAmount) {
      try {
        // Prevent selling a player more than once (frontend guard)
        if (currentPlayer.name && winningBids.some(b => b.playerName === currentPlayer.name)) {
          setError(`Player "${currentPlayer.name}" is already sold.`);
          return;
        }

        // Backend guard: check any existing winning bid for this player
        const { data: existing, error: checkError } = await supabase
          .from('auction_bids')
          .select('id')
          .eq('player_name', currentPlayer.name)
          .eq('is_winning_bid', true)
          .limit(1)
          .maybeSingle();
        if (checkError) {
          setError('Failed to verify existing winning bids. Please try again.');
          return;
        }
        if (existing) {
          setError(`Player "${currentPlayer.name}" is already sold.`);
          return;
        }

        const { error } = await supabase
          .from('auction_bids')
          .insert({
            player_name: currentPlayer.name,
            team_name: winningTeam,
            bid_amount: parseFloat(bidAmount),
            is_winning_bid: true
          });
        
        if (error) {
          const msg = (error as any)?.message || '';
          if (msg.toLowerCase().includes('duplicate') || msg.toLowerCase().includes('unique')) {
            setError(`Player "${currentPlayer.name}" is already sold.`);
            return;
          }
          setError('Failed to mark player as sold. Please try again.');
          return;
        }
        
        setWinningBids([
          ...winningBids,
          {
            playerName: currentPlayer.name,
            teamName: winningTeam,
            bidAmount: parseFloat(bidAmount),
          },
        ]);
        setBidAmount("");
        setWinningTeam("");
        loadTeamsRemaining();
        fetchPlayer();
      } catch (err) {
        console.error('Error recording winning bid:', err);
        setError('Unexpected error marking player as sold.');
      }
    }
  };

  const handleUnsold = async () => {
    if (!user || !activePlayer) return;
    
    try {
      // Mark player as unsold
      const { error } = await supabase
        .from('player_registrations')
        .update({ is_unsold: true })
        .eq('role_number', activePlayer.role_number);
      
      if (error) throw error;
      
      // Fetch next player
      fetchPlayer();
    } catch (err) {
      console.error('Error marking player as unsold:', err);
    }
  };

  const startUnsoldRound = async () => {
    if (!user) return;
    
    try {
      // Clear any existing active rounds
      await supabase
        .from('auction_rounds')
        .update({ is_active: false })
        .eq('is_active', true);

      // Create new unsold round
      const { error } = await supabase
        .from('auction_rounds')
        .insert({
          round_type: 'unsold',
          is_active: true
        });
      
      if (error) throw error;
      
      setCurrentRound('unsold');
      fetchPlayer();
    } catch (err) {
      console.error('Error starting unsold round:', err);
    }
  };

  const resetUnsoldPlayers = async () => {
    if (!user) return;
    
    try {
      // Reset all players unsold status
      const { error } = await supabase
        .from('player_registrations')
        .update({ is_unsold: false })
        .eq('is_unsold', true);
      
      if (error) throw error;
      
      // Delete all auction rounds rows
      const { error: deleteRoundsError } = await supabase
        .from('auction_rounds')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');
      if (deleteRoundsError) throw deleteRoundsError;
      
      setCurrentRound('main');
    } catch (err) {
      console.error('Error resetting unsold players:', err);
    }
  };

  const returnToMainRound = async () => {
    if (!user) return;
    try {
      await supabase
        .from('auction_rounds')
        .update({ is_active: false })
        .eq('is_active', true);
      setCurrentRound('main');
      fetchPlayer();
    } catch (err) {
      console.error('Error returning to main round:', err);
    }
  };

  const fetchPlayer = async () => {
    if (!user) return; // Only authenticated users can start auction
    
    setIsLoading(true);
    setError(null);
    try {
      // Get already auctioned players
      const { data: winningBids, error: winningBidsError } = await supabase
        .from('auction_bids')
        .select('player_name')
        .eq('is_winning_bid', true);
      
      if (winningBidsError) throw winningBidsError;
      
      const auctionedPlayerNames = winningBids?.map(bid => bid.player_name) || [];
      
      // Get next available player based on current round
      let playerQuery = supabase
        .from("player_registrations")
        .select("*")
        .not("name", "in", `(${auctionedPlayerNames.join(",")})`)
        .order("auction_number", { ascending: true })
        .order("role_number", { ascending: true });
      
      if (currentRound === 'unsold') {
        playerQuery = playerQuery.eq('is_unsold', true);
      } else {
        playerQuery = playerQuery.eq('is_unsold', false);
      }
      
      const { data: player, error: playerError } = await playerQuery
        .limit(1) 
        .single();

      if (playerError) {
        throw playerError;
      }

      if (!player) {
        setError("No players found or all players auctioned.");
        return;
      }

      // Clear any existing current auction player
      await supabase
        .from('current_auction_player')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000');

      // Insert new current auction player
      const { error: insertError } = await supabase
        .from('current_auction_player')
        .insert({
          player_name: player.name,
          role_number: player.role_number,
          season1_team: player.season1_team || '',
          position: player.position,
          class: player.class,
          photo_url: player.photo_url,
          is_active: true
        });

      if (insertError) throw insertError;

    } catch (err) {
      setError("Failed to fetch player: " + (err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-3 sm:p-4 md:p-6 space-y-6 md:space-y-8">
      {/* Auction Controls */}
      <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-4">
        <Button 
          onClick={() => fetchPlayer()} 
          className="bg-primary hover:bg-primary/90 w-full sm:w-auto"
          disabled={isLoading || !user}
        >
          {isLoading ? "Starting..." : currentRound === 'unsold' ? "Start Unsold Round" : "Start Auction"}
        </Button>
        {activePlayer && (
          <Button 
            variant="destructive"
            disabled={!user}
            className="w-full sm:w-auto"
            onClick={async () => {
              if (!user) return;
              
              try {
                // Delete current auction player to stop auction
                const { error: playerError } = await supabase
                  .from('current_auction_player')
                  .delete()
                  .neq('id', '00000000-0000-0000-0000-000000000000');
                
                if (playerError) throw playerError;
                
                // Reset local state
                setActivePlayer(null);
                setCurrentAuctionPlayer(null);
                setBidAmount("");
                setCurrentBiddingTeam("");
                setWinningTeam("");
              } catch (err) {
                console.error('Error stopping auction:', err);
              }
            }}
          >
            Stop Auction
          </Button>
        )}
        <Button 
          variant="secondary"
          disabled={!user}
          className="w-full sm:w-auto"
          onClick={async () => {
            if (!user) return;
            
            try {
              // Delete all auction bids from database
              const { error: bidsError } = await supabase
                .from('auction_bids')
                .delete()
                .neq('id', '00000000-0000-0000-0000-000000000000');
              
              if (bidsError) throw bidsError;
              
              // Delete current auction player
              const { error: playerError } = await supabase
                .from('current_auction_player')
                .delete()
                .neq('id', '00000000-0000-0000-0000-000000000000');
              
              if (playerError) throw playerError;
              
              // Reset local state
              setWinningBids([]);
              setAllBids([]);
              setActivePlayer(null);
              setCurrentAuctionPlayer(null);
              setBidAmount("");
              setCurrentBiddingTeam("");
              setWinningTeam("");
              loadTeamsRemaining();
            } catch (err) {
              console.error('Error resetting auction:', err);
            }
          }}
        >
          Reset Auction
        </Button>
        <Button
          variant="outline"
          className="w-full sm:w-auto"
          onClick={() => setShowSummary(true)}
        >
          Auction Summary
        </Button>
      </div>

      {/* Auction Summary Badge */}
      <div className="text-center">
        <Badge variant="secondary" className="text-sm px-4 py-2">
          {currentRound === 'unsold' ? 'Unsold Round' : 'Main Auction'}
        </Badge>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
        {/* Player Image */}
        <div className="flex justify-center lg:col-span-1 order-1 lg:order-1">
          {isLoading ? (
            <div className="w-full max-w-sm h-[20rem] sm:h-[24rem] lg:h-[32rem] bg-muted rounded-lg shadow-lg flex items-center justify-center">
              <p className="text-muted-foreground">Loading Player...</p>
            </div>
          ) : error ? (
            <div className="w-full max-w-sm h-[20rem] sm:h-[24rem] lg:h-[32rem] bg-destructive/10 border border-destructive/20 text-destructive px-4 py-3 rounded-lg relative flex items-center justify-center">
              <p className="text-center text-sm">{error}</p>
            </div>
          ) : activePlayer ? (
            <img 
              src={currentPlayer.image} 
              alt={currentPlayer.name}
              className="w-full max-w-sm h-[20rem] sm:h-[24rem] lg:h-[32rem] object-cover rounded-lg shadow-lg cursor-zoom-in"
              onClick={() => setShowImagePreview(true)}
              onError={(e) => {
                e.currentTarget.src = cricketPlayerAction;
              }}
            />
          ) : (
            <div className="w-full max-w-sm h-[20rem] sm:h-[24rem] lg:h-[32rem] bg-muted rounded-lg shadow-lg flex items-center justify-center">
              <p className="text-muted-foreground text-center text-sm px-4">Click "Start Auction" to fetch a player.</p>
            </div>
          )}
        </div>

        {/* Player Info and Bidding */}
        <div className="space-y-4 md:space-y-6 lg:col-span-1 order-2 lg:order-2">
          {/* Player Details */}
          <div className="text-center lg:text-left">
            <h2 className="text-xl sm:text-2xl font-bold mb-1">
              Player: {currentPlayer.name || "N/A"}
            </h2>
            {typeof currentPlayer.auctionNumber === 'number' && (
              <div className="inline-flex items-center gap-2 mb-1">
                <Badge variant="secondary" className="text-xs">Auction #{currentPlayer.auctionNumber}</Badge>
              </div>
            )}
            <p className="text-muted-foreground mb-2">{currentPlayer.role || "N/A"}</p>
            {currentPlayer.achievement && (
              <p className="text-sm text-muted-foreground mb-2">Achievement: {currentPlayer.achievement}</p>
            )}
            {activePlayer?.is_unsold && (
              <div className="inline-flex items-center gap-2 mb-2">
                <Badge variant="destructive" className="text-xs">Unsold</Badge>
              </div>
            )}
            <p className="text-primary font-semibold">Base Price: {currentPlayer.basePrice.toLocaleString()} Points</p>
          </div>

          {/* Rankings */}
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            <Card className="text-center p-2">
              <CardContent className="p-0">
                <div className="text-xs text-muted-foreground mb-1">MVP Rank</div>
                <div className="text-lg sm:text-2xl font-bold">{currentPlayer.rankings.mvp}</div>
              </CardContent>
            </Card>
            <Card className="text-center p-2">
              <CardContent className="p-0">
                <div className="text-xs text-muted-foreground mb-1">Batting Rank</div>
                <div className="text-lg sm:text-2xl font-bold">{currentPlayer.rankings.batting}</div>
              </CardContent>
            </Card>
            <Card className="text-center p-2">
              <CardContent className="p-0">
                <div className="text-xs text-muted-foreground mb-1">Bowling Rank</div>
                <div className="text-lg sm:text-2xl font-bold">{currentPlayer.rankings.bowling}</div>
              </CardContent>
            </Card>
          </div>

          {/* View Stats Button */}
          <div className="flex justify-center lg:justify-start">
            <PlayerStatsPopover 
              roleNumber={activePlayer?.role_number || ""}
              playerName={currentPlayer.name}
            />
          </div>

          {/* Bidding Section */}
          <div className="space-y-3 sm:space-y-4">
            <Select value={currentBiddingTeam} onValueChange={setCurrentBiddingTeam}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Team for Bid" />
              </SelectTrigger>
              <SelectContent>
                {teams.map((team) => (
                  <SelectItem key={team} value={team}>
                    {team}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              type="number"
              placeholder="Enter bid amount"
              value={bidAmount}
              onChange={(e) => setBidAmount(e.target.value)}
              className="w-full"
            />
            <Button 
              onClick={handleBid}
              disabled={!bidAmount || !currentBiddingTeam || !user}
              className="w-full bg-primary hover:bg-primary/90 h-9 text-sm"
            >
              {user ? "Bid" : "Login to Bid"}
            </Button>
          </div>

          {/* Sold To Section */}
          <div className="flex flex-col sm:flex-row items-center gap-2">
            <Select value={winningTeam} onValueChange={setWinningTeam}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Sold To" />
              </SelectTrigger>
              <SelectContent>
                {teams.map((team) => (
                  <SelectItem key={team} value={team}>
                    {team}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button 
              onClick={handleSold}
              disabled={!winningTeam || !bidAmount || !user || (currentPlayer.name && winningBids.some(b => b.playerName === currentPlayer.name))}
              className="h-9 text-sm w-full sm:w-auto"
            >
              {user ? (currentPlayer.name && winningBids.some(b => b.playerName === currentPlayer.name) ? 'Already Sold' : 'Sold') : 'Login to Mark Sold'}
            </Button>
            {activePlayer && (
              <Button 
                variant="outline"
                disabled={!user}
                className="h-9 text-sm w-full sm:w-auto"
                onClick={handleUnsold}
              >
                Mark as Unsold
              </Button>
            )}
          </div>
        </div>

        {/* Side Panel */}
        <div className="lg:col-span-1 space-y-6 order-3 lg:order-3">
          {/* Team Budgets */}
          <div>
            <h3 className="text-lg sm:text-xl font-bold mb-4">Team Budgets</h3>
            <div className="space-y-3">
              {teams.map((team) => {
                const total = teamInitialPoints[canonicalizeTeam(team)] || teamInitialPoints[team] || 0;
                const remaining = teamRemainingPoints[team] || 0;
                const used = Math.max(0, total - remaining);
                const percent = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0;
                const playersCount = winningBids.filter(b => canonicalizeTeam(b.teamName) === canonicalizeTeam(team)).length;
                return (
                  <Card key={team} className="p-3">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-semibold">{team}</p>
                      <span className="text-xs text-muted-foreground">{used.toLocaleString()} / {total.toLocaleString()}</span>
                    </div>
                    <div className="h-2 w-full rounded bg-gray-200">
                      <div className="h-2 rounded bg-green-500" style={{ width: `${percent}%` }} />
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">Remaining: <span className="text-foreground font-medium">{remaining.toLocaleString()}</span></div>
                    <div className="text-xs text-muted-foreground">Players purchased: <span className="text-foreground font-medium">{playersCount}</span></div>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Winning Bids Section */}
          <div>
            <h3 className="text-lg sm:text-xl font-bold mb-4">Winning Bids</h3>
            <div className="space-y-3 max-h-64 lg:max-h-96 overflow-y-auto">
              {winningBids.length === 0 ? (
                <p className="text-muted-foreground text-sm">No winning bids yet.</p>
              ) : (
                winningBids.map((bid, index) => (
                  <Card key={index} className="p-3">
                    <p className="text-sm sm:text-base font-semibold">Player: {bid.playerName}</p>
                    <p className="text-muted-foreground text-sm">Team: {bid.teamName}</p>
                    <p className="text-primary font-bold text-sm">Bid Amount: {bid.bidAmount.toLocaleString()} Points</p>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* All Bids Section */}
          <div>
            <h3 className="text-lg sm:text-xl font-bold mb-4">All Bids</h3>
            <div className="space-y-3 max-h-64 lg:max-h-96 overflow-y-auto">
              {allBids.length === 0 ? (
                <p className="text-muted-foreground text-sm">No bids yet.</p>
              ) : (
                <>
                  {allBids.map((bid, index) => (
                    <Card key={index} className="p-3">
                      <p className="text-sm sm:text-base font-semibold">Player: {bid.playerName}</p>
                      <p className="text-muted-foreground text-sm">Team: {bid.teamName || "Pending"}</p>
                      <p className="text-primary font-bold text-sm">Bid Amount: {bid.bidAmount.toLocaleString()} Points</p>
                    </Card>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {error && <p className="text-destructive text-center text-sm">{error}</p>}

      {/* Main Round Controls (end of page) */}
      {currentRound === 'main' && (
        <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-4 mt-4">
          <Button 
            variant="secondary"
            disabled={!user}
            onClick={startUnsoldRound}
            className="w-full sm:w-auto"
          >
            Start Unsold Round
          </Button>
          <Button 
            variant="secondary"
            disabled={!user}
            onClick={resetUnsoldPlayers}
            className="w-full sm:w-auto"
          >
            Reset Unsold
          </Button>
        </div>
      )}

      {/* Unsold Round Controls (end of page) */}
      {currentRound === 'unsold' && (
        <div className="flex flex-col sm:flex-row justify-center gap-2 sm:gap-4 mt-4">
          <Button 
            variant="secondary"
            disabled={!user}
            onClick={returnToMainRound}
            className="w-full sm:w-auto"
          >
            Return to Main Round
          </Button>
        </div>
      )}

      {/* Auction Summary Dialog */}
      <Dialog open={showSummary} onOpenChange={setShowSummary}>
        <DialogContent className="sm:max-w-[1200px] max-h-[97vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Auction Summary</DialogTitle>
          </DialogHeader>
          {summaryError && (
            <p className="text-sm text-destructive mb-3">{summaryError}</p>
          )}
          <div className="space-y-6">
            {/* Teams Remaining Points */}
            <div>
              <h4 className="text-sm font-semibold mb-2">Team Budgets</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {teams.map((team) => {
                  const total = teamInitialPoints[canonicalizeTeam(team)] || teamInitialPoints[team] || 0;
                  const remaining = teamRemainingPoints[team] || 0;
                  const used = Math.max(0, total - remaining);
                  const percent = total > 0 ? Math.min(100, Math.round((used / total) * 100)) : 0;
                  const playersCount = winningBids.filter(b => canonicalizeTeam(b.teamName) === canonicalizeTeam(team)).length;
                  return (
                    <Card key={team} className="p-3">
                      <div className="flex items-center justify-between mb-1">
                        <p className="text-sm font-medium">{team}</p>
                        <span className="text-xs text-muted-foreground">{used.toLocaleString()} / {total.toLocaleString()}</span>
                      </div>
                      <div className="h-2 w-full rounded bg-gray-200">
                        <div className="h-2 rounded bg-green-500" style={{ width: `${percent}%` }} />
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">Remaining: <span className="text-foreground font-medium">{remaining.toLocaleString()}</span></div>
                      <div className="text-xs text-muted-foreground">Players purchased: <span className="text-foreground font-medium">{playersCount}</span></div>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Remaining Players */}
            <div>
              <h4 className="text-sm font-semibold mb-2">Remaining Players</h4>
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-center">
                <Card className="p-3"><p className="text-xs text-muted-foreground">Batsmen</p><p className="text-lg font-bold">{remainingByRole.batsman}</p></Card>
                <Card className="p-3"><p className="text-xs text-muted-foreground">Bowlers</p><p className="text-lg font-bold">{remainingByRole.bowler}</p></Card>
                <Card className="p-3"><p className="text-xs text-muted-foreground">All Rounders</p><p className="text-lg font-bold">{remainingByRole.allRounder}</p></Card>
                <Card className="p-3"><p className="text-xs text-muted-foreground">Girls</p><p className="text-lg font-bold">{remainingGirls}</p></Card>
              </div>
              <p className="text-xs text-muted-foreground mt-2 text-center">Total remaining: <span className="text-foreground font-medium">{remainingByRole.total}</span></p>
            </div>

            {/* Highest Bid So Far */}
            <div>
              <h4 className="text-sm font-semibold mb-2">Highest Bid So Far</h4>
              {highestBidSoFar ? (
                <Card className="p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">{highestBidSoFar.playerName}</p>
                    <p className="text-xs text-muted-foreground">Team: {highestBidSoFar.teamName}</p>
                  </div>
                  <p className="text-primary font-bold text-sm mt-1">{highestBidSoFar.bidAmount.toLocaleString()} Points</p>
                </Card>
              ) : (
                <p className="text-sm text-muted-foreground">No winning bids yet.</p>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Image Preview Dialog */}
      <Dialog open={showImagePreview} onOpenChange={setShowImagePreview}>
        <DialogContent className="max-w-5xl w-full max-h-[90vh] p-0 overflow-hidden">
          <div className="bg-black flex items-center justify-center">
            <img
              src={currentPlayer.image}
              alt={currentPlayer.name}
              className="w-full h-auto max-h-[88vh] object-contain"
              onError={(e) => {
                e.currentTarget.src = cricketPlayerAction;
              }}
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LiveAuction;