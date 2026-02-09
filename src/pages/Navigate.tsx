import { useState, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import Navbar from "@/components/Navbar";
import NavigationMap from "@/components/NavigationMap";
import { 
  QLearningAgent, 
  Environment, 
  Position, 
  QLearningParams 
} from "@/utils/reinforcementLearning";
import { 
  Play, 
  RotateCcw, 
  MapPin, 
  Fuel, 
  Brain, 
  TrendingUp,
  Gauge,
  Navigation
} from "lucide-react";

const Navigate = () => {
  // Environment state
  const [gridSize] = useState(16);
  const [start, setStart] = useState<Position>({ x: 0, y: 0 });
  const [goal, setGoal] = useState<Position>({ x: 15, y: 15 });
  const [currentFuel, setCurrentFuel] = useState(100);
  const [maxFuel] = useState(100);
  
  // Fixed obstacles and fuel stations for consistent environment
  const obstacles: Position[] = [
    { x: 2, y: 2 }, { x: 2, y: 3 }, { x: 3, y: 2 },
    { x: 5, y: 5 }, { x: 5, y: 6 }, { x: 6, y: 5 },
    { x: 8, y: 3 }, { x: 9, y: 3 }, { x: 8, y: 4 },
    { x: 1, y: 8 }, { x: 2, y: 8 }, { x: 1, y: 9 },
    { x: 7, y: 9 }, { x: 7, y: 10 }, { x: 8, y: 9 },
    { x: 11, y: 11 }, { x: 12, y: 11 }, { x: 11, y: 12 },
    { x: 14, y: 7 }, { x: 13, y: 7 }, { x: 14, y: 8 },
    { x: 4, y: 13 }, { x: 5, y: 13 }, { x: 4, y: 14 }
  ];
  
  const fuelStations: Position[] = [
    { x: 3, y: 6 },
    { x: 8, y: 7 },
    { x: 5, y: 2 },
    { x: 9, y: 10 },
    { x: 12, y: 4 },
    { x: 6, y: 12 },
    { x: 13, y: 13 }
  ];

  // Training state
  const [isTraining, setIsTraining] = useState(false);
  const [agent, setAgent] = useState<QLearningAgent | null>(null);
  const [agentPosition, setAgentPosition] = useState<Position>(start);
  const [currentPath, setCurrentPath] = useState<Position[]>([]);
  const [optimalPath, setOptimalPath] = useState<Position[]>([]);
  const [showOptimalPath, setShowOptimalPath] = useState(false);
  const [stepsCount, setStepsCount] = useState(0);
  
  // Training metrics
  const [episode, setEpisode] = useState(0);
  const [totalEpisodes] = useState(200);
  const [currentReward, setCurrentReward] = useState(0);
  const [epsilon, setEpsilon] = useState(1.0);
  const [qValues, setQValues] = useState<string>("");
  const [needsRefuel, setNeedsRefuel] = useState(false);

  const initializeAgent = useCallback(() => {
    const environment: Environment = {
      gridSize,
      start,
      goal,
      fuelStations,
      obstacles,
      maxFuel
    };

    const params: QLearningParams = {
      learningRate: 0.15,
      discountFactor: 0.99,
      epsilon: 1.0,
      epsilonDecay: 0.99,
      minEpsilon: 0.01,
      episodes: totalEpisodes
    };

    const newAgent = new QLearningAgent(environment, params);
    
    // Set up progress callback
    newAgent.onUpdate = (data) => {
      setEpisode(data.episode);
      setCurrentReward(data.reward);
      setEpsilon(data.epsilon);
      setAgentPosition(data.position);
      setCurrentFuel(data.fuel);
      
      // Format Q-values for display
      const qValuesStr = Array.from(data.qValues.entries())
        .map(([action, value]) => `${action}: ${value.toFixed(2)}`)
        .join(', ');
      setQValues(qValuesStr);
    };

    setAgent(newAgent);
    return newAgent;
  }, [gridSize, start, goal, totalEpisodes]);

  const startTraining = async () => {
    if (isTraining) return;
    
    setIsTraining(true);
    setShowOptimalPath(false);
    setCurrentPath([]);
    setOptimalPath([]);
    
    const newAgent = initializeAgent();
    
    toast.success("Training started! The agent is learning the optimal path...");
    
    try {
      const bestPath = await newAgent.train();
      setOptimalPath(bestPath);
      
      // Get the final optimal path
      const finalPath = newAgent.getOptimalPath();
      setOptimalPath(finalPath);
      setShowOptimalPath(true);
      
      // Calculate distance
      const distance = finalPath.length - 1;
      setStepsCount(distance);
      const fuelNeeded = distance;
      const requiresRefuel = newAgent.needsRefuel(currentFuel, distance);
      setNeedsRefuel(requiresRefuel);
      
      toast.success(
        `Training complete! Shortest path found: ${distance} steps. ${
          requiresRefuel ? 'Refueling recommended.' : 'No refueling needed.'
        }`
      );
    } catch (error) {
      toast.error("Training failed. Please try again.");
    } finally {
      setIsTraining(false);
    }
  };

  const reset = () => {
    setIsTraining(false);
    setAgent(null);
    setAgentPosition(start);
    setCurrentPath([]);
    setOptimalPath([]);
    setShowOptimalPath(false);
    setEpisode(0);
    setCurrentReward(0);
    setEpsilon(1.0);
    setQValues("");
    setCurrentFuel(maxFuel);
    setNeedsRefuel(false);
    setStepsCount(0);
    toast.info("Environment reset. Ready for new training.");
  };

  const updateStartPosition = (axis: 'x' | 'y', value: string) => {
    const num = parseInt(value);
    if (num >= 0 && num < gridSize) {
      setStart(prev => ({ ...prev, [axis]: num }));
      setAgentPosition(prev => ({ ...prev, [axis]: num }));
    }
  };

  const updateGoalPosition = (axis: 'x' | 'y', value: string) => {
    const num = parseInt(value);
    if (num >= 0 && num < gridSize) {
      setGoal(prev => ({ ...prev, [axis]: num }));
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="container mx-auto px-4 pt-24 pb-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Map Display */}
          <div className="lg:col-span-2">
            <Card className="p-6 glass">
              <h2 className="text-2xl font-bold mb-4 text-gradient">Navigation Map</h2>
              <NavigationMap
                gridSize={gridSize}
                start={start}
                goal={goal}
                fuelStations={fuelStations}
                obstacles={obstacles}
                agentPosition={agentPosition}
                path={currentPath}
                optimalPath={optimalPath}
                showOptimalPath={showOptimalPath}
              />
            </Card>
          </div>

          {/* Control Panel */}
          <div className="space-y-6">
            {/* Position Controls */}
            <Card className="p-6 glass">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-primary" />
                Position Settings
              </h3>
              
              <div className="space-y-4">
                <div>
                  <Label>Start Position</Label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <Input
                      type="number"
                      placeholder="X"
                      value={start.x}
                      onChange={(e) => updateStartPosition('x', e.target.value)}
                      min={0}
                      max={gridSize - 1}
                      disabled={isTraining}
                    />
                    <Input
                      type="number"
                      placeholder="Y"
                      value={start.y}
                      onChange={(e) => updateStartPosition('y', e.target.value)}
                      min={0}
                      max={gridSize - 1}
                      disabled={isTraining}
                    />
                  </div>
                </div>
                
                <div>
                  <Label>Goal Position</Label>
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <Input
                      type="number"
                      placeholder="X"
                      value={goal.x}
                      onChange={(e) => updateGoalPosition('x', e.target.value)}
                      min={0}
                      max={gridSize - 1}
                      disabled={isTraining}
                    />
                    <Input
                      type="number"
                      placeholder="Y"
                      value={goal.y}
                      onChange={(e) => updateGoalPosition('y', e.target.value)}
                      min={0}
                      max={gridSize - 1}
                      disabled={isTraining}
                    />
                  </div>
                </div>
              </div>
            </Card>

            {/* Fuel Status */}
            <Card className="p-6 glass">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Fuel className="h-5 w-5 text-warning" />
                Fuel Management
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Current Fuel</span>
                  <span className="font-bold text-lg">{currentFuel.toFixed(0)}%</span>
                </div>
                <Progress value={currentFuel} className="h-3" />
                
                {needsRefuel && (
                  <div className="p-3 bg-warning/10 border border-warning/30 rounded-lg">
                    <p className="text-sm text-warning flex items-center gap-2">
                      <Fuel className="h-4 w-4" />
                      Refueling recommended for this journey
                    </p>
                  </div>
                )}
                
                <div className="pt-2">
                  <Label>Fuel Level</Label>
                  <Input
                    type="number"
                    value={currentFuel}
                    onChange={(e) => setCurrentFuel(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                    min={0}
                    max={100}
                    disabled={isTraining}
                    className="mt-1"
                  />
                </div>
              </div>
            </Card>

            {/* Training Metrics */}
            <Card className="p-6 glass">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Brain className="h-5 w-5 text-secondary" />
                RL Training Metrics
              </h3>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Episode</span>
                  <span className="font-bold">{episode} / {totalEpisodes}</span>
                </div>
                <Progress value={(episode / totalEpisodes) * 100} className="h-2" />
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Total Reward</span>
                  <span className="font-bold text-accent">{currentReward.toFixed(2)}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Exploration Rate (ε)</span>
                  <span className="font-bold">{(epsilon * 100).toFixed(1)}%</span>
                </div>
                
                {qValues && (
                  <div className="p-3 bg-primary/10 border border-primary/30 rounded-lg">
                    <p className="text-xs text-primary font-mono">Q-Values: {qValues}</p>
                  </div>
                )}
              </div>
            </Card>

            {/* Action Buttons */}
            <div className="space-y-3">
              <Button
                variant="path"
                size="lg"
                className="w-full"
                onClick={startTraining}
                disabled={isTraining}
              >
                {isTraining ? (
                  <>
                    <Brain className="h-5 w-5 animate-pulse" />
                    Training Agent...
                  </>
                ) : (
                  <>
                    <Play className="h-5 w-5" />
                    Start RL Training
                  </>
                )}
              </Button>
              
              <Button
                variant="outline"
                size="lg"
                className="w-full"
                onClick={reset}
                disabled={isTraining}
              >
                <RotateCcw className="h-5 w-5" />
                Reset Environment
              </Button>
            </div>

            {/* Results */}
            {showOptimalPath && optimalPath.length > 0 && (
              <Card className="p-6 glass border-accent/30">
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2 text-accent">
                  <Navigation className="h-5 w-5" />
                  Shortest Path Found!
                </h3>
                <div className="space-y-2 text-sm">
                  <p className="text-lg">Total Steps: <span className="font-bold text-primary text-xl">{stepsCount}</span></p>
                  <p>Fuel Required: <span className="font-bold">{stepsCount} units</span></p>
                  <p>Path Length: <span className="font-bold">{optimalPath.length} positions</span></p>
                  <p>Status: <span className="font-bold text-accent">
                    {needsRefuel ? "Stop at fuel station recommended" : "Direct route possible"}
                  </span></p>
                </div>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navigate;