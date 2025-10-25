import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import { PlotSize, HouseShape, DrawingPhase, PLOT_SIZES, HOUSE_SHAPES, PHASE_COLORS } from '../types';
import { feetToPixels } from '../utils/scaling';

const WizardContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  background: #f5f5f5;
`;

const Header = styled.div`
  background: #2c3e50;
  color: white;
  padding: 1rem 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const StepIndicator = styled.div`
  display: flex;
  gap: 1rem;
`;

const Step = styled.div<{ active: boolean; completed: boolean }>`
  padding: 0.5rem 1rem;
  border-radius: 20px;
  background: ${props => props.active ? '#3498db' : props.completed ? '#27ae60' : '#34495e'};
  color: white;
  font-weight: ${props => props.active ? 'bold' : 'normal'};
`;

const Content = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 2rem;
`;

const StepContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const Title = styled.h2`
  color: #2c3e50;
  margin-bottom: 1rem;
  text-align: center;
`;

const Subtitle = styled.p`
  color: #7f8c8d;
  margin-bottom: 2rem;
  text-align: center;
  font-size: 1.1rem;
`;

const OptionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  max-width: 800px;
  width: 100%;
`;

const OptionCard = styled.div<{ selected: boolean }>`
  padding: 1.5rem;
  border: 2px solid ${props => props.selected ? '#3498db' : '#bdc3c7'};
  border-radius: 8px;
  background: white;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: center;
  
  &:hover {
    border-color: #3498db;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  }
  
  ${props => props.selected && `
    background: #ecf0f1;
    box-shadow: 0 4px 8px rgba(52, 152, 219, 0.3);
  `}
`;

const OptionTitle = styled.h3`
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
`;

const OptionDescription = styled.p`
  margin: 0;
  color: #7f8c8d;
  font-size: 0.9rem;
`;

const Controls = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 2rem;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 0.75rem 2rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  
  ${props => props.variant === 'primary' ? `
    background: #3498db;
    color: white;
    
    &:hover {
      background: #2980b9;
    }
    
    &:disabled {
      background: #bdc3c7;
      cursor: not-allowed;
    }
  ` : `
    background: #95a5a6;
    color: white;
    
    &:hover {
      background: #7f8c8d;
    }
  `}
`;

const CanvasControls = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  justify-content: center;
`;

const ControlButton = styled.button<{ active: boolean }>`
  padding: 0.5rem 1rem;
  border: 1px solid #bdc3c7;
  border-radius: 4px;
  background: ${props => props.active ? '#3498db' : 'white'};
  color: ${props => props.active ? 'white' : '#2c3e50'};
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.active ? '#2980b9' : '#ecf0f1'};
  }
`;

interface WizardProps {
  onPlotSizeSelect: (plotSize: PlotSize) => void;
  onHouseShapeSelect: (houseShape: HouseShape) => void;
  onPhaseChange: (phase: DrawingPhase) => void;
  onDrawingModeChange: (isDrawing: boolean) => void;
  onPanModeChange: (isPanning: boolean) => void;
  onZoomChange: (zoom: number) => void;
  currentPhase: DrawingPhase;
  isDrawing: boolean;
  isPanning: boolean;
  zoom: number;
  children: React.ReactNode;
}

