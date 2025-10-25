import React, { useCallback } from 'react';
import { Line, Rect } from 'react-konva';
import { Point, HouseShape, PlotSize, DrawingObject, Line as LineType, Rectangle } from '../types';
import { feetToPixels } from '../utils/scaling';
import { PHASE_COLORS } from '../types';

interface ShapePlaceholdersProps {
  plotSize: PlotSize | null;
  houseShape: HouseShape | null;
  onObjectsAdd: (objects: DrawingObject[]) => void;
  canvasWidth: number;
  canvasHeight: number;
}

const ShapePlaceholders: React.FC<ShapePlaceholdersProps> = ({
  plotSize,
  houseShape,
  onObjectsAdd,
  canvasWidth,
  canvasHeight,
}) => {
  const generateId = () => `obj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Create boundary rectangle based on plot size
  const createBoundaryRectangle = useCallback((plot: PlotSize): DrawingObject[] => {
    if (plot.name === 'Custom') return [];

    const widthPx = feetToPixels(plot.width);
    const heightPx = feetToPixels(plot.height);
    
    // Center the rectangle on canvas
    const x = (canvasWidth - widthPx) / 2;
    const y = (canvasHeight - heightPx) / 2;

    const rect: Rectangle = {
      id: generateId(),
      x,
      y,
      width: widthPx,
      height: heightPx,
      color: PHASE_COLORS.boundary,
      weight: 2.95, // 0.25mm in pixels
      phase: 'boundary',
      widthFeet: plot.width,
      heightFeet: plot.height,
    };

    return [{
      id: rect.id,
      type: 'rectangle',
      data: rect,
      selected: false,
    }];
  }, [canvasWidth, canvasHeight]);

  // Create house shape based on selected shape
  const createHouseShape = useCallback((shape: HouseShape): DrawingObject[] => {
    if (shape.name === 'Custom' || shape.points.length === 0) return [];

    // Scale the shape to a reasonable size (10ft sides)
    const scaleFactor = feetToPixels(10) / 20; // Assuming original shape is ~20 units wide
    const scaledPoints = shape.points.map(point => ({
      x: point.x * scaleFactor,
      y: point.y * scaleFactor,
    }));

    // Center the shape on canvas
    const bounds = {
      minX: Math.min(...scaledPoints.map(p => p.x)),
      maxX: Math.max(...scaledPoints.map(p => p.x)),
      minY: Math.min(...scaledPoints.map(p => p.y)),
      maxY: Math.max(...scaledPoints.map(p => p.y)),
    };

    const centerX = (bounds.minX + bounds.maxX) / 2;
    const centerY = (bounds.minY + bounds.maxY) / 2;
    const offsetX = canvasWidth / 2 - centerX;
    const offsetY = canvasHeight / 2 - centerY;

    const centeredPoints = scaledPoints.map(point => ({
      x: point.x + offsetX,
      y: point.y + offsetY,
    }));

    // Create lines connecting the points
    const lines: DrawingObject[] = [];
    for (let i = 0; i < centeredPoints.length; i++) {
      const start = centeredPoints[i];
      const end = centeredPoints[(i + 1) % centeredPoints.length];

      const line: LineType = {
        id: generateId(),
        start,
        end,
        color: shape.color,
        weight: 2.95,
        phase: 'building',
        length: Math.sqrt(
          Math.pow(end.x - start.x, 2) + Math.pow(end.y - start.y, 2)
        ) / feetToPixels(1), // Convert to feet
      };

      lines.push({
        id: line.id,
        type: 'line',
        data: line,
        selected: false,
      });
    }

    return lines;
  }, [canvasWidth, canvasHeight]);

  // Effect to create placeholders when plot size or house shape changes
  React.useEffect(() => {
    const newObjects: DrawingObject[] = [];

    if (plotSize) {
      const boundaryObjects = createBoundaryRectangle(plotSize);
      newObjects.push(...boundaryObjects);
    }

    if (houseShape) {
      const houseObjects = createHouseShape(houseShape);
      newObjects.push(...houseObjects);
    }

    if (newObjects.length > 0) {
      onObjectsAdd(newObjects);
    }
  }, [plotSize, houseShape, createBoundaryRectangle, createHouseShape, onObjectsAdd]);

  return null; // This component doesn't render anything directly
};

export default ShapePlaceholders;