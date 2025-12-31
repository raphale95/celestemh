"use client";

import React from 'react';
import { useQuote } from '@/context/QuoteContext';
import { Stepper } from './Stepper';
import { SummarySidebar } from './SummarySidebar';
import { Step1ClientInfo } from './steps/Step1ClientInfo';
import { Step2ActivityDates } from './steps/Step2ActivityDates';
import { Step3Recap } from './steps/Step3Recap';
import { Step4Participants } from './steps/Step4Participants';
import { Step5Room } from './steps/Step5Room';
import { Step6Material } from './steps/Step6Material';
import { Step7Intervenants } from './steps/Step7Intervenants';
import { Step8Final } from './steps/Step8Final';
import { StepPrivatizationPresentation } from './steps/StepPrivatizationPresentation';

export function WizardLayout() {
    const { state } = useQuote();
    const { step, selection } = state;

    const showPrivatization = selection.privatization;
    const totalSteps = showPrivatization ? 9 : 8;

    return (
        <div className="min-h-screen bg-celeste-cream pb-20 font-sans">
            {/* Header */}
            <header className="bg-white border-b border-celeste-100 sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-4 h-32 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        {/* Logo enlarged and unconstrained */}
                        <div className="relative h-28 w-28">
                            <img
                                src="/brand-logo.png?v=4"
                                alt="Céleste Logo"
                                className="h-full w-full object-contain drop-shadow-sm"
                            />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-serif font-bold text-3xl text-celeste-main leading-tight">Céleste</span>
                            <div className="text-sm text-celeste-light tracking-widest uppercase flex flex-col sm:block">
                                <span>38470 Chasselay</span>
                                <span className="hidden sm:inline mx-1">-</span>
                                <span>Havre de bien-être et de créativité</span>
                            </div>
                        </div>
                    </div>
                    <div className="hidden sm:block text-sm text-celeste-text/60 italic border-l border-celeste-100 pl-4">Simulateur de Devis</div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-4 py-8">
                <div className="mb-8">
                    <Stepper currentStep={step} totalSteps={totalSteps} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-8">
                        <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8 min-h-[500px]">
                            {step === 1 && <Step1ClientInfo />}
                            {step === 2 && <Step2ActivityDates />}
                            {step === 3 && <Step3Recap />}
                            {step === 4 && <Step4Participants />}

                            {showPrivatization ? (
                                <>
                                    {step === 5 && <StepPrivatizationPresentation />}
                                    {step === 6 && <Step6Material />}
                                    {step === 7 && <Step5Room />}
                                    {step === 8 && <Step7Intervenants />}
                                    {step === 9 && <Step8Final />}
                                </>
                            ) : (
                                <>
                                    {step === 5 && <Step6Material />}
                                    {step === 6 && <Step5Room />}
                                    {step === 7 && <Step7Intervenants />}
                                    {step === 8 && <Step8Final />}
                                </>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-4 hidden lg:block">
                        <SummarySidebar />
                    </div>

                    {/* Mobile Summary Trigger (Optional, maybe specific mobile UI later) */}
                </div>
            </main>
        </div>
    );
}
