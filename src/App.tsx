import { Toaster } from "@/components/ui/toaster";
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

const App = () => (
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
            <Route path="/live" element={
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

export default App;
