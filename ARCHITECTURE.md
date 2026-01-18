# Waveform Draw Architecture

## Overview

Waveform Draw is a multi-platform application for creating and editing digital waveform timing diagrams with bidirectional synchronization between visual and textual representations.

## Design Principles

1. **Platform Agnostic Core**: All business logic resides in a shared core library
2. **Isomorphic Representations**: Waveform display and text editor contain identical information
3. **Real-time Synchronization**: Changes in either view immediately reflect in the other
4. **Extensibility**: Easy to add new waveform types, export formats, and platform targets

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Platform Layer                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │   Web    │  │ Desktop  │  │  Mobile  │  │   CLI    │   │
│  │   SPA    │  │ (Tauri)  │  │(Capacitor│  │          │   │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └────┬─────┘   │
└───────┼─────────────┼─────────────┼─────────────┼──────────┘
        │             │             │             │
        └─────────────┴─────────────┴─────────────┘
                            │
        ┌───────────────────▼────────────────────┐
        │         Adapter Layer                  │
        │  (Platform-specific implementations)   │
        │  - Rendering                           │
        │  - File I/O                            │
        │  - Events                              │
        └───────────────────┬────────────────────┘
                            │
        ┌───────────────────▼────────────────────┐
        │            Core Library                │
        │         @waveform-draw/core            │
        │                                        │
        │  ┌──────────────────────────────────┐ │
        │  │       Domain Model               │ │
        │  │  - WaveformDocument              │ │
        │  │  - Signal                        │ │
        │  │  - TimeStep                      │ │
        │  └──────────────────────────────────┘ │
        │                                        │
        │  ┌──────────────────────────────────┐ │
        │  │       Services                   │ │
        │  │  - Parser (Text → Model)         │ │
        │  │  - Serializer (Model → Text)     │ │
        │  │  - Validator                     │ │
        │  │  - Calculator (timing, layout)   │ │
        │  └──────────────────────────────────┘ │
        │                                        │
        │  ┌──────────────────────────────────┐ │
        │  │       State Management           │ │
        │  │  - DocumentStore                 │ │
        │  │  - UndoManager                   │ │
        │  │  - SyncEngine                    │ │
        │  └──────────────────────────────────┘ │
        │                                        │
        │  ┌──────────────────────────────────┐ │
        │  │       Rendering Engine           │ │
        │  │  - Layout Calculator             │ │
        │  │  - Drawing Primitives            │ │
        │  │  - Export (SVG, PNG, PDF)        │ │
        │  └──────────────────────────────────┘ │
        └────────────────────────────────────────┘
```

## Core Components

### 1. Domain Model

#### WaveformDocument
```typescript
interface WaveformDocument {
  id: string;
  metadata: DocumentMetadata;
  signals: Signal[];
  timeConfig: TimeConfiguration;
  version: string;
}

interface DocumentMetadata {
  title: string;
  description?: string;
  author?: string;
  created: Date;
  modified: Date;
}

interface TimeConfiguration {
  totalSteps: number;
  stepWidth: number; // For rendering
  unit?: string; // ns, us, ms, etc.
  labels?: TimeLabel[];
}
```

#### Signal
```typescript
interface Signal {
  id: string;
  name: string;
  states: SignalState[];
  style?: SignalStyle;
}

interface SignalState {
  value: '0' | '1' | 'X' | 'Z'; // Low, High, Unknown, High-Z
  duration: number; // Number of time steps
}

interface SignalStyle {
  color?: string;
  height?: number;
  showTransitions?: boolean;
}
```

### 2. Text Format Specification

#### Basic Format
```
# Simple format: Each line is a signal
CLK: 01010101
DATA: 00110011
ENABLE: 11111111

# Extended format with metadata
@title: My Waveform
@unit: ns

CLK: 01010101
DATA: 00110011 "Data Bus"
ENABLE: 11111111
```

#### Advanced Features
```
# Multi-bit values (future)
BUS[3:0]: 0123456789ABCDEF

# Special states
RESET: 0111X111  # X = unknown
TRISTATE: ZZ11ZZ  # Z = high-impedance

# Time markers
@marker: 4 "Setup Time"
@marker: 6 "Hold Time"
```

### 3. Core Services

#### Parser
Converts text representation to domain model:
```typescript
class WaveformParser {
  parse(text: string): WaveformDocument;
  parseSignal(line: string): Signal;
  validate(text: string): ValidationResult;
}
```

#### Serializer
Converts domain model to text representation:
```typescript
class WaveformSerializer {
  serialize(doc: WaveformDocument): string;
  serializeSignal(signal: Signal): string;
}
```

#### SyncEngine
Maintains bidirectional synchronization:
```typescript
class SyncEngine {
  syncTextToWaveform(text: string): void;
  syncWaveformToText(doc: WaveformDocument): void;

  // Event-based updates
  onTextChange(callback: (doc: WaveformDocument) => void): void;
  onWaveformChange(callback: (text: string) => void): void;
}
```

#### RenderingEngine
Generates visual representation:
```typescript
interface RenderingEngine {
  render(doc: WaveformDocument, canvas: RenderTarget): void;
  export(doc: WaveformDocument, format: 'svg' | 'png' | 'pdf'): Blob;

  // Interactive features
  hitTest(point: Point): HitResult; // For click detection
  getBoundingBox(signal: Signal): Rectangle;
}
```

### 4. State Management

#### DocumentStore
Central state container using observable pattern:
```typescript
class DocumentStore {
  private document: WaveformDocument;
  private observers: Set<Observer>;

  getDocument(): WaveformDocument;
  updateDocument(doc: WaveformDocument): void;
  updateSignal(signalId: string, signal: Signal): void;

  subscribe(observer: Observer): Unsubscribe;
}
```

#### UndoManager
Manages undo/redo operations:
```typescript
class UndoManager {
  execute(command: Command): void;
  undo(): void;
  redo(): void;
  canUndo(): boolean;
  canRedo(): boolean;
}
```

## Platform Implementations

### Web Application (@waveform-draw/web)

**Technology Stack:**
- Framework: React or Svelte
- Rendering: HTML5 Canvas or SVG
- State: Zustand or similar lightweight state manager
- Build: Vite

**Structure:**
```
web/
├── src/
│   ├── components/
│   │   ├── WaveformDisplay.tsx
│   │   ├── TextEditor.tsx
│   │   ├── Toolbar.tsx
│   │   └── Timeline.tsx
│   ├── adapters/
│   │   ├── CanvasRenderer.ts
│   │   └── FileAdapter.ts
│   ├── hooks/
│   │   ├── useWaveform.ts
│   │   └── useSync.ts
│   └── App.tsx
├── public/
└── index.html
```

### Desktop Application (@waveform-draw/desktop)

**Technology Stack:**
- Framework: Tauri (Rust backend + Web frontend)
- Reuses web components
- Native file system access
- Native menus and shortcuts

**Structure:**
```
desktop/
├── src-tauri/
│   ├── src/
│   │   ├── main.rs
│   │   ├── commands.rs  # File operations
│   │   └── menu.rs
│   └── Cargo.toml
└── src/  # Reuses web frontend
```

### Mobile Application (@waveform-draw/mobile)

**Technology Stack:**
- Framework: Capacitor (wraps web app)
- Touch-optimized UI components
- Mobile file pickers

**Structure:**
```
mobile/
├── src/
│   ├── components/
│   │   ├── TouchWaveformDisplay.tsx
│   │   ├── MobileTextEditor.tsx
│   │   └── GestureHandler.tsx
│   └── adapters/
│       └── MobileFileAdapter.ts
├── android/
└── ios/
```

### CLI Tool (@waveform-draw/cli)

**Technology Stack:**
- Runtime: Node.js
- CLI Framework: Commander.js
- Output: Terminal rendering or file generation

**Features:**
```bash
# Convert text to image
waveform-draw convert input.txt -o output.svg

# Validate waveform file
waveform-draw validate input.txt

# Watch mode for live conversion
waveform-draw watch input.txt -o output.svg

# ASCII art preview in terminal
waveform-draw preview input.txt
```

**Structure:**
```
cli/
├── src/
│   ├── commands/
│   │   ├── convert.ts
│   │   ├── validate.ts
│   │   ├── watch.ts
│   │   └── preview.ts
│   ├── renderers/
│   │   ├── AsciiRenderer.ts
│   │   └── FileRenderer.ts
│   └── index.ts
└── bin/
    └── waveform-draw
```

## Project Structure

```
waveform-draw/
├── packages/
│   ├── core/                    # Core library
│   │   ├── src/
│   │   │   ├── domain/
│   │   │   │   ├── WaveformDocument.ts
│   │   │   │   ├── Signal.ts
│   │   │   │   └── types.ts
│   │   │   ├── services/
│   │   │   │   ├── Parser.ts
│   │   │   │   ├── Serializer.ts
│   │   │   │   ├── Validator.ts
│   │   │   │   └── Calculator.ts
│   │   │   ├── state/
│   │   │   │   ├── DocumentStore.ts
│   │   │   │   ├── UndoManager.ts
│   │   │   │   └── SyncEngine.ts
│   │   │   ├── rendering/
│   │   │   │   ├── RenderingEngine.ts
│   │   │   │   ├── LayoutCalculator.ts
│   │   │   │   └── exporters/
│   │   │   └── index.ts
│   │   ├── tests/
│   │   └── package.json
│   │
│   ├── web/                     # Web application
│   │   ├── src/
│   │   ├── public/
│   │   ├── index.html
│   │   └── package.json
│   │
│   ├── desktop/                 # Desktop application
│   │   ├── src-tauri/
│   │   ├── src/
│   │   └── package.json
│   │
│   ├── mobile/                  # Mobile application
│   │   ├── src/
│   │   ├── android/
│   │   ├── ios/
│   │   └── package.json
│   │
│   └── cli/                     # CLI tool
│       ├── src/
│       ├── bin/
│       └── package.json
│
├── docs/                        # Documentation
│   ├── user-guide.md
│   ├── api-reference.md
│   └── text-format.md
│
├── examples/                    # Example waveforms
│   ├── simple.txt
│   ├── cpu-timing.txt
│   └── memory-access.txt
│
├── package.json                 # Root workspace
├── tsconfig.json
├── turbo.json                   # Turborepo config
└── README.md
```

## Key Design Decisions

### 1. Monorepo with Workspaces
- **Tool**: Turborepo or npm workspaces
- **Rationale**: Share core library across all platforms, consistent tooling

### 2. TypeScript Throughout
- **Rationale**: Type safety, better IDE support, easier refactoring

### 3. Functional Core, Imperative Shell
- **Core**: Pure functions for parsing, serialization, calculation
- **Shell**: Platform adapters handle side effects (rendering, I/O, events)

### 4. Event-Driven Synchronization
- **Pattern**: Observer pattern for view synchronization
- **Rationale**: Loose coupling between text editor and waveform display

### 5. Canvas-Based Rendering
- **Primary**: HTML5 Canvas for performance
- **Alternative**: SVG for export and print
- **Rationale**: Canvas handles large waveforms efficiently

### 6. Incremental Parsing
- **Approach**: Parse only changed lines on text edit
- **Rationale**: Real-time performance for large documents

## Data Flow

### Text → Waveform Update
```
User types in text editor
    ↓
Text change event
    ↓
Parser.parse(changedLines)
    ↓
DocumentStore.updateSignals(signals)
    ↓
Notify observers (WaveformDisplay)
    ↓
RenderingEngine.render(document)
    ↓
Canvas updates
```

### Waveform → Text Update
```
User clicks/drags on waveform
    ↓
Canvas event → hitTest
    ↓
Create/modify signal states
    ↓
DocumentStore.updateDocument(doc)
    ↓
Notify observers (TextEditor)
    ↓
Serializer.serialize(document)
    ↓
Text editor updates
```

## Rendering Strategy

### Layout Algorithm
1. Calculate time axis (total steps, pixel width per step)
2. For each signal:
   - Calculate vertical position
   - Calculate transitions (rising/falling edges)
   - Draw signal line with transitions
3. Draw labels, grid, time markers
4. Draw cursors/selections if any

### Performance Optimizations
- **Viewport culling**: Only render visible signals
- **Dirty rectangles**: Only redraw changed regions
- **Throttled updates**: Debounce rapid text changes
- **Virtual scrolling**: For documents with many signals

## File Format

### Primary Format (.wfd)
JSON format for full fidelity:
```json
{
  "version": "1.0",
  "metadata": {
    "title": "CPU Timing Diagram",
    "created": "2026-01-18T00:00:00Z"
  },
  "timeConfig": {
    "totalSteps": 16,
    "unit": "ns",
    "stepWidth": 40
  },
  "signals": [
    {
      "id": "sig-1",
      "name": "CLK",
      "states": [
        { "value": "0", "duration": 1 },
        { "value": "1", "duration": 1 }
      ]
    }
  ]
}
```

### Text Format (.txt)
Human-friendly format (as specified):
```
CLK: 01010101
DATA: 00110011
```

## Extension Points

### Custom Waveform Types
```typescript
interface CustomSignalType {
  name: string;
  validator: (state: string) => boolean;
  renderer: (state: string, context: RenderContext) => void;
}

// Register custom types
WaveformEngine.registerSignalType(customType);
```

### Export Plugins
```typescript
interface ExportPlugin {
  format: string;
  export(doc: WaveformDocument): Blob | string;
}

// Example: LaTeX timing diagram export
ExportEngine.registerPlugin(latexPlugin);
```

### Import Filters
```typescript
interface ImportFilter {
  canHandle(data: string | ArrayBuffer): boolean;
  parse(data: string | ArrayBuffer): WaveformDocument;
}

// Example: Import from VCD (Value Change Dump)
ImportEngine.registerFilter(vcdFilter);
```

## Testing Strategy

### Unit Tests
- Core domain logic (parsers, serializers)
- State management
- Calculation utilities

### Integration Tests
- Text ↔ Waveform synchronization
- Undo/redo operations
- File I/O

### Visual Regression Tests
- Rendering output consistency
- Screenshot comparison

### Platform-Specific Tests
- Web: Browser compatibility
- Desktop: OS-specific features
- Mobile: Touch interactions
- CLI: Command execution

## Development Roadmap

### Phase 1: MVP (Core + Web)
- [ ] Core library with basic text format
- [ ] Parser and serializer
- [ ] Canvas-based rendering
- [ ] Web SPA with split view
- [ ] Real-time synchronization

### Phase 2: Enhanced Features
- [ ] Undo/redo
- [ ] File save/load
- [ ] Export to SVG/PNG
- [ ] Time markers and labels
- [ ] Signal styling

### Phase 3: Platform Expansion
- [ ] Desktop application (Tauri)
- [ ] CLI tool
- [ ] Mobile application

### Phase 4: Advanced Features
- [ ] Multi-bit signals (buses)
- [ ] Special states (X, Z)
- [ ] Signal groups
- [ ] Templates
- [ ] VCD import

## Technology Recommendations

### Core Stack
- **Language**: TypeScript
- **Build**: Vite + Turborepo
- **Testing**: Vitest + Testing Library
- **Linting**: ESLint + Prettier

### Web
- **Framework**: React (ecosystem, community) or Svelte (simplicity, performance)
- **State**: Zustand or Jotai (lightweight)
- **Styling**: Tailwind CSS

### Desktop
- **Framework**: Tauri (smaller bundle than Electron, better security)

### Mobile
- **Framework**: Capacitor (reuses web code)

### CLI
- **Runtime**: Node.js
- **CLI**: Commander.js
- **Rendering**: SVG generation or terminal output

## Conclusion

This architecture provides:
- ✅ **Platform Independence**: Core logic shared across all platforms
- ✅ **Isomorphic Views**: Perfect synchronization between text and waveform
- ✅ **Extensibility**: Easy to add new features, formats, platforms
- ✅ **Performance**: Optimized rendering and parsing
- ✅ **Maintainability**: Clear separation of concerns, testable components

The modular design allows incremental development starting with the core library and web application, then expanding to other platforms as needed.
