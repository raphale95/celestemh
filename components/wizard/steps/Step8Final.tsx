"use client";

import React, { useState } from 'react';
import { useQuote } from '@/context/QuoteContext';
import { Button, Card, cn } from '@/components/ui';
import { calculatePricing } from '@/lib/pricing';
import { QuoteSelection } from '@/lib/types';
import { differenceInCalendarDays } from 'date-fns';
import { Check, Download, Send } from 'lucide-react';
import Link from 'next/link';
import { PRICES } from '@/lib/constants';

export function Step8Final() {
    const { state, dispatch } = useQuote();
    const { pricing, selection, event } = state;

    // Privatization Logic
    const nights = (event.startDate && event.endDate) ? Math.max(0, differenceInCalendarDays(event.endDate, event.startDate)) : 0;
    const emptyRooms = Math.max(0, 10 - pricing.nbChambresTotal);
    const privatizationCostInfo = emptyRooms * 100 * nights;

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isDownloaded, setIsDownloaded] = useState(false);
    const [questionObj, setQuestionObj] = useState({ text: "", isSending: false, isSent: false });

    // --- Comparison Logic ---
    let nextFormula: 'venez_leger' | 'cocooning' | null = null;
    if (selection.formula === 'essentiel') nextFormula = 'venez_leger';
    else if (selection.formula === 'venez_leger') nextFormula = 'cocooning';

    let comparisonPricing = null;
    let comparisonSelection: QuoteSelection | null = null;

    if (nextFormula) {
        comparisonSelection = {
            ...selection,
            formula: nextFormula,
        };
        comparisonPricing = calculatePricing(comparisonSelection, event);
    }

    const handleApplyUpgrade = () => {
        if (comparisonSelection) {
            dispatch({ type: 'SET_SELECTION', payload: comparisonSelection });
        }
    };

    const handleDownloadAndSend = async () => {
        setIsSubmitting(true);
        try {
            await fetch('/api/finalize', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(state),
            });

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
                setIsDownloaded(true);
            } else {
                throw new Error("Erreur PDF");
            }

        } catch (error) {
            console.error(error);
            alert("Une erreur est survenue. Vérifiez la console.");
        }
        setIsSubmitting(false);
    };

    const handleSendQuestion = async () => {
        if (!questionObj.text.trim()) return;
        setQuestionObj(prev => ({ ...prev, isSending: true }));
        try {
            await fetch('/api/finalize', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-action': 'send-question'
                },
                body: JSON.stringify({ ...state, userQuestion: questionObj.text }),
            });
            setQuestionObj(prev => ({ ...prev, isSent: true, text: "" }));
        } catch (error) {
            alert("Erreur lors de l'envoi du message.");
        }
        setQuestionObj(prev => ({ ...prev, isSending: false }));
    };

    return (
        <div className="space-y-8">
            <div className="text-center mb-8">
                {/* Header removed as requested */}
            </div>

            {/* Main Recap */}
            <Card className="p-8 border-celeste-main border-2 relative overflow-visible bg-white shadow-xl mt-6">
                {/* RESERVED BADGE REMOVED */}

                <div className="absolute top-0 right-0 bg-celeste-main text-celeste-cream px-6 py-2 rounded-bl-xl font-bold text-sm tracking-widest shadow-md">
                    FORMULE {selection.formula.toUpperCase().replace('_', ' ')}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-6">
                    {/* Columns Swapped: Price/People vs other details or just internal reordering? 
                       "intervertis nb de personne avec le prix" 
                       Currently: Left Col (Stagiaires), Right Col (Organisateur).
                       In Stagiaires Col: Line 1 "Hébergement... (X pers) ... Price". 
                       Maybe user means swap the Display: "X € ... Y Pers"?
                       Or swap the entire columns? Interpretation: "Recap final itervertis nb de ^personne avec le prix"
                       I will swap the content of the lines.
                    */}

                    <div>
                        <h3 className="font-bold font-serif text-celeste-main text-lg mb-4 border-b border-celeste-100 pb-2">Pension complète par stagiaire</h3>

                        <div className="bg-celeste-50/50 rounded-xl p-4 border border-celeste-100 flex flex-col gap-3">
                            {/* Visual Block with Icons */}
                            <div className="flex items-center justify-between">
                                <div className="flex -space-x-2">
                                    {/* Icons would ideally be imported, assuming Bed/Utensils avail or use text/emoji for now if not imported.
                                        I'll import them at top.
                                     */}
                                    <div className="bg-white p-2 rounded-full border border-celeste-100 shadow-sm z-10">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-celeste-main"><path d="M2 4v16" /><path d="M2 8h18a2 2 0 0 1 2 2v10" /><path d="M2 17h20" /><path d="M6 8v9" /></svg>
                                    </div>
                                    <div className="bg-white p-2 rounded-full border border-celeste-100 shadow-sm z-0">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-celeste-main"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" /><path d="M7 2v20" /><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7" /></svg>
                                    </div>
                                </div>
                                <div className="text-right">
                                    {/* Top Price removed as requested */}
                                    <span className="block text-xs text-celeste-light uppercase tracking-wider font-bold mb-1">Hébergement & Pension</span>
                                </div>
                            </div>

                            {/* Details Line */}
                            <div className="border-t border-celeste-200 pt-2 mt-1 mx-2">
                                <div className="flex justify-between items-center text-sm text-celeste-text">
                                    <span>Calcul :</span>
                                    <span className="font-mono text-xs bg-white px-2 py-1 rounded border border-celeste-100">
                                        {PRICES.FORMULA[selection.formula]}€ x {nights} nuits x {selection.participants} pers
                                    </span>
                                </div>
                            </div>

                            {/* Per Person Line */}
                            <div className="flex justify-between items-center bg-white p-2 rounded border border-celeste-100 mx-2 mb-1">
                                <span className="text-xs text-celeste-light">Coût par personne</span>
                                <span className="font-bold text-celeste-gold">{pricing.prixParStagiaire.toFixed(2)} € <span className="text-[10px] font-normal text-celeste-light">(hors priv.)</span></span>
                            </div>
                        </div>

                        <ul className="space-y-3 text-sm text-celeste-text mt-4 px-2">
                            {(pricing.coutMaterielTotal > 0 && selection.materialPaidBy === 'participant') && (
                                <li className="flex justify-between">
                                    <span className="font-semibold">{pricing.coutMaterielTotal.toFixed(2)} €</span>
                                    <span>Options / Matériel</span>
                                </li>
                            )}
                            <li className="border-t border-celeste-200 pt-2 flex justify-between items-center font-bold text-lg text-celeste-gold">
                                <span>Total pour {selection.participants} stagiaires</span>
                                <span>{pricing.totalStagiaires.toFixed(2)} €</span>
                            </li>
                        </ul>
                    </div>

                    <div>
                        <h3 className="font-bold font-serif text-celeste-main text-lg mb-4 border-b border-celeste-100 pb-2">Détails Organisateur</h3>
                        <ul className="space-y-3 text-sm text-celeste-text">
                            <li className="flex justify-between">
                                <span className="font-semibold">{pricing.animateurPrincipal.amountToPay.toFixed(2)} €</span>
                                <span>Participation aux frais de pension <span className="text-celeste-gold text-xs">(-{pricing.animateurPrincipal.discountPercent}%)</span></span>
                            </li>
                            {pricing.intervenantSupp && (
                                <li className="flex justify-between">
                                    <span className="font-semibold">{pricing.intervenantSupp.amountToPay.toFixed(2)} €</span>
                                    <span>Intervenant Suppl. <span className="text-celeste-gold text-xs">(-{100 - pricing.intervenantSupp.percentToPay}%)</span></span>
                                </li>
                            )}
                            <li className="flex justify-between border-t border-celeste-100 pt-1 mt-1">
                                <span className="font-semibold">{pricing.coutSalleTotal.toFixed(2)} €</span>
                                <span>Location Salle ({selection.room.replace('_', ' + ')})</span>
                            </li>

                            {(pricing.coutMaterielTotal > 0 && (selection.materialPaidBy === 'organizer' || !selection.materialPaidBy)) && (
                                <li className="flex justify-between">
                                    <span className="font-semibold">{pricing.coutMaterielTotal.toFixed(2)} €</span>
                                    <span>Options / Matériel perçu</span>
                                </li>
                            )}
                            <li className="border-t border-celeste-200 pt-2 flex justify-between font-bold text-lg text-celeste-main">
                                <span>{pricing.totalOrganisateur.toFixed(2)} €</span>
                                <span>Total Organisateur</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Privatization Cost Display - Separated */}
                {pricing.coutPrivatisation > 0 && (
                    <div className="mt-6 pt-4 border-t border-celeste-100">
                        <div className="flex justify-between items-center text-emerald-800 bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                            <span className="font-bold">Option Privatisation (Coût Global)</span>
                            <span className="font-bold text-lg">{pricing.coutPrivatisation.toFixed(2)} €</span>
                        </div>
                    </div>
                )}

                {/* Total Client Logic (Total Global) */}
                <div className="mt-8 pt-4 border-t-2 border-celeste-100 flex flex-col items-center bg-celeste-50/50 rounded-lg p-4">
                    <div className="text-sm font-semibold text-celeste-light uppercase tracking-wider mb-1">Total Global Estimé du Séjour</div>
                    <div className="text-4xl font-bold font-serif text-celeste-main">
                        {(pricing.totalStagiaires + pricing.totalOrganisateur + pricing.coutPrivatisation).toFixed(2)} €
                    </div>
                </div>
            </Card>

            {/* Privatization Info Block - HIDDEN if ESSENTIEL */}
            {(!selection.privatization && emptyRooms > 0 && selection.formula !== 'essentiel') && (
                <Card className="mt-8 p-6 bg-amber-50/50 border-2 border-amber-200 text-center space-y-2 dashed-border">
                    <p className="text-celeste-main text-lg">
                        En choisissant l'option privatisation, vous réservez l'intégralité du lieu pour votre groupe. Cela garantit qu'aucun autre groupe ou individu ne sera présent sur le site pendant votre séjour.
                    </p>
                    <p className="text-celeste-main font-bold">
                        Il reste {emptyRooms} chambres vacantes.
                    </p>
                    <p className="text-celeste-main">
                        Coût pour privatisation : <span className="font-bold text-celeste-gold">{privatizationCostInfo.toFixed(2)} €</span>
                    </p>
                </Card>
            )}

            {/* Comparison Upsell - ENHANCED VERSION */}
            {comparisonPricing && nextFormula && (
                <div
                    className="mt-8 bg-celeste-50 p-6 rounded-xl border border-celeste-100 relative group"
                >
                    <div className="absolute top-0 right-0 bg-celeste-gold text-white text-[10px] px-3 py-1 rounded-bl-lg font-bold uppercase">Suggestion</div>

                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="text-left space-y-3 flex-1">
                            <h3 className="font-bold font-serif text-celeste-main text-2xl">Passez à la formule {nextFormula.replace('_', ' ')}</h3>

                            <ul className="text-sm text-celeste-text space-y-1">
                                {nextFormula === 'venez_leger' ? (
                                    <>
                                        <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600" /> <strong>Tout inclus</strong> : voyagez l'esprit libre</li>
                                        <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600" /> Matériel Yoga & Linges inclus</li>
                                    </>
                                ) : nextFormula === 'cocooning' ? (
                                    <>
                                        <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600" /> <strong>Confort Optimal</strong> : Chambres de 2 (vs 3)</li>
                                        <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600" /> Salle Pina à -50% & Atelier offert</li>
                                        <li className="flex items-center gap-2"><Check className="h-4 w-4 text-emerald-600" /> Tout inclus (Lits, Ménage, Matériel)</li>
                                    </>
                                ) : (
                                    <li>Profitez de plus de services.</li>
                                )}
                            </ul>

                            <div className="mt-4 p-3 bg-white rounded-lg border border-celeste-100 inline-block shadow-sm">
                                <div className="text-xs text-celeste-light uppercase tracking-wider mb-1">Nouveau Coût Organisateur</div>
                                <div className="text-3xl font-bold text-celeste-main">
                                    {comparisonPricing.totalOrganisateur.toFixed(2)} €
                                </div>
                                {pricing.totalOrganisateur > comparisonPricing.totalOrganisateur && (
                                    <div className="text-sm font-bold text-emerald-600 mt-1">
                                        Vous économisez {(pricing.totalOrganisateur - comparisonPricing.totalOrganisateur).toFixed(2)} € !
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="text-right border-l border-celeste-200 pl-6 flex flex-col items-end gap-3">
                            <div>
                                <div className="text-sm text-celeste-light mb-1">Prix par stagiaire</div>
                                <div className="text-4xl font-bold font-serif text-celeste-gold">
                                    {comparisonPricing.prixParStagiaire.toFixed(2)} €
                                </div>
                                <div className="text-xs text-celeste-text/50">/ pers</div>
                            </div>
                            <Button size="sm" onClick={handleApplyUpgrade} className="bg-celeste-main text-white hover:bg-celeste-dark text-xs">
                                Choisir cette formule
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Question Form Section (Replaces Contact) */}
            <div className="mt-12 border-t pt-8">
                <h3 className="text-xl font-serif font-bold text-celeste-main mb-4 text-center">Une question ?</h3>
                <div className="max-w-xl mx-auto bg-white p-6 rounded-xl border border-celeste-100 shadow-sm">
                    {questionObj.isSent ? (
                        <div className="text-center text-emerald-600 font-bold p-4 bg-emerald-50 rounded-lg animate-in fade-in">
                            Votre question a bien été envoyée ! Nous vous répondrons sous peu.
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <textarea
                                className="w-full p-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-celeste-main focus:border-transparent min-h-[100px]"
                                placeholder="Posez votre question ici..."
                                value={questionObj.text}
                                onChange={(e) => setQuestionObj({ ...questionObj, text: e.target.value })}
                            />
                            <div className="text-center">
                                <Button
                                    onClick={handleSendQuestion}
                                    disabled={questionObj.isSending || !questionObj.text.trim()}
                                    className="bg-celeste-gold hover:bg-celeste-dark text-white w-full"
                                >
                                    {questionObj.isSending ? "Envoi..." : "Envoyer ma question"}
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 justify-between pt-8 items-center">
                <Button variant="ghost" onClick={() => dispatch({ type: 'PREV_STEP' })}>
                    Retour
                </Button>

                <div className="flex flex-col items-center gap-2">
                    <Button size="lg" onClick={handleDownloadAndSend} disabled={isSubmitting} className="gap-2 bg-celeste-main hover:bg-celeste-dark text-white shadow-lg shadow-celeste-main/20">
                        <Download className="h-4 w-4" />
                        Télécharger
                    </Button>
                    {isDownloaded && <span className="text-green-600 font-bold text-sm animate-pulse">✓ Téléchargé !</span>}
                </div>
            </div>
        </div>
    );
}
