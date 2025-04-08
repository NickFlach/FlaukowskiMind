import { Switch, Route, Link } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import MetaIntelligence from "@/pages/MetaIntelligence";
import SplashScreen from "@/components/SplashScreen";
import { useState, useEffect } from "react";
import { Brain, Home as HomeIcon, Menu, X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { Button } from "@/components/ui/button";

// Navigation component
function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isMobile = useIsMobile();
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  const closeMenu = () => {
    setIsMenuOpen(false);
  };
  
  return (
    <>
      {/* Desktop Navigation */}
      {!isMobile && (
        <nav className="fixed top-0 left-0 right-0 bg-background/80 backdrop-blur-md border-b border-border z-50">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-1">
              <Brain className="h-6 w-6 text-primary" />
              <span className="font-bold text-lg">Flaukowski</span>
            </div>
            
            <div className="flex items-center space-x-6">
              <Link href="/" className="flex items-center space-x-1 text-muted-foreground hover:text-foreground transition-colors">
                <HomeIcon className="h-4 w-4" />
                <span>Home</span>
              </Link>
              <Link href="/intelligence" className="flex items-center space-x-1 text-muted-foreground hover:text-foreground transition-colors">
                <Brain className="h-4 w-4" />
                <span>Meta-Intelligence</span>
              </Link>
            </div>
          </div>
        </nav>
      )}
      
      {/* Mobile Navigation */}
      {isMobile && (
        <>
          <div className="fixed top-0 left-0 right-0 bg-background/80 backdrop-blur-md border-b border-border z-50">
            <div className="container mx-auto px-4 py-3 flex items-center justify-between">
              <div className="flex items-center space-x-1">
                <Brain className="h-6 w-6 text-primary" />
                <span className="font-bold text-lg">Flaukowski</span>
              </div>
              
              <Button variant="ghost" size="icon" onClick={toggleMenu}>
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </div>
          </div>
          
          {isMenuOpen && (
            <div className="fixed inset-0 bg-background z-40 pt-16">
              <div className="container mx-auto px-4 py-8 space-y-6">
                <Link href="/" onClick={closeMenu} className="flex items-center space-x-3 p-3 rounded-md bg-muted/50 hover:bg-muted transition-colors">
                  <HomeIcon className="h-5 w-5" />
                  <span className="font-medium">Home</span>
                </Link>
                <Link href="/intelligence" onClick={closeMenu} className="flex items-center space-x-3 p-3 rounded-md bg-muted/50 hover:bg-muted transition-colors">
                  <Brain className="h-5 w-5" />
                  <span className="font-medium">Meta-Intelligence</span>
                </Link>
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
}

function Router() {
  return (
    <>
      <Navigation />
      <div className={`pt-16`}> {/* Add padding for fixed navbar */}
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/intelligence" component={MetaIntelligence} />
          <Route component={NotFound} />
        </Switch>
      </div>
    </>
  );
}

function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading time for the splash screen
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      {loading ? (
        <SplashScreen />
      ) : (
        <>
          <Router />
          <Toaster />
        </>
      )}
    </QueryClientProvider>
  );
}

export default App;
