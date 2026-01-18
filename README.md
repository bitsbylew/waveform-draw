# Waveform Draw

A multi-platform waveform timing diagram editor with bidirectional synchronization between visual and textual representations.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Overview

Waveform Draw is designed for digital electronics engineers, computer architecture students, and anyone who needs to create timing diagrams. It features:

- **Dual Representation**: Edit waveforms visually or as text - changes sync instantly
- **Cross-Platform**: Web app, desktop (Windows/Mac/Linux), mobile (iOS/Android), and CLI
- **Simple Text Format**: Human-readable format (0s and 1s) that's easy to learn and version control
- **Professional Output**: Export to SVG, PNG, or PDF for documentation

## Quick Example

```
# Simple waveform in text format
CLK: 01010101
DATA: 00110011
ENABLE: 11111111
```

This text automatically generates a professional timing diagram visualization.

## Architecture

See [ARCHITECTURE.md](./ARCHITECTURE.md) for the complete system design.

### Key Architectural Features

1. **Platform-Agnostic Core**: Shared TypeScript library (`@waveform-draw/core`) used by all platforms
2. **Isomorphic Views**: Perfect bidirectional sync between text editor and waveform display
3. **Modular Design**: Clean separation between domain logic, rendering, and platform code
4. **Extensible**: Easy to add new signal types, export formats, and platform targets

### Project Structure

```
waveform-draw/
├── packages/
│   ├── core/          # Platform-agnostic business logic
│   ├── web/           # Web SPA (React/Svelte + Vite)
│   ├── desktop/       # Desktop app (Tauri)
│   ├── mobile/        # Mobile app (Capacitor)
│   └── cli/           # Command-line tool
├── examples/          # Example waveform files
├── docs/              # Documentation
└── ARCHITECTURE.md    # Detailed architecture document
```

## Text Format

### Basic Syntax

```
# Comments start with #
SIGNAL_NAME: 01010101

# Each line defines one signal
# 0 = logic low, 1 = logic high
CLK: 01010101
DATA: 00110011
```

### Extended Syntax

```
# Document metadata
@title: CPU Read Cycle
@unit: ns

# Signals with descriptions
CLK: 01010101 "System Clock"
DATA: 00110011 "Data Bus"

# Special states
RESET: 00XXXX11   # X = unknown
TRISTATE: ZZ11ZZ  # Z = high-impedance

# Time markers
@marker: 2 "Setup Time"
@marker: 6 "Data Valid"
```

See [docs/text-format.md](./docs/text-format.md) for complete specification.

## Development Roadmap

### Phase 1: MVP ✅ (Architecture Complete)
- [x] Architecture design
- [x] Core type system
- [x] Parser and serializer
- [ ] Basic rendering engine
- [ ] Web application with split view
- [ ] Real-time synchronization

### Phase 2: Enhanced Features
- [ ] Undo/redo system
- [ ] File save/load
- [ ] Export to SVG/PNG/PDF
- [ ] Time markers and labels
- [ ] Signal styling options
- [ ] Zoom and pan controls

### Phase 3: Platform Expansion
- [ ] Desktop application (Tauri)
- [ ] CLI tool with ASCII preview
- [ ] Mobile application

### Phase 4: Advanced Features
- [ ] Multi-bit signals (buses)
- [ ] Signal grouping
- [ ] Templates and presets
- [ ] VCD (Value Change Dump) import
- [ ] Collaboration features

## Technology Stack

### Core
- **Language**: TypeScript
- **Build**: Vite + Turborepo
- **Testing**: Vitest + Testing Library
- **Linting**: ESLint + Prettier

### Web
- **Framework**: React or Svelte (TBD)
- **State**: Zustand
- **Rendering**: HTML5 Canvas + SVG
- **Styling**: Tailwind CSS

### Desktop
- **Framework**: Tauri
- **Native**: Rust backend
- **UI**: Reuses web frontend

### Mobile
- **Framework**: Capacitor
- **UI**: Touch-optimized components

### CLI
- **Runtime**: Node.js
- **CLI**: Commander.js
- **Rendering**: SVG generation

## Getting Started

### Prerequisites

- Node.js >= 18.0.0
- npm >= 9.0.0

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/waveform-draw.git
cd waveform-draw

# Install dependencies
npm install

# Build all packages
npm run build

# Start development
npm run dev
```

### Development Commands

```bash
# Run all packages in development mode
npm run dev

# Build all packages
npm run build

# Run tests
npm run test

# Lint code
npm run lint

# Type checking
npm run type-check

# Clean build artifacts
npm run clean
```

## Examples

See the [examples/](./examples/) directory for sample waveform files:

- [simple.txt](./examples/simple.txt) - Basic signals
- [cpu-timing.txt](./examples/cpu-timing.txt) - CPU memory read cycle
- [advanced.txt](./examples/advanced.txt) - Advanced features

## Use Cases

### Digital Design
- Document timing constraints
- Verify timing relationships
- Create datasheet diagrams

### Computer Architecture
- Illustrate CPU cycles
- Show bus protocols
- Explain memory timing

### Education
- Teach digital logic
- Demonstrate state machines
- Visualize sequential circuits

### Documentation
- Technical specifications
- Application notes
- Design documentation

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines.

### Development Workflow

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Make your changes
4. Run tests: `npm test`
5. Commit: `git commit -am 'Add new feature'`
6. Push: `git push origin feature/my-feature`
7. Submit a pull request

## License

MIT License - see [LICENSE](./LICENSE) file for details.

## Acknowledgments

- Inspired by traditional timing diagram tools
- Built with modern web technologies
- Designed for the digital design community

## Support

- 📖 [Documentation](./docs/)
- 🐛 [Issue Tracker](https://github.com/yourusername/waveform-draw/issues)
- 💬 [Discussions](https://github.com/yourusername/waveform-draw/discussions)

## Comparison with Other Tools

| Feature | Waveform Draw | WaveDrom | TimingDesigner |
|---------|---------------|----------|----------------|
| Text-based input | ✅ Simple | ✅ JSON | ❌ |
| Visual editing | ✅ | ❌ | ✅ |
| Bidirectional sync | ✅ | ❌ | ❌ |
| Cross-platform | ✅ Web/Desktop/Mobile | ✅ Web only | ❌ Desktop only |
| Open source | ✅ MIT | ✅ MIT | ❌ Proprietary |
| CLI tool | ✅ | ❌ | ❌ |

## Frequently Asked Questions

**Q: Why text-based input?**
A: Text is easy to version control, diff, review in pull requests, and edit with any text editor. It's perfect for including timing diagrams in documentation repositories.

**Q: What makes the representations "isomorphic"?**
A: Both the visual waveform and the text contain exactly the same information - no data is lost in translation. You can edit in either view and the other updates instantly.

**Q: Can I use this for analog signals?**
A: The current version focuses on digital signals (0/1). Analog support may be added in future versions.

**Q: How do I contribute a new export format?**
A: The architecture supports plugins for export formats. See [docs/extending.md](./docs/extending.md) for details.

---

Made with ❤️ for the digital design community
