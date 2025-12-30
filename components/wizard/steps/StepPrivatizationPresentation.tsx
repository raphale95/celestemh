"use client";

import React from 'react';
import { useQuote } from '@/context/QuoteContext';
import { Button, Card } from '@/components/ui';
import { calculatePricing } from '@/lib/pricing';

export function StepPrivatizationPresentation() {
    const { state, dispatch } = useQuote();
    const { selection, event } = state;
    const pricing = calculatePricing(selection, event);
    const [isConfirmed, setIsConfirmed] = React.useState(false);

    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold font-serif text-celeste-main">Option Privatisation</h2>
                <p className="text-celeste-light">Détails de votre demande de privatisation.</p>
            </div>

            <Card className="p-8 border-celeste-main border-2 bg-gradient-to-br from-white to-celeste-50">
                <div className="flex flex-col md:flex-row gap-8 items-center">
                    <div className="flex-1 space-y-4">
                        <h3 className="font-bold font-serif text-xl text-celeste-main">Votre Garantie d'Exclusivité</h3>
                        <p className="text-celeste-text">
                            En choisissant l'option privatisation, vous réservez l'intégralité du lieu pour votre groupe.
                            Cela garantit qu'aucun autre groupe ou individu ne sera présent sur le site pendant votre séjour.
                        </p>

                        <div className="bg-white p-4 rounded-lg shadow-sm border border-celeste-100 mt-4">
                            <h4 className="font-bold text-celeste-gold mb-2 uppercase text-sm tracking-wide">Calcul du forfait</h4>
                            <ul className="space-y-2 text-sm text-celeste-text">
                                <li className="flex justify-between">
                                    <span>Chambres occupées par votre groupe :</span>
                                    <span className="font-bold">{pricing.nbChambresTotal} / 10</span>
                                </li>
                                <li className="flex justify-between">
                                    <span>Chambres vacantes à privatiser :</span>
                                    <span className="font-bold">{Math.max(0, 10 - pricing.nbChambresTotal)}</span>
                                </li>
                                <li className="flex justify-between border-t border-celeste-100 pt-2 mt-2 font-semibold">
                                    <span>Coût par nuit (100€ / chambre vide) :</span>
                                    <span>{Math.max(0, 10 - pricing.nbChambresTotal) * 100} €</span>
                                </li>
                            </ul>
                        </div>
                    </div>

                    <div className="flex-shrink-0 bg-celeste-main text-celeste-cream p-6 rounded-xl text-center shadow-lg transform rotate-2">
                        <div className="text-sm font-semibold uppercase tracking-widest mb-2">Total Privatisation</div>
                        <div className="text-4xl font-bold font-serif">{pricing.coutPrivatisation} €</div>
                        <div className="text-xs mt-2 opacity-80">pour {event.nights} nuit(s)</div>
                    </div>
                </div>

                <p className="text-xs text-center text-celeste-light italic mt-6">
                    Ce montant sera ajouté à la facture de l'organisateur.
                </p>

                <div className="flex items-center justify-center gap-3 mt-6 p-4 border-t border-celeste-100">
                    <input
                        type="checkbox"
                        id="confirmPriv"
                        checked={isConfirmed}
                        onChange={(e) => setIsConfirmed(e.target.checked)}
                        className="h-5 w-5 rounded border-celeste-main text-celeste-main focus:ring-celeste-gold"
                    />
                    <label htmlFor="confirmPriv" className="text-sm font-bold text-celeste-main cursor-pointer select-none">
                        Je confirme vouloir privatiser le lieu
                    </label>
                </div>
            </Card>

            <div className="flex justify-between pt-6">
                <Button variant="ghost" onClick={() => dispatch({ type: 'PREV_STEP' })}>
                    Retour
                </Button>
                <Button size="lg" onClick={() => dispatch({ type: 'NEXT_STEP' })} disabled={!isConfirmed}>
                    Continuer
                </Button>
            </div>
        </div>
    );
}
