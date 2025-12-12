import { LucideIcon } from "lucide-react";
import * as React from "react";

/**
 * IconRenderer - Renders different types of icons consistently
 *
 * Handles multiple icon types:
 * - Lucide icons (LucideIcon component)
 * - React components
 * - React nodes (JSX elements)
 *
 * @param icon - The icon to render (can be LucideIcon, React component, or ReactNode)
 * @param className - CSS classes to apply to the icon
 */
interface IconRendererProps {
  icon:
    | LucideIcon
    | React.ComponentType<{ className?: string }>
    | React.ReactNode;
  className?: string;
}

export function IconRenderer({ icon, className = "" }: IconRendererProps) {
  // If icon is a valid React element (already rendered JSX)
  if (React.isValidElement(icon)) {
    return React.cloneElement(
      icon as React.ReactElement<{ className?: string }>,
      {
        className: `${
          (icon.props as { className?: string })?.className || ""
        } ${className}`.trim(),
      }
    );
  }

  // If icon is a component (Lucide icon or custom component)
  if (typeof icon === "function") {
    const IconComponent = icon as React.ComponentType<{ className?: string }>;
    return <IconComponent className={className} />;
  }

  // If icon is a simple ReactNode (string, number, etc.)
  return <>{icon}</>;
}
