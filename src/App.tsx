import { Toaster } from "@/components/ui/toaster";
import { useEffect } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { Layout } from "@/components/Layout";
import ProtectedRoute from "@/components/ProtectedRoute";
import Home from "./pages/Home";
import Auth from "./pages/Auth";
import LiveAuction from "./pages/LiveAuction";
import Teams from "./pages/Teams";
import Players from "./pages/Players";
import Season1Throwback from "./pages/Season1Throwback";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    try {
      // Ensure document is not in design mode
      if ((document as any).designMode !== "off") {
        (document as any).designMode = "off";
      }

      // Remove any accidental contenteditable flags
      const editableNodes = document.querySelectorAll('[contenteditable]');
      editableNodes.forEach((node) => {
        (node as HTMLElement).setAttribute('contenteditable', 'false');
      });

      // Block edits on contentEditable nodes while allowing real inputs/textarea
      const beforeInputHandler = (e: Event) => {
        const target = e.target as HTMLElement | null;
        if (!target) return;
        const tag = target.tagName;
        const isFormField = tag === 'INPUT' || tag === 'TEXTAREA' || !!target.closest('input,textarea,[role="textbox"]');
        const isEditable = (target as any).isContentEditable === true;
        if (isEditable && !isFormField) {
          e.preventDefault();
          e.stopPropagation();
        }
      };
      document.addEventListener('beforeinput', beforeInputHandler, true);
      return () => document.removeEventListener('beforeinput', beforeInputHandler, true);
    } catch {
      // no-op if environment restricts
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/auth" element={<Auth />} />
              <Route path="/" element={
                <Layout>
                  <Home />
                </Layout>
              } />
              <Route path="/live-auction" element={
                <Layout>
                  <LiveAuction />
                </Layout>
              } />
              <Route path="/teams" element={
                <Layout>
                  <Teams />
                </Layout>
              } />
              <Route path="/players" element={
                <Layout>
                  <Players />
                </Layout>
              } />
              <Route path="/season-1" element={
                <Layout>
                  <Season1Throwback />
                </Layout>
              } />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
