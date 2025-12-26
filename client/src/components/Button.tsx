import { ButtonHTMLAttributes, forwardRef } from "react";
import { Loader2 } from "lucide-react";
import clsx from "clsx";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(({ 
  className, 
  variant = "primary", 
  size = "md", 
  isLoading, 
  children, 
  disabled,
  ...props 
}, ref) => {
  const baseStyles = "inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-4";
  
  const variants = {
    primary: "bg-primary text-primary-foreground shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 hover:-translate-y-0.5 active:translate-y-0 focus:ring-primary/20",
    secondary: "bg-white text-foreground border border-border hover:bg-gray-50 hover:border-gray-300 focus:ring-gray-100",
    outline: "bg-transparent border-2 border-primary text-primary hover:bg-primary/5 focus:ring-primary/10",
    ghost: "bg-transparent text-muted-foreground hover:bg-gray-100 hover:text-foreground",
    destructive: "bg-red-500 text-white shadow-lg shadow-red-500/25 hover:bg-red-600 hover:shadow-red-500/40 focus:ring-red-500/20",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-5 py-2.5 text-base",
    lg: "px-8 py-3.5 text-lg",
  };

  return (
    <button
      ref={ref}
      disabled={disabled || isLoading}
      className={clsx(
        baseStyles,
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
      {children}
    </button>
  );
});

Button.displayName = "Button";
