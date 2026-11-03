import React from 'react';

interface VisualizationCanvasProps { children: React.ReactNode }

export function VisualizationCanvas({ children }: VisualizationCanvasProps) {
  return <div className="visualization-canvas" data-testid="visualization-canvas">{children}</div>;
}
