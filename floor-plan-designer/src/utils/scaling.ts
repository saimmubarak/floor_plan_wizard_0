import { SCALING } from '../types';

/**
 * Convert feet to pixels based on AutoCAD scaling
 * @param feet - measurement in feet
 * @returns equivalent pixels
 */
export const feetToPixels = (feet: number): number => {
  return feet * SCALING.PIXELS_PER_FOOT;
};

/**
 * Convert pixels to feet based on AutoCAD scaling
 * @param pixels - measurement in pixels
 * @returns equivalent feet
 */
export const pixelsToFeet = (pixels: number): number => {
  return pixels / SCALING.PIXELS_PER_FOOT;
};

/**
 * Calculate distance between two points in feet
 * @param point1 - first point
 * @param point2 - second point
 * @returns distance in feet
 */
export const calculateDistanceInFeet = (point1: { x: number; y: number }, point2: { x: number; y: number }): number => {
  const pixelDistance = Math.sqrt(
    Math.pow(point2.x - point1.x, 2) + Math.pow(point2.y - point1.y, 2)
  );
  return pixelsToFeet(pixelDistance);
};

/**
 * Calculate the center point of a rectangle
 * @param x - x coordinate
 * @param y - y coordinate
 * @param width - width in pixels
 * @param height - height in pixels
 * @returns center point
 */
export const getRectangleCenter = (x: number, y: number, width: number, height: number) => {
  return {
    x: x + width / 2,
    y: y + height / 2,
  };
};

/**
 * Convert canvas coordinates to A2 sheet coordinates
 * A2 sheet is 420mm x 594mm (16.54" x 23.39")
 * @param canvasX - x coordinate on canvas
 * @param canvasY - y coordinate on canvas
 * @param canvasWidth - canvas width
 * @param canvasHeight - canvas height
 * @returns A2 sheet coordinates
 */
export const canvasToA2Coordinates = (
  canvasX: number,
  canvasY: number,
  canvasWidth: number,
  canvasHeight: number
) => {
  // A2 dimensions in pixels at 300 DPI
  const a2WidthPx = 16.54 * 300; // ≈ 4962 pixels
  const a2HeightPx = 23.39 * 300; // ≈ 7017 pixels
  
  // Calculate center offset
  const centerX = a2WidthPx / 2;
  const centerY = a2HeightPx / 2;
  
  // Convert canvas coordinates to A2 coordinates
  const a2X = centerX + (canvasX - canvasWidth / 2);
  const a2Y = centerY + (canvasY - canvasHeight / 2);
  
  return { x: a2X, y: a2Y };
};

/**
 * Convert A2 sheet coordinates back to canvas coordinates
 * @param a2X - x coordinate on A2 sheet
 * @param a2Y - y coordinate on A2 sheet
 * @param canvasWidth - canvas width
 * @param canvasHeight - canvas height
 * @returns canvas coordinates
 */
export const a2ToCanvasCoordinates = (
  a2X: number,
  a2Y: number,
  canvasWidth: number,
  canvasHeight: number
) => {
  // A2 dimensions in pixels at 300 DPI
  const a2WidthPx = 16.54 * 300;
  const a2HeightPx = 23.39 * 300;
  
  // Calculate center offset
  const centerX = a2WidthPx / 2;
  const centerY = a2HeightPx / 2;
  
  // Convert A2 coordinates to canvas coordinates
  const canvasX = (a2X - centerX) + canvasWidth / 2;
  const canvasY = (a2Y - centerY) + canvasHeight / 2;
  
  return { x: canvasX, y: canvasY };
};