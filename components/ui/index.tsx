import React from 'react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

// Button
interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = 'primary', size = 'md', ...props }, ref) => {
        const variants = {
            primary: 'bg-celeste-main text-white hover:bg-celeste-light shadow-md',
            secondary: 'bg-celeste-dark text-white hover:bg-celeste-main',
            outline: 'border-2 border-celeste-main text-celeste-main hover:bg-celeste-50',
            ghost: 'text-celeste-main hover:bg-celeste-50',
        };

        const sizes = {
            sm: 'px-3 py-1.5 text-sm',
            md: 'px-6 py-2.5 text-base',
            lg: 'px-8 py-3 text-lg',
        };

        return (
            <button
                ref={ref}
                className={cn(
                    'inline-flex items-center justify-center rounded-lg font-serif transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-celeste-gold disabled:pointer-events-none disabled:opacity-50',
                    variants[variant],
                    sizes[size],
                    className
                )}
                {...props}
            />
        );
    }
);
Button.displayName = "Button";

// Card
export function Card({ className, children }: { className?: string, children: React.ReactNode }) {
    return (
        <div className={cn("rounded-xl border border-celeste-100 bg-white text-celeste-text shadow-sm", className)}>
            {children}
        </div>
    );
}

// Input Label
export function Label({ className, children, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
    return (
        <label className={cn("text-sm font-bold leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 text-celeste-main font-serif tracking-wide", className)} {...props}>
            {children}
        </label>
    );
}

// Input
export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
    ({ className, type, ...props }, ref) => {
        return (
            <input
                type={type}
                className={cn(
                    "flex h-11 w-full rounded-md border border-celeste-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-celeste-gold focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                    className
                )}
                ref={ref}
                {...props}
            />
        );
    }
);
Input.displayName = "Input";
