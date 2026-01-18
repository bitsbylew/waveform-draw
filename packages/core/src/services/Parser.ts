import type { WaveformDocument, ValidationResult, Signal } from '../domain/types';
import { createDocument, createSignal } from '../domain/WaveformDocument';

/**
 * Parser for converting text representation to WaveformDocument
 */
export class WaveformParser {
  /**
   * Parses text input into a WaveformDocument
   */
  parse(text: string): WaveformDocument {
    const doc = createDocument();
    const lines = text.split('\n');

    let currentTitle = 'Untitled Waveform';
    let currentUnit: string | undefined;
    const markers: Array<{ position: number; label: string }> = [];

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]?.trim();
      if (!line || line.startsWith('#')) continue;

      // Parse metadata directives
      if (line.startsWith('@')) {
        const directiveMatch = line.match(/^@(\w+):\s*(.+)$/);
        if (directiveMatch) {
          const [, directive, value] = directiveMatch;

          switch (directive) {
            case 'title':
              currentTitle = value;
              break;
            case 'unit':
              currentUnit = value;
              break;
            case 'marker': {
              const markerMatch = value.match(/^(\d+)\s+"([^"]+)"$/);
              if (markerMatch) {
                const [, pos, label] = markerMatch;
                markers.push({
                  position: parseInt(pos, 10),
                  label,
                });
              }
              break;
            }
          }
        }
        continue;
      }

      // Parse signal lines
      const signalMatch = line.match(/^([A-Za-z_][\w]*)\s*:\s*([01XZ]+)(?:\s+"([^"]+)")?$/);
      if (signalMatch) {
        const [, name, states, description] = signalMatch;
        const signal = createSignal(name, states);
        if (description) {
          signal.description = description;
        }
        doc.signals.push(signal);
      }
    }

    // Update document with parsed metadata
    doc.metadata.title = currentTitle;
    if (currentUnit) {
      doc.timeConfig.unit = currentUnit;
    }
    if (markers.length > 0) {
      doc.timeConfig.markers = markers;
    }

    // Calculate total steps
    if (doc.signals.length > 0) {
      const maxLength = Math.max(
        ...doc.signals.map(s =>
          s.states.reduce((sum, state) => sum + state.duration, 0)
        )
      );
      doc.timeConfig.totalSteps = maxLength;
    }

    return doc;
  }

  /**
   * Parses a single signal line
   */
  parseSignal(line: string): Signal | null {
    const match = line.match(/^([A-Za-z_][\w]*)\s*:\s*([01XZ]+)(?:\s+"([^"]+)")?$/);
    if (!match) return null;

    const [, name, states, description] = match;
    const signal = createSignal(name, states);
    if (description) {
      signal.description = description;
    }
    return signal;
  }

  /**
   * Validates text input without creating a full document
   */
  validate(text: string): ValidationResult {
    const errors = [];
    const warnings = [];
    const lines = text.split('\n');

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]?.trim();
      const lineNumber = i + 1;

      // Skip empty lines and comments
      if (!line || line.startsWith('#')) continue;

      // Validate directives
      if (line.startsWith('@')) {
        const directiveMatch = line.match(/^@(\w+):\s*(.+)$/);
        if (!directiveMatch) {
          errors.push({
            line: lineNumber,
            message: 'Invalid directive syntax',
            code: 'INVALID_DIRECTIVE',
          });
        }
        continue;
      }

      // Validate signal lines
      const signalMatch = line.match(/^([A-Za-z_][\w]*)\s*:\s*([01XZ]+)(?:\s+"([^"]+)")?$/);
      if (!signalMatch) {
        errors.push({
          line: lineNumber,
          message: 'Invalid signal syntax. Expected format: NAME: 01010101',
          code: 'INVALID_SIGNAL',
        });
        continue;
      }

      const [, name, states] = signalMatch;

      // Check for invalid characters in states
      if (!/^[01XZ]+$/.test(states)) {
        errors.push({
          line: lineNumber,
          message: 'Signal states must only contain 0, 1, X, or Z',
          code: 'INVALID_STATE',
        });
      }

      // Warn about very long signal names
      if (name.length > 32) {
        warnings.push({
          line: lineNumber,
          message: 'Signal name is very long (>32 characters)',
          code: 'LONG_NAME',
        });
      }
    }

    // Check for signal length consistency
    const signalLengths = new Map<string, number>();
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]?.trim();
      if (!line || line.startsWith('#') || line.startsWith('@')) continue;

      const signalMatch = line.match(/^([A-Za-z_][\w]*)\s*:\s*([01XZ]+)/);
      if (signalMatch) {
        const [, name, states] = signalMatch;
        signalLengths.set(name, states.length);
      }
    }

    if (signalLengths.size > 0) {
      const lengths = Array.from(signalLengths.values());
      const minLength = Math.min(...lengths);
      const maxLength = Math.max(...lengths);

      if (minLength !== maxLength) {
        warnings.push({
          line: 0,
          message: `Signal lengths are inconsistent (${minLength} to ${maxLength} steps)`,
          code: 'INCONSISTENT_LENGTHS',
        });
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings,
    };
  }
}
