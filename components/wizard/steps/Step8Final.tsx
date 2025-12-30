"use client";

import React, { useState } from 'react';
import { useQuote } from '@/context/QuoteContext';
import { Button, Card, cn } from '@/components/ui';
import { calculatePricing } from '@/lib/pricing';
import { QuoteSelection } from '@/lib/types'; // Import type
import { Check, Download, Send } from 'lucide-react';

// ... imports

export function Step8Final() {
    const { state, dispatch } = useQuote();
    const { pricing, selection, event } = state;

    const [isSubmitting, setIsSubmitting] = useState(false);

    // --- Comparison Logic ---
    let nextFormula: 'venez_leger' | 'cocooning' | null = null;
    if (selection.formula === 'essentiel') nextFormula = 'venez_leger';
    else if (selection.formula === 'venez_leger') nextFormula = 'cocooning';

    let comparisonPricing = null;
    let comparisonSelection: QuoteSelection | null = null;

    if (nextFormula) {
        // Create hypothetical selection
        comparisonSelection = {
            ...selection,
            formula: nextFormula,
            // Logic handled in calculatePricing for inclusions
            // Reset explicit options that become included or irrelevant, 
            // but strictly speaking, calculatePricing handles inclusions based on formula.
            // We just need to toggle 'formula'.
            // We might wanna toggle 'privatization' triggers too? 
            // If upgrading F1 -> F2, privatization becomes Available. 
            // But we shouldn't auto-enable it.
        };
        comparisonPricing = calculatePricing(comparisonSelection, event);
    }

    const handleApplyUpgrade = () => {
        if (comparisonSelection) {
            dispatch({ type: 'SET_SELECTION', payload: comparisonSelection });
            // Recalculate will happen via Context Effect
        }
    };

    const handleDownloadAndSend = async () => {
        setIsSubmitting(true);
        try {
            // 1. Send Email / Finalize (Notify Manager)
            // (The prompt says "Trigger 'Manager Notification' email upon confirmation"... Step 3 or 8? 
            // Step 3 was "Trigger... upon confirmation". Step 8 is "Download & Send".
            // I'll assume Step 8 is the final confirmation).

            // 2. Download PDF
            // We can do this in one or two calls. 
            // Let's try doing the PDF download. The backend usually generates PDF.
            // Sending email might be a separate flag or same call.
            // Calls '/api/finalize' with 'x-action': 'download-pdf' -> returns blob.
            // Does it also send email?
            // "Single Button: Download & Send". 
            // I'll assume I need to trigger email sending separately or modify backend.
            // For now, I'll sequence them if separate endpoints exist, or just use the download endpoint
            // and assume backend logs/notifies? 
            // Actually existing code had separate `handleFinalize` (POST) and `handleDownloadPDF` (POST with header).
            // I will call both.

            // A. Notify Manager / Save
            await fetch('/api/finalize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(state),
            });

            // B. Download PDF
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

                alert("Votre devis a été envoyé et téléchargé !");
            } else {
                throw new Error("Erreur PDF");
            }

        } catch (error) {
            console.error(error);
            alert("Une erreur est survenue. Vérifiez la console.");
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
                            {/* Only show material if participant pays */}
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
                            {/* Privatization display */}
                            {pricing.coutPrivatisation > 0 && (
                                <li className="flex justify-between text-emerald-700">
                                    <span>Option Privatisation</span>
                                    <span className="font-semibold">{pricing.coutPrivatisation.toFixed(2)} €</span>
                                </li>
                            )}

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

                {/* Total Client Logic (Total Global) */}
                <div className="mt-8 pt-4 border-t-2 border-celeste-100 flex flex-col items-center bg-celeste-50/50 rounded-lg p-4">
                    <div className="text-sm font-semibold text-celeste-light uppercase tracking-wider mb-1">Total Global Estimé du Séjour</div>
                    <div className="text-4xl font-bold font-serif text-celeste-main">
                        {(pricing.totalStagiaires + pricing.totalOrganisateur).toFixed(2)} €
                    </div>
                    <p className="text-xs text-celeste-text mt-2 italic max-w-lg text-center">
                        Ce montant inclut la part stagiaires (hébergement) et la part organisateur.
                        Le règlement s'effectue généralement : acompte organisateur à la réservation, le solde sur place.
                    </p>
                </div>
            </Card>

            {/* Comparison Upsell */}
            {comparisonPricing && nextFormula && (
                <div
                    onClick={handleApplyUpgrade}
                    className="mt-8 bg-gradient-to-r from-celeste-50 to-white p-6 rounded-xl border border-celeste-gold/30 shadow-sm relative overflow-hidden group cursor-pointer hover:shadow-md transition-all"
                >
                    <div className="absolute top-0 left-0 w-1 h-full bg-celeste-gold group-hover:w-2 transition-all"></div>
                    <div className="md:flex items-center justify-between relative z-10">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <h3 className="font-bold font-serif text-celeste-main text-lg">Envie de plus de confort ?</h3>
                                <div className="bg-celeste-gold text-white text-[10px] px-2 py-0.5 rounded-full font-bold uppercase animate-pulse">Recommandé</div>
                            </div>
                            <p className="text-sm text-celeste-light mb-2">
                                Passez à la formule <span className="font-bold uppercase text-celeste-gold">{nextFormula.replace('_', ' ')}</span> pour seulement :
                            </p>

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
                            <div className="text-3xl font-bold font-serif text-celeste-gold group-hover:scale-110 transition-transform origin-right">
                                {comparisonPricing.prixParStagiaire.toFixed(2)} € <span className="text-sm font-normal text-celeste-light font-sans">/ pers</span>
                            </div>
                            <div className="text-sm text-celeste-main font-medium mb-2">
                                (+{(comparisonPricing.prixParStagiaire - pricing.prixParStagiaire).toFixed(2)} € / pers)
                            </div>

                            {comparisonPricing && (
                                <div className="mt-2 mb-2 bg-white/50 p-2 rounded-lg border border-celeste-gold/20">
                                    <div className="text-sm font-bold text-celeste-main">
                                        Nouveau Total Orga. : {comparisonPricing.totalOrganisateur.toFixed(2)} €
                                    </div>
                                    {(pricing.totalOrganisateur - comparisonPricing.totalOrganisateur) > 1 && (
                                        <div className="text-xs font-bold text-emerald-600">
                                            📉 Économie : {(pricing.totalOrganisateur - comparisonPricing.totalOrganisateur).toFixed(2)} €
                                        </div>
                                    )}
                                </div>
                            )}

                            <Button size="sm" variant="outline" className="mt-2 border-celeste-gold text-celeste-gold hover:bg-celeste-gold hover:text-white">
                                Choisir cette formule
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex flex-col md:flex-row gap-4 justify-between pt-8">
                <Button variant="ghost" onClick={() => dispatch({ type: 'PREV_STEP' })}>
                    Retour
                </Button>

                <Button size="lg" onClick={handleDownloadAndSend} disabled={isSubmitting} className="gap-2 bg-celeste-main hover:bg-celeste-dark text-white shadow-lg shadow-celeste-main/20">
                    <Download className="h-4 w-4" />
                    <Send className="h-4 w-4" />
                    Télécharger & Envoyer
                </Button>
            </div>
        </div>
    );
}
