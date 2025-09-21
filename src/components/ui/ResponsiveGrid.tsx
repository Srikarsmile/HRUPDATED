"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface ResponsiveGridProps {
  children: React.ReactNode;
  cols?: {
    default?: number;
    sm?: number;
    md?: number;
    lg?: number;
    xl?: number;
  };
  gap?: number;
  className?: string;
}

export const ResponsiveGrid: React.FC<ResponsiveGridProps> = ({
  children,
  cols = { default: 1, sm: 2, md: 3, lg: 4 },
  gap = 6,
  className
}) => {
  const gridClasses = cn(
    "grid",
    `gap-${gap}`,
    cols.default && `grid-cols-${cols.default}`,
    cols.sm && `sm:grid-cols-${cols.sm}`,
    cols.md && `md:grid-cols-${cols.md}`,
    cols.lg && `lg:grid-cols-${cols.lg}`,
    cols.xl && `xl:grid-cols-${cols.xl}`,
    className
  );

  return (
    <div className={gridClasses}>
      {children}
    </div>
  );
};

interface ResponsiveStackProps {
  children: React.ReactNode;
  direction?: {
    default?: "row" | "col";
    sm?: "row" | "col";
    md?: "row" | "col";
    lg?: "row" | "col";
  };
  spacing?: number;
  align?: "start" | "center" | "end" | "stretch";
  justify?: "start" | "center" | "end" | "between" | "around" | "evenly";
  className?: string;
}

export const ResponsiveStack: React.FC<ResponsiveStackProps> = ({
  children,
  direction = { default: "col", md: "row" },
  spacing = 4,
  align = "start",
  justify = "start",
  className
}) => {
  const stackClasses = cn(
    "flex",
    `gap-${spacing}`,
    direction.default && `flex-${direction.default}`,
    direction.sm && `sm:flex-${direction.sm}`,
    direction.md && `md:flex-${direction.md}`,
    direction.lg && `lg:flex-${direction.lg}`,
    `items-${align}`,
    `justify-${justify}`,
    className
  );

  return (
    <div className={stackClasses}>
      {children}
    </div>
  );
};

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({
  isOpen,
  onClose,
  children,
  title
}) => {
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed inset-x-0 bottom-0 h-[80vh] bg-white dark:bg-gray-900 rounded-t-3xl overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            {title && (
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {title}
              </h3>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto h-full">
          {children}
        </div>
      </div>
    </div>
  );
};

interface BreakpointIndicatorProps {
  showInProduction?: boolean;
}

export const BreakpointIndicator: React.FC<BreakpointIndicatorProps> = ({
  showInProduction = false
}) => {
  if (process.env.NODE_ENV === 'production' && !showInProduction) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 z-50 px-3 py-2 bg-black/80 text-white text-xs font-mono rounded-lg backdrop-blur-sm">
      <div className="block sm:hidden">XS</div>
      <div className="hidden sm:block md:hidden">SM</div>
      <div className="hidden md:block lg:hidden">MD</div>
      <div className="hidden lg:block xl:hidden">LG</div>
      <div className="hidden xl:block 2xl:hidden">XL</div>
      <div className="hidden 2xl:block">2XL</div>
    </div>
  );
};

interface ResponsiveContainerProps {
  children: React.ReactNode;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  padding?: "none" | "sm" | "md" | "lg";
  className?: string;
}

export const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({
  children,
  maxWidth = "xl",
  padding = "md",
  className
}) => {
  const containerClasses = cn(
    "w-full mx-auto",
    maxWidth === "sm" && "max-w-sm",
    maxWidth === "md" && "max-w-md",
    maxWidth === "lg" && "max-w-lg",
    maxWidth === "xl" && "max-w-xl",
    maxWidth === "2xl" && "max-w-2xl",
    maxWidth === "full" && "max-w-full",
    padding === "sm" && "px-4",
    padding === "md" && "px-6 lg:px-8",
    padding === "lg" && "px-8 lg:px-12",
    className
  );

  return (
    <div className={containerClasses}>
      {children}
    </div>
  );
};