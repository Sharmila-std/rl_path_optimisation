// Q-Learning implementation for pathfinding with fuel management

export interface Position {
  x: number;
  y: number;
}

export interface State {
  position: Position;
  fuel: number;
}

export interface Environment {
  gridSize: number;
  start: Position;
  goal: Position;
  fuelStations: Position[];
  obstacles: Position[];
  maxFuel: number;
}

export interface QLearningParams {
  learningRate: number;
  discountFactor: number;
  epsilon: number;
  epsilonDecay: number;
  minEpsilon: number;
  episodes: number;
}

export type Action = 'up' | 'down' | 'left' | 'right' | 'refuel';

export class QLearningAgent {
  private qTable: Map<string, Map<Action, number>>;
  private environment: Environment;
  private params: QLearningParams;
  private currentEpisode: number = 0;
  private totalReward: number = 0;
  private path: Position[] = [];
  private bestPath: Position[] = [];
  private bestReward: number = -Infinity;
  
  public onUpdate?: (data: {
    episode: number;
    reward: number;
    epsilon: number;
    position: Position;
    fuel: number;
    qValues: Map<Action, number>;
  }) => void;

  constructor(environment: Environment, params: QLearningParams) {
    this.qTable = new Map();
    this.environment = environment;
    this.params = params;
  }

  private stateToKey(state: State): string {
    return `${state.position.x},${state.position.y},${Math.floor(state.fuel)}`;
  }

  private getQValue(state: State, action: Action): number {
    const key = this.stateToKey(state);
    if (!this.qTable.has(key)) {
      this.qTable.set(key, new Map());
    }
    const actionValues = this.qTable.get(key)!;
    if (!actionValues.has(action)) {
      actionValues.set(action, 0);
    }
    return actionValues.get(action)!;
  }

  private setQValue(state: State, action: Action, value: number): void {
    const key = this.stateToKey(state);
    if (!this.qTable.has(key)) {
      this.qTable.set(key, new Map());
    }
    this.qTable.get(key)!.set(action, value);
  }

  private getValidActions(state: State): Action[] {
    const actions: Action[] = [];
    const { position } = state;
    
    // Movement actions
    if (position.y > 0 && !this.isObstacle({ x: position.x, y: position.y - 1 })) {
      actions.push('up');
    }
    if (position.y < this.environment.gridSize - 1 && !this.isObstacle({ x: position.x, y: position.y + 1 })) {
      actions.push('down');
    }
    if (position.x > 0 && !this.isObstacle({ x: position.x - 1, y: position.y })) {
      actions.push('left');
    }
    if (position.x < this.environment.gridSize - 1 && !this.isObstacle({ x: position.x + 1, y: position.y })) {
      actions.push('right');
    }
    
    // Refuel action (only at fuel stations)
    if (this.isFuelStation(position) && state.fuel < this.environment.maxFuel) {
      actions.push('refuel');
    }
    
    return actions;
  }

  private isObstacle(position: Position): boolean {
    return this.environment.obstacles.some(
      obs => obs.x === position.x && obs.y === position.y
    );
  }

  private isFuelStation(position: Position): boolean {
    return this.environment.fuelStations.some(
      station => station.x === position.x && station.y === position.y
    );
  }

  private selectAction(state: State): Action {
    const validActions = this.getValidActions(state);
    if (validActions.length === 0) return 'up'; // Default action
    
    // Epsilon-greedy strategy
    if (Math.random() < this.params.epsilon) {
      // Explore: random action
      return validActions[Math.floor(Math.random() * validActions.length)];
    } else {
      // Exploit: best known action
      let bestAction = validActions[0];
      let bestValue = this.getQValue(state, bestAction);
      
      for (const action of validActions) {
        const value = this.getQValue(state, action);
        if (value > bestValue) {
          bestValue = value;
          bestAction = action;
        }
      }
      
      return bestAction;
    }
  }

