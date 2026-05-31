"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  glass?: boolean;
  gradient?: string;
  onClick?: () => void;
}

export function Card({ children, className, hover = false, glass = true, gradient, onClick }: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      whileHover={hover ? { y: -4, transition: { duration: 0.2 } } : undefined}
      onClick={onClick}
      className={cn(
        "rounded-xl p-6",
        glass && "glass",
        gradient && gradient,
        hover && "cursor-pointer transition-shadow hover:shadow-xl hover:shadow-purple-500/20",
        className
      )}
    >
      {children}
    </motion.div>
  );
}

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost" | "danger" | "outline" | "destructive";
  size?: "sm" | "md" | "lg";
  className?: string;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}

export function Button({
  children,
  onClick,
  variant = "primary",
  size = "md",
  className,
  disabled = false,
  type = "button",
}: ButtonProps) {
  const variants = {
    primary: "bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-500/30",
    secondary: "glass hover:glass-strong text-foreground",
    ghost: "hover:bg-white/5 text-foreground",
    danger: "bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/30",
    outline: "border border-purple-500/50 hover:bg-purple-500/10 text-purple-400",
    destructive: "bg-red-600 hover:bg-red-700 text-white shadow-lg shadow-red-500/30",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      onClick={onClick}
      disabled={disabled}
      type={type}
      className={cn(
        "rounded-lg font-medium transition-all duration-200",
        variants[variant],
        sizes[size],
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {children}
    </motion.button>
  );
}

interface BadgeProps {
  children: ReactNode;
  variant?: "default" | "cold" | "warm" | "hot" | "reservation" | "booked" | "error" | "destructive" | "outline";
  className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  const variants = {
    default: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    cold: "status-cold",
    warm: "status-warm",
    hot: "status-hot",
    reservation: "status-reservation",
    booked: "status-booked",
    error: "bg-red-500/10 text-red-400 border-red-500/20",
    destructive: "bg-red-500/10 text-red-400 border-red-500/20",
    outline: "border-purple-500/50 text-purple-400 bg-transparent",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}

interface InputProps {
  id?: string;
  type?: string;
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onFocus?: () => void;
  onBlur?: () => void;
  onKeyPress?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  className?: string;
  icon?: ReactNode;
  required?: boolean;
  disabled?: boolean;
}

export function Input({ id, type = "text", placeholder, value, defaultValue, onChange, onFocus, onBlur, onKeyPress, className, icon, required, disabled }: InputProps) {
  return (
    <div className="relative">
      {icon && <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">{icon}</div>}
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        value={value}
        defaultValue={defaultValue}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        onKeyPress={onKeyPress}
        required={required}
        disabled={disabled}
        className={cn(
          "w-full rounded-lg glass border border-white/10 px-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all",
          icon && "pl-10",
          disabled && "opacity-50 cursor-not-allowed",
          className
        )}
      />
    </div>
  );
}

interface TextareaProps {
  placeholder?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  rows?: number;
  className?: string;
}

export function Textarea({ placeholder, value, onChange, rows = 4, className }: TextareaProps) {
  return (
    <textarea
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      rows={rows}
      className={cn(
        "w-full rounded-lg glass border border-white/10 px-4 py-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all resize-none",
        className
      )}
    />
  );
}

interface SelectProps {
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options?: { value: string; label: string }[];
  placeholder?: string;
  className?: string;
  children?: React.ReactNode;
  disabled?: boolean;
}

export function Select({ value, onChange, options, placeholder, className, children, disabled }: SelectProps) {
  return (
    <select
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={cn(
        "w-full rounded-lg glass border border-white/10 px-4 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all cursor-pointer",
        "[&>option]:bg-gray-900 [&>option]:text-white [&>option]:py-2",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
    >
      {placeholder && (
        <option value="" disabled className="bg-gray-900 text-gray-400">
          {placeholder}
        </option>
      )}
      {options ? (
        options.map((option) => (
          <option 
            key={option.value} 
            value={option.value}
            className="bg-gray-900 text-foreground hover:bg-white/10"
          >
            {option.label}
          </option>
        ))
      ) : (
        children
      )}
    </select>
  );
}

interface LabelProps {
  htmlFor?: string;
  children: ReactNode;
  className?: string;
}

export function Label({ htmlFor, children, className }: LabelProps) {
  return (
    <label
      htmlFor={htmlFor}
      className={cn(
        "block text-sm font-medium text-foreground mb-1.5",
        className
      )}
    >
      {children}
    </label>
  );
}

interface CheckboxProps {
  id?: string;
  checked?: boolean;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  label?: string;
  className?: string;
  disabled?: boolean;
}

export function Checkbox({ id, checked, onChange, label, className, disabled }: CheckboxProps) {
  return (
    <div className={cn("flex items-center", className)}>
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={onChange}
        disabled={disabled}
        className={cn(
          "w-4 h-4 rounded border-white/10 bg-white/5 text-purple-600 focus:ring-2 focus:ring-purple-500/50 focus:ring-offset-0 cursor-pointer",
          disabled && "opacity-50 cursor-not-allowed"
        )}
      />
      {label && (
        <label
          htmlFor={id}
          className={cn(
            "ml-2 text-sm text-foreground cursor-pointer select-none",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          {label}
        </label>
      )}
    </div>
  );
}

// Dialog Components
interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: ReactNode;
}

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  return (
    <>
      {children}
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div 
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => onOpenChange?.(false)}
          />
          <div className="relative z-50">
            {children}
          </div>
        </div>
      )}
    </>
  );
}

interface DialogTriggerProps {
  asChild?: boolean;
  children: ReactNode;
}

export function DialogTrigger({ children }: DialogTriggerProps) {
  return <>{children}</>;
}

interface DialogContentProps {
  children: ReactNode;
  className?: string;
}

export function DialogContent({ children, className }: DialogContentProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={cn(
        "glass rounded-xl border border-white/10 p-6 w-full max-w-md shadow-2xl",
        className
      )}
    >
      {children}
    </motion.div>
  );
}

interface DialogHeaderProps {
  children: ReactNode;
  className?: string;
}

export function DialogHeader({ children, className }: DialogHeaderProps) {
  return (
    <div className={cn("space-y-2 mb-4", className)}>
      {children}
    </div>
  );
}

interface DialogTitleProps {
  children: ReactNode;
  className?: string;
}

export function DialogTitle({ children, className }: DialogTitleProps) {
  return (
    <h2 className={cn("text-xl font-bold text-foreground", className)}>
      {children}
    </h2>
  );
}

interface DialogDescriptionProps {
  children: ReactNode;
  className?: string;
}

export function DialogDescription({ children, className }: DialogDescriptionProps) {
  return (
    <p className={cn("text-sm text-muted-foreground", className)}>
      {children}
    </p>
  );
}

// Table Components
interface TableProps {
  children: ReactNode;
  className?: string;
}

export function Table({ children, className }: TableProps) {
  return (
    <div className="w-full overflow-auto">
      <table className={cn("w-full border-collapse", className)}>
        {children}
      </table>
    </div>
  );
}

export function TableHeader({ children, className }: TableProps) {
  return (
    <thead className={cn("border-b border-white/10", className)}>
      {children}
    </thead>
  );
}

export function TableBody({ children, className }: TableProps) {
  return (
    <tbody className={cn("divide-y divide-white/5", className)}>
      {children}
    </tbody>
  );
}

export function TableRow({ children, className }: TableProps) {
  return (
    <tr className={cn("hover:bg-white/5 transition-colors", className)}>
      {children}
    </tr>
  );
}

export function TableHead({ children, className }: TableProps) {
  return (
    <th className={cn("px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider", className)}>
      {children}
    </th>
  );
}

interface TableCellProps {
  children: ReactNode;
  className?: string;
  colSpan?: number;
}

export function TableCell({ children, className, colSpan }: TableCellProps) {
  return (
    <td className={cn("px-6 py-4 text-sm text-foreground", className)} colSpan={colSpan}>
      {children}
    </td>
  );
}

// Alert Components
interface AlertProps {
  children: ReactNode;
  variant?: "default" | "destructive";
  className?: string;
}

export function Alert({ children, variant = "default", className }: AlertProps) {
  const variants = {
    default: "bg-blue-500/10 border-blue-500/30 text-blue-500",
    destructive: "bg-red-500/10 border-red-500/30 text-red-500",
  };

  return (
    <div className={cn("rounded-lg border p-4 flex items-start gap-3", variants[variant], className)}>
      {children}
    </div>
  );
}

interface AlertDescriptionProps {
  children: ReactNode;
  className?: string;
}

export function AlertDescription({ children, className }: AlertDescriptionProps) {
  return (
    <p className={cn("text-sm", className)}>
      {children}
    </p>
  );
}

// Export AutocompleteInput
export { AutocompleteInput } from "./AutocompleteInput";
