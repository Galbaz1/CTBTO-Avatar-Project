declare module "framer-motion" {
  import React from "react";
  export const motion: any;
  export const AnimatePresence: React.FC<{
    children: React.ReactNode;
    mode?: string;
  }>;
  export type Variants = any;
}
