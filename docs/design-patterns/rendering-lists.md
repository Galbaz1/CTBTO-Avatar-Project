# Rendering Lists

**Source:** https://react.dev/learn/rendering-lists

## Key Techniques for Card Lists

- **Use `map()` to render arrays of card data**
  ```jsx
  {cards.map(card => (
    <Card key={card.id} title={card.title} content={card.content} />
  ))}
  ```
- **Stable `key` prop**
  - Use a unique identifier (e.g., `id`) for each card to maintain stability across renders.
  - Avoid using array indices as keys when data can change order.
- **Filtering and transforming data**
  ```jsx
  {cards
    .filter(c => c.active)
    .map(c => <Card key={c.id} {...c} />)
  }
  ```
- **Performance optimizations**
  - Wrap card components with `React.memo` to prevent unnecessary re-renders when props haven’t changed.
  - Use virtualized lists (e.g., `react-window`) for large card collections.

## Example Usage

```jsx
import React, { memo } from 'react';

const Card = memo(({ title, content }) => (
  <div className="card">
    <h2>{title}</h2>
    <p>{content}</p>
  </div>
));

function CardGrid({ cards }) {
  return (
    <div className="card-grid">
      {cards.map(card => (
        <Card key={card.id} {...card} />
      ))}
    </div>
  );
}
``` 