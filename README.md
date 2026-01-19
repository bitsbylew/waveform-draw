# Waveform Draw - Simple Version

A lightweight, single-page waveform timing diagram editor built with vanilla HTML, CSS, and JavaScript.

## Features

- **Split-pane interface** - Text editor on the left, visual waveform on the right
- **Real-time sync** - Changes in text immediately update the waveform
- **Interactive editing** - Click on waveforms to toggle signal states
- **Multiple signal states** - Support for 0 (low), 1 (high), X (unknown), Z (high-impedance)
- **Zoom controls** - Zoom in/out to adjust waveform detail level
- **Export** - Export waveforms as PNG images
- **No build tools** - Just open index.html in a browser!

## Quick Start

1. Open `index.html` in any modern web browser
2. Enter your waveform definition in the text editor (or click "Example" to load a sample)
3. Watch the waveform update in real-time
4. Click on the waveform to toggle signal states
5. Export as PNG when done

## Text Format

The text format is simple and intuitive:

```
# Comments start with #
SIGNAL_NAME: 01010101

# Example
CLK: 01010101 "System Clock"
DATA: 00110011 "Data Bus"
ENABLE: 11111111

# Signal states:
# 0 = Logic Low
# 1 = Logic High
# X = Unknown/Don't Care
# Z = High-Impedance
```

### Examples

**Simple clock and data:**
```
CLK: 01010101
DATA: 00110011
```

**Memory read cycle:**
```
CLK: 01010101 "System Clock"
ADDR: 00111111 "Address Bus"
RD: 11000011 "Read Enable"
DATA: 00001111 "Data Bus"
READY: 11110000 "Device Ready"
```

**With special states:**
```
RESET: 0111X111  # X = unknown during reset
BUS: ZZ11ZZ00    # Z = high-impedance when tristated
```

## Usage

### Text Editor
- Type or paste waveform definitions
- Each line defines one signal
- Format: `SIGNAL_NAME: 01010101 "Optional Description"`
- Use `#` for comments

### Waveform Display
- Click on any signal to toggle its state (cycles through: low → high → unknown → high-z → low)
- Use zoom buttons to adjust detail level
- Hover over signals to see details

### Toolbar Buttons

**Text Editor Toolbar:**
- **Example** - Load a sample waveform
- **Clear** - Clear all content
- **Export PNG** - Download waveform as PNG image

**Waveform Toolbar:**
- **+** - Zoom in
- **-** - Zoom out
- **Reset** - Reset zoom to default

## Technical Details

### Architecture

This is a simplified version of the waveform editor with:
- **No dependencies** - Pure vanilla JavaScript
- **No build process** - Just HTML, CSS, and JS
- **Single page** - Three files total (index.html, styles.css, app.js)

### Key Components

1. **Parser** - Converts text format to internal signal representation
2. **Renderer** - Draws waveforms on HTML5 Canvas
3. **Sync Engine** - Keeps text and visual views synchronized
4. **Hit Testing** - Detects clicks for interactive editing

### File Structure

```
waveform-draw/
├── index.html    # Main HTML page
├── styles.css    # Styling and layout
├── app.js        # Application logic
└── README.md     # This file
```

## Browser Compatibility

Works in all modern browsers:
- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)

## Future Enhancements

This simple version could be extended with:
- Local storage for auto-save
- Keyboard shortcuts
- SVG export
- Multi-bit bus signals
- Custom color schemes
- Time markers and annotations
- Grid snapping
- Copy/paste functionality

## Packaging for Desktop/Mobile

Later, this single-page app can be easily packaged as:
- **Desktop app** - Using Electron or Tauri
- **Mobile app** - Using Capacitor or Cordova
- **PWA** - Add service worker for offline support

## Comparison to Complex Version

This simplified version differs from the previously planned complex architecture:

| Feature | Complex Version | Simple Version |
|---------|----------------|----------------|
| Architecture | Monorepo with multiple packages | Single page, 3 files |
| Build tools | TypeScript, Vite, Turborepo | None - vanilla JS |
| Framework | React/Svelte | None |
| State management | Zustand/Jotai | Simple class-based |
| Platforms | Web, Desktop, Mobile, CLI | Web only (for now) |
| File formats | JSON + text | Text only |
| Undo/Redo | Complex command pattern | Not yet implemented |
| Testing | Vitest, E2E tests | Manual testing |

The simple version provides the same core user experience with much less complexity!

## License

MIT License - see LICENSE file for details.

## Contributing

This is a simple, educational project. Feel free to:
- Fork and modify
- Submit pull requests
- Report issues
- Suggest improvements

---

Built with ❤️ using vanilla web technologies
