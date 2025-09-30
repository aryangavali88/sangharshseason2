import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, Gavel } from "lucide-react";
import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { RegistrationDialog } from "@/components/RegistrationDialog";
import { useSeason1Photos } from "@/hooks/useSeason1Photos";
import { PhotoCarousel } from "@/components/PhotoCarousel";
import { LogoLoop } from "@/components/LogoLoop";
import heroImage from "@/assets/cricket-stadium-hero.jpg";
import cricketPlayerAction from "@/assets/cricket-player-action.jpg";
import cricketTeamCelebration from "@/assets/cricket-team-celebration.jpg";
import cricketTrophy from "@/assets/cricket-trophy.jpg";
const Home = () => {
  const { photos: season1Photos, loading: photosLoading } = useSeason1Photos();
  const [registrationCount, setRegistrationCount] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: ""
  });
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Registration data:", formData);
    // Handle registration logic here
  };

  useEffect(() => {
    const fetchRegistrationCount = async () => {
      const { error, count } = await supabase
        .from('player_registrations')
        .select('*', { count: 'exact', head: true });
      if (!error) {
        setRegistrationCount(count ?? 0);
      } else {
        console.error('Failed to fetch registration count', error);
      }
    };
    fetchRegistrationCount();
  }, []);
  const highlights = [{
    title: "Live Auction",
    description: "Join live auction and bid for your favorite players in real-time.",
    image: cricketPlayerAction,
    link: "/live-auction"
  }, {
    title: "Team Management",
    description: "Manage your team, strategize your lineup, and compete against other teams.",
    image: cricketTeamCelebration,
    link: "/teams"
  }, {
    title: "Exciting Prizes",
    description: "Win exciting trophies and recognition for your performance in the tournament.",
    image: cricketTrophy,
    link: "/teams"
  }];

  // Team logos for LogoLoop component - using actual team logos
  const teamLogos = [
    { src: "/team-logos/Aurwadkar_20241016_024702_0000.png", alt: "The Aurwadkar's" },
    { src: "/team-logos/Birdje_20241016_021955_0000.png", alt: "Birje Champions" },
    { src: "/team-logos/Joshi_20241016_022134_0000.png", alt: "Joshi Warriors" },
    { src: "/team-logos/Navgekar_20241016_022103_0000.png", alt: "Navgekar Strikers" },
    { src: "/team-logos/patil_panthers.png", alt: "Patil Panthers" },
    { src: "/team-logos/Red-Represents-A-Combination-Of-Spartan-Helmet-Logo_20241016_022337_0000.png", alt: "Gupte" }
  ];
  return <div className="min-h-screen w-screen overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative h-80 sm:h-96 bg-cover bg-center bg-no-repeat flex items-center justify-center w-full" style={{
      backgroundImage: `url(${heroImage})`
    }}>
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative z-10 text-center text-white px-4 w-full max-w-full">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-6xl font-bold mb-3 sm:mb-4 leading-tight break-words">
            Experience the Thrill of <br className="hidden sm:block" />
            <span className="text-primary-glow">Sangharsh Season 2</span> Auctions
          </h1>
          <p className="text-sm sm:text-base md:text-lg lg:text-xl mb-6 sm:mb-8 max-w-2xl mx-auto px-2 break-words">
            Join the most exciting cricket tournament and bid for your favorite players. 
            Compete for glory and win amazing prizes!
          </p>
          <RegistrationDialog>
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-white font-semibold px-6 sm:px-8 py-2 sm:py-3 shadow-glow text-sm sm:text-base">
              Register Now
            </Button>
          </RegistrationDialog>
        </div>
      </section>

      {/* Tournament Highlights Section */}
      <section className="py-8 sm:py-12 lg:py-16 px-4 bg-background w-full overflow-x-hidden">
        <div className="max-w-6xl mx-auto w-full">
          <h2 className="text-2xl sm:text-3xl font-bold mb-8 sm:mb-12 text-foreground text-center break-words">
            Tournament Highlights
          </h2>
          
          <div className="space-y-8 sm:space-y-12 w-full">
            {highlights.map((highlight, index) => (
              <div key={index} className="flex flex-col items-center gap-4 sm:gap-6 w-full">
                <div className="w-full max-w-full relative">
                  <img 
                    src={highlight.image} 
                    alt={highlight.title} 
                    loading="lazy"
                    className="w-full h-48 sm:h-56 lg:h-64 object-cover rounded-lg shadow-cricket max-w-full"
                  />
                  {highlight.title === "Live Auction" && (
                    <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded-md flex items-center gap-1 text-xs sm:text-sm">
                      <Gavel className="w-3 h-3 sm:w-4 sm:h-4" />
                      <span>Auction</span>
                    </div>
                  )}
                </div>
                <div className="w-full text-center max-w-full">
                  <h3 className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 text-foreground break-words">{highlight.title}</h3>
                  <p className="text-muted-foreground mb-4 sm:mb-6 text-sm sm:text-base lg:text-lg break-words">{highlight.description}</p>
                  <Button asChild className="bg-primary hover:bg-primary/90 text-sm sm:text-base">
                    <Link to={highlight.link}>Learn More</Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Partner Logos Section */}
      <section className="py-6 sm:py-8 px-2 sm:px-4 bg-muted/30 w-full overflow-x-hidden">
        <div className="max-w-6xl mx-auto w-full">
          <div className="py-2 sm:py-4 w-full">
            <LogoLoop
              logos={teamLogos}
              speed={120}
              direction="left"
              logoHeight={80}
              gap={40}
              pauseOnHover={true}
              fadeOut={false}
              scaleOnHover={true}
              ariaLabel="Team logos"
              className="w-full max-w-full"
            />
          </div>
        </div>
      </section>

      {/* Registration Stats Section */}
      <section className="py-8 sm:py-12 lg:py-16 px-4 bg-background w-full overflow-x-hidden">
        <div className="max-w-4xl mx-auto text-center w-full">
          <h2 className="text-2xl sm:text-3xl font-bold mb-8 sm:mb-12 text-foreground break-words">Registration so far</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8 w-full">
            <div className="space-y-2 w-full">
              <div className="text-3xl sm:text-4xl font-bold text-primary break-words">{registrationCount ?? "--"}</div>
              <div className="text-sm sm:text-base text-muted-foreground break-words">Registrations</div>
            </div>
            <div className="space-y-2 w-full">
              <div className="text-3xl sm:text-4xl font-bold text-primary break-words">6</div>
              <div className="text-sm sm:text-base text-muted-foreground break-words">Teams</div>
            </div>
          </div>
        </div>
      </section>

      {/* Season 1 Throwback Section */}
      <section className="py-8 sm:py-12 lg:py-16 px-4 bg-gradient-field w-full overflow-x-hidden">
        <div className="max-w-6xl mx-auto w-full">
          <div className="flex flex-col sm:flex-row items-center justify-between mb-8 sm:mb-12 gap-4 w-full">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground text-center sm:text-left break-words">
              Season 1 Throwback
            </h2>
            <Button asChild variant="outline" className="text-sm sm:text-base">
              <Link to="/season-1">View All</Link>
            </Button>
          </div>
          
          {photosLoading ? (
            // Loading skeleton
            <div className="aspect-video bg-muted rounded-lg animate-pulse w-full max-w-full"></div>
          ) : season1Photos.length > 0 ? (
            <PhotoCarousel 
              photos={season1Photos} 
              className="max-w-4xl mx-auto w-full max-w-full"
              aspectRatio="video"
              autoPlay={true}
              interval={5000}
              showCaption={true}
            />
          ) : (
            // Fallback when no photos available
            <div className="aspect-video bg-muted rounded-lg flex items-center justify-center w-full max-w-full">
              <div className="text-center text-muted-foreground">
                <Users className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm sm:text-base break-words">No photos available yet</p>
              </div>
            </div>
          )}
        </div>
      </section>


      {/* Footer */}
      <footer className="py-6 sm:py-8 px-4 bg-muted/30 border-t border-border w-full overflow-x-hidden">
        <div className="max-w-6xl mx-auto w-full">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 w-full">
            <div className="text-xs sm:text-sm text-muted-foreground text-center md:text-left break-words">
              ©2024 Sangharsh Season 2. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>;
};
export default Home;