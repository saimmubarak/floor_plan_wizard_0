import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import { PlantSymbol } from '../types';
import { a2ToCanvasCoordinates } from '../utils/scaling';

const Container = styled.div`
  padding: 1rem;
  border: 1px solid #bdc3c7;
  border-radius: 4px;
  margin: 1rem 0;
  background: #f8f9fa;
`;

const Title = styled.h3`
  margin: 0 0 1rem 0;
  color: #2c3e50;
`;

const FileInput = styled.input`
  margin-bottom: 1rem;
  padding: 0.5rem;
  border: 1px solid #bdc3c7;
  border-radius: 4px;
  width: 100%;
`;

const Button = styled.button`
  padding: 0.5rem 1rem;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 0.5rem;
  
  &:hover {
    background: #2980b9;
  }
  
  &:disabled {
    background: #bdc3c7;
    cursor: not-allowed;
  }
`;

const Preview = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  background: white;
  border-radius: 4px;
  border: 1px solid #bdc3c7;
`;

const PreviewTitle = styled.h4`
  margin: 0 0 0.5rem 0;
  color: #2c3e50;
`;

const SymbolList = styled.div`
  max-height: 200px;
  overflow-y: auto;
`;

const SymbolItem = styled.div`
  padding: 0.25rem 0;
  border-bottom: 1px solid #ecf0f1;
  font-size: 0.9rem;
  color: #7f8c8d;
`;

interface CSVIntegrationProps {
  onPlantSymbolsUpdate: (symbols: PlantSymbol[]) => void;
  canvasWidth: number;
  canvasHeight: number;
}

interface CSVSymbol {
  x: number;
  y: number;
  category: string;
  confidence: number;
  width?: number;
  height?: number;
}

const CSVIntegration: React.FC<CSVIntegrationProps> = ({
  onPlantSymbolsUpdate,
  canvasWidth,
  canvasHeight,
}) => {
  const [csvData, setCsvData] = useState<CSVSymbol[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Parse CSV content
  const parseCSV = useCallback((csvContent: string): CSVSymbol[] => {
    const lines = csvContent.trim().split('\n');
    const symbols: CSVSymbol[] = [];

    // Skip header row if it exists
    const dataLines = lines.slice(1);

    for (const line of dataLines) {
      const columns = line.split(',').map(col => col.trim());
      
      if (columns.length >= 4) {
        const x = parseFloat(columns[0]);
        const y = parseFloat(columns[1]);
        const category = columns[2];
        const confidence = parseFloat(columns[3]);
        const width = columns[4] ? parseFloat(columns[4]) : undefined;
        const height = columns[5] ? parseFloat(columns[5]) : undefined;

        if (!isNaN(x) && !isNaN(y) && !isNaN(confidence)) {
          symbols.push({
            x,
            y,
            category,
            confidence,
            width,
            height,
          });
        }
      }
    }

    return symbols;
  }, []);

  // Convert CSV coordinates to canvas coordinates
  const convertToCanvasCoordinates = useCallback((csvSymbols: CSVSymbol[]): PlantSymbol[] => {
    return csvSymbols.map((symbol, index) => {
      // Convert A2 coordinates to canvas coordinates
      const canvasCoords = a2ToCanvasCoordinates(
        symbol.x,
        symbol.y,
        canvasWidth,
        canvasHeight
      );

      // Calculate radius based on confidence or use default
      const radius = Math.max(5, Math.min(20, symbol.confidence * 20));

      return {
        id: `plant_${index}`,
        x: canvasCoords.x,
        y: canvasCoords.y,
        category: symbol.category,
        confidence: symbol.confidence,
        radius,
      };
    });
  }, [canvasWidth, canvasHeight]);

  // Handle file upload
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessing(true);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        try {
          const parsedData = parseCSV(content);
          setCsvData(parsedData);
          setIsProcessing(false);
        } catch (error) {
          console.error('Error parsing CSV:', error);
          setIsProcessing(false);
        }
      }
    };
    
    reader.readAsText(file);
  }, [parseCSV]);

  // Apply plant symbols to canvas
  const handleApplySymbols = useCallback(() => {
    if (csvData.length === 0) return;

    const plantSymbols = convertToCanvasCoordinates(csvData);
    onPlantSymbolsUpdate(plantSymbols);
  }, [csvData, convertToCanvasCoordinates, onPlantSymbolsUpdate]);

  // Clear all plant symbols
  const handleClearSymbols = useCallback(() => {
    onPlantSymbolsUpdate([]);
    setCsvData([]);
  }, [onPlantSymbolsUpdate]);

  // Load sample CSV data for testing
  const handleLoadSample = useCallback(() => {
    const sampleCSV = `x,y,category,confidence,width,height
100,200,Tree,0.95,10,10
300,150,Shrub,0.87,5,5
500,300,Flower,0.92,3,3
200,400,Tree,0.89,12,12
400,500,Shrub,0.78,6,6`;

    const parsedData = parseCSV(sampleCSV);
    setCsvData(parsedData);
  }, [parseCSV]);

  return (
    <Container>
      <Title>YOLO Plant Symbol Integration</Title>
      
      <div>
        <FileInput
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          disabled={isProcessing}
        />
        
        <Button
          onClick={handleLoadSample}
          disabled={isProcessing}
        >
          Load Sample Data
        </Button>
        
        <Button
          onClick={handleApplySymbols}
          disabled={csvData.length === 0 || isProcessing}
        >
          Apply Symbols
        </Button>
        
        <Button
          onClick={handleClearSymbols}
          disabled={isProcessing}
        >
          Clear All
        </Button>
      </div>

      {csvData.length > 0 && (
        <Preview>
          <PreviewTitle>
            Loaded {csvData.length} plant symbols
          </PreviewTitle>
          <SymbolList>
            {csvData.slice(0, 10).map((symbol, index) => (
              <SymbolItem key={index}>
                {symbol.category} at ({symbol.x}, {symbol.y}) - {Math.round(symbol.confidence * 100)}% confidence
              </SymbolItem>
            ))}
            {csvData.length > 10 && (
              <SymbolItem>... and {csvData.length - 10} more</SymbolItem>
            )}
          </SymbolList>
        </Preview>
      )}

      {isProcessing && (
        <div style={{ color: '#7f8c8d', fontStyle: 'italic' }}>
          Processing CSV data...
        </div>
      )}
    </Container>
  );
};

export default CSVIntegration;