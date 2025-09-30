import { NavLink, useLocation } from "react-router-dom";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const navigationItems = [
  { title: "Home", url: "/" },
  { title: "Live Auction", url: "/live-auction" },
  { title: "Teams", url: "/teams" },
  { title: "Players", url: "/players" },
  { title: "Season 1 Throwback", url: "/season-1" },
];

export function AppSidebar() {
  const { state, setOpenMobile, isMobile } = useSidebar();
  const location = useLocation();
  const currentPath = location.pathname;

  const isCollapsed = state === "collapsed";
  const isActive = (path: string) => currentPath === path;
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive
      ? "bg-primary text-black font-semibold shadow-cricket"
      : "text-black hover:text-black hover:bg-muted font-medium transition-smooth";

  return (
    <Sidebar
      className="bg-card border-r border-border text-black"
      collapsible="offcanvas"
    >
      <SidebarContent className="p-4">
        <div className="mb-6">
          <h2 className={`font-bold text-black ${isCollapsed ? "text-sm text-center" : "text-lg"}`}>
            {isCollapsed ? "S2" : "Sangharsh Season 2"}
          </h2>
        </div>
        
        <SidebarGroup>
          <SidebarGroupLabel className="text-black font-medium mb-2">
            {!isCollapsed && "Navigation"}
          </SidebarGroupLabel>
          
          <SidebarGroupContent>
            <SidebarMenu className="space-y-1">
              {navigationItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className="w-full">
                    <NavLink 
                      to={item.url} 
                      end 
                      className={getNavCls}
                      onClick={() => isMobile && setOpenMobile(false)}
                    >
                      <span className="truncate">{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}