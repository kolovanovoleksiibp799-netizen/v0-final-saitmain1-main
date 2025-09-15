import React, { Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/components/ThemeProvider";
import { MessagesProvider } from "@/contexts/MessagesContext";
import LoadingSpinner from "@/components/LoadingSpinner"; // Import LoadingSpinner

// Dynamically import pages using React.lazy for code splitting
const Index = React.lazy(() => import("./pages/Index"));
const NotFound = React.lazy(() => import("./pages/NotFound"));
const SubcategoryPage = React.lazy(() => import("./pages/SubcategoryPage"));
const CategoriesPage = React.lazy(() => import("./pages/CategoriesPage"));
const AdminPanel = React.lazy(() => import("./pages/AdminPanel"));
const CreateAdPage = React.lazy(() => import("./pages/CreateAdPage"));
const AdvertisementPage = React.lazy(() => import("./pages/AdvertisementPage"));
const UserProfilePage = React.lazy(() => import("./pages/UserProfilePage"));
const MessagesPage = React.lazy(() => import("./pages/MessagesPage"));
const PrivacyPolicyPage = React.lazy(() => import("./pages/PrivacyPolicyPage")); // New lazy import
const TermsOfServicePage = React.lazy(() => import("./pages/TermsOfServicePage")); // New lazy import

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="system" attribute="class">
      <AuthProvider>
        <MessagesProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Suspense fallback={<LoadingSpinner />}> {/* Add Suspense for lazy loading */}
                <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/categories" element={<CategoriesPage />} />
                  <Route path="/:category/:subcategory" element={<SubcategoryPage />} />
                  <Route path="/admin" element={<AdminPanel />} />
                  <Route path="/create-ad" element={<CreateAdPage />} />
                  <Route path="/advertisement/:id" element={<AdvertisementPage />} />
                  <Route path="/profile/:userId" element={<UserProfilePage />} />
                  <Route path="/messages" element={<MessagesPage />} />
                  <Route path="/privacy-policy" element={<PrivacyPolicyPage />} /> {/* New route */}
                  <Route path="/terms-of-service" element={<TermsOfServicePage />} /> {/* New route */}
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </Suspense>
            </BrowserRouter>
          </TooltipProvider>
        </MessagesProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
