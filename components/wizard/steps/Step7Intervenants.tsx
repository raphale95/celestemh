"use client";

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { intervenantsSchema } from '@/lib/schemas';
import { useQuote } from '@/context/QuoteContext';
import { Input, Label, Button, Card, cn } from '@/components/ui';
import { z } from 'zod';

type IntervenantsFormData = z.infer<typeof intervenantsSchema>;

export function Step7Intervenants() {
    const { state, dispatch } = useQuote();
    const { pricing } = state;

    const { register, handleSubmit, watch, setValue } = useForm<IntervenantsFormData>({
        resolver: zodResolver(intervenantsSchema) as any,
        defaultValues: {
            count: state.selection.intervenants.count,
        }
    });

    const count = watch('count');

    // Trigger recalculation when count changes (update state temporarily to see pricing ?)
    // Actually we need to commit to state to see accurate pricing in sidebar AND in this component.
    // We can use an effect to sync local form state to global state for live preview steps? 
    // No, Step 7 is specifically setting this. 
    // But to show the "Tableau de montants", we need the valid count in state.
    useEffect(() => {
        dispatch({ type: 'SET_SELECTION', payload: { intervenants: { count } } });
    }, [count, dispatch]);

    const onSubmit = (data: IntervenantsFormData) => {
        // Already synced by effect, but good to be explicit
        dispatch({ type: 'SET_SELECTION', payload: { intervenants: { count: data.count } } });
        dispatch({ type: 'NEXT_STEP' });
    };

    return (
        <div className="space-y-8">
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold font-serif text-celeste-main">L'Équipe d'Animation</h2>
                <p className="text-celeste-light">Combien d'intervenants animent ce stage ?</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">

                {/* Count Selection */}
                <div className="flex justify-center space-x-6">
                    <div
                        onClick={() => setValue('count', 1)}
                        className={cn(
                            "cursor-pointer rounded-xl border-2 px-6 py-4 transition-all hover:shadow-md flex flex-col items-center bg-white",
                            count === 1 ? "border-celeste-main ring-2 ring-celeste-main bg-celeste-50" : "border-celeste-200"
                        )}
                    >
                        <span className="text-2xl font-bold text-celeste-main">1</span>
                        <span className="text-sm font-medium text-celeste-text">Intervenant</span>
                    </div>

                    <div
                        onClick={() => setValue('count', 2)}
                        className={cn(
                            "cursor-pointer rounded-xl border-2 px-6 py-4 transition-all hover:shadow-md flex flex-col items-center bg-white",
                            count === 2 ? "border-celeste-main ring-2 ring-celeste-main bg-celeste-50" : "border-celeste-200"
                        )}
                    >
                        <span className="text-2xl font-bold text-celeste-main">2</span>
                        <span className="text-sm font-medium text-celeste-text">Intervenants</span>
                    </div>
                </div>

                {/* Breakdown Table */}
                <Card className="p-6 bg-celeste-50/50 border-celeste-100 shadow-sm transition-all hover:bg-celeste-50">
                    <h3 className="font-bold font-serif text-celeste-main mb-4 border-b border-celeste-200 pb-2">Détail des coûts Organisateur</h3>

                    <div className="space-y-4">
                        {/* Main Animateur */}
                        <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-celeste-100 shadow-sm">
                            <div>
                                <div className="font-semibold text-celeste-main">Animateur Principal</div>
                                <div className="text-xs text-celeste-light">
                                    Base séjour : {pricing.animateurPrincipal.base.toFixed(2)} €
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-celeste-gold font-bold text-lg">
                                    {pricing.animateurPrincipal.amountToPay.toFixed(2)} €
                                </div>
                                <div className="text-xs text-celeste-light font-medium">
                                    (Reste à payer : {pricing.animateurPrincipal.percentToPay}%)
                                </div>
                            </div>
                        </div>

                        {/* Second Intervenant */}
                        {count === 2 && pricing.intervenantSupp && (
                            <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-celeste-100 shadow-sm">
                                <div>
                                    <div className="font-semibold text-celeste-main">Intervenant Suppl.</div>
                                    <div className="text-xs text-celeste-light">
                                        Base séjour : {pricing.intervenantSupp.base.toFixed(2)} €
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-celeste-gold font-bold text-lg">
                                        {pricing.intervenantSupp.amountToPay.toFixed(2)} €
                                    </div>
                                    <div className="text-xs text-celeste-light font-medium">
                                        (Reste à payer : {pricing.intervenantSupp.percentToPay}%)
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Total Line Removed as per request */}
                    </div>
                </Card>

                <div className="flex justify-between pt-6">
                    <Button type="button" variant="ghost" onClick={() => dispatch({ type: 'PREV_STEP' })}>
                        Retour
                    </Button>
                    <Button type="submit" size="lg">
                        Voir le récapitulatif final
                    </Button>
                </div>
            </form>
        </div>
    );
}
