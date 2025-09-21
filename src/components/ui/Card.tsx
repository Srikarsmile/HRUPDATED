"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "glass" | "gradient" | "elevated" | "outline" | "minimal" | "neumorphic" | "floating" | "magnetic" | "holographic" | "bordered";
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  hover?: boolean;
  animate?: boolean;
  gradient?: "primary" | "secondary" | "success" | "warning" | "error" | "rainbow" | "sunset" | "ocean";
  magnetic?: boolean;
  glowEffect?: boolean;
  borderGlow?: boolean;
  // Accessibility props
  interactive?: boolean;
  ariaLabel?: string;
  ariaDescription?: string;
  focusable?: boolean;
  // Performance props
  reduceMotion?: boolean;
  preloadAnimation?: boolean;
}

const cardVariants = {
  // Simplified, professional variants
  default: "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm",
  glass: "bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border border-gray-200/80 dark:border-gray-800/80 shadow-sm",
  gradient: "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm",
  elevated: "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-md",
  outline: "bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700",
  minimal: "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm",
  neumorphic: "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm",
  floating: "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm",
  magnetic: "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm",
  holographic: "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-sm",
  bordered: "bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700",
};

const sizeVariants = {
  xs: "p-2 sm:p-3 rounded-lg text-sm",
  sm: "p-3 sm:p-4 rounded-lg text-sm sm:text-base",
  md: "p-4 sm:p-5 md:p-6 rounded-xl text-base",
  lg: "p-5 sm:p-6 md:p-8 rounded-xl text-base md:text-lg",
  xl: "p-6 sm:p-8 md:p-10 rounded-2xl text-lg",
  "2xl": "p-8 sm:p-10 md:p-12 rounded-3xl text-lg md:text-xl",
};

const gradientVariants = {
  primary: "bg-gradient-to-br from-blue-500 via-purple-500 to-indigo-600",
  secondary: "bg-gradient-to-br from-gray-500 via-gray-600 to-gray-700",
  success: "bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600",
  warning: "bg-gradient-to-br from-orange-500 via-amber-500 to-yellow-600",
  error: "bg-gradient-to-br from-red-500 via-rose-500 to-pink-600",
  rainbow: "bg-gradient-to-br from-pink-500 via-purple-500 via-blue-500 via-green-500 to-yellow-500",
  sunset: "bg-gradient-to-br from-orange-400 via-pink-500 to-purple-600",
  ocean: "bg-gradient-to-br from-blue-400 via-cyan-500 to-teal-600",
};

