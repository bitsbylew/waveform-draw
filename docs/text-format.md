# Waveform Draw Text Format Specification

Version 1.0

## Overview

The Waveform Draw text format is a human-readable, line-based format for defining digital timing diagrams. It's designed to be:

- **Simple**: Easy to learn and write
- **Readable**: Clear even without syntax highlighting
- **Version-controllable**: Works well with Git diffs
- **Extensible**: Easy to add new features

## Basic Syntax

### Signal Definition

The most basic element is a signal definition:

```
SIGNAL_NAME: 01010101
```

Components:
- **Signal name**: Must start with a letter or underscore, can contain letters, numbers, underscores
- **Colon**: Separates name from states
- **States**: Sequence of 0s and 1s representing logic levels

### Comments

```
# This is a comment
# Comments start with # and continue to end of line

CLK: 01010101  # Comments can appear at end of line
```

### Empty Lines

Empty lines are ignored and can be used for formatting:

```
# Clock signals
CLK: 01010101

# Data signals
DATA: 00110011
ADDR: 11110000
```

## Signal States

### Basic States

| Character | Meaning | Visual Representation |
|-----------|---------|----------------------|
| `0` | Logic low | Low horizontal line |
| `1` | Logic high | High horizontal line |

### Extended States (Future)

| Character | Meaning | Visual Representation |
|-----------|---------|----------------------|
| `X` | Unknown/undefined | Middle line with X markers |
| `Z` | High-impedance | Middle line with Z markers |

### Example

```
CLK: 01010101        # Regular clock
DATA: 00110011       # Data changes
RESET: 00XXXX11      # Reset with unknown states
TRISTATE: ZZ1100ZZ   # Tri-state buffer output
```

## Metadata Directives

Directives start with `@` and provide document-level configuration.

### @title

Sets the document title:

```
@title: CPU Memory Read Cycle
```

### @description

Adds a description:

```
@description: Timing diagram for a typical synchronous memory read operation
```

### @unit

Specifies the time unit:

```
@unit: ns
```

Common units: `ns` (nanoseconds), `us` (microseconds), `ms` (milliseconds), `cycles`

### @marker

Adds a time marker at a specific position:

```
@marker: 4 "Setup Time"
@marker: 8 "Data Valid"
```

Format: `@marker: POSITION "LABEL"`
- Position is 0-indexed (0 is before first time step)

### Example with Metadata

```
@title: SPI Transfer
@description: Master writes data to slave
@unit: ns

@marker: 0 "Start"
@marker: 4 "Sample"
@marker: 8 "End"

SCLK: 01010101
MOSI: 00110011
MISO: 11001100
CS_N: 00111111
```

## Signal Descriptions

Add an inline description to a signal:

```
CLK: 01010101 "System Clock"
DATA: 00110011 "8-bit Data Bus"
```

The description appears in quotes after the states.

## Complete Example

```
@title: UART Transmission
@description: Sending byte 0xA5 (10100101)
@unit: bit-time

# Control signals
@marker: 0 "Start Bit"
@marker: 9 "Stop Bit"

# UART transmit line
TX: 0101001011 "UART TX Line"

# Sampling clock (16x oversampling)
SAMPLE_CLK: 0101010101010101010101010101010101010101010101010101010101010101 "Sampling Clock"
```

## Multi-bit Signals (Future)

Planned syntax for buses and multi-bit values:

```
# 4-bit bus with hex values
ADDR[3:0]: 0123456789ABCDEF

# 8-bit data bus with binary
DATA[7:0]: 00000000 11111111 10101010

# Alternative compact notation
BUS: [0x0, 0xF, 0xA, 0x5]
```

## File Extension

- Primary: `.wfd` (Waveform Draw)
- Text: `.txt` (for simple text files)
- JSON: `.wfd.json` (for JSON format with full metadata)

## Grammar (EBNF)

