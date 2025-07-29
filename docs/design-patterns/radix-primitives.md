# Radix UI Primitives

**Source:** https://www.radix-ui.com/docs/primitives/overview/introduction

Radix UI provides unstyled, accessible React components (“primitives”) that handle complex behavior and accessibility concerns, enabling you to style freely.

## Key Features

- **Accessibility-first**: Built-in ARIA roles, keyboard navigation, and focus management.
- **Headless Components**: Unstyled by default, giving full control over appearance via CSS or design tokens.
- **Composable API**: Separate `Root`, `Trigger`, and `Content` components for fine-grained control.
- **Dark Mode & Theming**: Support for styling across themes and variants.
- **TypeScript Support**: Fully typed API for improved DX.

## Example Usage

```jsx
import * as HoverCard from '@radix-ui/react-hover-card';

<HoverCard.Root>
  <HoverCard.Trigger>Hover me</HoverCard.Trigger>
  <HoverCard.Content>
    Tooltip content goes here.
  </HoverCard.Content>
</HoverCard.Root>
```

## Why Use Radix Primitives for Cards

- Ensures consistent, accessible behavior (e.g., keyboard focus, screen reader support).
- Separates behavior from styling, aligning with the single responsibility principle.
- Works seamlessly with design systems and utility CSS frameworks like Tailwind. 