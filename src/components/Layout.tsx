import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Menu, LogOut, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background overflow-x-hidden">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col overflow-x-hidden">
          <header className="h-16 border-b border-border bg-card flex items-center justify-between px-3 sm:px-4 shadow-sm w-full">
            {/* Left: sidebar trigger + title */}
            <div className="flex items-center gap-2">
              <SidebarTrigger />
              <div className="ml-2 leading-tight">
                <h1 className="text-base sm:text-lg md:text-xl font-bold text-primary">
                  Sangharsh Season 2
                </h1>
                <p className="text-[10px] sm:text-xs md:text-sm text-muted-foreground">
                  Cricket Tournament Auction
                </p>
              </div>
            </div>

            {/* Right: user info and logout/login (compact on mobile) */}
            <div className="flex items-center space-x-2 sm:space-x-4">
              {user ? (
                <>
                  {/* Admin label hidden on mobile */}
                  <div className="hidden sm:flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span className="text-sm">Admin</span>
                  </div>

                  {/* Icon-only logout on mobile */}
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleSignOut}
                    className="h-8 w-8 sm:hidden"
                    aria-label="Logout"
                  >
                    <LogOut className="h-4 w-4" />
                  </Button>

                  {/* Full logout button on >= sm */}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleSignOut}
                    className="hidden sm:inline-flex items-center space-x-2"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>Logout</span>
                  </Button>
                </>
              ) : (
                <>
                  {/* Icon-only login on mobile */}
                  <Button 
                    variant="outline" 
                    size="icon" 
                    onClick={() => window.location.href = '/auth'}
                    className="h-8 w-8 sm:hidden"
                    aria-label="Login"
                  >
                    <User className="h-4 w-4" />
                  </Button>

                  {/* Full login button on >= sm */}
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => window.location.href = '/auth'}
                    className="hidden sm:inline-flex items-center space-x-2"
                  >
                    <User className="h-4 w-4" />
                    <span>Login</span>
                  </Button>
                </>
              )}
            </div>
          </header>
          
          <main className="flex-1 overflow-x-hidden overflow-y-auto w-full">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}