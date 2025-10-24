// Types for the floor plan designer application

export interface Point {
  x: number;
  y: number;
}

export interface Line {
  id: string;
  start: Point;
  end: Point;
  color: string;
  weight: number;
  phase: DrawingPhase;
  length?: number; // in feet
}

export interface Rectangle {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  color: string;
  weight: number;
  phase: DrawingPhase;
  widthFeet?: number;
  heightFeet?: number;
}

export interface PlantSymbol {
  id: string;
  x: number;
  y: number;
  category: string;
  confidence: number;
  radius: number;
}

export type DrawingPhase = 'boundary' | 'building' | 'wall' | 'pathway' | 'driveway';

export interface DrawingObject {
  id: string;
  type: 'line' | 'rectangle' | 'plant';
  data: Line | Rectangle | PlantSymbol;
  selected: boolean;
}

export interface PlotSize {
  name: string;
  width: number; // in feet
  height: number; // in feet
}

export interface HouseShape {
  name: string;
  points: Point[];
  color: string;
}

// Scaling constants based on AutoCAD settings
export const SCALING = {
  // AutoCAD settings: 3.1:1 scale, 300 DPI
  PLOT_SCALE: 3.1,
  DPI: 300,
  // 1 foot = 0.3226 inches on paper
  INCHES_PER_FOOT: 0.3226,
  // Calculate pixels per foot: (DPI / plot_scale) * inches_per_foot
  PIXELS_PER_FOOT: (300 / 3.1) * 0.3226, // ≈ 31.2 pixels per foot
  // Line weight in pixels (0.25mm = 0.0098 inches)
  LINE_WEIGHT_PX: (0.25 / 25.4) * 300, // ≈ 2.95 pixels
} as const;

// Predefined plot sizes
export const PLOT_SIZES: PlotSize[] = [
  { name: '1 Kanal', width: 50, height: 90 },
  { name: '10 Marla', width: 35, height: 65 },
  { name: '5 Marla', width: 25, height: 45 },
  { name: 'Custom', width: 0, height: 0 },
];

// Predefined house shapes
export const HOUSE_SHAPES: HouseShape[] = [
  {
    name: 'L Shaped House',
    points: [
      { x: 0, y: 0 },
      { x: 20, y: 0 },
      { x: 20, y: 15 },
      { x: 10, y: 15 },
      { x: 10, y: 30 },
      { x: 0, y: 30 },
    ],
    color: '#B22222', // brick red
  },
  {
    name: 'Mirror L Shaped House',
    points: [
      { x: 0, y: 0 },
      { x: 10, y: 0 },
      { x: 10, y: 15 },
      { x: 20, y: 15 },
      { x: 20, y: 30 },
      { x: 0, y: 30 },
    ],
    color: '#B22222',
  },
  {
    name: 'Rectangular House',
    points: [
      { x: 0, y: 0 },
      { x: 20, y: 0 },
      { x: 20, y: 30 },
      { x: 0, y: 30 },
    ],
    color: '#B22222',
  },
  {
    name: 'U Shaped House',
    points: [
      { x: 0, y: 0 },
      { x: 20, y: 0 },
      { x: 20, y: 10 },
      { x: 15, y: 10 },
      { x: 15, y: 20 },
      { x: 20, y: 20 },
      { x: 20, y: 30 },
      { x: 0, y: 30 },
    ],
    color: '#B22222',
  },
  {
    name: 'Custom',
    points: [],
    color: '#B22222',
  },
];

export const PHASE_COLORS = {
  boundary: '#0000FF', // dark blue
  building: '#B22222', // brick red
  wall: '#000080', // dark blue
  pathway: '#808080', // grey
  driveway: '#808080', // grey
} as const;