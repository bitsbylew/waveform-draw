# Waveform Draw - Quick Start Guide

This guide will help you understand and start developing with the Waveform Draw architecture.

## Understanding the Architecture

### Core Concept: Isomorphic Representations

The key innovation is that the **text editor** and **waveform display** are perfect mirrors of each other:

```
Text Editor                    Waveform Display
-----------                    ----------------
CLK: 01010101        ←→        ___‾‾‾___‾‾‾___‾‾‾
DATA: 00110011       ←→        _______‾‾‾‾‾‾_____
ENABLE: 11111111     ←→        ‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾‾
```

Any change in either view **instantly** updates the other. No information is lost in translation.

## Architecture Layers

### 1. Core Layer (Platform-Agnostic)

Located in `packages/core/`, this contains all business logic:

```typescript
// Domain models
WaveformDocument → Signal → SignalState

// Services
Parser:     Text → WaveformDocument
Serializer: WaveformDocument → Text
Validator:  Text → ValidationResult

// State management
DocumentStore:  Central state container
SyncEngine:     Bidirectional synchronization
UndoManager:    Command pattern for undo/redo
```

**Key files to understand:**
- `packages/core/src/domain/types.ts` - All type definitions
- `packages/core/src/domain/WaveformDocument.ts` - Domain model
- `packages/core/src/services/Parser.ts` - Text parsing logic
- `packages/core/src/services/Serializer.ts` - Text generation logic

### 2. Platform Layer

Each platform adapts the core for its environment:

```
packages/
├── web/       - React/Svelte SPA
├── desktop/   - Tauri (Rust + Web)
├── mobile/    - Capacitor (Web + Native)
└── cli/       - Node.js CLI tool
```

## Development Workflow

### Phase 1: Core Development

Start here - build the foundation that all platforms use:

```bash
cd packages/core

# 1. Implement domain model
# Already started in:
# - src/domain/types.ts
# - src/domain/WaveformDocument.ts

# 2. Implement parser
# Already started in:
# - src/services/Parser.ts

# 3. Implement serializer
# Already started in:
# - src/services/Serializer.ts

# 4. Add tests
npm test

# 5. Build
npm run build
```

### Phase 2: Web Application

The web app is the reference implementation:

```typescript
// Component structure
App
├── Toolbar (save, load, export)
├── WaveformDisplay (Canvas rendering)
│   └── uses RenderingEngine from core
├── TextEditor (Monaco/CodeMirror)
│   └── uses Parser/Serializer from core
└── Timeline (time markers, zoom)

// Data flow
User edits text
  → Parser.parse(text)
  → DocumentStore.update(doc)
  → Observer notification
  → WaveformDisplay.render()

User clicks waveform
  → hitTest(point)
  → Modify document
  → DocumentStore.update(doc)
  → Observer notification
  → Serializer.serialize(doc)
  → TextEditor.update(text)
```

### Phase 3: Desktop Application

Tauri wraps the web app with native capabilities:

```rust
// src-tauri/src/main.rs
#[tauri::command]
fn save_file(path: String, content: String) -> Result<(), String> {
    std::fs::write(path, content).map_err(|e| e.to_string())
}

#[tauri::command]
fn load_file(path: String) -> Result<String, String> {
    std::fs::read_to_string(path).map_err(|e| e.to_string())
}
```

### Phase 4: Other Platforms

- **Mobile**: Capacitor + touch-optimized UI
- **CLI**: Commander.js + SVG export

## Key Design Patterns

### 1. Observer Pattern (Synchronization)

```typescript
class DocumentStore {
  private observers = new Set<Observer>();

  subscribe(observer: Observer): Unsubscribe {
    this.observers.add(observer);
    return () => this.observers.delete(observer);
  }

  private notify() {
    this.observers.forEach(obs => obs(this.document));
  }

  updateDocument(doc: WaveformDocument) {
    this.document = doc;
    this.notify(); // All views update
  }
}
```

### 2. Command Pattern (Undo/Redo)

```typescript
class UpdateSignalCommand implements Command {
  constructor(
    private signalId: string,
    private oldSignal: Signal,
    private newSignal: Signal
  ) {}

  execute() {
    store.updateSignal(this.signalId, this.newSignal);
  }

  undo() {
    store.updateSignal(this.signalId, this.oldSignal);
  }
}
```

### 3. Adapter Pattern (Platform Abstraction)

```typescript
// Core defines interface
interface FileAdapter {
  save(path: string, content: string): Promise<void>;
  load(path: string): Promise<string>;
}

// Web implements with localStorage/File API
class WebFileAdapter implements FileAdapter { ... }

// Desktop implements with Tauri commands
class TauriFileAdapter implements FileAdapter { ... }

// CLI implements with fs
class NodeFileAdapter implements FileAdapter { ... }
```

## Critical Implementation Details

