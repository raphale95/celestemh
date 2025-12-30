"use client";

import React from 'react';
import { cn } from '@/components/ui';
import { Check } from 'lucide-react';

interface StepperProps {
    currentStep: number;
    totalSteps: number;
}

export function Stepper({ currentStep, totalSteps }: StepperProps) {
    return (
        <div className="w-full py-4">
            <div className="relative flex items-center justify-between">
                {/* Connection Line */}
                <div className="absolute left-0 top-1/2 -z-10 w-full h-0.5 bg-slate-200 -translate-y-1/2" />
                <div
                    className="absolute left-0 top-1/2 -z-10 h-0.5 bg-celeste-gold -translate-y-1/2 transition-all duration-500"
                    style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
                />

                {Array.from({ length: totalSteps }).map((_, index) => {
                    const stepNum = index + 1;
                    const isCompleted = stepNum < currentStep;
                    const isCurrent = stepNum === currentStep;

                    return (
                        <div key={stepNum} className="flex flex-col items-center gap-2 bg-white px-2">
                            <div
                                className={cn(
                                    "flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors duration-300",
                                    isCompleted
                                        ? "border-celeste-main bg-celeste-main text-white"
                                        : isCurrent
                                            ? "border-celeste-gold bg-white text-celeste-main"
                                            : "border-slate-300 bg-white text-slate-400"
                                )}
                            >
                                {isCompleted ? <Check className="h-4 w-4" /> : stepNum}
                            </div>
                            <span className={cn(
                                "hidden sm:block text-xs font-medium font-serif",
                                isCurrent ? "text-celeste-main font-bold" : "text-slate-400"
                            )}>
                                {getStepLabel(stepNum, totalSteps)}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

function getStepLabel(step: number, totalSteps: number): string {
    const isPrivatization = totalSteps === 9;

    if (isPrivatization) {
        switch (step) {
            case 1: return "Infos";
            case 2: return "Dates";
            case 3: return "Verif";
            case 4: return "Groupe";
            case 5: return "Privat.";
            case 6: return "Options";
            case 7: return "Salles";
            case 8: return "Interv.";
            case 9: return "Final";
            default: return "";
        }
    } else {
        switch (step) {
            case 1: return "Infos";
            case 2: return "Dates";
            case 3: return "Verif";
            case 4: return "Groupe";
            case 5: return "Options";
            case 6: return "Salles";
            case 7: return "Interv.";
            case 8: return "Final";
            default: return "";
        }
    }
}
