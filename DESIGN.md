# Design

## Visual world

Stacked, not stalled is a night-shift engineering workbench. Ink blue is the large field where a complex change is worked through; paper white holds inspection and review artifacts; chartreuse is the route becoming clear. The visual system treats pull-request relationships as physical paths and layers rather than as product cards.

## Typography

Archivo Black carries the declarative, campaign-scale statements. Manrope keeps teaching copy clear and contemporary. Roboto Mono is used only for source-like labels, commands, and precise pull-request metadata.

## Components

- Structural lines and squared panels establish dependency and order.
- Pull-request nodes use white paper surfaces and offset blue shadows.
- The active route, ready state, and actions use chartreuse with text labels so color is never the only status signal.
- Buttons move upward slightly on hover; focus remains explicit through native outlines.

## Responsive behavior

On small screens, comparison columns and simulator regions become a readable vertical sequence. The stack map stays visible before the focused review. The workshop route becomes a static list above its lessons.

## Motion

The simulator uses one authored sequence to explain stack mechanics. Layers enter from `main` in dependency order, the route energizes as each pull request is created, and merging travels back through ready dependencies before landing on `main`. Routine selection and review feedback remain fast. Reduced-motion users receive the same ordered states and status narration without spatial travel or delays.

## Accessibility

Text contrast is maintained against each field. Simulator controls are semantic buttons with selected-state labels, and the code examples remain selectable text. Motion is limited to short hover transitions and does not gate comprehension.
