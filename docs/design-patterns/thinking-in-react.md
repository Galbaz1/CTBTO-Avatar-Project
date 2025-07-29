# Thinking in React

**Source:** https://react.dev/learn/thinking-in-react

## Key Principles for Card Components

1. Decompose the UI into a hierarchy of components
   - Identify each card as a component and break it into subcomponents (e.g., `CardHeader`, `CardBody`, `CardFooter`).
2. Start with a static mockup
   - Build a non-interactive version of your card to ensure layout correctness.
3. Identify the minimal representation of state
   - Determine the data necessary for your cards (e.g., title, subtitle, content, image, actions) and keep state in parent handler components, not inside UI components.
4. Single-direction data flow via props
   - Pass card data through props; card components are pure and render based solely on their props.
5. Owner vs. Presentational Components
   - Use a container component to fetch and filter card data, then pass data down to presentational card components.
6. Design for composability
   - Keep individual card pieces (title, subtitle, image, badges) as separate components to maximize reuse and customization.

## Example Card Decomposition

```jsx
// Data handler (owner)
function ConferenceCardList({ sessions }) {
  const filtered = sessions.filter(s => s.track === 'React');
  return (
    <div className="card-list">
      {filtered.map(session => (
        <Card key={session.id} title={session.title} subtitle={session.speaker} content={<SessionDetails session={session} />} />
      ))}
    </div>
  );
}

// Presentational card
function Card({ title, subtitle, content }) {
  return (
    <article className="card">
      <header>
        <h2>{title}</h2>
        <h3>{subtitle}</h3>
      </header>
      <section>{content}</section>
    </article>
  );
}
``` 