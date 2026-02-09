import { Card } from "./ui/card";
import { Shield, AlertTriangle, Info, CheckCircle } from "lucide-react";

const TrafficRulesSection = () => {
  const rules = [
    {
      icon: Shield,
      title: "Safety First",
      items: [
        "Always follow speed limits in residential areas",
        "Maintain safe distance from other vehicles",
        "Use turn signals for navigation",
        "Stop at red lights and stop signs"
      ],
      color: "text-primary"
    },
    {
      icon: AlertTriangle,
      title: "Fuel Management",
      items: [
        "Monitor fuel levels constantly",
        "Plan refueling stops in advance",
        "Avoid running below 10% fuel capacity",
        "Consider detours to fuel stations when necessary"
      ],
      color: "text-warning"
    },
    {
      icon: Info,
      title: "Route Optimization",
      items: [
        "Avoid high-traffic areas during peak hours",
        "Consider weather conditions",
        "Use highways for long-distance travel",
        "Take scenic routes when time permits"
      ],
      color: "text-secondary"
    },
    {
      icon: CheckCircle,
      title: "AI Guidelines",
      items: [
        "The AI learns from exploration",
        "Rewards are based on distance and fuel efficiency",
        "Penalties apply for running out of fuel",
        "Optimal paths balance speed and efficiency"
      ],
      color: "text-accent"
    }
  ];

  return (
    <section className="py-20 bg-gradient-hero">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold mb-4">
            <span className="text-gradient">Traffic Rules & Guidelines</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Understanding the rules helps our AI make better navigation decisions
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {rules.map((rule, index) => (
            <Card key={index} className="p-6 glass">
              <div className="flex items-start gap-4">
                <div className={`p-3 rounded-lg bg-background/50 ${rule.color}`}>
                  <rule.icon className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-3">{rule.title}</h3>
                  <ul className="space-y-2">
                    {rule.items.map((item, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className={`mt-1.5 w-1.5 h-1.5 rounded-full bg-current ${rule.color}`} />
                        <span className="text-muted-foreground">{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default TrafficRulesSection;