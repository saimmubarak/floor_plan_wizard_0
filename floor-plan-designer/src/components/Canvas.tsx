import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Stage, Layer, Line, Rect, Circle, Text } from 'react-konva';
import Konva from 'konva';
import { Point, Line as LineType, Rectangle, DrawingObject, DrawingPhase, PlantSymbol } from '../types';
import { feetToPixels, pixelsToFeet, calculateDistanceInFeet } from '../utils/scaling';
import { PHASE_COLORS } from '../types';

interface CanvasProps {
  width: number;
  height: number;
  currentPhase: DrawingPhase;
  isDrawing: boolean;
  isPanning: boolean;
  zoom: number;
  onZoomChange: (zoom: number) => void;
  onObjectsChange: (objects: DrawingObject[]) => void;
  plantSymbols: PlantSymbol[];
}

const Canvas: React.FC<CanvasProps> = ({
  width,
  height,
  currentPhase,
  isDrawing,
  isPanning,
  zoom,
  onZoomChange,
  onObjectsChange,
  plantSymbols,
}) => {
  const stageRef = useRef<Konva.Stage>(null);
  const [objects, setObjects] = useState<DrawingObject[]>([]);
  const [isDrawingLine, setIsDrawingLine] = useState(false);
  const [currentLine, setCurrentLine] = useState<Point[]>([]);
  const [isDrawingRect, setIsDrawingRect] = useState(false);
  const [currentRect, setCurrentRect] = useState<{ start: Point; end: Point } | null>(null);
  const [selectedObject, setSelectedObject] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState<Point | null>(null);

  // Generate unique ID
  const generateId = () => `obj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Handle mouse down
  const handleMouseDown = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    if (isPanning) return;

    const pos = e.target.getStage()?.getPointerPosition();
    if (!pos) return;

    if (isDrawing) {
      if (e.target === e.target.getStage()) {
        // Started drawing on empty space
        if (currentPhase === 'boundary' || currentPhase === 'wall') {
          // Start drawing a line
          setIsDrawingLine(true);
          setCurrentLine([pos]);
        } else if (currentPhase === 'building') {
          // Start drawing a rectangle
          setIsDrawingRect(true);
          setCurrentRect({ start: pos, end: pos });
        }
      }
    } else {
      // Selection mode
      const clickedObject = e.target;
      if (clickedObject instanceof Konva.Line || clickedObject instanceof Konva.Rect) {
        setSelectedObject(clickedObject.id());
        setDragStart(pos);
      } else {
        setSelectedObject(null);
      }
    }
  }, [isDrawing, isPanning, currentPhase]);

  // Handle mouse move
  const handleMouseMove = useCallback((e: Konva.KonvaEventObject<MouseEvent>) => {
    if (isPanning) return;

    const pos = e.target.getStage()?.getPointerPosition();
    if (!pos) return;

    if (isDrawingLine && currentLine.length > 0) {
      setCurrentLine([...currentLine, pos]);
    } else if (isDrawingRect && currentRect) {
      setCurrentRect({ ...currentRect, end: pos });
    } else if (selectedObject && dragStart) {
      // Handle object dragging
      const deltaX = pos.x - dragStart.x;
      const deltaY = pos.y - dragStart.y;
      
      setObjects(prev => prev.map(obj => {
        if (obj.id === selectedObject) {
          if (obj.type === 'line') {
            const line = obj.data as LineType;
            return {
              ...obj,
              data: {
                ...line,
                start: { x: line.start.x + deltaX, y: line.start.y + deltaY },
                end: { x: line.end.x + deltaX, y: line.end.y + deltaY },
              }
            };
          } else if (obj.type === 'rectangle') {
            const rect = obj.data as Rectangle;
            return {
              ...obj,
              data: {
                ...rect,
                x: rect.x + deltaX,
                y: rect.y + deltaY,
              }
            };
          }
        }
        return obj;
      }));
      
      setDragStart(pos);
    }
  }, [isDrawingLine, currentLine, isDrawingRect, currentRect, selectedObject, dragStart, isPanning]);

  // Handle mouse up
  const handleMouseUp = useCallback(() => {
    if (isPanning) return;

    if (isDrawingLine && currentLine.length >= 2) {
      // Complete line drawing
      const line: LineType = {
        id: generateId(),
        start: currentLine[0],
        end: currentLine[currentLine.length - 1],
        color: PHASE_COLORS[currentPhase],
        weight: 2.95, // 0.25mm in pixels
        phase: currentPhase,
        length: calculateDistanceInFeet(currentLine[0], currentLine[currentLine.length - 1]),
      };

      setObjects(prev => [...prev, { id: line.id, type: 'line', data: line, selected: false }]);
      setIsDrawingLine(false);
      setCurrentLine([]);
    } else if (isDrawingRect && currentRect) {
      // Complete rectangle drawing
      const width = Math.abs(currentRect.end.x - currentRect.start.x);
      const height = Math.abs(currentRect.end.y - currentRect.start.y);
      const x = Math.min(currentRect.start.x, currentRect.end.x);
      const y = Math.min(currentRect.start.y, currentRect.end.y);

      if (width > 5 && height > 5) { // Minimum size check
        const rect: Rectangle = {
          id: generateId(),
          x,
          y,
          width,
          height,
          color: PHASE_COLORS[currentPhase],
          weight: 2.95,
          phase: currentPhase,
          widthFeet: pixelsToFeet(width),
          heightFeet: pixelsToFeet(height),
        };

        setObjects(prev => [...prev, { id: rect.id, type: 'rectangle', data: rect, selected: false }]);
      }

      setIsDrawingRect(false);
      setCurrentRect(null);
    }

    setDragStart(null);
  }, [isDrawingLine, currentLine, isDrawingRect, currentRect, currentPhase, isPanning]);

  // Handle wheel zoom
  const handleWheel = useCallback((e: Konva.KonvaEventObject<WheelEvent>) => {
    e.evt.preventDefault();
    
    const scaleBy = 1.1;
    const stage = e.target.getStage();
    if (!stage) return;

    const oldScale = stage.scaleX();
    const pointer = stage.getPointerPosition();
    if (!pointer) return;

    const mousePointTo = {
      x: (pointer.x - stage.x()) / oldScale,
      y: (pointer.y - stage.y()) / oldScale,
    };

    const newScale = e.evt.deltaY > 0 ? oldScale * scaleBy : oldScale / scaleBy;
    const clampedScale = Math.max(0.1, Math.min(5, newScale));

    stage.scale({ x: clampedScale, y: clampedScale });

    const newPos = {
      x: pointer.x - mousePointTo.x * clampedScale,
      y: pointer.y - mousePointTo.y * clampedScale,
    };

    stage.position(newPos);
    stage.batchDraw();

    onZoomChange(clampedScale);
  }, [onZoomChange]);

  // Update objects when plant symbols change
  useEffect(() => {
    const plantObjects: DrawingObject[] = plantSymbols.map(symbol => ({
      id: symbol.id,
      type: 'plant',
      data: symbol,
      selected: false,
    }));

    setObjects(prev => {
      const nonPlantObjects = prev.filter(obj => obj.type !== 'plant');
      return [...nonPlantObjects, ...plantObjects];
    });
  }, [plantSymbols]);

  // Notify parent of objects change
  useEffect(() => {
    onObjectsChange(objects);
  }, [objects, onObjectsChange]);

  // Render line with measurement label
  const renderLine = (line: LineType, isSelected: boolean) => {
    const midPoint = {
      x: (line.start.x + line.end.x) / 2,
      y: (line.start.y + line.end.y) / 2,
    };

    return (
      <React.Fragment key={line.id}>
        <Line
          id={line.id}
          points={[line.start.x, line.start.y, line.end.x, line.end.y]}
          stroke={line.color}
          strokeWidth={line.weight}
          lineCap="round"
          lineJoin="round"
          draggable={isSelected}
        />
        {line.length && (
          <Text
            x={midPoint.x}
            y={midPoint.y - 10}
            text={`${line.length.toFixed(1)}ft`}
            fontSize={12}
            fill="#000"
            offsetX={20}
            offsetY={5}
          />
        )}
      </React.Fragment>
    );
  };

  // Render rectangle with measurement labels
  const renderRectangle = (rect: Rectangle, isSelected: boolean) => {
    return (
      <React.Fragment key={rect.id}>
        <Rect
          id={rect.id}
          x={rect.x}
          y={rect.y}
          width={rect.width}
          height={rect.height}
          stroke={rect.color}
          strokeWidth={rect.weight}
          fill="transparent"
          draggable={isSelected}
        />
        {rect.widthFeet && (
          <Text
            x={rect.x + rect.width / 2}
            y={rect.y - 15}
            text={`${rect.widthFeet.toFixed(1)}ft`}
            fontSize={12}
            fill="#000"
            offsetX={20}
            offsetY={5}
          />
        )}
        {rect.heightFeet && (
          <Text
            x={rect.x - 15}
            y={rect.y + rect.height / 2}
            text={`${rect.heightFeet.toFixed(1)}ft`}
            fontSize={12}
            fill="#000"
            offsetX={20}
            offsetY={5}
            rotation={-90}
          />
        )}
      </React.Fragment>
    );
  };

  // Render plant symbol
  const renderPlantSymbol = (symbol: PlantSymbol) => {
    return (
      <Circle
        key={symbol.id}
        id={symbol.id}
        x={symbol.x}
        y={symbol.y}
        radius={symbol.radius}
        fill={`rgba(0, 255, 0, 0.3)`}
        stroke="#00FF00"
        strokeWidth={1}
      />
    );
  };

  return (
    <div style={{ border: '1px solid #ccc', borderRadius: '4px', overflow: 'hidden' }}>
      <Stage
        ref={stageRef}
        width={width}
        height={height}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onWheel={handleWheel}
        scaleX={zoom}
        scaleY={zoom}
      >
        <Layer>
          {/* Render existing objects */}
          {objects.map(obj => {
            if (obj.type === 'line') {
              return renderLine(obj.data as LineType, obj.id === selectedObject);
            } else if (obj.type === 'rectangle') {
              return renderRectangle(obj.data as Rectangle, obj.id === selectedObject);
            } else if (obj.type === 'plant') {
              return renderPlantSymbol(obj.data as PlantSymbol);
            }
            return null;
          })}

          {/* Render current drawing */}
          {isDrawingLine && currentLine.length > 1 && (
            <Line
              points={currentLine.flatMap(p => [p.x, p.y])}
              stroke={PHASE_COLORS[currentPhase]}
              strokeWidth={2.95}
              lineCap="round"
              lineJoin="round"
              dash={[5, 5]}
            />
          )}

          {isDrawingRect && currentRect && (
            <Rect
              x={Math.min(currentRect.start.x, currentRect.end.x)}
              y={Math.min(currentRect.start.y, currentRect.end.y)}
              width={Math.abs(currentRect.end.x - currentRect.start.x)}
              height={Math.abs(currentRect.end.y - currentRect.start.y)}
              stroke={PHASE_COLORS[currentPhase]}
              strokeWidth={2.95}
              fill="transparent"
              dash={[5, 5]}
            />
          )}
        </Layer>
      </Stage>
    </div>
  );
};

export default Canvas;