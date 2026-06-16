import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary/80",
        secondary: "border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:bg-destructive/80",
        outline: "text-foreground",
        success: "border-transparent bg-success text-success-foreground",
        warning: "border-transparent bg-warning text-warning-foreground",
        info: "border-transparent bg-info text-info-foreground",
        "status-new": "border-transparent bg-muted text-muted-foreground",
        "status-in-progress": "border-transparent bg-info/20 text-info",
        "status-review": "border-transparent bg-warning/20 text-warning",
        "status-done": "border-transparent bg-success/20 text-success",
        "priority-low": "border-transparent bg-muted text-muted-foreground",
        "priority-medium": "border-transparent bg-info/20 text-info",
        "priority-high": "border-transparent bg-warning/20 text-warning",
        "priority-urgent": "border-transparent bg-destructive/20 text-destructive",
        "role-admin": "border-transparent bg-primary/20 text-primary",
        "role-manager": "border-transparent bg-accent/20 text-accent",
        "role-employee": "border-transparent bg-muted text-muted-foreground",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
