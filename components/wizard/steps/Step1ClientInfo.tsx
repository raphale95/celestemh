"use client";

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { clientInfoSchema } from '@/lib/schemas';
import { useQuote } from '@/context/QuoteContext';
import { Input, Label, Button, Card } from '@/components/ui';
import { z } from 'zod';

type ClientInfoFormData = z.infer<typeof clientInfoSchema>;

export function Step1ClientInfo() {
    const { state, dispatch } = useQuote();

    const { register, handleSubmit, formState: { errors } } = useForm<ClientInfoFormData>({
        resolver: zodResolver(clientInfoSchema),
        defaultValues: state.client,
    });

    const onSubmit = (data: ClientInfoFormData) => {
        dispatch({ type: 'SET_CLIENT_INFO', payload: data });
        dispatch({ type: 'NEXT_STEP' });
        // Trigger API sync here if needed (via useEffect in Context or direct call)
    };

    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-slate-800">Commençons par faire connaissance</h2>
                <p className="text-slate-500">Ces informations nous permettront de vous envoyer votre devis.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="firstName">Prénom</Label>
                        <Input id="firstName" {...register('firstName')} placeholder="Votre prénom" />
                        {errors.firstName && <p className="text-red-500 text-sm">{errors.firstName.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="lastName">Nom</Label>
                        <Input id="lastName" {...register('lastName')} placeholder="Votre nom" />
                        {errors.lastName && <p className="text-red-500 text-sm">{errors.lastName.message}</p>}
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" {...register('email')} placeholder="exemple@email.com" />
                    {errors.email && <p className="text-red-500 text-sm">{errors.email.message}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="phone">Téléphone</Label>
                    <Input id="phone" type="tel" {...register('phone')} placeholder="06 12 34 56 78" />
                    {errors.phone && <p className="text-red-500 text-sm">{errors.phone.message}</p>}
                </div>

                <div className="space-y-2">
                    <Label htmlFor="eventName">Nom de l'événement (Optionnel)</Label>
                    <Input id="eventName" {...register('eventName')} placeholder="Stage Yoga Hiver..." />
                </div>

                <Card className="p-4 bg-emerald-50 border-emerald-100 mt-6">
                    <div className="flex items-start space-x-3">
                        <input
                            type="checkbox"
                            id="consent"
                            {...register('consent')}
                            className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                        />
                        <div className="space-y-1">
                            <Label htmlFor="consent" className="text-sm text-slate-600 font-normal cursor-pointer select-none">
                                J'accepte que mes informations soient transmises au gérant de Céleste pour établir un devis.
                            </Label>
                            {errors.consent && <p className="text-red-500 text-sm block">{errors.consent.message}</p>}
                        </div>
                    </div>
                </Card>

                <div className="pt-4 flex justify-end">
                    <Button type="submit" size="lg" className="w-full md:w-auto">
                        Continuer
                    </Button>
                </div>
            </form>
        </div>
    );
}