### Parsing Strategy

**Incremental parsing** for performance:

```typescript
// Don't re-parse entire document on every keystroke
class IncrementalParser {
  parseChangedLines(
    oldText: string,
    newText: string,
    changes: TextChange[]
  ): WaveformDocument {
    // Only parse modified lines
    // Update affected signals
    // Recalculate totals
  }
}
```

### Rendering Strategy

**Canvas-based** for performance with large diagrams:

```typescript
class CanvasRenderer implements RenderingEngine {
  render(doc: WaveformDocument, canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext('2d');

    // 1. Calculate layout
    const layout = this.calculateLayout(doc);

    // 2. Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 3. Draw grid
    this.drawGrid(ctx, layout);

    // 4. Draw signals
    doc.signals.forEach(signal => {
      this.drawSignal(ctx, signal, layout);
    });

    // 5. Draw markers
    this.drawMarkers(ctx, doc.timeConfig.markers, layout);
  }

  private drawSignal(ctx, signal, layout) {
    let x = layout.signalStartX;
    const y = layout.signalY(signal.id);

    signal.states.forEach(state => {
      const width = state.duration * layout.stepWidth;

      if (state.value === '1') {
        ctx.moveTo(x, y);
        ctx.lineTo(x, y - layout.signalHeight);
        ctx.lineTo(x + width, y - layout.signalHeight);
      } else {
        ctx.moveTo(x, y);
        ctx.lineTo(x + width, y);
      }

      x += width;
    });

    ctx.stroke();
  }
}
```

### Synchronization

**Debounced updates** to prevent performance issues:

```typescript
class SyncEngine {
  private textUpdateTimer: NodeJS.Timeout | null = null;

  onTextChange(text: string) {
    // Debounce rapid typing
    if (this.textUpdateTimer) {
      clearTimeout(this.textUpdateTimer);
    }

    this.textUpdateTimer = setTimeout(() => {
      const doc = parser.parse(text);
      store.updateDocument(doc);
    }, 100); // 100ms debounce
  }

  onWaveformChange(doc: WaveformDocument) {
    // Waveform changes are less frequent, update immediately
    const text = serializer.serialize(doc);
    textEditor.setValue(text);
  }
}
```

## Testing Strategy

### Unit Tests (Core)

```typescript
describe('WaveformParser', () => {
  it('parses simple signal', () => {
    const text = 'CLK: 01010101';
    const doc = parser.parse(text);

    expect(doc.signals).toHaveLength(1);
    expect(doc.signals[0].name).toBe('CLK');
    expect(serializeSignalStates(doc.signals[0].states)).toBe('01010101');
  });

  it('handles metadata', () => {
    const text = `
      @title: Test
      @unit: ns
      CLK: 0101
    `;
    const doc = parser.parse(text);

    expect(doc.metadata.title).toBe('Test');
    expect(doc.timeConfig.unit).toBe('ns');
  });
});
```

### Integration Tests (Sync)

```typescript
describe('Synchronization', () => {
  it('syncs text to waveform', () => {
    const text = 'CLK: 0101';

    // Update text
    syncEngine.syncTextToWaveform(text);

    // Check document was updated
    const doc = store.getDocument();
    expect(doc.signals[0].name).toBe('CLK');
  });

  it('syncs waveform to text', () => {
    const doc = createDocument();
    doc.signals.push(createSignal('CLK', '0101'));

    // Update document
    syncEngine.syncWaveformToText(doc);

    // Check text was updated
    expect(textEditor.getValue()).toContain('CLK: 0101');
  });
});
```

## Next Steps

1. **Set up the monorepo**:
   ```bash
   npm install
   cd packages/core
   npm install
   npm run build
   ```

2. **Implement remaining core services**:
   - Validator (already partially done)
   - RenderingEngine
   - DocumentStore
   - SyncEngine

3. **Create web application**:
   ```bash
   cd packages/web
   npm create vite@latest . -- --template react-ts
   # Add core as dependency
   # Implement components
   ```

4. **Test thoroughly**:
   - Write comprehensive unit tests
   - Test synchronization edge cases
   - Performance test with large documents

5. **Expand to other platforms**:
   - Desktop (Tauri)
   - CLI (Node.js)
   - Mobile (Capacitor)

## Common Pitfalls to Avoid

1. **Don't put business logic in UI components** - keep it in core
2. **Don't skip debouncing** - rapid updates will kill performance
3. **Don't parse the entire document on every change** - use incremental parsing
4. **Don't render everything** - implement viewport culling
5. **Don't forget undo/redo** - users expect it

## Resources

- [Main README](./README.md)
- [Full Architecture](./ARCHITECTURE.md)
- [Text Format Spec](./docs/text-format.md)
- [Examples](./examples/)

## Questions?

Open an issue or start a discussion on GitHub!

---

**Happy coding!** 🚀