const hoverVariants = {
  // Subtle hover effects only (no transforms)
  default: "hover:shadow-md",
  glass: "hover:shadow-md hover:bg-white/85 dark:hover:bg-gray-900/85",
  gradient: "hover:shadow-md",
  elevated: "hover:shadow-lg",
  outline: "hover:bg-gray-50 dark:hover:bg-gray-800 hover:shadow-md",
  minimal: "hover:shadow-md hover:bg-white dark:hover:bg-gray-900",
  neumorphic: "hover:shadow-md",
  floating: "hover:shadow-md",
  magnetic: "hover:shadow-md",
  holographic: "hover:shadow-md",
  bordered: "hover:shadow-md",
};

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({
    className,
    variant = "default",
    size = "md",
    hover = true,
    animate = false,
    gradient,
    magnetic = false,
    glowEffect = false,
    borderGlow = false,
    interactive = false,
    ariaLabel,
    ariaDescription,
    focusable = false,
    reduceMotion = false,
    preloadAnimation = false,
    children,
    ...props
  }, ref) => {
    // Check for reduced motion preference
    const prefersReducedMotion = React.useMemo(() => {
      if (typeof window !== 'undefined') {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches || reduceMotion;
      }
      return reduceMotion;
    }, [reduceMotion]);

    // Performance optimization: disable heavy effects on low-end devices
    const isLowEndDevice = React.useMemo(() => {
      if (typeof window !== 'undefined' && 'navigator' in window) {
        // @ts-ignore - deviceMemory is experimental
        return navigator.deviceMemory && navigator.deviceMemory < 4;
      }
      return false;
    }, []);
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);
    const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], ["6deg", "-6deg"]));
    const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], ["-6deg", "6deg"]));

    const baseClasses = "relative overflow-hidden rounded-xl transition-shadow duration-200";

    const variantClasses = variant === "gradient" && gradient
      ? gradientVariants[gradient]
      : cardVariants[variant];

    const sizeClasses = sizeVariants[size];
    const hoverClasses = hover ? hoverVariants[variant] : "";

    const cardClasses = cn(
      baseClasses,
      variantClasses,
      sizeClasses,
      // Disable hover effects if reduced motion is preferred or on low-end devices
      !prefersReducedMotion && !isLowEndDevice && hoverClasses,
      // remove aggressive glow effects for a cleaner look
      !isLowEndDevice && glowEffect && "",
      !isLowEndDevice && borderGlow && "",
      (magnetic || interactive) && "cursor-pointer",
      // Accessibility classes
      focusable && "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
      interactive && "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2",
      // Mobile optimization classes
      "touch-manipulation",
      !isLowEndDevice && "md:will-change-transform",
      className
    );

    // Accessibility attributes
    const accessibilityProps = {
      role: interactive ? "button" : props.role,
      tabIndex: focusable || interactive ? 0 : props.tabIndex,
      "aria-label": ariaLabel,
      "aria-describedby": ariaDescription ? `${props.id}-description` : undefined,
      ...(interactive && {
        onKeyDown: (e: React.KeyboardEvent) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            props.onClick?.(e as any);
          }
        }
      })
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
      if (!magnetic) return;

      // Disable magnetic effects on mobile/touch devices for better performance
      if (window.matchMedia && window.matchMedia("(max-width: 768px)").matches) {
        return;
      }

      const rect = e.currentTarget.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      const mouseXPos = (e.clientX - centerX) / rect.width;
      const mouseYPos = (e.clientY - centerY) / rect.height;

      mouseX.set(mouseXPos);
      mouseY.set(mouseYPos);
    };

    const handleMouseLeave = () => {
      if (!magnetic) return;
      mouseX.set(0);
      mouseY.set(0);
    };

    const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
      // Add touch feedback for mobile devices
      if (magnetic) {
        e.currentTarget.style.transform = "scale(0.98)";
      }
    };

    const handleTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
      if (magnetic) {
        e.currentTarget.style.transform = "";
      }
    };

    if ((animate || magnetic) && !prefersReducedMotion) {
      return (
        <motion.div
          ref={ref}
          className={cardClasses}
          initial={animate && !prefersReducedMotion ? { opacity: 0, y: 8 } : {}}
          whileInView={animate && !prefersReducedMotion ? { opacity: 1, y: 0 } : {}}
          viewport={{ once: true }}
          transition={{
            duration: prefersReducedMotion ? 0.01 : 0.3,
            ease: "easeOut",
          }}
          whileHover={{}}
          style={magnetic && !prefersReducedMotion && !isLowEndDevice ? {
            rotateX,
            rotateY,
            transformStyle: "preserve-3d"
          } : {}}
          onMouseMove={!prefersReducedMotion ? handleMouseMove : undefined}
          onMouseLeave={!prefersReducedMotion ? handleMouseLeave : undefined}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          {...accessibilityProps}
          {...props}
        >
          {/* Holographic overlay */}
          {variant === "holographic" && (
            <motion.div
              className="absolute inset-0 opacity-0 bg-gradient-to-br from-pink-500/20 via-blue-500/20 to-green-500/20 pointer-events-none"
              whileHover={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
          )}

          {/* Magnetic glow effect */}
          {magnetic && (
            <motion.div
              className="absolute -inset-1 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl blur-lg opacity-0 pointer-events-none"
              style={{
                scale: useTransform(mouseX, [-0.5, 0.5], [0.8, 1.2])
              }}
              whileHover={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            />
          )}

          {/* Border gradient for bordered variant */}
          {variant === "bordered" && (
            <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-75 -z-10" />
          )}

          {/* Content with 3D transform */}
          <div style={magnetic ? { transform: "translateZ(50px)" } : {}}>
            {children}
          </div>
        </motion.div>
      );
    }

    return (
      <div ref={ref} className={cardClasses} {...accessibilityProps} {...props}>
        {children}
        {/* Screen reader description */}
        {ariaDescription && (
          <div id={`${props.id}-description`} className="sr-only">
            {ariaDescription}
          </div>
        )}
      </div>
    );
  }
);

Card.displayName = "Card";

export const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 pb-3", className)} {...props} />
  )
);
CardHeader.displayName = "CardHeader";

export const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("text-lg font-semibold leading-none tracking-tight", className)} {...props} />
  )
);
CardTitle.displayName = "CardTitle";

export const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p ref={ref} className={cn("text-sm text-gray-600 dark:text-gray-400", className)} {...props} />
  )
);
CardDescription.displayName = "CardDescription";

