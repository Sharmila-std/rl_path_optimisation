import { Card } from "./ui/card";
import { Brain, Map, Fuel, RotateCcw, BarChart3, Navigation } from "lucide-react";

const FeaturesSection = () => {
  const features = [
    {
      icon: Brain,
      title: "Reinforcement Learning Engine",
      description: "Our Q-learning algorithm trains an intelligent agent that explores the environment, learns from rewards, and discovers optimal paths through experience.",
      gradient: "from-primary to-secondary"
    },
    {
      icon: Map,
      title: "Beautiful Interactive Map",
      description: "Realistic isometric-style visualization with roads, buildings, trees, and fuel stations. Watch your vehicle navigate through the city in real-time.",
      gradient: "from-secondary to-accent"
    },
    {
      icon: Fuel,
      title: "Smart Fuel Management",
      description: "The system tracks your fuel levels and intelligently recommends refueling stops, ensuring you never run out while optimizing your route.",
      gradient: "from-accent to-warning"
    },
    {
      icon: BarChart3,
      title: "Live Training Analytics",
      description: "Monitor Q-values, rewards, and exploration rates in real-time as the agent learns. See exactly how the AI discovers the best path.",
      gradient: "from-warning to-primary"
    },
    {
      icon: RotateCcw,
      title: "Reset & Retry",
      description: "Easily reset the environment and try different start/end positions. Each training session helps you understand how RL works.",
      gradient: "from-primary to-accent"
    },
    {
      icon: Navigation,
      title: "Optimal Path Visualization",
      description: "Once trained, see the optimal path highlighted with beautiful animations. The system shows distance, fuel consumption, and recommended stops.",
      gradient: "from-secondary to-warning"
    }
  ];

  return (
    <section className="py-20 relative">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">
            <span className="text-gradient">How It Works</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Our AI navigation system uses cutting-edge reinforcement learning to find the perfect route
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <Card 
              key={index}
              className="p-6 glass hover:scale-105 transition-all cursor-pointer group"
            >
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${feature.gradient} p-2.5 mb-4 group-hover:scale-110 transition-all`}>
                <feature.icon className="w-full h-full text-primary-foreground" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;