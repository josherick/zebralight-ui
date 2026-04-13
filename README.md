# Zebralight UI for Web

An implementation of the Zebralight UI for web, meant as a tutorial to help
users understand what actions are available at each stage.

Demo: https://josherick.github.io/zebralight-ui/

## Getting Started

```bash
# Install dependencies
yarn install

# Start development server
yarn dev-server

# Build for production
npm run build
```

## Features

- **Full G5/G6/G7 UI group support** — switch between groups with 5/6/7
  clicks from off. G6/G7 allow programming all 6 brightness slots (H1, H2,
  M1, M2, L1, L2) to any of the 12 available brightness levels.
- **Programming mode** — double-click to toggle between sublevels, or enter
  programming mode with 6 double-clicks to customize brightness levels.
- **Factory reset** — 15/18/21 clicks from off to reset G5/G6/G7 to defaults.
- **Lamp selector** — choose from 50 Zebralight models to see accurate lumen
  and runtime values.
- **Timeout indicator** — visual countdown bar showing when timeouts are active.
- **Persistent memory** — all settings and lamp memory persist across page
  refreshes via localStorage.
- **Settings** — configurable timeout speed, timeout indicator visibility,
  and option to hide G6/G7 groups for a simpler UI.
- **Mode grid** — visual representation of all brightness levels across all
  three UI groups, with responsive layout (side-by-side on wide screens,
  tabbed on narrow screens).

## Caveats

- The brightness levels are not proportional to the actual lumen levels —
  differences between levels are exaggerated to make it easier to tell that the
  light is changing.
- Some lamps in the product list may have a slightly different UI than what is
  simulated here, but the lumen and runtime values are accurate.

## Implementation

This is implemented using a state machine with over 250 states, which were
programmatically generated. The states contain information about the current
lamp state (brightness, strobe, battery indicator) as well as a state suffix
which is used to keep track of information like whether the user is cycling
between levels, and how many times they've toggled between sublevels.

There is also
[memory](https://github.com/josherick/zebralight-ui/blob/main/src/state_machine/implementations/basic_ui/memory.js)
which stores per-group last used sublevels, programmed brightness mappings for
G6/G7, and subcycle options for G5.

There are several
[transitions](https://github.com/josherick/zebralight-ui/blob/main/src/state_machine/implementations/basic_ui/enums.js#L80-L88)
related to button presses and timing. These are captured by React and fed into
the state machine to determine the next state, which is then rendered.

The state resulting from a transition is
[defined](https://github.com/josherick/zebralight-ui/blob/main/src/state_machine/implementations/basic_ui/makeBasicUIStateMachine.js#L28)
in a condensed way by breaking the state string into parts and swapping pieces
out based on the transition, or drawing values from memory where necessary.
Then at runtime, these are
[expanded](https://github.com/josherick/zebralight-ui/blob/main/src/state_machine/implementations/basic_ui/stateExpander.js)
into a full map of state to new state pairs given a transition.

State transitions are logged to the console in development mode.

## Why?
For fun!