export const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("pt-2", className)} {...props} />
  )
);
CardContent.displayName = "CardContent";

export const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex items-center pt-4", className)} {...props} />
  )
);
CardFooter.displayName = "CardFooter";

// Specialized card components
export interface StatsCardProps extends CardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

export const StatsCard = React.forwardRef<HTMLDivElement, StatsCardProps>(
  ({ title, value, description, icon, trend, className, ...props }, ref) => {
    const [isVisible, setIsVisible] = React.useState(false);
    const [animatedValue, setAnimatedValue] = React.useState(0);

    React.useEffect(() => {
      setIsVisible(true);
      // Animate numerical values
      const numericValue = typeof value === 'string' ? parseFloat(value.replace(/[^\d.-]/g, '')) : value;
      if (!isNaN(numericValue as number)) {
        let start = 0;
        const duration = 1500;
        const startTime = Date.now();

        const animate = () => {
          const elapsed = Date.now() - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const easeOut = 1 - Math.pow(1 - progress, 3);

          setAnimatedValue(start + (numericValue - start) * easeOut);

          if (progress < 1) {
            requestAnimationFrame(animate);
          }
        };

        requestAnimationFrame(animate);
      }
    }, [value]);

    const formatAnimatedValue = (val: number): string => {
      if (typeof value === 'string') {
        // Preserve original formatting but with animated number
        return value.replace(/[\d.-]+/, Math.round(val).toString());
      }
      return Math.round(val).toString();
    };

    return (
      <Card
        ref={ref}
        variant="minimal"
        hover
        animate
        className={cn("relative", className)}
        {...props}
      >
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="space-y-1 flex-1">
              <CardDescription className="text-xs font-medium uppercase tracking-wide">
                {title}
              </CardDescription>
              <div className="flex items-baseline space-x-2">
                <CardTitle className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                  {typeof value === 'number' || !isNaN(parseFloat(value as string))
                    ? formatAnimatedValue(animatedValue)
                    : value}
                </CardTitle>
              </div>
            </div>
            {icon && (
              <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
                <div className="text-xl sm:text-2xl">{icon}</div>
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="pt-1">
          {description && (
            <CardDescription className="text-sm">
              {description}
            </CardDescription>
          )}

          {trend && (
            <div className="mt-3 flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-800">
              <div className={cn(
                "flex items-center space-x-1.5 text-sm font-medium px-2.5 py-1 rounded-md",
                trend.isPositive
                  ? "text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/20"
                  : "text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20"
              )}>
                <span>{trend.isPositive ? "↑" : "↓"}</span>
                <span>{Math.abs(trend.value)}%</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }
);
StatsCard.displayName = "StatsCard";

export interface ActionCardProps extends CardProps {
  title: string;
  description: string;
  icon?: React.ReactNode;
  action?: () => void;
  disabled?: boolean;
}

export const ActionCard = React.forwardRef<HTMLDivElement, ActionCardProps>(
  ({ title, description, icon, action, disabled = false, className, ...props }, ref) => (
    <Card
      ref={ref}
      variant="minimal"
      hover={!disabled}
      animate
      className={cn(
        "cursor-pointer",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      onClick={disabled ? undefined : action}
      {...props}
    >
      <CardContent className="text-center space-y-3">
        {icon && (
          <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xl">
            {icon}
          </div>
        )}
        <div>
          <CardTitle className="text-base mb-1 px-2">{title}</CardTitle>
          <CardDescription className="text-sm px-2">{description}</CardDescription>
        </div>
      </CardContent>
    </Card>
  )
);
ActionCard.displayName = "ActionCard";

// New specialized card components
export interface MetricCardProps extends CardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
    period?: string;
  };
  icon?: React.ReactNode;
  chart?: React.ReactNode;
  status?: "success" | "warning" | "error" | "neutral";
}

export const MetricCard = React.forwardRef<HTMLDivElement, MetricCardProps>(
  ({ title, value, subtitle, trend, icon, chart, status = "neutral", className, ...props }, ref) => {
    return (
      <Card
        ref={ref}
        variant="minimal"
        hover
        animate
        className={cn(className)}
        {...props}
      >
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <CardDescription className="text-xs font-medium uppercase tracking-wide">
                {title}
              </CardDescription>
              <div className="flex items-baseline space-x-2">
                <CardTitle className="text-2xl font-bold">{value}</CardTitle>
                {subtitle && <span className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</span>}
              </div>
            </div>
            {icon && (
              <div className="p-3 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-200">
                {icon}
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {trend && (
            <div className={cn(
              "flex items-center space-x-1 text-sm font-medium",
              trend.isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
            )}>
              <span>{trend.isPositive ? "↗" : "↘"}</span>
              <span>{Math.abs(trend.value)}%</span>
              {trend.period && <span className="text-gray-500 dark:text-gray-400">vs {trend.period}</span>}
            </div>
          )}
          {chart && <div className="mt-4">{chart}</div>}
        </CardContent>
      </Card>
    );
  }
);
MetricCard.displayName = "MetricCard";

export interface InteractiveCardProps extends CardProps {
  title: string;
  description?: string;
  image?: string;
  overlay?: React.ReactNode;
  action?: () => void;
  badge?: {
    text: string;
    variant?: "success" | "warning" | "error" | "info";
  };
}

export const InteractiveCard = React.forwardRef<HTMLDivElement, InteractiveCardProps>(
  ({ title, description, image, overlay, action, badge, className, ...props }, ref) => (
    <Card
      ref={ref}
      variant="minimal"
      hover
      animate
      className={cn("cursor-pointer overflow-hidden", className)}
      onClick={action}
      {...props}
    >
      <div className="relative">
        {image && (
          <div className="aspect-video relative overflow-hidden rounded-t-xl">
            <img src={image} alt={title} className="w-full h-full object-cover" />
            {badge && (
              <div className={cn(
                "absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-semibold",
                badge.variant === "success" && "bg-green-500 text-white",
                badge.variant === "warning" && "bg-orange-500 text-white",
                badge.variant === "error" && "bg-red-500 text-white",
                badge.variant === "info" && "bg-blue-500 text-white",
                !badge.variant && "bg-gray-900/70 text-white backdrop-blur-sm"
              )}>
                {badge.text}
              </div>
            )}
          </div>
        )}

        <CardContent className="p-6">
          <CardTitle className="mb-2">
            {title}
          </CardTitle>
          {description && (
            <CardDescription className="line-clamp-3">
              {description}
            </CardDescription>
          )}
        </CardContent>

        {overlay && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-200">
            {overlay}
          </div>
        )}
      </div>
    </Card>
  )
);
InteractiveCard.displayName = "InteractiveCard";

export interface ProgressCardProps extends CardProps {
  title: string;
  progress: number;
  total?: number;
  status?: "in-progress" | "completed" | "paused" | "error";
  showPercentage?: boolean;
  color?: "blue" | "green" | "orange" | "red" | "purple";
  icon?: React.ReactNode;
  description?: string;
}

export const ProgressCard = React.forwardRef<HTMLDivElement, ProgressCardProps>(
  ({
    title,
    progress,
    total = 100,
    status = "in-progress",
    showPercentage = true,
    color = "blue",
    icon,
    description,
    className,
    ...props
  }, ref) => {
    const percentage = Math.min((progress / total) * 100, 100);

    const colorMap = {
      blue: { bg: "bg-blue-500", text: "text-blue-600", ring: "ring-blue-500" },
      green: { bg: "bg-green-500", text: "text-green-600", ring: "ring-green-500" },
      orange: { bg: "bg-orange-500", text: "text-orange-600", ring: "ring-orange-500" },
      red: { bg: "bg-red-500", text: "text-red-600", ring: "ring-red-500" },
      purple: { bg: "bg-purple-500", text: "text-purple-600", ring: "ring-purple-500" },
    };

    const statusIcons = {
      "in-progress": "⏳",
      completed: "✅",
      paused: "⏸️",
      error: "❌",
    };

    return (
      <Card
        ref={ref}
        variant="minimal"
        hover
        animate
        className={cn("group", className)}
        {...props}
      >
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {icon && (
                <div className={cn(
                  "p-2 rounded-lg",
                  colorMap[color].bg,
                  "text-white"
                )}>
                  {icon}
                </div>
              )}
              <div>
                <CardTitle className="text-lg">{title}</CardTitle>
                {description && (
                  <CardDescription className="text-sm mt-1">
                    {description}
                  </CardDescription>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-xl">{statusIcons[status]}</span>
              {showPercentage && (
                <span className={cn("text-lg font-bold", colorMap[color].text)}>
                  {percentage.toFixed(0)}%
                </span>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Progress</span>
              <span className="font-medium">{progress} / {total}</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
              <motion.div
                className={cn("h-full rounded-full", colorMap[color].bg)}
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }
);
ProgressCard.displayName = "ProgressCard";
