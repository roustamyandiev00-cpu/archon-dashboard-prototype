import { Component, ErrorInfo, ReactNode } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Props {
  children: ReactNode;
  fallback?: Component<{ error: Error; resetErrorBoundary: () => void }>;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export default class ErrorBoundaryComponent extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Error caught by boundary:", error, errorInfo);
    
    // Log error to service (in production)
    if (import.meta.env.PROD) {
      // Send to error logging service
      fetch('/api/errors', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          error: error.message,
          stack: error.stack,
          componentStack: errorInfo.componentStack,
          timestamp: new Date().toISOString(),
          userAgent: navigator.userAgent,
          url: window.location.href
        })
      }).catch(console.error);
    }
  }

  handleReset = () => {
    this.setState({ hasError: false, error: undefined });
  };

  render() {
    if (this.state.hasError) {
      return (
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="min-h-screen flex items-center justify-center p-4"
        >
          <Card className="glass-card border-red-500/20 max-w-md w-full">
            <CardHeader className="text-center">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="mb-4"
              >
                <div className="w-16 h-16 mx-auto rounded-2xl bg-red-500/20 flex items-center justify-center">
                  <AlertTriangle className="w-8 h-8 text-red-400" />
                </div>
              </motion.div>
              <CardTitle className="text-xl font-bold text-red-400" style={{ fontFamily: 'var(--font-display)' }}>
                Er is iets misgegaan
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-6">
              <p className="text-muted-foreground leading-relaxed">
                Er is een onverwachte fout opgetreden. Onze excuses voor het ongemak.
              </p>
              
              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10">
                  <div className="flex items-center gap-3">
                    <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
                    <div className="text-left">
                      <p className="text-sm font-medium text-red-400">Foutdetails</p>
                      <p className="text-xs text-muted-foreground">
                        {this.state.error?.message || "Onbekende fout"}
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3">
                  <Button 
                    variant="outline" 
                    className="flex-1 border-red-500/20 hover:bg-red-500/5 text-red-400"
                    onClick={this.handleReset}
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Probeer opnieuw
                  </Button>
                  <Button 
                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
                    onClick={() => window.location.href = "/help"}
                  >
                    Contact support
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      );
    }

    return this.props.children;
  }
}
