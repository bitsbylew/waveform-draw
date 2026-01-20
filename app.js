// Waveform Draw - Simple Timing Diagram Editor
// Built with vanilla JavaScript

class WaveformApp {
    constructor() {
        // DOM elements
        this.textEditor = document.getElementById('textEditor');
        this.canvas = document.getElementById('waveformCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.canvasInfo = document.getElementById('canvasInfo');

        // State
        this.signals = [];
        this.zoom = 1.0;
        this.stepWidth = 60;
        this.signalHeight = 60;
        this.padding = { top: 40, left: 150, right: 40, bottom: 40 };
        this.isLightMode = false;

        // Color configurations
        this.darkColors = {
            high: '#4ade80',
            low: '#60a5fa',
            unknown: '#fbbf24',
            highz: '#a78bfa',
            text: '#e0e0e0',
            grid: '#333',
            background: '#1a1a1a'
        };

        this.lightColors = {
            high: '#000000',
            low: '#000000',
            unknown: '#000000',
            highz: '#000000',
            text: '#000000',
            grid: '#dddddd',
            background: '#ffffff'
        };

        // Active colors (start with dark mode)
        this.colors = { ...this.darkColors };

        // Initialize
        this.setupEventListeners();
        this.setupCanvas();
        this.loadExample();
    }

    setupEventListeners() {
        // Text editor changes
        this.textEditor.addEventListener('input', () => this.onTextChange());

        // Canvas interactions
        this.canvas.addEventListener('click', (e) => this.onCanvasClick(e));
        this.canvas.addEventListener('mousemove', (e) => this.onCanvasHover(e));

        // Toolbar buttons
        document.getElementById('btnExample').addEventListener('click', () => this.loadExample());
        document.getElementById('btnClear').addEventListener('click', () => this.clearAll());
        document.getElementById('btnExport').addEventListener('click', () => this.exportPNG());
        document.getElementById('btnZoomIn').addEventListener('click', () => this.adjustZoom(0.1));
        document.getElementById('btnZoomOut').addEventListener('click', () => this.adjustZoom(-0.1));
        document.getElementById('btnZoomReset').addEventListener('click', () => this.resetZoom());
        document.getElementById('btnThemeToggle').addEventListener('click', () => this.toggleTheme());

        // Window resize
        window.addEventListener('resize', () => this.setupCanvas());
    }

    setupCanvas() {
        const container = this.canvas.parentElement;
        this.canvas.width = container.clientWidth;
        this.canvas.height = container.clientHeight;
        this.render();
    }

    // Parser: Convert text to signal data structure
    parseText(text) {
        const signals = [];
        const lines = text.split('\n');

        for (const line of lines) {
            const trimmed = line.trim();

            // Skip empty lines and comments
            if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('@')) {
                continue;
            }

            // Parse signal line: "SIGNAL_NAME: 01010101 "Optional Description""
            const match = trimmed.match(/^([A-Za-z0-9_]+)\s*:\s*([01XZxz]+)(\s+"([^"]+)")?/);

            if (match) {
                const [, name, statesStr, , description] = match;
                const states = statesStr.toUpperCase().split('').map(char => {
                    switch(char) {
                        case '0': return 'low';
                        case '1': return 'high';
                        case 'X': return 'unknown';
                        case 'Z': return 'highz';
                        default: return 'low';
                    }
                });

                signals.push({
                    name,
                    description: description || '',
                    states
                });
            }
        }

        return signals;
    }

    // Serializer: Convert signals back to text
    serializeSignals() {
        return this.signals.map(signal => {
            const statesStr = signal.states.map(state => {
                switch(state) {
                    case 'low': return '0';
                    case 'high': return '1';
                    case 'unknown': return 'X';
                    case 'highz': return 'Z';
                    default: return '0';
                }
            }).join('');

            return signal.description
                ? `${signal.name}: ${statesStr} "${signal.description}"`
                : `${signal.name}: ${statesStr}`;
        }).join('\n');
    }

    // Event handler: Text changed
    onTextChange() {
        this.signals = this.parseText(this.textEditor.value);
        this.render();
    }

