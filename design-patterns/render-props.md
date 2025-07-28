# Render Props Pattern

**Source:** https://legacy.reactjs.org/docs/render-props.html

Render props allow sharing code between React components by passing a function prop that returns JSX, enabling dynamic rendering based on component state or props.

## Key Points

- A “render prop” is a prop whose value is a function that returns a React element.
- Ideal for cross-cutting concerns (e.g., data fetching, subscriptions).
- Popular in libraries such as React Router, Downshift, and Formik.
- Largely superseded by custom Hooks in modern React.

## Example Usage

```jsx
class Mouse extends React.Component {
  constructor(props) {
    super(props);
    this.state = { x: 0, y: 0 };
    this.handleMouseMove = this.handleMouseMove.bind(this);
  }
  handleMouseMove(event) {
    this.setState({ x: event.clientX, y: event.clientY });
  }
  render() {
    return (
      <div style={{ height: '100vh' }} onMouseMove={this.handleMouseMove}>
        {this.props.render(this.state)}
      </div>
    );
  }
}

function App() {
  return (
    <Mouse render={mouse => (
      <p>The mouse position is ({mouse.x}, {mouse.y})</p>
    )} />
  );
}
```

## Caveats

- Avoid defining the render prop inline when using `React.PureComponent`, as a new function is created each render.
- Extract the render function as a method to maintain referential equality:

```jsx
class MouseTracker extends React.Component {
  renderCat(mouse) {
    return <Cat mouse={mouse} />;
  }
  render() {
    return <Mouse render={this.renderCat} />;
  }
}
``` 