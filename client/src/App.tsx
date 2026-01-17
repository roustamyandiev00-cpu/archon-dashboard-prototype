import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
import ErrorBoundary from "./components/ErrorBoundaryComponent";
import { ThemeProvider } from "./contexts/ThemeContext";
import DashboardLayout from "./components/DashboardLayout";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Klanten from "./pages/Klanten";
import Facturen from "./pages/Facturen";
import Offertes from "./pages/Offertes";
import Transacties from "./pages/Transacties";
import Instellingen from "./pages/Instellingen";
import Projecten from "./pages/Projecten";
import Werkzaamheden from "./pages/Werkzaamheden";
import Email from "./pages/Email";
import Agenda from "./pages/Agenda";
import Uitgaven from "./pages/Uitgaven";
import Bankieren from "./pages/Bankieren";
import Inzichten from "./pages/Inzichten";
import AIAssistant from "./pages/AIAssistant";
import Help from "./pages/Help";

function Router() {
  return (
    <Switch>
      {/* Public routes without dashboard layout */}
      <Route path="/" component={Landing} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />

      {/* Dashboard routes wrapped with layout */}
      <Route path="/dashboard">
        {(params) => (
          <DashboardLayout>
            <Dashboard {...params} />
          </DashboardLayout>
        )}
      </Route>
      <Route path="/klanten">
        {(params) => (
          <DashboardLayout>
            <Klanten {...params} />
          </DashboardLayout>
        )}
      </Route>
      <Route path="/facturen">
        {(params) => (
          <DashboardLayout>
            <Facturen {...params} />
          </DashboardLayout>
        )}
      </Route>
      <Route path="/offertes">
        {(params) => (
          <DashboardLayout>
            <Offertes {...params} />
          </DashboardLayout>
        )}
      </Route>
      <Route path="/transacties">
        {(params) => (
          <DashboardLayout>
            <Transacties {...params} />
          </DashboardLayout>
        )}
      </Route>
      <Route path="/instellingen">
        {(params) => (
          <DashboardLayout>
            <Instellingen {...params} />
          </DashboardLayout>
        )}
      </Route>
      <Route path="/projecten">
        {(params) => (
          <DashboardLayout>
            <Projecten {...params} />
          </DashboardLayout>
        )}
      </Route>
      <Route path="/werkzaamheden">
        {(params) => (
          <DashboardLayout>
            <Werkzaamheden {...params} />
          </DashboardLayout>
        )}
      </Route>
      <Route path="/email">
        {(params) => (
          <DashboardLayout>
            <Email {...params} />
          </DashboardLayout>
        )}
      </Route>
      <Route path="/agenda">
        {(params) => (
          <DashboardLayout>
            <Agenda {...params} />
          </DashboardLayout>
        )}
      </Route>
      <Route path="/uitgaven">
        {(params) => (
          <DashboardLayout>
            <Uitgaven {...params} />
          </DashboardLayout>
        )}
      </Route>
      <Route path="/bankieren">
        {(params) => (
          <DashboardLayout>
            <Bankieren {...params} />
          </DashboardLayout>
        )}
      </Route>
      <Route path="/inzichten">
        {(params) => (
          <DashboardLayout>
            <Inzichten {...params} />
          </DashboardLayout>
        )}
      </Route>
      <Route path="/ai-assistant">
        {(params) => (
          <DashboardLayout>
            <AIAssistant {...params} />
          </DashboardLayout>
        )}
      </Route>
      <Route path="/help">
        {(params) => (
          <DashboardLayout>
            <Help {...params} />
          </DashboardLayout>
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
      <ThemeProvider defaultTheme="dark" switchable={true}>
        <TooltipProvider>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: 'var(--card)',
                border: '1px solid var(--border)',
                color: 'var(--foreground)',
              },
              className: 'glass-card'
            }}
          />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