  private executeAction(state: State, action: Action): { nextState: State; reward: number } {
    const nextState: State = {
      position: { ...state.position },
      fuel: state.fuel
    };
    
    let reward = -1; // Small penalty for each step to encourage shortest path
    
    switch (action) {
      case 'up':
        nextState.position.y -= 1;
        nextState.fuel -= 1;
        break;
      case 'down':
        nextState.position.y += 1;
        nextState.fuel -= 1;
        break;
      case 'left':
        nextState.position.x -= 1;
        nextState.fuel -= 1;
        break;
      case 'right':
        nextState.position.x += 1;
        nextState.fuel -= 1;
        break;
      case 'refuel':
        nextState.fuel = this.environment.maxFuel;
        reward = -3; // Smaller penalty for refueling to encourage when needed
        break;
    }
    
    // Check if out of fuel
    if (nextState.fuel <= 0) {
      reward = -200; // Very large penalty for running out of fuel
    }
    
    // Check if reached goal - major reward with distance bonus
    if (nextState.position.x === this.environment.goal.x && 
        nextState.position.y === this.environment.goal.y) {
      // Reward inversely proportional to steps taken (encourage shortest path)
      const manhattanDistance = Math.abs(this.environment.start.x - this.environment.goal.x) + 
                                Math.abs(this.environment.start.y - this.environment.goal.y);
      reward = 200 + nextState.fuel * 2; // Big reward for reaching goal with fuel bonus
    }
    
    // Stronger reward for getting closer to goal (Manhattan distance)
    const currentDistance = Math.abs(state.position.x - this.environment.goal.x) + 
                          Math.abs(state.position.y - this.environment.goal.y);
    const nextDistance = Math.abs(nextState.position.x - this.environment.goal.x) + 
                        Math.abs(nextState.position.y - this.environment.goal.y);
    
    if (nextDistance < currentDistance) {
      reward += 5; // Bigger reward for moving closer
    } else if (nextDistance > currentDistance && action !== 'refuel') {
      reward -= 3; // Penalty for moving away (unless refueling)
    }
    
    return { nextState, reward };
  }

  private updateQValue(state: State, action: Action, reward: number, nextState: State): void {
    const currentQ = this.getQValue(state, action);
    
    // Find max Q-value for next state
    const nextActions = this.getValidActions(nextState);
    let maxNextQ = 0;
    if (nextActions.length > 0) {
      maxNextQ = Math.max(...nextActions.map(a => this.getQValue(nextState, a)));
    }
    
    // Q-learning update formula
    const newQ = currentQ + this.params.learningRate * 
                 (reward + this.params.discountFactor * maxNextQ - currentQ);
    
    this.setQValue(state, action, newQ);
  }

  public async train(): Promise<Position[]> {
    for (let episode = 0; episode < this.params.episodes; episode++) {
      this.currentEpisode = episode;
      let state: State = {
        position: { ...this.environment.start },
        fuel: this.environment.maxFuel
      };
      
      this.path = [{ ...state.position }];
      this.totalReward = 0;
      let steps = 0;
      const maxSteps = this.environment.gridSize * this.environment.gridSize * 2;
      
      while (steps < maxSteps) {
        const action = this.selectAction(state);
        const { nextState, reward } = this.executeAction(state, action);
        
        this.updateQValue(state, action, reward, nextState);
        
        this.totalReward += reward;
        state = nextState;
        this.path.push({ ...state.position });
        
        // Report progress
        if (this.onUpdate) {
          const qValues = new Map<Action, number>();
          const validActions = this.getValidActions(state);
          validActions.forEach(a => qValues.set(a, this.getQValue(state, a)));
          
          this.onUpdate({
            episode,
            reward: this.totalReward,
            epsilon: this.params.epsilon,
            position: state.position,
            fuel: state.fuel,
            qValues
          });
        }
        
        // Check if reached goal or out of fuel
        if ((state.position.x === this.environment.goal.x && 
             state.position.y === this.environment.goal.y) ||
            state.fuel <= 0) {
          break;
        }
        
        steps++;
        
        // Small delay for visualization
        await new Promise(resolve => setTimeout(resolve, 10));
      }
      
      // Update best path
      if (this.totalReward > this.bestReward) {
        this.bestReward = this.totalReward;
        this.bestPath = [...this.path];
      }
      
      // Decay epsilon
      this.params.epsilon = Math.max(
        this.params.minEpsilon,
        this.params.epsilon * this.params.epsilonDecay
      );
    }
    
    return this.bestPath;
  }

  public getOptimalPath(): Position[] {
    const path: Position[] = [];
    let state: State = {
      position: { ...this.environment.start },
      fuel: this.environment.maxFuel
    };
    
    path.push({ ...state.position });
    const maxSteps = this.environment.gridSize * this.environment.gridSize * 2;
    let steps = 0;
    
    while (steps < maxSteps) {
      const validActions = this.getValidActions(state);
      if (validActions.length === 0) break;
      
      // Always choose the best action (no exploration)
      let bestAction = validActions[0];
      let bestValue = this.getQValue(state, bestAction);
      
      for (const action of validActions) {
        const value = this.getQValue(state, action);
        if (value > bestValue) {
          bestValue = value;
          bestAction = action;
        }
      }
      
      const { nextState } = this.executeAction(state, bestAction);
      state = nextState;
      
      // Only add position changes to path (not refuel actions)
      if (bestAction !== 'refuel') {
        path.push({ ...state.position });
      }
      
      // Check if reached goal
      if (state.position.x === this.environment.goal.x && 
          state.position.y === this.environment.goal.y) {
        break;
      }
      
      steps++;
    }
    
    return path;
  }

  public needsRefuel(currentFuel: number, distanceToGoal: number): boolean {
    // Simple heuristic: need refuel if fuel won't last to goal with 20% buffer
    return currentFuel < distanceToGoal * 1.2;
  }
}