"use client";

import React from 'react';
import { useQuote } from '@/context/QuoteContext';
import { Card, Button } from '@/components/ui';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export function SummarySidebar() {
    const { state } = useQuote();
    const { event, selection, pricing } = state;
    const isFinalStep = state.step === 8;

    const formatDate = (d?: Date) => d ? format(d, 'dd MMM yyyy', { locale: fr }) : '-';

    if (state.step === 1) return null; // Hide on first step until basic info collected? Or show minimal.
    // Actually nice to show emptiness to encourage filling.

    return (
        <Card className="p-6 sticky top-8 h-fit shadow-lg border-celeste-100 bg-gradient-to-b from-white to-celeste-50/50">
            <h2 className="text-xl font-bold font-serif text-celeste-main mb-4 border-b border-celeste-100 pb-2">
                Votre Devis
            </h2>

            <div className="space-y-4 text-sm text-celeste-text">
                {/* Dates */}
                <div className="flex justify-between">
                    <span className="text-slate-500">Dates ({event.nights} nuits)</span>
                    <div className="text-right font-medium text-celeste-main">
                        <div>{formatDate(event.startDate)}</div>
                        <div>{formatDate(event.endDate)}</div>
                    </div>
                </div>

                {/* Participants - Display only after Step 4 (Participants) is passed */}
                {state.step > 4 && selection.participants > 0 && (
                    <div className="flex justify-between items-center">
                        <span className="text-slate-500">Participants</span>
                        <span className="font-medium bg-celeste-100 text-celeste-main px-2 py-0.5 rounded-full">
                            {selection.participants} pers.
                        </span>
                    </div>
                )}

                {/* Formula - Display only after Step 4 (Participants) is passed */}
                {(state.step > 4 && selection.formula) && (
                    <div className="flex justify-between items-center">
                        <span className="text-slate-500">Formule</span>
                        <span className="font-medium capitalize text-celeste-main">{selection.formula.replace('_', ' ')}</span>
                    </div>
                )}

                {/* Room - Display only after Step 5 (Room) is passed */}
                {state.step > 5 && selection.room && (
                    <div className="flex justify-between items-center">
                        <span className="text-slate-500">Salle</span>
                        <span className="font-medium capitalize text-celeste-main">{selection.room}</span>
                    </div>
                )}

                <div className="border-t border-celeste-100 my-2 pt-2 space-y-2">
                    {/* Detailed Pricing Preview - Only show if valid calculation AND after step 4 */}
                    {state.step > 4 && pricing.totalStagiaires > 0 && (
                        <>
                            <div className="flex justify-between text-slate-600">
                                <span>Hébergement & Repas</span>
                                <span>{(pricing.baseStagiaires).toFixed(2)} €</span>
                            </div>
                        </>
                    )}
                </div>

                {(isFinalStep && pricing.totalOrganisateur > 0) && (
                    <div className="bg-amber-50 p-3 rounded-lg border border-amber-100">
                        <div className="flex justify-between font-semibold text-amber-900">
                            <span>Total Organisateur</span>
                            <span>{pricing.totalOrganisateur.toFixed(2)} €</span>
                        </div>
                        <p className="text-xs text-amber-700 mt-1">Incluant Salle, Matériel & Équipe</p>
                    </div>
                )}

                {(state.step > 4 && pricing.prixParStagiaire > 0) && (
                    <div className="bg-celeste-dark text-white p-4 rounded-lg mt-4 shadow-xl ring-1 ring-celeste-main">
                        <div className="text-celeste-gold/70 text-xs text-center mb-1 uppercase tracking-widest">Total par Stagiaire</div>
                        <div className="text-3xl font-bold font-serif text-center text-celeste-gold">
                            {pricing.prixParStagiaire.toFixed(2)} €
                        </div>
                        <div className="text-center text-xs text-celeste-cream/60 mt-1">
                            pour le séjour
                        </div>
                    </div>
                )}
            </div>
        </Card>
    );
}
