import { Button } from "./ui/button";
import { ArrowRight, Brain, Route, Zap } from "lucide-react";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-hero" />
        <div className="absolute top-20 left-10 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse-glow animation-delay-2000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-accent/10 rounded-full blur-3xl animate-float" />
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 border border-primary/30 rounded-full mb-6 animate-slide-up">
            <Brain className="h-4 w-4 text-primary" />
            <span className="text-sm text-primary">Powered by Reinforcement Learning</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-slide-up" style={{ animationDelay: "100ms" }}>
            <span className="text-gradient">Intelligent Navigation</span>
            <br />
            <span className="text-foreground">Redefined</span>
          </h1>

          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto animate-slide-up" style={{ animationDelay: "200ms" }}>
            Experience the future of route planning with our AI-powered navigation system that learns, adapts, and optimizes your journey considering fuel efficiency.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up" style={{ animationDelay: "300ms" }}>
            <Link to="/navigate">
              <Button variant="hero" size="lg" className="gap-2 min-w-[200px]">
                Start Navigation
                <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="gap-2 min-w-[200px] border-primary/30 hover:bg-primary/10">
              <Route className="h-5 w-5" />
              Learn More
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
            {[
              {
                icon: Brain,
                title: "RL-Powered",
                description: "Advanced Q-learning algorithm finds optimal paths"
              },
              {
                icon: Zap,
                title: "Fuel Efficient",
                description: "Smart refueling recommendations based on your journey"
              },
              {
                icon: Route,
                title: "Real-time Learning",
                description: "Agent learns and adapts to find the best route"
              }
            ].map((feature, index) => (
              <div 
                key={index}
                className="glass p-6 rounded-xl hover:scale-105 transition-all animate-slide-up"
                style={{ animationDelay: `${400 + index * 100}ms` }}
              >
                <feature.icon className="h-8 w-8 text-primary mb-4 mx-auto" />
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;