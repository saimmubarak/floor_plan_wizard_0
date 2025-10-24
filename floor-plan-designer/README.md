# Floor Plan Designer

A React-based web application for creating floor plans with AI-powered plant symbol placement. This application mimics AutoCAD functionality for drawing floor plans and integrates with YOLO models for automatic plant symbol detection and placement.

## Features

### 🏗️ Drawing Capabilities
- **Interactive Canvas**: Draw lines and rectangles with mouse interaction
- **Multiple Drawing Phases**: Boundary, building, wall, pathway, and driveway phases with different colors
- **Real-time Measurements**: Automatic calculation and display of dimensions in feet
- **Zoom and Pan**: Full zoom and pan functionality for detailed work
- **Object Selection**: Click to select and drag objects around the canvas

### 📐 Precise Scaling
- **AutoCAD-Compatible Scaling**: Based on 3.1:1 plot scale and 300 DPI
- **Accurate Measurements**: 1 foot = ~31.2 pixels on screen
- **A2 Sheet Format**: Floor plans are designed for A2 sheet export
- **Consistent Coordinates**: Maintains coordinate consistency between canvas and AI processing

### 🏠 Predefined Shapes
- **Plot Sizes**: 1 Kanal (50×90ft), 10 Marla (35×65ft), 5 Marla (25×45ft), Custom
- **House Shapes**: L-shaped, Mirror L-shaped, Rectangular, U-shaped, Custom
- **Smart Placeholders**: Predefined shapes that can be resized and repositioned

### 🤖 AI Integration
- **YOLO CSV Import**: Import plant symbol data from YOLO model predictions
- **Translucent Overlays**: Plant symbols appear as translucent circles on the floor plan
- **Coordinate Mapping**: Accurate placement based on A2 sheet coordinates
- **Category Support**: Different plant categories with confidence scores

### 📤 Export Options
- **PNG Export**: High-resolution PNG images for AI processing
- **PDF Export**: Professional PDF blueprints in A2 format
- **JSON Export**: Complete floor plan data for further processing
- **CSV Export**: Plant symbol data for YOLO model training

## Technical Specifications

### Scaling System
```
AutoCAD Settings:
- Plot Scale: 3.1:1
- DPI: 300
- Units: Decimal feet
- 1 foot = 0.3226 inches on paper
- 1 foot = ~31.2 pixels on screen
```

### Drawing Phases
- **Boundary**: Dark blue (#0000FF) - Property boundaries
- **Building**: Brick red (#B22222) - House structures
- **Wall**: Dark blue (#000080) - Interior walls
- **Pathway**: Grey (#808080) - Walkways
- **Driveway**: Grey (#808080) - Vehicle access

### File Formats
- **Input**: CSV files with YOLO detection data
- **Output**: PNG, PDF, JSON, CSV formats
- **Coordinates**: A2 sheet coordinate system (420mm × 594mm)

## Getting Started

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd floor-plan-designer

# Install dependencies
npm install

# Start development server
npm start
```

### Usage

1. **Step 1 - Plot Size**: Select your property size or choose custom
2. **Step 2 - House Shape**: Choose a predefined house shape or draw custom
3. **Step 3 - Design**: Add walls, pathways, and other features
4. **AI Integration**: Import YOLO CSV data to place plant symbols
5. **Export**: Generate PNG/PDF for AI processing or final blueprints

### CSV Format for YOLO Integration
```csv
x,y,category,confidence,width,height
100,200,Tree,0.95,10,10
300,150,Shrub,0.87,5,5
500,300,Flower,0.92,3,3
```

## Architecture

### Components
- **Canvas**: Main drawing surface with Konva.js
- **Wizard**: Step-by-step interface for floor plan creation
- **ShapePlaceholders**: Predefined shape generation
- **CSVIntegration**: YOLO data import and processing
- **ExportControls**: File export functionality

### Key Technologies
- **React 18**: UI framework
- **TypeScript**: Type safety
- **Konva.js**: 2D canvas rendering
- **Styled Components**: CSS-in-JS styling
- **html2canvas**: Canvas to image conversion
- **jsPDF**: PDF generation

## Development

### Project Structure
```
src/
├── components/          # React components
│   ├── Canvas.tsx      # Main drawing canvas
│   ├── Wizard.tsx      # Step-by-step interface
│   ├── ShapePlaceholders.tsx
│   ├── CSVIntegration.tsx
│   └── ExportControls.tsx
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
│   └── scaling.ts      # Coordinate conversion
└── App.tsx             # Main application
```

### Building for Production
```bash
npm run build
```

The build artifacts will be stored in the `build/` directory.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For questions or issues, please open an issue on the GitHub repository.