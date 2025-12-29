"use client";

import React from 'react';
import { useQuote } from '@/context/QuoteContext';
import { Button, Card } from '@/components/ui';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export function Step3Recap() {
    const { state, dispatch } = useQuote();
    const { client, event } = state;

    return (
        <div className="space-y-6">
            <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-slate-800">Vérifions vos informations</h2>
                <p className="text-slate-500">Avant de passer aux détails du séjour, confirmez-vous ces éléments ?</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="p-6 space-y-4">
                    <h3 className="font-semibold text-emerald-800 border-b border-emerald-100 pb-2">Vos Coordonnées</h3>
                    <div className="space-y-2 text-sm text-slate-700">
                        <p><span className="font-medium text-slate-500">Nom :</span> {client.firstName} {client.lastName}</p>
                        <p><span className="font-medium text-slate-500">Email :</span> {client.email}</p>
                        <p><span className="font-medium text-slate-500">Tél :</span> {client.phone}</p>
                        {client.eventName && <p><span className="font-medium text-slate-500">Événement :</span> {client.eventName}</p>}
                    </div>
                </Card>

                <Card className="p-6 space-y-4">
                    <h3 className="font-semibold text-emerald-800 border-b border-emerald-100 pb-2">Le Séjour</h3>
                    <div className="space-y-2 text-sm text-slate-700">
                        <p><span className="font-medium text-slate-500">Activité :</span> <span className="capitalize">{event.activity}</span></p>
                        <p><span className="font-medium text-slate-500">Arrivée :</span> {event.startDate ? format(event.startDate, 'dd MMMM yyyy', { locale: fr }) : '-'} {event.startTime ? `à ${event.startTime}` : ''}</p>
                        <p><span className="font-medium text-slate-500">Départ :</span> {event.endDate ? format(event.endDate, 'dd MMMM yyyy', { locale: fr }) : '-'} {event.endTime ? `à ${event.endTime}` : ''}</p>
                        <p><span className="font-medium text-slate-500">Durée :</span> {event.nights} nuits</p>
                    </div>
                </Card>
            </div>

            <div className="flex justify-between pt-6">
                <Button variant="ghost" onClick={() => dispatch({ type: 'PREV_STEP' })}>
                    Modifier
                </Button>
                <Button size="lg" onClick={() => dispatch({ type: 'NEXT_STEP' })}>
                    Je confirme ces informations
                </Button>
            </div>
        </div>
    );
}
