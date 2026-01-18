/**
 * Core domain types for Waveform Draw
 * These types represent the fundamental data structures of the application
 */

/**
 * Signal state values
 * - '0': Logic low
 * - '1': Logic high
 * - 'X': Unknown/undefined state
 * - 'Z': High-impedance (tri-state)
 */
export type SignalValue = '0' | '1' | 'X' | 'Z';

/**
 * A single state in a signal with its duration
 */
export interface SignalState {
  /** The logic value of this state */
  value: SignalValue;
  /** Number of time steps this state lasts */
  duration: number;
}

/**
 * Visual styling options for a signal
 */
export interface SignalStyle {
  /** Color for the signal line (CSS color string) */
  color?: string;
  /** Height of the signal in pixels */
  height?: number;
  /** Whether to show transition markers on edges */
  showTransitions?: boolean;
  /** Line width in pixels */
  lineWidth?: number;
}

/**
 * A signal (waveform line) in the diagram
 */
export interface Signal {
  /** Unique identifier for this signal */
  id: string;
  /** Display name of the signal */
  name: string;
  /** Sequence of states that make up this signal */
  states: SignalState[];
  /** Optional visual styling */
  style?: SignalStyle;
  /** Optional description/label */
  description?: string;
}

/**
 * Time marker annotation
 */
export interface TimeMarker {
  /** Time step position (0-indexed) */
  position: number;
  /** Label text to display */
  label: string;
  /** Optional color for the marker */
  color?: string;
}

/**
 * Configuration for the time axis
 */
export interface TimeConfiguration {
  /** Total number of time steps in the diagram */
  totalSteps: number;
  /** Width of each time step in pixels (for rendering) */
  stepWidth: number;
  /** Optional time unit (ns, us, ms, etc.) */
  unit?: string;
  /** Optional time markers/annotations */
  markers?: TimeMarker[];
  /** Whether to show grid lines */
  showGrid?: boolean;
}

/**
 * Document metadata
 */
export interface DocumentMetadata {
  /** Document title */
  title: string;
  /** Optional description */
  description?: string;
  /** Author name */
  author?: string;
  /** Creation timestamp */
  created: Date;
  /** Last modified timestamp */
  modified: Date;
  /** Custom tags for organization */
  tags?: string[];
}

/**
 * Complete waveform document
 */
export interface WaveformDocument {
  /** Unique document identifier */
  id: string;
  /** Document metadata */
  metadata: DocumentMetadata;
  /** List of signals in the diagram */
  signals: Signal[];
  /** Time axis configuration */
  timeConfig: TimeConfiguration;
  /** Format version for compatibility */
  version: string;
}

/**
 * Result of parsing/validation operations
 */
export interface ValidationResult {
  /** Whether the validation passed */
  valid: boolean;
  /** List of errors found */
  errors: ValidationError[];
  /** List of warnings (non-critical issues) */
  warnings: ValidationWarning[];
}

/**
 * Validation error details
 */
export interface ValidationError {
  /** Line number where error occurred (1-indexed) */
  line: number;
  /** Column number where error occurred (1-indexed) */
  column?: number;
  /** Error message */
  message: string;
  /** Error code for programmatic handling */
  code: string;
}

/**
 * Validation warning details
 */
export interface ValidationWarning {
  /** Line number where warning occurred (1-indexed) */
  line: number;
  /** Warning message */
  message: string;
  /** Warning code */
  code: string;
}

/**
 * Point in 2D space
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * Rectangle bounds
 */
export interface Rectangle {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * Result of hit testing (clicking on the waveform)
 */
export interface HitResult {
  /** The signal that was hit, if any */
  signal?: Signal;
  /** The time step that was hit */
  timeStep?: number;
  /** The specific state index within the signal */
  stateIndex?: number;
  /** The exact position of the hit */
  position: Point;
}

/**
 * Export format options
 */
export type ExportFormat = 'svg' | 'png' | 'pdf' | 'json' | 'text';

/**
 * Export options
 */
export interface ExportOptions {
  /** Export format */
  format: ExportFormat;
  /** Width in pixels (for raster formats) */
  width?: number;
  /** Height in pixels (for raster formats) */
  height?: number;
  /** Background color */
  backgroundColor?: string;
  /** Whether to include metadata */
  includeMetadata?: boolean;
}

/**
 * Command for undo/redo system
 */
export interface Command {
  /** Execute the command */
  execute(): void;
  /** Undo the command */
  undo(): void;
  /** Human-readable description */
  description: string;
}

/**
 * Observer pattern callback
 */
export type Observer<T = WaveformDocument> = (data: T) => void;

/**
 * Unsubscribe function
 */
export type Unsubscribe = () => void;