    // Renderer: Draw waveforms on canvas
    render() {
        if (!this.canvas || !this.ctx) return;

        const { width, height } = this.canvas;
        const { top, left, right, bottom } = this.padding;

        // Clear canvas
        this.ctx.fillStyle = this.colors.background;
        this.ctx.fillRect(0, 0, width, height);

        if (this.signals.length === 0) {
            this.drawEmptyState();
            return;
        }

        // Calculate dimensions
        const maxSteps = Math.max(...this.signals.map(s => s.states.length), 1);
        const scaledStepWidth = this.stepWidth * this.zoom;
        const drawWidth = maxSteps * scaledStepWidth;

        // Draw grid
        this.drawGrid(maxSteps, scaledStepWidth);

        // Draw each signal
        this.signals.forEach((signal, index) => {
            const y = top + index * this.signalHeight;
            this.drawSignal(signal, y, scaledStepWidth);
        });

        // Draw time markers
        this.drawTimeMarkers(maxSteps, scaledStepWidth);
    }

    drawGrid(steps, stepWidth) {
        const { top, left } = this.padding;
        const totalHeight = this.signals.length * this.signalHeight;

        this.ctx.strokeStyle = this.colors.grid;
        this.ctx.lineWidth = 1;

        // Vertical grid lines
        for (let i = 0; i <= steps; i++) {
            const x = left + i * stepWidth;
            this.ctx.beginPath();
            this.ctx.moveTo(x, top - 20);
            this.ctx.lineTo(x, top + totalHeight);
            this.ctx.stroke();
        }

        // Horizontal grid lines
        for (let i = 0; i <= this.signals.length; i++) {
            const y = top + i * this.signalHeight;
            this.ctx.beginPath();
            this.ctx.moveTo(left, y);
            this.ctx.lineTo(left + steps * stepWidth, y);
            this.ctx.stroke();
        }
    }

    drawSignal(signal, y, stepWidth) {
        const { left } = this.padding;
        const midY = y + this.signalHeight / 2;
        const highY = y + 10;
        const lowY = y + this.signalHeight - 10;

        // Draw signal name
        this.ctx.fillStyle = this.colors.text;
        this.ctx.font = '14px monospace';
        this.ctx.textAlign = 'right';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(signal.name, left - 10, midY);

        // Draw waveform
        this.ctx.lineWidth = 2;

        for (let i = 0; i < signal.states.length; i++) {
            const x1 = left + i * stepWidth;
            const x2 = left + (i + 1) * stepWidth;
            const state = signal.states[i];

            // Set color based on state
            this.ctx.strokeStyle = this.colors[state] || this.colors.low;
            this.ctx.fillStyle = this.colors[state] || this.colors.low;

            // Draw state
            switch (state) {
                case 'high':
                    // Draw horizontal line at high level
                    this.ctx.beginPath();
                    this.ctx.moveTo(x1, highY);
                    this.ctx.lineTo(x2, highY);
                    this.ctx.stroke();

                    // Draw transition from previous state
                    if (i > 0 && signal.states[i - 1] === 'low') {
                        this.ctx.beginPath();
                        this.ctx.moveTo(x1, lowY);
                        this.ctx.lineTo(x1, highY);
                        this.ctx.stroke();
                    }
                    break;

                case 'low':
                    // Draw horizontal line at low level
                    this.ctx.beginPath();
                    this.ctx.moveTo(x1, lowY);
                    this.ctx.lineTo(x2, lowY);
                    this.ctx.stroke();

                    // Draw transition from previous state
                    if (i > 0 && signal.states[i - 1] === 'high') {
                        this.ctx.beginPath();
                        this.ctx.moveTo(x1, highY);
                        this.ctx.lineTo(x1, lowY);
                        this.ctx.stroke();
                    }
                    break;

                case 'unknown':
                    // Draw X pattern
                    this.ctx.beginPath();
                    this.ctx.moveTo(x1, highY);
                    this.ctx.lineTo(x2, lowY);
                    this.ctx.moveTo(x1, lowY);
                    this.ctx.lineTo(x2, highY);
                    this.ctx.stroke();

                    // Draw horizontal boundaries
                    this.ctx.beginPath();
                    this.ctx.moveTo(x1, highY);
                    this.ctx.lineTo(x2, highY);
                    this.ctx.moveTo(x1, lowY);
                    this.ctx.lineTo(x2, lowY);
                    this.ctx.stroke();
                    break;

                case 'highz':
                    // Draw middle line for high-impedance
                    this.ctx.beginPath();
                    this.ctx.moveTo(x1, midY);
                    this.ctx.lineTo(x2, midY);
                    this.ctx.stroke();
                    break;
            }
        }
    }

