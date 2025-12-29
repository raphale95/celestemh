"use client";

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { materialsSchema } from '@/lib/schemas';
import { useQuote } from '@/context/QuoteContext';
import { Input, Label, Button, Card, cn } from '@/components/ui';
import { z } from 'zod';
import { PRICES } from '@/lib/constants';

type MaterialsFormData = z.infer<typeof materialsSchema>;

export function Step6Material() {
    const { state, dispatch } = useQuote();
    const { selection, pricing } = state;
    const isEssentiel = selection.formula === 'essentiel';

    const { register, handleSubmit, watch } = useForm<MaterialsFormData>({
        resolver: zodResolver(materialsSchema) as any,
        defaultValues: {
            individualEquipment: selection.individualEquipment,
            audioVideo: selection.audioVideo,
            materialPaidBy: selection.materialPaidBy || 'organizer', // Default
        }
    });

    const onSubmit = (data: MaterialsFormData) => {
        dispatch({ type: 'SET_SELECTION', payload: data });
        dispatch({ type: 'NEXT_STEP' });
    };

    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold font-serif text-celeste-main">Équipements & Matériel</h2>
                <p className="text-celeste-light">De quoi aurez-vous besoin sur place ?</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">

                {/* Materiel Individuel */}
                <Card className={cn("p-6 border-2 transition-all hover:shadow-sm bg-white", isEssentiel ? "border-celeste-100" : "border-celeste-main bg-celeste-50/30")}>
                    <div className="flex items-start justify-between">
                        <div className="space-y-1">
                            <h3 className="font-bold font-serif text-lg text-celeste-main">Matériel de pratique individuel</h3>
                            <p className="text-sm text-celeste-text">Tapis de yoga, coussins, couvertures.</p>
                            {!isEssentiel && <span className="inline-block bg-celeste-100 text-celeste-main text-xs px-2 py-0.5 rounded-full font-bold mt-1">INCLUS DANS VOTRE FORMULE</span>}
                        </div>

                        {isEssentiel ? (
                            <div className="flex flex-col items-end">
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="individualEquipment"
                                        {...register('individualEquipment')}
                                        className="h-5 w-5 rounded border-celeste-200 text-celeste-main focus:ring-celeste-gold"
                                    />
                                    <Label htmlFor="individualEquipment" className="font-bold text-base cursor-pointer text-celeste-main">
                                        +{PRICES.OPTIONS.individualMaterial} € <span className="text-sm font-normal">/ pers</span>
                                    </Label>
                                </div>
                            </div>
                        ) : (
                            <div className="text-celeste-gold font-bold">0 €</div>
                        )}
                    </div>
                </Card>

                {/* Sono / Video */}
                <Card className="p-6 border-2 border-celeste-100 transition-all hover:bg-celeste-50/50 bg-white">
                    <div className="flex items-start justify-between">
                        <div className="space-y-1">
                            <h3 className="font-bold font-serif text-lg text-celeste-main">Pack Sono & Vidéo</h3>
                            <p className="text-sm text-celeste-text">Enceinte puissante, micro, vidéoprojecteur.</p>
                        </div>
                        <div className="flex flex-col items-end">
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="audioVideo"
                                    {...register('audioVideo')}
                                    className="h-5 w-5 rounded border-celeste-200 text-celeste-main focus:ring-celeste-gold"
                                />
                                <Label htmlFor="audioVideo" className="font-bold text-base cursor-pointer text-celeste-main">
                                    +{PRICES.OPTIONS.sonoVideo} € <span className="text-sm font-normal">/ séjour</span>
                                </Label>
                            </div>
                        </div>
                    </div>
                </Card>

                {/* Qui paye le matériel ? */}
                {(watch('individualEquipment') || watch('audioVideo')) && (
                    <Card className="p-6 border border-celeste-100 bg-celeste-50/50">
                        <h3 className="font-bold font-serif text-lg text-celeste-main mb-2">Qui prend en charge ces frais ?</h3>
                        <p className="text-sm text-celeste-light mb-4">Vous pouvez choisir d'intégrer ces coûts à votre charge ou de les laisser aux participants.</p>

                        <div className="flex gap-4">
                            <label className={cn(
                                "flex-1 cursor-pointer rounded-lg border-2 p-4 transition-all text-center",
                                watch('materialPaidBy') === 'organizer'
                                    ? "border-celeste-main bg-white ring-1 ring-celeste-main"
                                    : "border-celeste-100 hover:bg-white"
                            )}>
                                <input
                                    type="radio"
                                    value="organizer"
                                    className="sr-only"
                                    {...register('materialPaidBy')}
                                />
                                <div className="font-bold text-celeste-main">L'Organisateur</div>
                                <div className="text-xs text-celeste-light">Inclus dans votre facture</div>
                            </label>

                            <label className={cn(
                                "flex-1 cursor-pointer rounded-lg border-2 p-4 transition-all text-center",
                                watch('materialPaidBy') === 'participant'
                                    ? "border-celeste-main bg-white ring-1 ring-celeste-main"
                                    : "border-celeste-100 hover:bg-white"
                            )}>
                                <input
                                    type="radio"
                                    value="participant"
                                    className="sr-only"
                                    {...register('materialPaidBy')}
                                />
                                <div className="font-bold text-celeste-main">Les Participants</div>
                                <div className="text-xs text-celeste-light">Ajouté à leur tarif</div>
                            </label>
                        </div>
                    </Card>
                )}

                <div className="flex justify-between pt-6">
                    <Button type="button" variant="ghost" onClick={() => dispatch({ type: 'PREV_STEP' })}>
                        Retour
                    </Button>
                    <Button type="submit" size="lg">
                        Continuer
                    </Button>
                </div>
            </form>
        </div>
    );
}
