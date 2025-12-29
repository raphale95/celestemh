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
        name: 'Formule Essentiel',
        price: PRICES.FORMULA.essentiel,
        desc: 'L’offre accessible pour tous vos stages.',
        features: ['Hébergement standard', 'Pension complète', 'Matériel Yoga en option (+5€)']
    },
    {
        id: 'venez_leger',
        name: 'Formule Venez Léger',
        price: PRICES.FORMULA.venez_leger,
        desc: 'Tout inclus pour voyager l’esprit libre.',
        features: ['Hébergement standard', 'Pension complète', 'Matériel Yoga inclus', 'Linges de lit & toilette']
    },
    {
        id: 'cocooning',
        name: 'Formule Cocooning',
        price: PRICES.FORMULA.cocooning,
        desc: 'Le confort optimal pour vos stagiaires.',
        features: ['Hébergement Confort (chambres de 2)', 'Pension complète', 'Matériel Yoga inclus', 'Salle Pina à -50%']
    },
];

export function Step4Participants() {
    const { state, dispatch } = useQuote();

    const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<ParticipantsFormData>({
        resolver: zodResolver(participantsSchema),
        defaultValues: {
            participants: state.selection.participants,
            formula: state.selection.formula || 'venez_leger',
        }
    });

    const participantCount = watch('participants');
    const selectedFormula = watch('formula');

    // Logic display rooms
    const divider = selectedFormula === 'cocooning' ? 2 : 3;
    const nbChambresParticipants = Math.ceil((participantCount || 0) / divider);
    const nbChambresTotal = nbChambresParticipants + 1;

    const onSubmit = (data: ParticipantsFormData) => {
        dispatch({ type: 'SET_SELECTION', payload: data });
        dispatch({ type: 'NEXT_STEP' });
    };

    return (
        <div className="space-y-8">
            <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-slate-800">Votre Groupe & Formule</h2>
                <p className="text-slate-500">Combien serez-vous et quel niveau de confort souhaitez-vous ?</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                {/* Participants Input */}
                <div className="max-w-xs mx-auto text-center space-y-2">
                    <Label htmlFor="participants" className="text-lg">Nombre de participants (sans vous)</Label>
                    <Input
                        type="number"
                        id="participants"
                        {...register('participants', { valueAsNumber: true })}
                        className="text-center text-xl h-14"
                        min={8}
                        max={29}
                    />
                    {errors.participants && <p className="text-red-500 text-sm">{errors.participants.message}</p>}

                    {(participantCount >= 8 && participantCount <= 29) && (
                        <p className="text-emerald-600 text-lg font-medium mt-1">
                            {nbChambresParticipants} chambres stagiaires + 1 chambre intervenant = {nbChambresTotal} chambres total
                        </p>
                    )}
                </div>

                {/* Formula Selection */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {FORMULAS.map((f) => (
                        <div
                            key={f.id}
                            onClick={() => setValue('formula', f.id as any)}
                            className={cn(
                                "cursor-pointer rounded-xl border-2 p-4 transition-all hover:shadow-md relative overflow-hidden",
                                selectedFormula === f.id
                                    ? "border-emerald-500 bg-emerald-50/50 ring-1 ring-emerald-500"
                                    : "border-slate-200 bg-white hover:border-emerald-200"
                            )}
                        >
                            {selectedFormula === f.id && (
                                <div className="absolute top-0 right-0 bg-emerald-500 text-white text-xs px-2 py-1 rounded-bl-lg font-bold">CHOISI</div>
                            )}
                            <h3 className="font-bold text-lg text-slate-900">{f.price} € <span className="text-sm font-normal text-slate-500">/j/pers</span></h3>
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
