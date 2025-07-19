import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppSidebar } from "@/components/AppSidebar";
import Builds from "./pages/Builds";
import CreateBuild from "./pages/CreateBuild";
import BuildDetails from "./pages/BuildDetails";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import { useEffect } from "react";
import { AuthProvider } from '@/context/AuthContext';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import EditBuildPage from "./pages/EditBuildPage";


const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.classList.add(isDark ? 'dark' : 'light');
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <SidebarProvider defaultOpen>
              <div className="min-h-screen flex w-full bg-background">
                <AppSidebar />
                <main className="flex-1 flex flex-col">
                  <header className="h-12 flex items-center border-b border-border bg-card/50 backdrop-blur px-4">
                    <SidebarTrigger className="mr-4" />
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-gradient-primary rounded flex items-center justify-center">
                        <span className="text-primary-foreground font-bold text-xs">SC</span>
                      </div>
                      <span className="font-semibold text-foreground">STALCRAFT: X Builds</span>
                    </div>
                  </header>
                  <div className="flex-1 overflow-auto">
                    <Routes>
                      <Route path="/auth" element={<Auth />} />
                      <Route path="/" element={
                        <ProtectedRoute>
                          <Builds />
                        </ProtectedRoute>
                      } />
                      <Route path="/create" element={
                        <ProtectedRoute>
                          <CreateBuild />
                        </ProtectedRoute>
                      } />
                      <Route path="/build/:id" element={
                        <ProtectedRoute>
                          <BuildDetails />
                        </ProtectedRoute>
                      } />
                      <Route path="/build/:id/edit" element={
                        <ProtectedRoute>
                          <EditBuildPage />
                        </ProtectedRoute>
                      } />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </div>
                </main>
              </div>
            </SidebarProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;