"use client";

import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { eventDetailsSchema } from '@/lib/schemas';
import { useQuote } from '@/context/QuoteContext';
import { Input, Label, Button, Card } from '@/components/ui';
import { z } from 'zod';
import { differenceInCalendarDays, format } from 'date-fns';
import { TIME_SLOTS } from '@/lib/time-slots';

type EventFormData = z.infer<typeof eventDetailsSchema>;

const ACTIVITIES = [
    { value: 'yoga', label: 'Yoga' },
    { value: 'meditation', label: 'Méditation' },
    { value: 'dev_perso', label: 'Développement Personnel' },
    { value: 'seminaire', label: 'Séminaire' },
    { value: 'autre', label: 'Autre' },
];

export function Step2ActivityDates() {
    const { state, dispatch } = useQuote();

    const { register, control, handleSubmit, watch, formState: { errors } } = useForm<EventFormData>({
        resolver: zodResolver(eventDetailsSchema),
        defaultValues: {
            activity: state.event.activity as any,
            startDate: state.event.startDate ? new Date(state.event.startDate) : undefined,
            endDate: state.event.endDate ? new Date(state.event.endDate) : undefined,
        }
    });

    const startDate = watch('startDate');
    const endDate = watch('endDate');

    // Real-time calculation for display
    const nights = (startDate && endDate)
        ? Math.max(0, differenceInCalendarDays(endDate, startDate))
        : 0;

    const onSubmit = (data: EventFormData) => {
        dispatch({ type: 'SET_EVENT_DETAILS', payload: data });
        dispatch({ type: 'NEXT_STEP' });
    };

    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold font-serif text-celeste-main">Quelle est la nature de votre événement ?</h2>
                <p className="text-celeste-light mt-2">Précisez les dates et le type de stage.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                    <Label htmlFor="activity">Type d'activité</Label>
                    <select
                        id="activity"
                        {...register('activity')}
                        className="flex h-11 w-full rounded-md border border-celeste-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-celeste-gold"
                    >
                        {ACTIVITIES.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                    {errors.activity && <p className="text-red-500 text-sm">{errors.activity.message}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="startDate">Date d'arrivée</Label>
                            <Controller
                                control={control}
                                name="startDate"
                                render={({ field }) => (
                                    <Input
                                        type="date"
                                        value={field.value ? format(field.value, 'yyyy-MM-dd') : ''}
                                        onChange={(e) => field.onChange(e.target.valueAsDate)}
                                    />
                                )}
                            />
                            {errors.startDate && <p className="text-red-500 text-sm">{errors.startDate.message}</p>}
                        </div>


                        <div className="space-y-2">
                            <Label htmlFor="startTime">Heure d'arrivée</Label>
                            <select
                                id="startTime"
                                className="flex h-10 w-full rounded-md border border-celeste-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-celeste-gold disabled:cursor-not-allowed disabled:opacity-50"
                                {...register('startTime')}
                            >
                                <option value="">-- H --</option>
                                {TIME_SLOTS.map(t => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                            {errors.startTime && <p className="text-red-500 text-sm">{errors.startTime.message}</p>}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="endDate">Date de départ</Label>
                            <Controller
                                control={control}
                                name="endDate"
                                render={({ field }) => (
                                    <Input
                                        type="date"
                                        value={field.value ? format(field.value, 'yyyy-MM-dd') : ''}
                                        onChange={(e) => field.onChange(e.target.valueAsDate)}
                                    />
                                )}
                            />
                            {errors.endDate && <p className="text-red-500 text-sm">{errors.endDate.message}</p>}
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="endTime">Heure de départ</Label>
                            <select
                                id="endTime"
                                className="flex h-10 w-full rounded-md border border-celeste-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-celeste-gold disabled:cursor-not-allowed disabled:opacity-50"
                                {...register('endTime')}
                            >
                                <option value="">-- H --</option>
                                {TIME_SLOTS.map(t => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                            {errors.endTime && <p className="text-red-500 text-sm">{errors.endTime.message}</p>}
                        </div>
                    </div>
                </div>

                {(nights > 0) && (
                    <div className="space-y-4">
                        <Card className="p-4 bg-celeste-50 border-celeste-100 flex justify-center text-celeste-main font-serif font-bold italic">
                            Durée du séjour : {nights} nuits
                        </Card>
                        <p className="text-xs text-center text-celeste-light italic">
                            Les horaires d'arrivée et de départ influencent le tarif final mais ne sont pas chiffrés dans ce devis.
                        </p>
                    </div>
                )}

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
