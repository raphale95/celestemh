import { Formula, Room } from './types';

export const PRICES = {
    FORMULA: {
        essentiel: 98,
        venez_leger: 110,
        cocooning: 123,
    },
    ROOM: {
        pina: {
            standard: 160, // F1 & F2
            discounted: 80, // F3
        },
        patio: {
            standard: 100, // F1 & F2
            discounted: 50, // F3
        },
        pina_patio: {
            standard: 210, // User Request
            discounted: 105, // 50%
        },
    },
    OPTIONS: {
        heater: 20, // per day
        individualMaterial: 5, // per person (F1 only)
        sonoVideo: 50, // flat fee per stay
    },
};

// Thresholds for Organizer discounts
export const INTERVENANT_THRESHOLDS = {
    tier1: { min: 8, max: 12 },
    tier2: { min: 13, max: 24 },
    tier3: { min: 25 },
};

// Percent paid by Organizer (Main & Extra) based on Tiers and Formula
// Structure: [Main_F1_2, Main_F3, Extra_All]?
// Better structure:
export const ORGANIZER_COST_PERCENTAGE = {
    // Key: Formula Type -> Tier -> % to pay
    main: {
        standard: { // F1 & F2
            tier1: 75, // 8-12
            tier2: 66, // 13-24
            tier3: 0,  // >24
        },
        cocooning: { // F3
            tier1: 50,
            tier2: 66,
            tier3: 0,
        },
    },
    extra: { // All formulas
        tier1: 100,
        tier2: 66,
        tier3: 0,
    },
};