```ebnf
document      = { line } ;
line          = ( comment | directive | signal | empty ) , newline ;

comment       = "#" , { any-char } ;
directive     = "@" , directive-name , ":" , whitespace , directive-value ;
signal        = signal-name , ":" , whitespace , states , [ whitespace , description ] ;
empty         = whitespace ;

directive-name  = "title" | "description" | "unit" | "marker" ;
directive-value = { any-char } ;

signal-name   = letter , { letter | digit | "_" } ;
states        = state-char , { state-char } ;
state-char    = "0" | "1" | "X" | "Z" ;
description   = '"' , { any-char-except-quote } , '"' ;

letter        = "a".."z" | "A".."Z" | "_" ;
digit         = "0".."9" ;
whitespace    = { " " | "\t" } ;
newline       = "\n" | "\r\n" ;
```

## Validation Rules

### Required

1. Signal names must be unique within a document
2. Signal names must start with letter or underscore
3. States must only contain valid characters (0, 1, X, Z)

### Recommended

1. All signals should have the same number of time steps
2. Signal names should be descriptive (not just "sig1", "sig2")
3. Use consistent naming convention (UPPER_CASE, camelCase, etc.)

### Warnings

1. Signal name longer than 32 characters
2. Inconsistent signal lengths
3. Very long documents (>100 signals)

## Error Messages

| Error Code | Message | Example |
|------------|---------|---------|
| `INVALID_SIGNAL` | Invalid signal syntax | `CLK 01010101` (missing colon) |
| `INVALID_STATE` | Invalid state character | `DATA: 01X20101` (2 is invalid) |
| `INVALID_NAME` | Invalid signal name | `2CLOCK: 01010101` (starts with digit) |
| `DUPLICATE_NAME` | Duplicate signal name | Two signals named "CLK" |
| `INVALID_DIRECTIVE` | Invalid directive syntax | `@title CPU Read` (missing colon) |

## Best Practices

### Naming

```
# Good
CLK: 01010101
DATA_IN: 00110011
CHIP_SELECT_N: 11111111

# Avoid
c: 01010101
x: 00110011
sig1: 11111111
```

### Organization

```
# Group related signals
@title: CPU Bus Interface

# Clock signals
CLK: 01010101

# Address bus
ADDR_VALID: 00111111
A0: 01010101
A1: 00110011

# Control signals
READ_N: 11100111
WRITE_N: 11111111
READY: 00001111

# Data bus
DATA_VALID: 00001111
D0: 00000011
D1: 00001111
```

### Metadata

```
# Always include title for non-trivial diagrams
@title: I2C Start Condition

# Add unit for timing diagrams
@unit: us

# Use markers for important events
@marker: 2 "SDA Falls"
@marker: 4 "SCL Falls"
```

## Conversion from Other Formats

### WaveDrom JSON to Waveform Draw

WaveDrom:
```json
{
  "signal": [
    { "name": "clk", "wave": "p....." },
    { "name": "dat", "wave": "0.1.0." }
  ]
}
```

Waveform Draw:
```
CLK: 01010101
DATA: 00110011
```

### VCD (Value Change Dump) to Waveform Draw

VCD files can be imported and converted to the text format. The CLI tool will support:

```bash
waveform-draw import input.vcd -o output.txt
```

## Future Extensions

### Planned Features

1. **Multi-bit buses**: `BUS[3:0]: 0x0 0xF 0xA`
2. **Analog signals**: `VOUT: analog(0.0, 3.3, 5.0, 3.3, 0.0)`
3. **Transitions**: `CLK: 0-1-0-1` (explicit edge control)
4. **Delays**: `DATA: ...01010101` (initial delay)
5. **Repeats**: `CLK: (01)*8` (repeat pattern)
6. **Groups**: `@group: "Control Signals" [CS, RD, WR]`

### Example Future Syntax

```
@title: Mixed Signal Example
@unit: ns

# Digital signals
CLK: 01010101

# Multi-bit bus
ADDR[7:0]: 0x00 0xFF 0xA5 0x5A

# Analog signal (future)
@analog: VOUT
VOUT: 0.0 -> 3.3 -> 5.0 -> 3.3 -> 0.0

# Repeated pattern
DATA: (01)*16

# Signal group
@group: "SPI Signals" [SCLK, MOSI, MISO, CS]
```

## Version History

- **1.0.0** (2026-01-18): Initial specification
  - Basic signal syntax (0, 1)
  - Metadata directives (@title, @unit, @marker)
  - Comments and descriptions

---

For more information, see the [main documentation](../README.md) or [architecture document](../ARCHITECTURE.md).
