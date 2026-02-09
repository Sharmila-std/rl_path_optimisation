import { Link, useLocation } from "react-router-dom";
import { Button } from "./ui/button";
import { MapPin, Home, Navigation, Fuel } from "lucide-react";

const Navbar = () => {
  const location = useLocation();

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="p-2 bg-gradient-primary rounded-lg">
              <Navigation className="h-6 w-6 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold text-gradient">SmartRoute AI</span>
          </Link>

          <div className="flex items-center gap-4">
            <Link to="/">
              <Button 
                variant={location.pathname === "/" ? "glow" : "ghost"}
                size="sm"
                className="gap-2"
              >
                <Home className="h-4 w-4" />
                Home
              </Button>
            </Link>
            <Link to="/navigate">
              <Button 
                variant={location.pathname === "/navigate" ? "path" : "ghost"}
                size="sm"
                className="gap-2"
              >
                <MapPin className="h-4 w-4" />
                Navigate
              </Button>
            </Link>
            <Button 
              variant="fuel"
              size="sm"
              className="gap-2"
            >
              <Fuel className="h-4 w-4" />
              Fuel Status
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;