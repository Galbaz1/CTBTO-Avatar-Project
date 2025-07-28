# Atomic Design Methodology

**Source:** https://atomicdesign.bradfrost.com/

Atomic Design is a methodology for creating design systems by breaking interfaces into hierarchical components:

1. **Atoms**: Basic building blocks — HTML elements like buttons, labels, inputs.
2. **Molecules**: Combinations of atoms that form a simple functional unit, e.g., a search form (label + input + button).
3. **Organisms**: Relatively complex components composed of groups of molecules and/or atoms — e.g., header, card grid.
4. **Templates**: Page-level layouts that position organisms within a layout, defining structure but using placeholder content.
5. **Pages**: Specific instances of templates with real content applied, used for validation and testing.

This approach promotes consistency, scalability, and reusability across a design system, allowing teams to build reliable UI libraries that grow predictably. 