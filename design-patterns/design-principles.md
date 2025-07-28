# React Design Principles

**Source:** https://legacy.reactjs.org/docs/design-principles.html

## Principles Applied to Card Components

1. **Composition over Inheritance**
   - Build cards by composing smaller primitives (e.g., `Title`, `Subtitle`, `Image`, `Badge`).
2. **Single-direction Data Flow**
   - Data flows down via props; cards remain pure and predictable.
3. **Declarative UI**
   - Describe UI structure in JSX; avoid manual DOM manipulation for card rendering.
4. **Userland Implementation**
   - Leverage React’s escape hatches (e.g., refs) only when needed for performance or integration; avoid premature optimization in card components.
5. **Common Abstractions**
   - Share variants and behaviors through utility hooks or higher-order components (e.g., `useCardInteraction`).
6. **Avoid Reconciliation Pitfalls**
   - Ensure consistent element structure (e.g., same number of child nodes) to prevent unexpected remounts during card updates.

## Example Utility Hook

```jsx
function useCardHover() {
  const [hovered, setHovered] = React.useState(false);
  return {
    hovered,
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false)
  };
}

function Card({ title, content }) {
  const hover = useCardHover();
  return (
    <div className={`card ${hover.hovered ? 'highlight' : ''}`} {...hover}>
      <h2>{title}</h2>
      <div>{content}</div>
    </div>
  );
}
``` 