import React, { useState, useCallback, useRef } from 'react';
import styled from 'styled-components';
import Canvas from './components/Canvas';
import Wizard from './components/Wizard';
import ShapePlaceholders from './components/ShapePlaceholders';
import CSVIntegration from './components/CSVIntegration';
import ExportControls from './components/ExportControls';
import { PlotSize, HouseShape, DrawingPhase, DrawingObject, PlantSymbol } from './types';

const AppContainer = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
`;

const MainContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const CanvasContainer = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0;
`;

const ControlsContainer = styled.div`
  padding: 1rem;
  background: #f8f9fa;
  border-top: 1px solid #dee2e6;
  max-height: 200px;
  overflow-y: auto;
`;

function App() {
  const [currentPhase, setCurrentPhase] = useState<DrawingPhase>('boundary');
  const [isDrawing, setIsDrawing] = useState(false);
  const [isPanning, setIsPanning] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [objects, setObjects] = useState<DrawingObject[]>([]);
  const [plantSymbols, setPlantSymbols] = useState<PlantSymbol[]>([]);
  const [selectedPlotSize, setSelectedPlotSize] = useState<PlotSize | null>(null);
  const [selectedHouseShape, setSelectedHouseShape] = useState<HouseShape | null>(null);
  
  const canvasRef = useRef<HTMLDivElement>(null);
  const canvasWidth = 1200;
  const canvasHeight = 800;

  const handlePlotSizeSelect = useCallback((plotSize: PlotSize) => {
    setSelectedPlotSize(plotSize);
  }, []);

  const handleHouseShapeSelect = useCallback((houseShape: HouseShape) => {
    setSelectedHouseShape(houseShape);
  }, []);

  const handlePhaseChange = useCallback((phase: DrawingPhase) => {
    setCurrentPhase(phase);
  }, []);

  const handleDrawingModeChange = useCallback((drawing: boolean) => {
    setIsDrawing(drawing);
    if (drawing) {
      setIsPanning(false);
    }
  }, []);

  const handlePanModeChange = useCallback((panning: boolean) => {
    setIsPanning(panning);
    if (panning) {
      setIsDrawing(false);
    }
  }, []);

  const handleZoomChange = useCallback((newZoom: number) => {
    setZoom(newZoom);
  }, []);

  const handleObjectsChange = useCallback((newObjects: DrawingObject[]) => {
    setObjects(newObjects);
  }, []);

  const handleObjectsAdd = useCallback((newObjects: DrawingObject[]) => {
    setObjects(prev => [...prev, ...newObjects]);
  }, []);

  const handlePlantSymbolsUpdate = useCallback((symbols: PlantSymbol[]) => {
    setPlantSymbols(symbols);
  }, []);

  return (
    <AppContainer>
      <Wizard
        onPlotSizeSelect={handlePlotSizeSelect}
        onHouseShapeSelect={handleHouseShapeSelect}
        onPhaseChange={handlePhaseChange}
        onDrawingModeChange={handleDrawingModeChange}
        onPanModeChange={handlePanModeChange}
        onZoomChange={handleZoomChange}
        currentPhase={currentPhase}
        isDrawing={isDrawing}
        isPanning={isPanning}
        zoom={zoom}
      >
        <MainContent>
          <CanvasContainer>
            <div ref={canvasRef}>
              <Canvas
                width={canvasWidth}
                height={canvasHeight}
                currentPhase={currentPhase}
                isDrawing={isDrawing}
                isPanning={isPanning}
                zoom={zoom}
                onZoomChange={handleZoomChange}
                onObjectsChange={handleObjectsChange}
                plantSymbols={plantSymbols}
              />
            </div>
            
            <ShapePlaceholders
              plotSize={selectedPlotSize}
              houseShape={selectedHouseShape}
              onObjectsAdd={handleObjectsAdd}
              canvasWidth={canvasWidth}
              canvasHeight={canvasHeight}
            />
          </CanvasContainer>
          
          <ControlsContainer>
            <CSVIntegration
              onPlantSymbolsUpdate={handlePlantSymbolsUpdate}
              canvasWidth={canvasWidth}
              canvasHeight={canvasHeight}
            />
            
            <ExportControls
              canvasRef={canvasRef}
              objects={objects}
              canvasWidth={canvasWidth}
              canvasHeight={canvasHeight}
            />
          </ControlsContainer>
        </MainContent>
      </Wizard>
    </AppContainer>
  );
}

export default App;