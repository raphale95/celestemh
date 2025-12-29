"use client";

import React, { useState } from 'react';
import { useQuote } from '@/context/QuoteContext';
import { Button, Card, cn } from '@/components/ui';
import { calculatePricing } from '@/lib/pricing';
import { QuoteSelection } from '@/lib/types'; // Import type
import { Check, Download, Send } from 'lucide-react';

export function Step8Final() {
    const { state } = useQuote();
    const { pricing, selection, event } = state;

    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- Comparison Logic ---
    let nextFormula: 'venez_leger' | 'cocooning' | null = null;
    if (selection.formula === 'essentiel') nextFormula = 'venez_leger';
    else if (selection.formula === 'venez_leger') nextFormula = 'cocooning';

    let comparisonPricing = null;
    let comparisonSelection: QuoteSelection | null = null; // Typing fix

    if (nextFormula) {
        // Create hypothetical selection
        comparisonSelection = {
            ...selection,
            formula: nextFormula,
            // Adjust implications
            // If moving to F2 (Venez Leger): Material Indiv becomes included (logic handles it, but check param).
            // If moving to F3 (Cocooning): Room prices change, Room count changes (div 2).
            // Heaters: default to false unless explicitly set? or keep same? F3 allows heater. F1/2 don't.
            // If we move F2->F3, we can enable heater if it was somehow relevant? No, keep it simple: no heater in comparison unless user had it (impossible).
            // Just keep other params same, calculatePricing handles the rest.
            individualEquipment: false, // Inclus
        };
        comparisonPricing = calculatePricing(comparisonSelection, event);
    }

    const handleFinalize = async () => {
        setIsSubmitting(true);
        try {
            // API Call to /api/finalize
            const response = await fetch('/api/finalize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(state),
            });
            if (response.ok) {
                alert("Devis envoyé avec succès !");
            }
        } catch (e) {
            console.error(e);
            alert("Erreur lors de l'envoi");
        }
        setIsSubmitting(false);
    };

    const handleDownloadPDF = async () => {
        setIsSubmitting(true);
        try {
            const response = await fetch('/api/finalize', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-action': 'download-pdf'
                },
                body: JSON.stringify(state),
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `Devis_Celeste_${state.id.slice(0, 6)}.pdf`;
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            } else {
                let errorMsg = "Erreur lors de la génération du PDF.";
                try {
                    const err = await response.json();
                    if (err.error) errorMsg += " (" + JSON.stringify(err.error) + ")";
                } catch (e) { }
                alert(errorMsg);
            }
        } catch (error) {
            console.error(error);
            alert("Erreur technique lors du téléchargement.");
        }
        setIsSubmitting(false);
    };

    return (
        <div className="space-y-8">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold font-serif text-celeste-main">Votre Devis Estimatif</h2>
                <p className="text-celeste-light">Voici le récapitulatif complet de votre séjour.</p>
            </div>

            {/* Main Recap */}
            <Card className="p-8 border-celeste-main border-2 relative overflow-hidden bg-white shadow-xl">
                <div className="absolute top-0 right-0 bg-celeste-main text-celeste-cream px-6 py-2 rounded-bl-xl font-bold text-sm tracking-widest shadow-md">
                    FORMULE {selection.formula.toUpperCase().replace('_', ' ')}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
                    <div>
                        <h3 className="font-bold font-serif text-celeste-main text-lg mb-4 border-b border-celeste-100 pb-2">Détails Stagiaires</h3>
                        <ul className="space-y-3 text-sm text-celeste-text">
                            <li className="flex justify-between">
                                <span>Hébergement & Pension ({selection.participants} pers.)</span>
                                <span className="font-semibold">{pricing.baseStagiaires.toFixed(2)} €</span>
                            </li>
                            {(pricing.coutMaterielTotal > 0 && selection.materialPaidBy === 'participant') && (
                                <li className="flex justify-between">
                                    <span>Options / Matériel</span>
                                    <span className="font-semibold">{pricing.coutMaterielTotal.toFixed(2)} €</span>
                                </li>
                            )}
                            <li className="border-t border-celeste-200 pt-2 flex justify-between font-bold text-lg text-celeste-gold">
                                <span>Total Stagiaires</span>
                                <span>{pricing.totalStagiaires.toFixed(2)} €</span>
                            </li>
                            <li className="text-right text-xs text-celeste-light">
                                soit {pricing.prixParStagiaire.toFixed(2)} € / pers.
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-bold font-serif text-celeste-main text-lg mb-4 border-b border-celeste-100 pb-2">Détails Organisateur</h3>
                        <ul className="space-y-3 text-sm text-celeste-text">
                            <li className="flex justify-between">
                                <span>Animateur Principal <span className="text-celeste-gold text-xs">(-{pricing.animateurPrincipal.discountPercent}%)</span></span>
                                <span className="font-semibold">{pricing.animateurPrincipal.amountToPay.toFixed(2)} €</span>
                            </li>
                            {pricing.intervenantSupp && (
                                <li className="flex justify-between">
                                    <span>Intervenant Suppl. <span className="text-celeste-gold text-xs">(-{100 - pricing.intervenantSupp.percentToPay}%)</span></span>
                                    <span className="font-semibold">{pricing.intervenantSupp.amountToPay.toFixed(2)} €</span>
                                </li>
                            )}
                            <li className="flex justify-between border-t border-celeste-100 pt-1 mt-1">
                                <span>Location Salle ({selection.room.replace('_', ' + ')})</span>
                                <span className="font-semibold">{pricing.coutSalleTotal.toFixed(2)} €</span>
                            </li>
                            {(pricing.coutMaterielTotal > 0 && (selection.materialPaidBy === 'organizer' || !selection.materialPaidBy)) && (
                                <li className="flex justify-between">
                                    <span>Options / Matériel</span>
                                    <span className="font-semibold">{pricing.coutMaterielTotal.toFixed(2)} €</span>
                                </li>
                            )}
                            <li className="border-t border-celeste-200 pt-2 flex justify-between font-bold text-lg text-celeste-main">
                                <span>Total Organisateur</span>
                                <span>{pricing.totalOrganisateur.toFixed(2)} €</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </Card>

            {/* Comparison */}
            {comparisonPricing && nextFormula && (
                <div className="mt-8 bg-gradient-to-r from-celeste-50 to-white p-6 rounded-xl border border-celeste-gold/30 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-celeste-gold"></div>
                    <div className="md:flex items-center justify-between relative z-10">
                        <div>
                            <h3 className="font-bold font-serif text-celeste-main text-lg">Envie de plus de confort ?</h3>
                            <p className="text-sm text-celeste-light mb-2">
                                Passez à la formule <span className="font-bold uppercase text-celeste-gold">{nextFormula.replace('_', ' ')}</span> pour seulement :
                            </p>

                            {/* Benefits List */}
                            <ul className="text-xs text-celeste-text list-disc list-inside space-y-1 ml-1 marker:text-celeste-gold">
                                {nextFormula === 'venez_leger' && (
                                    <>
                                        <li>Matériel de pratique inclus (tapis, coussins...)</li>
                                        <li>Draps & serviettes fournis</li>
                                    </>
                                )}
                                {nextFormula === 'cocooning' && (
                                    <>
                                        <li>Chambres plus spacieuses (max 2 pers.)</li>
                                        <li>Lits faits à l'arrivée</li>
                                        <li>Ménage quotidien</li>
                                    </>
                                )}
                            </ul>
                        </div>
                        <div className="mt-4 md:mt-0 text-right">
                            <div className="text-3xl font-bold font-serif text-celeste-gold">
                                {comparisonPricing.prixParStagiaire.toFixed(2)} € <span className="text-sm font-normal text-celeste-light font-sans">/ pers</span>
                            </div>
                            <div className="text-sm text-celeste-main font-medium mb-2">
                                (+{(comparisonPricing.prixParStagiaire - pricing.prixParStagiaire).toFixed(2)} € / pers)
                            </div>

                            {/* Organizer Impact */}
                            <div className="border-t border-celeste-200 pt-2 mt-2">
                                <div className="text-xs font-bold text-celeste-main uppercase tracking-wide">Impact Organisateur</div>
                                <div className={cn(
                                    "text-lg font-bold",
                                    comparisonPricing.totalOrganisateur < pricing.totalOrganisateur ? "text-green-600" : "text-celeste-main"
                                )}>
                                    {comparisonPricing.totalOrganisateur.toFixed(2)} €
                                </div>
                                <div className={cn(
                                    "text-sm font-medium",
                                    comparisonPricing.totalOrganisateur < pricing.totalOrganisateur ? "text-green-600" : "text-celeste-light"
                                )}>
                                    {comparisonPricing.totalOrganisateur < pricing.totalOrganisateur
                                        ? `(Économie de ${(pricing.totalOrganisateur - comparisonPricing.totalOrganisateur).toFixed(2)} € !)`
                                        : `(+${(comparisonPricing.totalOrganisateur - pricing.totalOrganisateur).toFixed(2)} €)`
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex flex-col md:flex-row gap-4 justify-center pt-8">
                <Button variant="outline" size="lg" onClick={handleDownloadPDF} className="gap-2">
                    <Download className="h-4 w-4" /> Télécharger le PDF
                </Button>
                <Button size="lg" onClick={handleFinalize} disabled={isSubmitting} className="gap-2">
                    <Send className="h-4 w-4" /> Terminer & Envoyer au gérant
                </Button>
            </div>
        </div>
    );
}
