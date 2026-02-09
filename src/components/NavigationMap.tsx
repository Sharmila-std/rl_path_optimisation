import React, { useEffect, useRef, useState } from 'react';
import { Position } from '@/utils/reinforcementLearning';
import { Car, Trees, Building, Fuel } from 'lucide-react';

interface NavigationMapProps {
  gridSize: number;
  start: Position;
  goal: Position;
  fuelStations: Position[];
  obstacles: Position[];
  agentPosition: Position;
  path: Position[];
  optimalPath: Position[];
  showOptimalPath: boolean;
}

const NavigationMap: React.FC<NavigationMapProps> = ({
  gridSize,
  start,
  goal,
  fuelStations,
  obstacles,
  agentPosition,
  path,
  optimalPath,
  showOptimalPath
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hoveredCell, setHoveredCell] = useState<Position | null>(null);

  const cellSize = 35;
  const mapSize = gridSize * cellSize;
  const isometricOffset = 0.5;

  // Convert grid position to isometric coordinates
  const toIsometric = (x: number, y: number) => {
    const isoX = (x - y) * cellSize * 0.866 + mapSize / 2;
    const isoY = (x + y) * cellSize * 0.5;
    return { x: isoX, y: isoY };
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw grid cells
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        const iso = toIsometric(x, y);
        
        // Cell color based on type
        let fillColor = 'hsl(217 33% 17%)'; // Default road color
        
        if (obstacles.some(obs => obs.x === x && obs.y === y)) {
          fillColor = 'hsl(217 33% 25%)'; // Building color
        } else if (fuelStations.some(fuel => fuel.x === x && fuel.y === y)) {
          fillColor = 'hsl(38 92% 50% / 0.2)'; // Fuel station color
        } else if (x === start.x && y === start.y) {
          fillColor = 'hsl(142 86% 58% / 0.3)'; // Start color
        } else if (x === goal.x && y === goal.y) {
          fillColor = 'hsl(0 84% 60% / 0.3)'; // Goal color
        }

        // Draw isometric tile
        ctx.beginPath();
        ctx.moveTo(iso.x, iso.y);
        ctx.lineTo(iso.x + cellSize * 0.866, iso.y + cellSize * 0.5);
        ctx.lineTo(iso.x, iso.y + cellSize);
        ctx.lineTo(iso.x - cellSize * 0.866, iso.y + cellSize * 0.5);
        ctx.closePath();
        
        ctx.fillStyle = fillColor;
        ctx.fill();
        ctx.strokeStyle = 'hsl(217 33% 30%)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }

    // Draw optimal path if shown
    if (showOptimalPath && optimalPath.length > 1) {
      ctx.strokeStyle = 'hsl(142 86% 58%)';
      ctx.lineWidth = 6;
      ctx.lineCap = 'round';
      ctx.setLineDash([12, 6]);
      ctx.globalAlpha = 0.8;
      ctx.shadowColor = 'hsl(142 86% 58%)';
      ctx.shadowBlur = 10;
      
      ctx.beginPath();
      for (let i = 0; i < optimalPath.length; i++) {
        const iso = toIsometric(optimalPath[i].x, optimalPath[i].y);
        if (i === 0) {
          ctx.moveTo(iso.x, iso.y + cellSize * 0.5);
        } else {
          ctx.lineTo(iso.x, iso.y + cellSize * 0.5);
        }
      }
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.globalAlpha = 1;
      ctx.shadowBlur = 0;
    }

    // Draw explored path
    if (path.length > 1) {
      ctx.strokeStyle = 'hsl(217 91% 60% / 0.5)';
      ctx.lineWidth = 2;
      ctx.lineCap = 'round';
      
      ctx.beginPath();
      for (let i = 0; i < path.length; i++) {
        const iso = toIsometric(path[i].x, path[i].y);
        if (i === 0) {
          ctx.moveTo(iso.x, iso.y + cellSize * 0.5);
        } else {
          ctx.lineTo(iso.x, iso.y + cellSize * 0.5);
        }
      }
      ctx.stroke();
    }

    // Draw icons
    // Obstacles (buildings)
    obstacles.forEach(obs => {
      const iso = toIsometric(obs.x, obs.y);
      ctx.fillStyle = 'hsl(217 33% 40%)';
      ctx.fillRect(iso.x - 15, iso.y - 10, 30, 40);
      ctx.fillStyle = 'hsl(217 33% 35%)';
      ctx.fillRect(iso.x - 10, iso.y, 20, 30);
      
      // Windows
      ctx.fillStyle = 'hsl(38 92% 50% / 0.6)';
      for (let i = 0; i < 2; i++) {
        for (let j = 0; j < 3; j++) {
          ctx.fillRect(iso.x - 8 + i * 8, iso.y + 5 + j * 8, 4, 4);
        }
      }
    });

    // Fuel stations
    fuelStations.forEach(fuel => {
      const iso = toIsometric(fuel.x, fuel.y);
      ctx.fillStyle = 'hsl(38 92% 50%)';
      ctx.beginPath();
      ctx.arc(iso.x, iso.y + cellSize * 0.5, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'hsl(222 47% 11%)';
      ctx.font = 'bold 16px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('⛽', iso.x, iso.y + cellSize * 0.5);
    });

    // Start marker
    const startIso = toIsometric(start.x, start.y);
    ctx.fillStyle = 'hsl(142 86% 58%)';
    ctx.beginPath();
    ctx.arc(startIso.x, startIso.y + cellSize * 0.5, 8, 0, Math.PI * 2);
    ctx.fill();

    // Goal marker
    const goalIso = toIsometric(goal.x, goal.y);
    ctx.fillStyle = 'hsl(0 84% 60%)';
    ctx.beginPath();
    ctx.moveTo(goalIso.x, goalIso.y + cellSize * 0.3);
    ctx.lineTo(goalIso.x + 10, goalIso.y + cellSize * 0.7);
    ctx.lineTo(goalIso.x - 10, goalIso.y + cellSize * 0.7);
    ctx.closePath();
    ctx.fill();

    // Agent (car)
    const agentIso = toIsometric(agentPosition.x, agentPosition.y);
    ctx.fillStyle = 'hsl(217 91% 60%)';
    ctx.strokeStyle = 'hsl(217 100% 70%)';
    ctx.lineWidth = 2;
    
    // Car body
    ctx.fillRect(agentIso.x - 10, agentIso.y + cellSize * 0.5 - 15, 20, 25);
    ctx.strokeRect(agentIso.x - 10, agentIso.y + cellSize * 0.5 - 15, 20, 25);
    
    // Windshield
    ctx.fillStyle = 'hsl(217 91% 70% / 0.6)';
    ctx.fillRect(agentIso.x - 8, agentIso.y + cellSize * 0.5 - 13, 16, 8);
    
    // Glow effect for agent
    ctx.shadowColor = 'hsl(217 100% 70%)';
    ctx.shadowBlur = 20;
    ctx.strokeStyle = 'hsl(217 100% 70% / 0.5)';
    ctx.beginPath();
    ctx.arc(agentIso.x, agentIso.y + cellSize * 0.5, 18, 0, Math.PI * 2);
    ctx.stroke();
    ctx.shadowBlur = 0;

  }, [gridSize, start, goal, fuelStations, obstacles, agentPosition, path, optimalPath, showOptimalPath]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Convert mouse position to grid coordinates (simplified)
    const gridX = Math.floor(x / cellSize);
    const gridY = Math.floor(y / cellSize);
    
    if (gridX >= 0 && gridX < gridSize && gridY >= 0 && gridY < gridSize) {
      setHoveredCell({ x: gridX, y: gridY });
    } else {
      setHoveredCell(null);
    }
  };

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        width={mapSize * 1.5}
        height={mapSize}
        className="border border-border rounded-lg shadow-2xl"
        onMouseMove={handleMouseMove}
        style={{
          background: 'linear-gradient(135deg, hsl(222 47% 11%), hsl(222 47% 7%))'
        }}
      />
      
      {hoveredCell && (
        <div className="absolute top-2 left-2 px-3 py-1 bg-background/90 rounded-md text-sm">
          Position: ({hoveredCell.x}, {hoveredCell.y})
        </div>
      )}

      {/* Legend */}
      <div className="absolute bottom-4 right-4 glass p-4 rounded-lg">
        <div className="space-y-2 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-accent" />
            <span>Start Position</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-destructive" />
            <span>Goal Position</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-warning" />
            <span>Fuel Station</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-muted" />
            <span>Obstacle</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-primary" />
            <span>Agent</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavigationMap;