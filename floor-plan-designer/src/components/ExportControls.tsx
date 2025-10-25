import React, { useCallback, useRef, useState } from 'react';
import styled from 'styled-components';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { DrawingObject } from '../types';
import { canvasToA2Coordinates } from '../utils/scaling';

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

const ButtonGroup = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  
  ${props => props.variant === 'primary' ? `
    background: #27ae60;
    color: white;
    
    &:hover {
      background: #229954;
    }
  ` : `
    background: #3498db;
    color: white;
    
    &:hover {
      background: #2980b9;
    }
  `}
  
  &:disabled {
    background: #bdc3c7;
    cursor: not-allowed;
  }
`;

const Status = styled.div<{ type: 'success' | 'error' | 'info' }>`
  margin-top: 1rem;
  padding: 0.5rem;
  border-radius: 4px;
  font-size: 0.9rem;
  
  ${props => {
    switch (props.type) {
      case 'success':
        return 'background: #d4edda; color: #155724; border: 1px solid #c3e6cb;';
      case 'error':
        return 'background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb;';
      case 'info':
        return 'background: #d1ecf1; color: #0c5460; border: 1px solid #bee5eb;';
      default:
        return '';
    }
  }}
`;

interface ExportControlsProps {
  canvasRef: React.RefObject<HTMLDivElement>;
  objects: DrawingObject[];
  canvasWidth: number;
  canvasHeight: number;
}

const ExportControls: React.FC<ExportControlsProps> = ({
  canvasRef,
  objects,
  canvasWidth,
  canvasHeight,
}) => {
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  // Show status message
  const showStatus = useCallback((type: 'success' | 'error' | 'info', message: string) => {
    setStatus({ type, message });
    setTimeout(() => setStatus(null), 3000);
  }, []);

  // Export as PNG
  const handleExportPNG = useCallback(async () => {
    if (!canvasRef.current) {
      showStatus('error', 'Canvas not found');
      return;
    }

    try {
      showStatus('info', 'Generating PNG...');
      
      const canvas = await html2canvas(canvasRef.current, {
        scale: 2, // Higher resolution
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
      });

      // Create download link
      const link = document.createElement('a');
      link.download = `floor-plan-${new Date().toISOString().split('T')[0]}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();

      showStatus('success', 'PNG exported successfully');
    } catch (error) {
      console.error('Error exporting PNG:', error);
      showStatus('error', 'Failed to export PNG');
    }
  }, [canvasRef, showStatus]);

  // Export as PDF
  const handleExportPDF = useCallback(async () => {
    if (!canvasRef.current) {
      showStatus('error', 'Canvas not found');
      return;
    }

    try {
      showStatus('info', 'Generating PDF...');
      
      const canvas = await html2canvas(canvasRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
      });

      // Create PDF with A2 dimensions (420mm x 594mm)
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a2',
      });

      // Calculate dimensions to fit A2
      const imgWidth = 420; // A2 width in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Center the image on A2
      const x = 0;
      const y = (594 - imgHeight) / 2; // A2 height is 594mm

      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', x, y, imgWidth, imgHeight);
      
      // Add title
      pdf.setFontSize(16);
      pdf.text('Floor Plan Design', 20, 20);
      
      // Add timestamp
      pdf.setFontSize(10);
      pdf.text(`Generated: ${new Date().toLocaleString()}`, 20, 30);

      pdf.save(`floor-plan-${new Date().toISOString().split('T')[0]}.pdf`);
      showStatus('success', 'PDF exported successfully');
    } catch (error) {
      console.error('Error exporting PDF:', error);
      showStatus('error', 'Failed to export PDF');
    }
  }, [canvasRef, showStatus]);

  // Export objects data as JSON
  const handleExportData = useCallback(() => {
    try {
      // Convert objects to A2 coordinates for AI processing
      const a2Objects = objects.map(obj => {
        if (obj.type === 'line') {
          const line = obj.data as any;
          const startA2 = canvasToA2Coordinates(line.start.x, line.start.y, canvasWidth, canvasHeight);
          const endA2 = canvasToA2Coordinates(line.end.x, line.end.y, canvasWidth, canvasHeight);
          
          return {
            type: 'line',
            start: startA2,
            end: endA2,
            color: line.color,
            phase: line.phase,
            length: line.length,
          };
        } else if (obj.type === 'rectangle') {
          const rect = obj.data as any;
          const topLeftA2 = canvasToA2Coordinates(rect.x, rect.y, canvasWidth, canvasHeight);
          const bottomRightA2 = canvasToA2Coordinates(
            rect.x + rect.width, 
            rect.y + rect.height, 
            canvasWidth, 
            canvasHeight
          );
          
          return {
            type: 'rectangle',
            x: topLeftA2.x,
            y: topLeftA2.y,
            width: bottomRightA2.x - topLeftA2.x,
            height: bottomRightA2.y - topLeftA2.y,
            color: rect.color,
            phase: rect.phase,
            widthFeet: rect.widthFeet,
            heightFeet: rect.heightFeet,
          };
        } else if (obj.type === 'plant') {
          const plant = obj.data as any;
          const a2Coords = canvasToA2Coordinates(plant.x, plant.y, canvasWidth, canvasHeight);
          
          return {
            type: 'plant',
            x: a2Coords.x,
            y: a2Coords.y,
            category: plant.category,
            confidence: plant.confidence,
            radius: plant.radius,
          };
        }
        return obj;
      });

      const dataStr = JSON.stringify(a2Objects, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const link = document.createElement('a');
      link.href = URL.createObjectURL(dataBlob);
      link.download = `floor-plan-data-${new Date().toISOString().split('T')[0]}.json`;
      link.click();

      showStatus('success', 'Data exported successfully');
    } catch (error) {
      console.error('Error exporting data:', error);
      showStatus('error', 'Failed to export data');
    }
  }, [objects, canvasWidth, canvasHeight, showStatus]);

  // Generate CSV for YOLO processing
  const handleExportCSV = useCallback(() => {
    try {
      // Filter only plant symbols for CSV
      const plantSymbols = objects
        .filter(obj => obj.type === 'plant')
        .map(obj => {
          const plant = obj.data as any;
          const a2Coords = canvasToA2Coordinates(plant.x, plant.y, canvasWidth, canvasHeight);
          
          return {
            x: Math.round(a2Coords.x),
            y: Math.round(a2Coords.y),
            category: plant.category,
            confidence: plant.confidence,
            width: Math.round(plant.radius * 2),
            height: Math.round(plant.radius * 2),
          };
        });

      if (plantSymbols.length === 0) {
        showStatus('info', 'No plant symbols to export');
        return;
      }

      // Create CSV content
      const csvHeader = 'x,y,category,confidence,width,height\n';
      const csvRows = plantSymbols.map(symbol => 
        `${symbol.x},${symbol.y},${symbol.category},${symbol.confidence},${symbol.width},${symbol.height}`
      ).join('\n');
      
      const csvContent = csvHeader + csvRows;
      
      const dataBlob = new Blob([csvContent], { type: 'text/csv' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(dataBlob);
      link.download = `plant-symbols-${new Date().toISOString().split('T')[0]}.csv`;
      link.click();

      showStatus('success', `CSV exported with ${plantSymbols.length} plant symbols`);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      showStatus('error', 'Failed to export CSV');
    }
  }, [objects, canvasWidth, canvasHeight, showStatus]);

  return (
    <Container>
      <Title>Export Floor Plan</Title>
      
      <ButtonGroup>
        <Button onClick={handleExportPNG}>
          Export PNG
        </Button>
        
        <Button onClick={handleExportPDF}>
          Export PDF
        </Button>
        
        <Button variant="secondary" onClick={handleExportData}>
          Export Data (JSON)
        </Button>
        
        <Button variant="secondary" onClick={handleExportCSV}>
          Export Plant Symbols (CSV)
        </Button>
      </ButtonGroup>

      {status && (
        <Status type={status.type}>
          {status.message}
        </Status>
      )}
    </Container>
  );
};

export default ExportControls;