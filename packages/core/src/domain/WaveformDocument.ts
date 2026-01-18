import type {
  WaveformDocument,
  DocumentMetadata,
  Signal,
  TimeConfiguration,
} from './types';
import { generateId } from '../utils/id';

/**
 * Factory and utility functions for WaveformDocument
 */

/**
 * Creates a new empty waveform document
 */
export function createDocument(
  title: string = 'Untitled Waveform'
): WaveformDocument {
  const now = new Date();

  return {
    id: generateId(),
    version: '1.0.0',
    metadata: {
      title,
      created: now,
      modified: now,
    },
    signals: [],
    timeConfig: {
      totalSteps: 8,
      stepWidth: 40,
      showGrid: true,
    },
  };
}

/**
 * Creates a new signal with default values
 */
export function createSignal(name: string, states?: string): Signal {
  const signal: Signal = {
    id: generateId(),
    name,
    states: [],
  };

  if (states) {
    // Convert string like "01010101" to SignalState array
    signal.states = parseSignalStates(states);
  }

  return signal;
}

/**
 * Parses a signal state string into SignalState array
 * Example: "00111" -> [{ value: '0', duration: 2 }, { value: '1', duration: 3 }]
 */
export function parseSignalStates(stateString: string) {
  const states = [];
  let currentValue = stateString[0] as '0' | '1' | 'X' | 'Z';
  let duration = 1;

  for (let i = 1; i < stateString.length; i++) {
    const value = stateString[i] as '0' | '1' | 'X' | 'Z';

    if (value === currentValue) {
      duration++;
    } else {
      states.push({ value: currentValue, duration });
      currentValue = value;
      duration = 1;
    }
  }

  // Push the last state
  states.push({ value: currentValue, duration });

  return states;
}

/**
 * Converts SignalState array back to string representation
 * Example: [{ value: '0', duration: 2 }, { value: '1', duration: 3 }] -> "00111"
 */
export function serializeSignalStates(states: Signal['states']): string {
  return states.map(state => state.value.repeat(state.duration)).join('');
}

/**
 * Adds a signal to the document
 */
export function addSignal(
  doc: WaveformDocument,
  signal: Signal
): WaveformDocument {
  return {
    ...doc,
    signals: [...doc.signals, signal],
    metadata: {
      ...doc.metadata,
      modified: new Date(),
    },
  };
}

/**
 * Updates a signal in the document
 */
export function updateSignal(
  doc: WaveformDocument,
  signalId: string,
  updates: Partial<Signal>
): WaveformDocument {
  return {
    ...doc,
    signals: doc.signals.map(s =>
      s.id === signalId ? { ...s, ...updates } : s
    ),
    metadata: {
      ...doc.metadata,
      modified: new Date(),
    },
  };
}

/**
 * Removes a signal from the document
 */
export function removeSignal(
  doc: WaveformDocument,
  signalId: string
): WaveformDocument {
  return {
    ...doc,
    signals: doc.signals.filter(s => s.id !== signalId),
    metadata: {
      ...doc.metadata,
      modified: new Date(),
    },
  };
}

/**
 * Updates document metadata
 */
export function updateMetadata(
  doc: WaveformDocument,
  updates: Partial<DocumentMetadata>
): WaveformDocument {
  return {
    ...doc,
    metadata: {
      ...doc.metadata,
      ...updates,
      modified: new Date(),
    },
  };
}

/**
 * Updates time configuration
 */
export function updateTimeConfig(
  doc: WaveformDocument,
  updates: Partial<TimeConfiguration>
): WaveformDocument {
  return {
    ...doc,
    timeConfig: {
      ...doc.timeConfig,
      ...updates,
    },
    metadata: {
      ...doc.metadata,
      modified: new Date(),
    },
  };
}

/**
 * Calculates the total number of time steps from signals
 */
export function calculateTotalSteps(doc: WaveformDocument): number {
  if (doc.signals.length === 0) return 0;

  return Math.max(
    ...doc.signals.map(signal =>
      signal.states.reduce((sum, state) => sum + state.duration, 0)
    )
  );
}

/**
 * Validates that all signals have the same length
 */
export function validateSignalLengths(doc: WaveformDocument): boolean {
  if (doc.signals.length === 0) return true;

  const lengths = doc.signals.map(signal =>
    signal.states.reduce((sum, state) => sum + state.duration, 0)
  );

  return lengths.every(len => len === lengths[0]);
}
