# Accessible Card UI Patterns – UC Berkeley

**Source:** https://dap.berkeley.edu/web-a11y-basics/accessible-card-ui-component-patterns

## Best Practices for Accessible Cards

1. **Semantic Container**
   - Use `<article>` or `<section role="region">` for each card.
   - Include `aria-labelledby` linking to the card’s heading.
2. **Heading Structure**
   - Use heading tags (`<h2>`, `<h3>`) for card titles to provide clear structure for screen readers.
3. **Alternative Text for Images**
   - Provide descriptive `alt` text for `<img>` elements in cards.
4. **Clickable Areas & Focus**
   - Ensure only intended elements are interactive (e.g., links or buttons inside the card).
   - If the whole card is clickable, wrap content in an `<a>` with `role="link"` and make it focusable.
   - Add `tabindex="0"` to card elements that need keyboard focus.
5. **Hover & Focus Indicators**
   - Provide visible focus styles (outline, shadow) when card or links receive focus.
   - Provide hover feedback (e.g., background or border change).
6. **ARIA Roles & Properties**
   - Use `role="article"` or `role="link"` for non-standard interactive wrappers.
   - Use `aria-describedby` for additional context (e.g., timestamps, status).
7. **Large Clickable Targets**
   - Ensure minimum touch target size (44×44px) for card actions (buttons, links).

## Example Markup

```html
<article class="card" aria-labelledby="card1-title">
  <h2 id="card1-title">Session Overview</h2>
  <img src="speaker.png" alt="Portrait of speaker" />
  <p>Learn advanced React patterns…</p>
  <a href="/session/123" class="card-link">Learn More</a>
</article>
``` 