    drawTimeMarkers(steps, stepWidth) {
        const { top, left } = this.padding;

        this.ctx.fillStyle = this.colors.text;
        this.ctx.font = '12px monospace';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'bottom';

        for (let i = 0; i <= steps; i++) {
            const x = left + i * stepWidth;
            this.ctx.fillText(i.toString(), x, top - 5);
        }
    }

    drawEmptyState() {
        const { width, height } = this.canvas;

        this.ctx.fillStyle = this.colors.text;
        this.ctx.font = '16px sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';

        this.ctx.fillText('Enter waveform definition in the text editor', width / 2, height / 2 - 20);
        this.ctx.fillText('or click "Example" to load a sample', width / 2, height / 2 + 10);
    }

    // Canvas interaction: Click to toggle states
    onCanvasClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const hit = this.hitTest(x, y);

        if (hit) {
            const { signalIndex, stepIndex } = hit;
            const signal = this.signals[signalIndex];

            // Toggle state
            const currentState = signal.states[stepIndex];
            signal.states[stepIndex] = currentState === 'low' ? 'high' :
                                       currentState === 'high' ? 'unknown' :
                                       currentState === 'unknown' ? 'highz' : 'low';

            // Update text editor
            this.textEditor.value = this.serializeSignals();

            // Re-render
            this.render();
        }
    }

    // Canvas interaction: Hover to show info
    onCanvasHover(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const hit = this.hitTest(x, y);

        if (hit) {
            const { signalIndex, stepIndex } = hit;
            const signal = this.signals[signalIndex];
            const state = signal.states[stepIndex];

            this.canvasInfo.textContent =
                `${signal.name} @ step ${stepIndex}: ${state.toUpperCase()} - Click to toggle`;
        } else {
            this.canvasInfo.textContent = 'Click on waveform to toggle states';
        }
    }

    // Hit testing: Detect which signal/step was clicked
    hitTest(x, y) {
        const { top, left } = this.padding;
        const scaledStepWidth = this.stepWidth * this.zoom;

        // Check if within signal area
        if (x < left) return null;

        const signalIndex = Math.floor((y - top) / this.signalHeight);
        const stepIndex = Math.floor((x - left) / scaledStepWidth);

        if (signalIndex >= 0 && signalIndex < this.signals.length) {
            const signal = this.signals[signalIndex];
            if (stepIndex >= 0 && stepIndex < signal.states.length) {
                return { signalIndex, stepIndex };
            }
        }

        return null;
    }

    // Zoom controls
    adjustZoom(delta) {
        this.zoom = Math.max(0.3, Math.min(3.0, this.zoom + delta));
        this.render();
    }

    resetZoom() {
        this.zoom = 1.0;
        this.render();
    }

    // Load example waveform
    loadExample() {
        const example = `# Example: Simple CPU Timing Diagram
# This demonstrates a basic memory read cycle

CLK: 01010101 "System Clock"
ADDR: 00111111 "Address Bus"
RD: 11000011 "Read Enable"
DATA: 00001111 "Data Bus"
READY: 11110000 "Device Ready"`;

        this.textEditor.value = example;
        this.onTextChange();
    }

    // Clear all
    clearAll() {
        if (confirm('Clear all content?')) {
            this.textEditor.value = '';
            this.signals = [];
            this.render();
        }
    }

    // Export to PNG
    exportPNG() {
        try {
            const link = document.createElement('a');
            link.download = 'waveform.png';
            link.href = this.canvas.toDataURL('image/png');
            link.click();
        } catch (error) {
            alert('Failed to export PNG: ' + error.message);
        }
    }

    // Toggle between light and dark mode
    toggleTheme() {
        this.isLightMode = !this.isLightMode;

        // Update colors
        this.colors = this.isLightMode ? { ...this.lightColors } : { ...this.darkColors };

        // Toggle CSS class on body
        document.body.classList.toggle('light-mode', this.isLightMode);

        // Update button text
        const btn = document.getElementById('btnThemeToggle');
        btn.textContent = this.isLightMode ? 'Dark Mode' : 'Light Mode';

        // Re-render canvas with new colors
        this.render();
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.waveformApp = new WaveformApp();
});
