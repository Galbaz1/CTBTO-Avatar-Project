# Context API

**Source:** https://legacy.reactjs.org/docs/context.html

Context provides a way to share values (e.g., theme, locale, user info) across a component tree without manually passing props at every level.

## Key Concepts

- Create with `React.createContext(defaultValue)`.
- Provide using `<Context.Provider value={...}>`.
- Consume in class components via `static contextType = MyContext` or `<MyContext.Consumer>`.
- Consume in function components using `const value = useContext(MyContext)`.
- Use sparingly for truly global data; prefer prop composition for local concerns.

## Example Usage

```jsx
// Create context
const ThemeContext = React.createContext('light');

class App extends React.Component {
  render() {
    return (
      <ThemeContext.Provider value="dark">
        <Toolbar />
      </ThemeContext.Provider>
    );
  }
}

function Toolbar() {
  return <ThemedButton />;
}

class ThemedButton extends React.Component {
  static contextType = ThemeContext;
  render() {
    return <button theme={this.context}>Click me</button>;
  }
}
```

## When to Use

- Sharing data needed by many components (theme, language, auth status).
- Avoid prop drilling for deeply nested consumers.

## Caveats

- Updates propagate to all descendants; be mindful of re-renders.
- Objects or arrays passed as `value` should be memoized or stored in state.
- Context makes components less reusable if overused. 