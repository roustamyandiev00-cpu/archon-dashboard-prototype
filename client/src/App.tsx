import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundaryComponent";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider } from "./contexts/AuthContext";
import DashboardLayout from "./components/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";

// Eager load critical pages
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";

// Lazy load dashboard pages
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Klanten = lazy(() => import("./pages/Klanten"));
const Facturen = lazy(() => import("./pages/Facturen"));
const Offertes = lazy(() => import("./pages/Offertes"));
const Transacties = lazy(() => import("./pages/Transacties"));
const Instellingen = lazy(() => import("./pages/Instellingen"));
const Projecten = lazy(() => import("./pages/Projecten"));
const Werkzaamheden = lazy(() => import("./pages/Werkzaamheden"));
const Email = lazy(() => import("./pages/Email"));
const Agenda = lazy(() => import("./pages/Agenda"));
const Uitgaven = lazy(() => import("./pages/Uitgaven"));
const Bankieren = lazy(() => import("./pages/Bankieren"));
const Inzichten = lazy(() => import("./pages/Inzichten"));
const AIAssistant = lazy(() => import("./pages/AIAssistant"));
const Pricing = lazy(() => import("./pages/Pricing"));
const PricingPublic = lazy(() => import("./pages/PricingPublic"));
const Modules = lazy(() => import("./pages/Modules"));
const Help = lazy(() => import("./pages/Help"));

// Loading component
function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="animate-spin w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full" />
    </div>
  );
}

function Router() {
  return (
    <Switch>
      {/* Public routes - no lazy loading */}
      <Route path="/" component={Landing} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/pricing">
        <Suspense fallback={<PageLoader />}>
          <PricingPublic />
        </Suspense>
      </Route>

      {/* Protected dashboard routes - lazy loaded */}
      <Route path="/dashboard">
        {(params) => (
          <ProtectedRoute>
            <DashboardLayout>
              <Suspense fallback={<PageLoader />}>
                <Dashboard {...params} />
              </Suspense>
            </DashboardLayout>
          </ProtectedRoute>
        )}
      </Route>
      
      <Route path="/klanten">
        {(params) => (
          <ProtectedRoute>
            <DashboardLayout>
              <Suspense fallback={<PageLoader />}>
                <Klanten {...params} />
              </Suspense>
            </DashboardLayout>
          </ProtectedRoute>
        )}
      </Route>
      
      <Route path="/facturen">
        {(params) => (
          <ProtectedRoute>
            <DashboardLayout>
              <Suspense fallback={<PageLoader />}>
                <Facturen {...params} />
              </Suspense>
            </DashboardLayout>
          </ProtectedRoute>
        )}
      </Route>
      
      <Route path="/offertes">
        {(params) => (
          <ProtectedRoute>
            <DashboardLayout>
              <Suspense fallback={<PageLoader />}>
                <Offertes {...params} />
              </Suspense>
            </DashboardLayout>
          </ProtectedRoute>
        )}
      </Route>
      
      <Route path="/transacties">
        {(params) => (
          <ProtectedRoute>
            <DashboardLayout>
              <Suspense fallback={<PageLoader />}>
                <Transacties {...params} />
              </Suspense>
            </DashboardLayout>
          </ProtectedRoute>
        )}
      </Route>
      
      <Route path="/instellingen">
        {(params) => (
          <ProtectedRoute>
            <DashboardLayout>
              <Suspense fallback={<PageLoader />}>
                <Instellingen {...params} />
              </Suspense>
            </DashboardLayout>
          </ProtectedRoute>
        )}
      </Route>
      
      <Route path="/projecten">
        {(params) => (
          <ProtectedRoute>
            <DashboardLayout>
              <Suspense fallback={<PageLoader />}>
                <Projecten {...params} />
              </Suspense>
            </DashboardLayout>
          </ProtectedRoute>
        )}
      </Route>
      
      <Route path="/werkzaamheden">
        {(params) => (
          <ProtectedRoute>
            <DashboardLayout>
              <Suspense fallback={<PageLoader />}>
                <Werkzaamheden {...params} />
              </Suspense>
            </DashboardLayout>
          </ProtectedRoute>
        )}
      </Route>
      
      <Route path="/email">
        {(params) => (
          <ProtectedRoute>
            <DashboardLayout>
              <Suspense fallback={<PageLoader />}>
                <Email {...params} />
              </Suspense>
            </DashboardLayout>
          </ProtectedRoute>
        )}
      </Route>
      
      <Route path="/agenda">
        {(params) => (
          <ProtectedRoute>
            <DashboardLayout>
              <Suspense fallback={<PageLoader />}>
                <Agenda {...params} />
              </Suspense>
            </DashboardLayout>
          </ProtectedRoute>
        )}
      </Route>
      
      <Route path="/uitgaven">
        {(params) => (
          <ProtectedRoute>
            <DashboardLayout>
              <Suspense fallback={<PageLoader />}>
                <Uitgaven {...params} />
              </Suspense>
            </DashboardLayout>
          </ProtectedRoute>
        )}
      </Route>
      
      <Route path="/bankieren">
        {(params) => (
          <ProtectedRoute>
            <DashboardLayout>
              <Suspense fallback={<PageLoader />}>
                <Bankieren {...params} />
              </Suspense>
            </DashboardLayout>
          </ProtectedRoute>
        )}
      </Route>
      
      <Route path="/inzichten">
        {(params) => (
          <ProtectedRoute>
            <DashboardLayout>
              <Suspense fallback={<PageLoader />}>
                <Inzichten {...params} />
              </Suspense>
            </DashboardLayout>
          </ProtectedRoute>
        )}
      </Route>

      <Route path="/app/pricing">
        {(params) => (
          <ProtectedRoute>
            <DashboardLayout>
              <Suspense fallback={<PageLoader />}>
                <Pricing {...params} />
              </Suspense>
            </DashboardLayout>
          </ProtectedRoute>
        )}
      </Route>

      <Route path="/modules">
        {(params) => (
          <ProtectedRoute>
            <DashboardLayout>
              <Suspense fallback={<PageLoader />}>
                <Modules {...params} />
              </Suspense>
            </DashboardLayout>
          </ProtectedRoute>
        )}
      </Route>
      
      <Route path="/ai-assistant">
        {(params) => (
          <ProtectedRoute>
            <DashboardLayout>
              <Suspense fallback={<PageLoader />}>
                <AIAssistant {...params} />
              </Suspense>
            </DashboardLayout>
          </ProtectedRoute>
        )}
      </Route>
      
      <Route path="/help">
        {(params) => (
          <ProtectedRoute>
            <DashboardLayout>
              <Suspense fallback={<PageLoader />}>
                <Help {...params} />
              </Suspense>
            </DashboardLayout>
          </ProtectedRoute>
        )}
      </Route>

      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ThemeProvider defaultTheme="dark" switchable={true}>
          <TooltipProvider>
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  color: "var(--foreground)",
                },
                className: "glass-card",
              }}
            />
            <Router />
          </TooltipProvider>
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
