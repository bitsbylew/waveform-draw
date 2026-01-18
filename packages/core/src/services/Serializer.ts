import type { WaveformDocument, Signal } from '../domain/types';
import { serializeSignalStates } from '../domain/WaveformDocument';

/**
 * Serializer for converting WaveformDocument to text representation
 */
export class WaveformSerializer {
  /**
   * Serializes a WaveformDocument to text format
   */
  serialize(doc: WaveformDocument): string {
    const lines: string[] = [];

    // Add metadata
    if (doc.metadata.title && doc.metadata.title !== 'Untitled Waveform') {
      lines.push(`@title: ${doc.metadata.title}`);
    }

    if (doc.metadata.description) {
      lines.push(`@description: ${doc.metadata.description}`);
    }

    if (doc.timeConfig.unit) {
      lines.push(`@unit: ${doc.timeConfig.unit}`);
    }

    // Add time markers
    if (doc.timeConfig.markers && doc.timeConfig.markers.length > 0) {
      doc.timeConfig.markers.forEach(marker => {
        lines.push(`@marker: ${marker.position} "${marker.label}"`);
      });
    }

    // Add blank line after metadata if present
    if (lines.length > 0) {
      lines.push('');
    }

    // Add signals
    doc.signals.forEach(signal => {
      lines.push(this.serializeSignal(signal));
    });

    return lines.join('\n');
  }

  /**
   * Serializes a single signal to text format
   */
  serializeSignal(signal: Signal): string {
    const states = serializeSignalStates(signal.states);
    let line = `${signal.name}: ${states}`;

    if (signal.description) {
      line += ` "${signal.description}"`;
    }

    return line;
  }

  /**
   * Serializes to JSON format for full fidelity storage
   */
  serializeToJSON(doc: WaveformDocument): string {
    return JSON.stringify(doc, null, 2);
  }

  /**
   * Parses from JSON format
   */
  deserializeFromJSON(json: string): WaveformDocument {
    const parsed = JSON.parse(json);

    // Convert date strings back to Date objects
    parsed.metadata.created = new Date(parsed.metadata.created);
    parsed.metadata.modified = new Date(parsed.metadata.modified);

    return parsed as WaveformDocument;
  }
}
