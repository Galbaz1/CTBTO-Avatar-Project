import React from "react";

// Simple runtime stub that replaces any motion.* element with plain div to
// satisfy existing markup without adding interactive/animation props.

export const motion: any = new Proxy(
  {},
  {
    get: () => {
      return ({ children, ...rest }: any) => <div {...rest}>{children}</div>;
    },
  },
);

export const AnimatePresence: React.FC<{
  children: React.ReactNode;
  mode?: string;
}> = ({ children }) => <>{children}</>;

// Re-export common types as `any`
export type Variants = any;
