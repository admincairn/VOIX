// ============================================================
// VOIX — CSS Module Declarations
// Fixes TypeScript "Cannot find module" for CSS imports
// ============================================================

declare module "*.css" {
  const content: Record<string, string>;
  export default content;
}

declare module "*.scss" {
  const content: Record<string, string>;
  export default content;
}