const Wizard: React.FC<WizardProps> = ({
  onPlotSizeSelect,
  onHouseShapeSelect,
  onPhaseChange,
  onDrawingModeChange,
  onPanModeChange,
  onZoomChange,
  currentPhase,
  isDrawing,
  isPanning,
  zoom,
  children,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedPlotSize, setSelectedPlotSize] = useState<PlotSize | null>(null);
  const [selectedHouseShape, setSelectedHouseShape] = useState<HouseShape | null>(null);

  const steps = [
    { id: 1, title: 'Plot Size', phase: 'boundary' as DrawingPhase },
    { id: 2, title: 'House Shape', phase: 'building' as DrawingPhase },
    { id: 3, title: 'Design', phase: 'wall' as DrawingPhase },
  ];

  const handlePlotSizeSelect = useCallback((plotSize: PlotSize) => {
    setSelectedPlotSize(plotSize);
    onPlotSizeSelect(plotSize);
  }, [onPlotSizeSelect]);

  const handleHouseShapeSelect = useCallback((houseShape: HouseShape) => {
    setSelectedHouseShape(houseShape);
    onHouseShapeSelect(houseShape);
  }, [onHouseShapeSelect]);

  const handleNext = useCallback(() => {
    if (currentStep < steps.length) {
      setCurrentStep(currentStep + 1);
      onPhaseChange(steps[currentStep].phase);
    }
  }, [currentStep, steps, onPhaseChange]);

  const handlePrevious = useCallback(() => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      onPhaseChange(steps[currentStep - 2].phase);
    }
  }, [currentStep, steps, onPhaseChange]);

  const handleZoomIn = useCallback(() => {
    onZoomChange(Math.min(5, zoom * 1.2));
  }, [zoom, onZoomChange]);

  const handleZoomOut = useCallback(() => {
    onZoomChange(Math.max(0.1, zoom / 1.2));
  }, [zoom, onZoomChange]);

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <StepContent>
            <Title>Guide us on how big your house is</Title>
            <Subtitle>Choose from one of the plot sizes and adjust according to your liking</Subtitle>
            <OptionsGrid>
              {PLOT_SIZES.map((plotSize) => (
                <OptionCard
                  key={plotSize.name}
                  selected={selectedPlotSize?.name === plotSize.name}
                  onClick={() => handlePlotSizeSelect(plotSize)}
                >
                  <OptionTitle>{plotSize.name}</OptionTitle>
                  <OptionDescription>
                    {plotSize.name === 'Custom' 
                      ? 'Draw your own boundary' 
                      : `${plotSize.width}ft × ${plotSize.height}ft`
                    }
                  </OptionDescription>
                </OptionCard>
              ))}
            </OptionsGrid>
          </StepContent>
        );

      case 2:
        return (
          <StepContent>
            <Title>Tell us about the shape of your house</Title>
            <Subtitle>Select a predefined shape or draw your own</Subtitle>
            <OptionsGrid>
              {HOUSE_SHAPES.map((houseShape) => (
                <OptionCard
                  key={houseShape.name}
                  selected={selectedHouseShape?.name === houseShape.name}
                  onClick={() => handleHouseShapeSelect(houseShape)}
                >
                  <OptionTitle>{houseShape.name}</OptionTitle>
                  <OptionDescription>
                    {houseShape.name === 'Custom' 
                      ? 'Draw your own house shape' 
                      : 'Predefined house layout'
                    }
                  </OptionDescription>
                </OptionCard>
              ))}
            </OptionsGrid>
          </StepContent>
        );

      case 3:
        return (
          <StepContent>
            <Title>Design your floor plan</Title>
            <Subtitle>Add walls, pathways, and other features to complete your design</Subtitle>
            <CanvasControls>
              <ControlButton
                active={isDrawing}
                onClick={() => {
                  onDrawingModeChange(true);
                  onPanModeChange(false);
                }}
              >
                Draw Mode
              </ControlButton>
              <ControlButton
                active={isPanning}
                onClick={() => {
                  onPanModeChange(true);
                  onDrawingModeChange(false);
                }}
              >
                Pan Mode
              </ControlButton>
              <ControlButton
                active={false}
                onClick={handleZoomIn}
              >
                Zoom In
              </ControlButton>
              <ControlButton
                active={false}
                onClick={handleZoomOut}
              >
                Zoom Out
              </ControlButton>
            </CanvasControls>
            <div style={{ flex: 1, width: '100%' }}>
              {children}
            </div>
          </StepContent>
        );

      default:
        return null;
    }
  };

  return (
    <WizardContainer>
      <Header>
        <h1>Floor Plan Designer</h1>
        <StepIndicator>
          {steps.map((step) => (
            <Step
              key={step.id}
              active={currentStep === step.id}
              completed={currentStep > step.id}
            >
              {step.title}
            </Step>
          ))}
        </StepIndicator>
      </Header>
      
      <Content>
        {renderStepContent()}
        
        <Controls>
          <Button
            variant="secondary"
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            Previous
          </Button>
          <Button
            variant="primary"
            onClick={handleNext}
            disabled={
              (currentStep === 1 && !selectedPlotSize) ||
              (currentStep === 2 && !selectedHouseShape) ||
              currentStep === steps.length
            }
          >
            {currentStep === steps.length ? 'Finish' : 'Next'}
          </Button>
        </Controls>
      </Content>
    </WizardContainer>
  );
};

export default Wizard;