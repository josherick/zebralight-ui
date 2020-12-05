# Zebralight UI for Web

An implementation of the Zebralight UI for web, meant as a tutorial to help
users understand what actions are available at each stage.

Demo: https://josherick.github.io/zebralight-ui/

Some caveats:
- The implementation is based on the [latest
  version](https://zebralight.3dcartstores.com/assets/images/ZebraLightUserGuide2019.pdf)
  of the UI as of 2019.
- This implements a subset of the device functionality. Notably, it omits
  multiple UI groups. If you'd like to learn about those, you can read about
  them in the manual (linked above).
- The brightness levels are not proportional to the actual lumen levels –
  differences between levels are exaggerated to make it easier to tell that the
  light is changing.
- The lumens and runtime values are based off [the
  604c](https://zebralight.3dcartstores.com/H604c-18650-XHP502-Flood-4000K-High-CRI-Headlamp_p_223.html).

# Implementation
This is implemented using a state machine with [234
states](https://github.com/josherick/zebralight-ui/blob/main/src/state_machine/implementations/basic_ui/enums.js#L105),
which were programatically generated. The states contain information about the
current lamp state (brightness, strobe, battery indicator) as well as a state
suffix which is used to keep track of information like whether the user is
cycling between levels, and how many times they've toggled between sublevels.

There is also
[memory](https://github.com/josherick/zebralight-ui/blob/main/src/state_machine/implementations/basic_ui/memory.js)
which stores the last used sublevel (i.e. H1 vs H2) and lumen level for
H2/M2/L2 which I'm calling an "option".

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

State transitions are logged to the console for informational purposes.

# Why?
For fun!
