"use client";

import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { QuoteState, ClientInfo, EventDetails, QuoteSelection, PricingResult } from '@/lib/types';
import { calculatePricing } from '@/lib/pricing';
import { v4 as uuidv4 } from 'uuid';
import { differenceInCalendarDays } from 'date-fns';

// Initial State
const initialState: QuoteState = {
    id: '', // set on mount
    step: 1,
    lastSentStep: 0,
    client: {
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        eventName: '',
        consent: false,
    },
    event: {
        activity: 'yoga',
        startDate: undefined,
        endDate: undefined,
        nights: 0,
    },
    selection: {
        participants: 8,
        formula: 'essentiel',
        privatization: false,
        room: 'pina',
        heater: false,
        individualEquipment: false,
        audioVideo: false,
        materialPaidBy: 'organizer',
        intervenants: { count: 1 },
    },
    pricing: {
        baseStagiaires: 0,
        coutSalleBase: 0,
        coutChauffage: 0,
        coutSalleTotal: 0,
        coutMaterielIndiv: 0,
        coutSonoVideo: 0,
        coutMaterielTotal: 0,
        totalStagiaires: 0,
        prixParStagiaire: 0,
        animateurPrincipal: { base: 0, discountPercent: 0, percentToPay: 0, amountToPay: 0 },
        totalOrganisateur: 0,
        nbChambresParticipants: 0,
        nbChambresTotal: 0,
        coutPrivatisation: 0
    }
};

// Actions
type Action =
    | { type: 'SET_ID'; payload: string }
    | { type: 'SET_CLIENT_INFO'; payload: ClientInfo }
    | { type: 'SET_EVENT_DETAILS'; payload: Partial<EventDetails> }
    | { type: 'SET_SELECTION'; payload: Partial<QuoteSelection> }
    | { type: 'NEXT_STEP' }
    | { type: 'PREV_STEP' }
    | { type: 'SET_STEP'; payload: number }
    | { type: 'RECALCULATE' }
    | { type: 'MARK_STEP_SENT'; payload: number };

// Reducer
function quoteReducer(state: QuoteState, action: Action): QuoteState {
    switch (action.type) {
        case 'SET_ID':
            return { ...state, id: action.payload };
        case 'SET_CLIENT_INFO':
            return { ...state, client: action.payload };
        case 'SET_EVENT_DETAILS': {
            const newEvent = { ...state.event, ...action.payload };
            if (newEvent.startDate && newEvent.endDate) {
                newEvent.nights = differenceInCalendarDays(newEvent.endDate, newEvent.startDate);
                if (newEvent.nights < 0) newEvent.nights = 0;
            }
            return { ...state, event: newEvent as EventDetails };
        }
        case 'SET_SELECTION': {
            return { ...state, selection: { ...state.selection, ...action.payload } };
        }
        case 'NEXT_STEP':
            return { ...state, step: state.step + 1 };
        case 'PREV_STEP':
            return { ...state, step: Math.max(1, state.step - 1) };
        case 'SET_STEP':
            return { ...state, step: action.payload };
        case 'RECALCULATE': {
            const pricing = calculatePricing(state.selection, state.event);
            return { ...state, pricing };
        }
        case 'MARK_STEP_SENT':
            return { ...state, lastSentStep: action.payload };
        default:
            return state;
    }
}

// Context
const QuoteContext = createContext<{
    state: QuoteState;
    dispatch: React.Dispatch<Action>;
} | null>(null);

export function QuoteProvider({ children }: { children: React.ReactNode }) {
    const [state, dispatch] = useReducer(quoteReducer, initialState);

    // Initialize ID
    useEffect(() => {
        dispatch({ type: 'SET_ID', payload: uuidv4() });
    }, []);

    // Auto-calculate on changes
    useEffect(() => {
        dispatch({ type: 'RECALCULATE' });
    }, [state.selection, state.event.nights, state.event.startDate]);

    // API Sync logic
    useEffect(() => {
        const sendStepNotification = async () => {
            const stepCompleted = state.step - 1;
            const lastSent = state.lastSentStep || 0;

            if (stepCompleted < 1) return;
            if (stepCompleted <= lastSent) return;

            try {
                await fetch('/api/step', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        quoteId: state.id,
                        stepNumber: stepCompleted,
                        payload: state
                    })
                });
                dispatch({ type: 'MARK_STEP_SENT', payload: stepCompleted });
            } catch (error) {
                console.error("API Step Error", error);
            }
        };

        if (state.id) {
            sendStepNotification();
        }
    }, [state.step, state.id, state.lastSentStep]);

    return (
        <QuoteContext.Provider value={{ state, dispatch }}>
            {children}
        </QuoteContext.Provider>
    );
}

export function useQuote() {
    const context = useContext(QuoteContext);
    if (!context) {
        throw new Error('useQuote must be used within a QuoteProvider');
    }
    return context;
}
