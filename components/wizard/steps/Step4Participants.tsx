"use client";

import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { participantsSchema } from '@/lib/schemas';
import { useQuote } from '@/context/QuoteContext';
import { Input, Label, Button, Card, cn } from '@/components/ui';
import { z } from 'zod';
import { PRICES } from '@/lib/constants';

type ParticipantsFormData = z.infer<typeof participantsSchema>;

const FORMULAS = [
    {
        id: 'essentiel',
        name: 'Essentiel',
        price: PRICES.FORMULA.essentiel,
        desc: 'L’offre accessible pour tous vos stages.',
        features: ['Hébergement standard (chambres de 3)', 'Pension complète + pause', 'Matériel Yoga en option (+5€)', 'Linges de lit en option (+12€)']
    },
    {
        id: 'venez_leger',
        name: 'Venez Léger',
        price: PRICES.FORMULA.venez_leger,
        desc: 'Tout inclus pour voyager l’esprit libre.',
        features: ['Hébergement standard (chambres de 3)', 'Pension complète + pause', 'Matériel Yoga inclus', 'Linges de lit & toilette inclus']
    },
    {
        id: 'cocooning',
        name: 'Cocooning',
        price: PRICES.FORMULA.cocooning,
        desc: 'Le confort optimal pour vos stagiaires.',
        features: ['Hébergement Confort (chambres de 2)', 'Pension complète + pause', 'Matériel Yoga inclus', 'Linges de lit & toilette inclus', 'Salle Pina à -50%', 'Atelier d’1 heure offert (produits au naturel, speed cooking, zumba)']
    },
];

export function Step4Participants() {
    const { state, dispatch } = useQuote();

    const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<ParticipantsFormData>({
        resolver: zodResolver(participantsSchema) as any,
        defaultValues: {
            participants: state.selection.participants,
            formula: state.selection.formula || 'venez_leger',
            privatization: state.selection.privatization ?? false,
        }
    });

    const participantCount = watch('participants');
    const selectedFormula = watch('formula');

    // Logic display rooms
    const divider = selectedFormula === 'cocooning' ? 2 : 3;
    const nbChambresParticipants = Math.ceil((participantCount || 0) / divider);
    const nbChambresTotal = nbChambresParticipants + 1;

    // Determine available options
    const canPrivatize = selectedFormula === 'venez_leger' || selectedFormula === 'cocooning';

    const onSubmit = (data: ParticipantsFormData) => {
        dispatch({ type: 'SET_SELECTION', payload: data });
        dispatch({ type: 'NEXT_STEP' });
    };

    return (
        <div className="space-y-8">
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Votre Groupe & Formule</h2>
                <p className="text-slate-500">Choisissez votre niveau de confort et la taille du groupe.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-10">

                {/* 1. Formula Selection (Bubbles) */}
                <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {FORMULAS.map((f) => (
                            <div
                                key={f.id}
                                onClick={() => setValue('formula', f.id as any)}
                                className={cn(
                                    "cursor-pointer rounded-xl border-2 p-4 transition-all hover:shadow-md relative overflow-hidden group",
                                    selectedFormula === f.id
                                        ? "border-emerald-500 bg-emerald-50/50 ring-1 ring-emerald-500"
                                        : "border-slate-200 bg-white hover:border-emerald-200"
                                )}
                            >
                                {selectedFormula === f.id && (
                                    <div className="absolute top-0 right-0 bg-emerald-500 text-white text-xs px-2 py-1 rounded-bl-lg font-bold">CHOISI</div>
                                )}
                                <h3 className="font-bold text-lg text-slate-900 group-hover:text-emerald-700 transition-colors">{f.price} € <span className="text-sm font-normal text-slate-500">/j/pers</span></h3>
                                <div className="font-medium text-emerald-800 mb-2">{f.name}</div>
                                <p className="text-xs text-slate-500 mb-4 h-8">{f.desc}</p>
                                <ul className="text-xs space-y-1 text-slate-600">
                                    {f.features.map((feat, i) => (
                                        <li key={i} className="flex items-start">
                                            <span className="mr-1 text-emerald-500">•</span> {feat}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                    {errors.formula && <p className="text-red-500 text-sm text-center">{errors.formula.message}</p>}
                </div>

                {/* 2. Options for F2/F3 */}
                {canPrivatize && (
                    <Card className="p-4 border-emerald-100 bg-emerald-50/30">
                        <div className="flex items-center space-x-3">
                            <input
                                type="checkbox"
                                id="privatization"
                                {...register('privatization')}
                                className="h-5 w-5 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-500"
                            />
                            <div>
                                <Label htmlFor="privatization" className="font-bold text-slate-800 cursor-pointer text-base">
                                    Option Privatisation du lieu
                                </Label>
                                <p className="text-sm text-slate-600">
                                    Garanti l'exclusivité du lieu (+100€/nuit par chambre vide restante).
                                </p>
                            </div>
                        </div>
                    </Card>
                )}


                {/* 3. Participants Input & Room Calc */}
                <div className="max-w-md mx-auto text-center space-y-4 pt-4 border-t border-slate-100">
                    <div className="space-y-2">
                        <Label htmlFor="participants" className="text-lg font-medium text-slate-700">Nombre de participants (stagiaires)</Label>
                        <div className="flex justify-center">
                            <Input
                                type="number"
                                id="participants"
                                {...register('participants', { valueAsNumber: true })}
                                className="text-center text-3xl h-16 w-32 font-bold text-emerald-900 border-2 focus:border-emerald-500"
                                min={8}
                                max={29}
                            />
                        </div>
                        {errors.participants && <p className="text-red-500 text-sm">{errors.participants.message}</p>}
                    </div>

                    {(participantCount >= 8 && participantCount <= 29) && (
                        <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-100 animate-in fade-in zoom-in duration-300">
                            <p className="text-emerald-800 text-xl font-bold">
                                {watch('privatization') ? "10 Chambres (Privatisation Complète)" : `${nbChambresTotal} Chambres au total`}
                            </p>
                            {!watch('privatization') && (
                                <p className="text-emerald-600 text-sm font-medium">
                                    (dont {nbChambresParticipants} pour les stagiaires et 1 pour l'intervenant)
                                </p>
                            )}
                        </div>
                    )}
                </div>

                <div className="flex justify-between pt-4">
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
