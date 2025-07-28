# Higher-Order Components (HOCs)

**Source:** https://legacy.reactjs.org/docs/higher-order-components.html

HOCs are functions that take a component and return an enhanced component, enabling code reuse and abstraction of cross-cutting concerns.

## Key Concepts

- Signature: `const Enhanced = withEnhancer(WrappedComponent)`.
- Use for behaviors like data subscription, logging, theming, permissions.
- Does not mutate the original component; uses composition (wraps it).
- Can accept additional arguments for configuration.
- Use `hoist-non-react-statics` to copy static methods from wrapped component.

## Example Usage

```jsx
function withSubscription(WrappedComponent, selectData) {
  return class extends React.Component {
    constructor(props) {
      super(props);
      this.state = { data: selectData(DataSource, props) };
      this.handleChange = this.handleChange.bind(this);
    }
    componentDidMount() {
      DataSource.addChangeListener(this.handleChange);
    }
    componentWillUnmount() {
      DataSource.removeChangeListener(this.handleChange);
    }
    handleChange() {
      this.setState({ data: selectData(DataSource, this.props) });
    }
    render() {
      return <WrappedComponent data={this.state.data} {...this.props} />;
    }
  };
}

const CommentListWithSubscription = withSubscription(
  CommentList,
  (DataSource) => DataSource.getComments()
);
```

## Best Practices

- **Don’t apply HOCs inside `render`** – define them outside to preserve component identity.
- **Pass unrelated props through** using rest/spread so the wrapped component’s API remains stable.
- **Compose multiple HOCs** with utilities like `compose()`.
- **Wrap display names**: `WithSubscription(MyComponent)` for easier debugging.
- **Forward refs** using `React.forwardRef` for components that need to expose refs. 