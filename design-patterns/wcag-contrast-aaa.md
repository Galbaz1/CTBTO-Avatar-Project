# WCAG 2.1 Contrast Requirements (Level AAA)

**Source:** https://www.w3.org/TR/WCAG21/#contrast-enhanced

## Contrast Ratios for Card Components

- **Normal Text & Images of Text**: Minimum contrast ratio of **7:1**.
- **Large Text (≥ 18pt or ≥ 14pt bold)**: Minimum contrast ratio of **4.5:1**.
- **UI Components & Graphical Objects**: Minimum contrast ratio of **3:1** for Level AA, but Level AAA is **7:1** for enhanced compliance.

## Implementation Tips

- Use high-contrast design tokens in card CSS:
  ```css
  .card {
    background-color: #ffffff; /* white */
    color: #1a1a1a; /* dark gray */
  }
  ```
- Test contrast locally with browser extensions (e.g., aXe, Lighthouse).
- Consider disabled and hover states for cards to maintain sufficient contrast.
- Use semantic HTML and ARIA to complement visual contrast with accessible labels. 