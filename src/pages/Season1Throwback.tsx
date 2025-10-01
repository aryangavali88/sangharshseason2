import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Trophy, Calendar, Award, Users, ImageIcon } from "lucide-react";
import PhotoModal from "@/components/PhotoModal";
import { PhotoCarousel } from "@/components/PhotoCarousel";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useSeason1Photos } from "@/hooks/useSeason1Photos";

const Season1Throwback = () => {
  const { photos: season1Photos, loading: photosLoading, error: photosError } = useSeason1Photos();
  const champions = {
    team: "Patak Panthers",
    captain: "Rishikesh Rajput",
    wins: 6,
    losses: 1
  };

  const awardWinners = [
    {
      id: 1,
      award: "Man of the Series",
      winner: "Kedar",
      team: "Navgekar Stickers",
      photo: "https://dlavwfhzuiliggiwbowp.supabase.co/storage/v1/object/public/award%20winners/man%20of%20the%20series.png",
    },
    {
      id: 2,
      award: "Best Batsman",
      winner: "Dhurv",
      team: "Pathak Panthers",
      photo: "https://dlavwfhzuiliggiwbowp.supabase.co/storage/v1/object/public/award%20winners/best%20batsman.png",
    },
    {
      id: 3,
      award: "Best Bowler",
      winner: "Akash",
      team: "Pathak Panthers",
      photo: "https://dlavwfhzuiliggiwbowp.supabase.co/storage/v1/object/public/award%20winners/best%20bowler.png",
    },
    {
      id: 4,
      award: "Best Girl Player",
      winner: "Diksha",
      team: "Navgekar Stickers",
      photo: "https://dlavwfhzuiliggiwbowp.supabase.co/storage/v1/object/public/award%20winners/best%20girl.png",
    },
  ];

  const memorableMatches = [
    {
      id: 1,
      title: "Pathak Panthers vs GUPTE GLADIATORS",
      teams: "Pathak Panthers vs GUPTE GLADIATORS",
      score: "Pathak Panthers won by 5 runs (76/3 vs 71/1)",
      date: "Nov 26, 2024 • Gogte College Of Commerce, Belgaum",
      description: "Blazing knocks from Dhruv Desai 58(21) and Pratham Mastamardi 53(21) lit up a high-scoring 5-over thriller.",
      pdfUrl: "https://dlavwfhzuiliggiwbowp.supabase.co/storage/v1/object/public/best%20matches/Summary%20Scorecard%2013596211.pdf"
    },
    {
      id: 2,
      title: "Joshi Warriors vs The Aurwadkars",
      teams: "Joshi Warriors vs The Aurwadkars",
      score: "Joshi Warriors won by 4 runs (71/5 vs 67/3)",
      date: "Nov 27, 2024 • Gogte College Of Commerce, Belgaum",
      description: "Aryan A Gavali smashed 48(18) with 5 sixes, leading Joshi Warriors to a narrow win. Best bowling came from Anup Deshpande 2/2.",
      pdfUrl: "https://dlavwfhzuiliggiwbowp.supabase.co/storage/v1/object/public/best%20matches/Summary%20Scorecard%2013596219.pdf"
    },
    {
      id: 3,
      title: "Pathak Panthers vs Navgekar Strikers",
      teams: "Pathak Panthers vs Navgekar Strikers",
      score: "Pathak Panthers won by 19 runs (101/3 vs 82/2)",
      date: "Nov 28, 2024 • Gogte College Of Commerce, Belgaum",
      description: "A rapid finish from Md Huzaifa A 37(8) and a captain’s 33(18) from Rishikesh Rajput powered a 6-over 101; tight bowling led by Akash Huchappagol 2-0-5-1 sealed the defense.",
      pdfUrl: "https://dlavwfhzuiliggiwbowp.supabase.co/storage/v1/object/public/best%20matches/Summary%20Scorecard%2013712176.pdf"
    }
  ];

  const teamStandings = [
    { position: 1, team: "Navgekar Stickers", matches: 5, wins: 5, losses: 0, points: 10, nrr: "8.274", last5: "W-W-W-W-W" },
    { position: 2, team: "Pathak Panthers", matches: 5, wins: 4, losses: 1, points: 8, nrr: "7.800", last5: "L-W-W-W-W" },
    { position: 3, team: "Joshi Warriors", matches: 5, wins: 3, losses: 2, points: 6, nrr: "-4.624", last5: "W-W-L-L-W" },
    { position: 4, team: "The Aurwadkars", matches: 5, wins: 2, losses: 3, points: 4, nrr: "-2.168", last5: "W-L-W-L-L" },
    { position: 5, team: "GUPTE GLADIATORS", matches: 5, wins: 1, losses: 4, points: 2, nrr: "-2.438", last5: "L-L-L-W-L" },
    { position: 6, team: "Brije Blasters", matches: 5, wins: 0, losses: 5, points: 0, nrr: "-6.974", last5: "L-L-L-L-L" }
  ];

  // Static gallery photos from recent uploads
  const staticGalleryPhotos = [
    { id: "1", url: "/lovable-uploads/b981004f-a425-4a9e-aa68-5a48eb2b2883.png", caption: "Team Meeting Session", category: "Meeting" },
    { id: "2", url: "/lovable-uploads/82bba173-9c0e-4526-972c-7a7c40bf11bf.png", caption: "Strategic Planning", category: "Meeting" },
    { id: "3", url: "/lovable-uploads/57596184-fec3-448d-a01e-07deba7e3f51.png", caption: "Championship Celebration", category: "Celebration" },
    { id: "4", url: "/lovable-uploads/1f8f8ce9-52dd-4d2e-97bf-671fa0c145be.png", caption: "Victory Balloon Release", category: "Celebration" },
    { id: "5", url: "/lovable-uploads/26ac87d0-7f86-49dc-9c62-fce7e14b2dff.png", caption: "Team Strategy Discussion", category: "Meeting" },
    { id: "6", url: "/lovable-uploads/46bd351a-eadc-42d5-a7b0-ae686b2ffafa.png", caption: "Cricket Ceremony", category: "Ceremony" },
    { id: "7", url: "/lovable-uploads/da58a93c-30ef-46cc-9907-286cc56411bc.png", caption: "Field Group Photo", category: "Team Photo" },
    { id: "8", url: "/lovable-uploads/6b456db8-c07b-4943-9d2f-fb69017ccad7.png", caption: "Match Day Action", category: "Match" },
    { id: "9", url: "/lovable-uploads/6d38849f-baee-4ddd-a308-a694c0db0894.png", caption: "Audience Participation", category: "Event" },
    { id: "10", url: "/lovable-uploads/ee04bf26-814d-4372-8008-571fc981868c.png", caption: "Players Oath Taking", category: "Ceremony" }
  ];

  // Combine static photos with dynamic photos
  const allPhotos = [...staticGalleryPhotos, ...season1Photos];

  // Exclude specific photos by caption or filename keywords
  const excludedCaptions = new Set([
    // Removed cricket-specific photos as they're now filtered in the hook
  ]);
  const excludedKeywords = [
    // Removed cricket-specific keywords as they're now filtered in the hook
  ];

  const galleryPhotos = allPhotos.filter((p) => {
    const captionBlocked = p.caption && excludedCaptions.has(p.caption);
    const url = (p as any).url || "";
    const urlBlocked = excludedKeywords.some((kw) => url.includes(kw));
    return !captionBlocked && !urlBlocked;
  });


  return (
    <div className="w-full max-w-7xl mx-auto p-3 sm:p-4 md:p-6 space-y-6 md:space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">Season 1 Throwback</h1>
        <p className="text-lg sm:text-xl text-muted-foreground px-4">Relive the greatest moments from our inaugural season</p>
        <Badge className="bg-primary/10 text-primary text-sm sm:text-lg px-3 sm:px-4 py-2">
          <Calendar className="h-4 w-4 mr-2" />
          February - March 2024
        </Badge>
      </div>

      {/* Champions Section */}
      <Card className="text-white border-none shadow-glow relative overflow-hidden min-h-[300px]" style={{ backgroundImage: `url('https://dlavwfhzuiliggiwbowp.supabase.co/storage/v1/object/public/award%20winners/winners.png')`, backgroundSize: 'cover', backgroundPosition: 'center', backgroundRepeat: 'no-repeat' }}>
        <div className="absolute inset-0 bg-black/50 z-0"></div> {/* Overlay for readability */}
        <CardHeader className="text-center p-4 sm:p-6 !bg-transparent relative z-10">
          <Trophy className="h-12 sm:h-16 w-12 sm:w-16 mx-auto mb-4 text-yellow-300" />
          <CardTitle className="text-2xl sm:text-3xl">Season 1 Champions</CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4 p-4 sm:p-6 !bg-transparent relative z-10">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold">{champions.team}</h2>
            <p className="text-lg sm:text-xl opacity-90">Captain: {champions.captain}</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4 max-w-md mx-auto">
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold">{champions.wins}</div>
                <div className="text-xs sm:text-sm opacity-80">Wins</div>
              </div>
              <div className="text-center">
                <div className="text-xl sm:text-2xl font-bold">{champions.losses}</div>
                <div className="text-xs sm:text-sm opacity-80">Losses</div>
              </div>
            </div>
          </CardContent>
        </Card>

      {/* Award Winners Section */}
      <div className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground">Award Winners</h2>
        <Carousel
          opts={{
            align: "start",
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-2 md:-ml-4">
            {awardWinners.map((award, index) => (
              <CarouselItem key={index} className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3 xl:basis-1/4">
                <div className="p-1">
                  <Card className="overflow-hidden shadow-lg hover:shadow-cricket transition-all duration-300 relative group">
                    <AspectRatio ratio={4 / 3}>
                      <img 
                        src={award.photo} 
                        alt={award.winner} 
                        className="w-full h-full object-cover rounded-lg group-hover:scale-105 transition-all duration-300"
                      />
                    </AspectRatio>
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent rounded-lg flex flex-col justify-end p-3 sm:p-4">
                      <p className="text-lg sm:text-xl font-bold text-white mb-1">{award.winner}</p>
                      <p className="text-xs sm:text-sm text-gray-300">{award.team}</p>
                      <Badge className="mt-2 sm:mt-3 text-xs sm:text-sm px-2 sm:px-3 py-1 bg-primary text-white">
                        <Award className="h-3 sm:h-4 w-3 sm:w-4 mr-1 sm:mr-2" />{award.award}
                      </Badge>
                    </div>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden sm:flex" />
          <CarouselNext className="hidden sm:flex" />
        </Carousel>
      </div>

      {/* Memorable Matches */}
      <div className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground">Memorable Matches</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {memorableMatches.map((match) => (
            <Card key={match.id} className="hover:shadow-cricket transition-all duration-300">
              <CardHeader className="p-4 sm:p-6">
                <CardTitle className="text-base sm:text-lg">{match.title}</CardTitle>
                <p className="text-xs sm:text-sm text-muted-foreground">{match.date}</p>
              </CardHeader>
              <CardContent className="space-y-3 p-4 sm:p-6 pt-0">
                <div className="space-y-1">
                  <p className="font-semibold text-sm sm:text-base">{match.teams}</p>
                  <p className="text-xs sm:text-sm text-primary font-medium">{match.score}</p>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">{match.description}</p>
                {"pdfUrl" in match ? (
                  <Button variant="outline" size="sm" className="w-full" asChild>
                    <a href={(match as any).pdfUrl} target="_blank" rel="noopener noreferrer">
                      Watch Highlights
                    </a>
                  </Button>
                ) : (
                  <Button variant="outline" size="sm" className="w-full">
                    Watch Highlights
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Final Standings */}
      <div className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground">Final Points Table</h2>
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/30">
                  <tr className="text-xs sm:text-sm">
                    <th className="text-left p-2 sm:p-4">Pos</th>
                    <th className="text-left p-2 sm:p-4">Team</th>
                    <th className="text-center p-2 sm:p-4">M</th>
                    <th className="text-center p-2 sm:p-4">W</th>
                    <th className="text-center p-2 sm:p-4">L</th>
                    <th className="text-center p-2 sm:p-4">Pts</th>
                    <th className="text-center p-2 sm:p-4">NRR</th>
                    <th className="text-center p-2 sm:p-4">Last5</th>
                  </tr>
                </thead>
                <tbody>
                  {teamStandings.map((team) => (
                    <tr key={team.position} className="border-b border-border hover:bg-muted/20">
                      <td className="p-2 sm:p-4 font-semibold text-sm">{team.position}</td>
                      <td className="p-2 sm:p-4">
                        <div className="flex items-center space-x-2">
                          <span className={`text-xs sm:text-sm ${team.position === 1 ? "font-bold text-black" : ""}`}>
                            {team.team}
                          </span>
                        </div>
                      </td>
                      <td className="text-center p-2 sm:p-4 text-xs sm:text-sm">{team.matches}</td>
                      <td className="text-center p-2 sm:p-4 text-xs sm:text-sm">{team.wins}</td>
                      <td className="text-center p-2 sm:p-4 text-xs sm:text-sm">{team.losses}</td>
                      <td className="text-center p-2 sm:p-4 font-semibold text-xs sm:text-sm">{team.points}</td>
                      <td className="text-center p-2 sm:p-4 text-xs sm:text-sm">{team.nrr}</td>
                      <td className="text-center p-2 sm:p-4 text-xs sm:text-sm">{team.last5}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Photo Gallery */}
      <div className="space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-foreground">Photo Gallery</h2>
        {photosError && (
          <div className="text-center p-4 text-muted-foreground">
            <p>Unable to load photos: {photosError}</p>
          </div>
        )}
        
        {photosLoading ? (
          // Loading skeleton
          <div className="aspect-video bg-muted rounded-lg animate-pulse"></div>
        ) : galleryPhotos.length > 0 ? (
          <div className="space-y-6">
            {/* Main Carousel */}
            <PhotoCarousel 
              photos={galleryPhotos} 
              className="max-w-5xl mx-auto"
              aspectRatio="video"
              autoPlay={true}
              interval={5000}
              showCaption={true}
            />
            
            {/* Grid View for additional photos */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {galleryPhotos.slice(0, 12).map((photo) => (
                <PhotoModal key={photo.id} photo={photo}>
                  <Card className="hover:shadow-cricket transition-all duration-300 cursor-pointer group overflow-hidden">
                    <div className="aspect-video relative overflow-hidden">
                      <img 
                        src={photo.url} 
                        alt={photo.caption}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          // Fallback to placeholder if image fails to load
                          e.currentTarget.style.display = 'none';
                          e.currentTarget.nextElementSibling?.classList.remove('hidden');
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-field rounded-t-lg flex items-center justify-center hidden">
                        <ImageIcon className="h-8 sm:h-12 w-8 sm:w-12 text-primary/50" />
                      </div>
                    </div>
                    <CardContent className="p-3">
                      <p className="font-semibold text-sm">{photo.caption}</p>
                      <Badge variant="outline" className="text-xs mt-1">
                        {photo.category}
                      </Badge>
                    </CardContent>
                  </Card>
                </PhotoModal>
              ))}
            </div>
          </div>
        ) : (
          // Fallback when no photos available
          <div className="col-span-full text-center p-8 text-muted-foreground">
            <ImageIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No photos available in the gallery yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Season1Throwback;