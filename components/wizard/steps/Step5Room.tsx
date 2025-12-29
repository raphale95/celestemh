"use client";

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { roomSchema } from '@/lib/schemas';
import { useQuote } from '@/context/QuoteContext';
import { Input, Label, Button, Card, cn } from '@/components/ui';
import { z } from 'zod';
import { PRICES } from '@/lib/constants';

type RoomFormData = z.infer<typeof roomSchema>;

export function Step5Room() {
    const { state, dispatch } = useQuote();
    const { selection } = state;
    const isCocooning = selection.formula === 'cocooning';

    const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<RoomFormData>({
        resolver: zodResolver(roomSchema) as any,
        defaultValues: {
            room: selection.room,
            heater: selection.heater,
        }
    });

    const selectedRoom = watch('room');
    const heater = watch('heater');

    const getPrice = (r: 'pina' | 'patio') => {
        return isCocooning ? PRICES.ROOM[r].discounted : PRICES.ROOM[r].standard;
    };

    const onSubmit = (data: RoomFormData) => {
        dispatch({ type: 'SET_SELECTION', payload: data });
        dispatch({ type: 'NEXT_STEP' });
    };

    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold font-serif text-celeste-main">Votre Salle de Pratique</h2>
                <p className="text-celeste-light">Choisissez l'espace adapté à votre activité.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Salles */}
                    <div
                        onClick={() => setValue('room', 'pina')}
                        className={cn(
                            "cursor-pointer rounded-xl border-2 p-4 transition-all hover:shadow-md bg-white",
                            selectedRoom === 'pina'
                                ? "border-celeste-main bg-celeste-50 ring-1 ring-celeste-main"
                                : "border-celeste-100 hover:border-celeste-200"
                        )}
                    >
                        <h3 className="text-lg font-bold font-serif text-celeste-main mb-1">Salle Pina</h3>
                        <div className="text-xl font-bold text-celeste-gold mb-2">{getPrice('pina')} € <span className="text-sm font-normal text-celeste-light">/jour</span></div>
                        <p className="text-xs text-celeste-text">Grand espace lumineux avec parquet, idéal pour les grands groupes.</p>
                    </div>

                    <div
                        onClick={() => setValue('room', 'patio')}
                        className={cn(
                            "cursor-pointer rounded-xl border-2 p-4 transition-all hover:shadow-md bg-white",
                            selectedRoom === 'patio'
                                ? "border-celeste-main bg-celeste-50 ring-1 ring-celeste-main"
                                : "border-celeste-100 hover:border-celeste-200"
                        )}
                    >
                        <h3 className="text-lg font-bold font-serif text-celeste-main mb-1">Le Patio</h3>
                        <div className="text-xl font-bold text-celeste-gold mb-2">{getPrice('patio')} € <span className="text-sm font-normal text-celeste-light">/jour</span></div>
                        <p className="text-xs text-celeste-text">Espace intime et chaleureux, parfait pour la méditation.</p>
                    </div>

                    <div
                        onClick={() => setValue('room', 'pina_patio')}
                        className={cn(
                            "cursor-pointer rounded-xl border-2 p-4 transition-all hover:shadow-md bg-white",
                            selectedRoom === 'pina_patio'
                                ? "border-celeste-main bg-celeste-50 ring-1 ring-celeste-main"
                                : "border-celeste-100 hover:border-celeste-200"
                        )}
                    >
                        <h3 className="text-lg font-bold font-serif text-celeste-main mb-1">Pina + Patio</h3>
                        {/* @ts-ignore */}
                        <div className="text-xl font-bold text-celeste-gold mb-2">{getPrice('pina_patio')} € <span className="text-sm font-normal text-celeste-light">/jour</span></div>
                        <p className="text-xs text-celeste-text">Profitez des deux espaces pour une flexibilité maximale.</p>
                    </div>
                </div>

                {isCocooning && (
                    <Card className="p-4 bg-celeste-50 border-celeste-100 mt-4">
                        <div className="flex items-center space-x-3">
                            <input
                                type="checkbox"
                                id="heater"
                                {...register('heater')}
                                className="h-5 w-5 rounded border-celeste-300 text-celeste-main focus:ring-celeste-gold"
                            />
                            <div>
                                <Label htmlFor="heater" className="font-bold text-celeste-main cursor-pointer text-base">
                                    Option Chauffage (+{PRICES.OPTIONS.heater} € / jour)
                                </Label>
                                <p className="text-sm text-celeste-light">Recommandé en hiver pour la salle Pina (hauteur sous plafond).</p>
                            </div>
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
