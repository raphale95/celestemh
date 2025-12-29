import { differenceInCalendarDays } from 'date-fns';
import { PricingResult, QuoteSelection, EventDetails } from './types';
import { PRICES, INTERVENANT_THRESHOLDS, ORGANIZER_COST_PERCENTAGE } from './constants';

export function calculatePricing(selection: QuoteSelection, event: EventDetails): PricingResult {
    // 1. Calculate Nights (Duration)
    let nights = 0;
    if (event.startDate && event.endDate) {
        nights = differenceInCalendarDays(event.endDate, event.startDate);
        if (nights < 0) nights = 0;
    }

    // 2. Base Costs per Stagiaire (Boarding/Pension)
    const formulaPrice = PRICES.FORMULA[selection.formula];
    const baseStagiaires = selection.participants * formulaPrice * nights;

    // 3. Room Cost
    let roomDailyPrice = 0;
    const isCocooning = selection.formula === 'cocooning';

    if (selection.room === 'pina') {
        roomDailyPrice = isCocooning ? PRICES.ROOM.pina.discounted : PRICES.ROOM.pina.standard;
    } else if (selection.room === 'patio') {
        roomDailyPrice = isCocooning ? PRICES.ROOM.patio.discounted : PRICES.ROOM.patio.standard;
    } else if (selection.room === 'pina_patio') {
        roomDailyPrice = isCocooning ? PRICES.ROOM.pina_patio.discounted : PRICES.ROOM.pina_patio.standard;
    }

    let heaterCost = 0;
    if (isCocooning && selection.heater) {
        heaterCost = PRICES.OPTIONS.heater * nights;
    }

    const coutSalleBase = roomDailyPrice * nights;
    const coutSalleTotal = coutSalleBase + heaterCost;

    // 4. Material Costs
    let coutMaterielIndiv = 0;
    if (selection.formula === 'essentiel' && selection.individualEquipment) {
        coutMaterielIndiv = selection.participants * PRICES.OPTIONS.individualMaterial * nights;
        // Logic check: Previously I assumed Flat 5euro/pers. 
        // Code here used * nights last time but originally 5 per person. 
        // User request "matos type cousin" implies simple rental. 
        // Constants say "individualMaterial: 5". 
        // I'll revert to FLAT RATE PER PERSON (Not nights) if that was the ambiguity. 
        // But let's look at previous write. `PRICES.OPTIONS.individualMaterial * nights`. 
        // If constant is 5, 5*nights is quite expensive for a cushion. 
        // I will change it to FLAT to be safer/more reasonable, unless proved otherwise.
        // Wait, I am overwriting the file. I should stick to valid logic. 
        // Let's assume FLAT per person for material. 
        // Re-reading Step6Material: "+5 € / pers". It does NOT say "/ pers / jour". It says "/ pers".
        // So I will remove `* nights`.
        coutMaterielIndiv = selection.participants * PRICES.OPTIONS.individualMaterial;
    }

    let coutSonoVideo = 0;
    if (selection.audioVideo) {
        coutSonoVideo = PRICES.OPTIONS.sonoVideo;
    }

    const coutMaterielTotal = coutMaterielIndiv + coutSonoVideo;

    // 5. Cost Attribution (Updated Logic)
    // - Room: Always Organizer (as per previous request "prix de la salle ... payer par l'animateur")
    // - Material: CHOICE (Step 6) -> selection.materialPaidBy
    // - Pension: Stagiaire

    // Default to organizer if undefined (migration safety)
    const materialPayer = selection.materialPaidBy || 'organizer';

    let totalStagiaires = baseStagiaires;
    let totalMaterialOrganisateur = 0;

    if (materialPayer === 'participant') {
        // Add material cost to Stagiaires
        totalStagiaires += coutMaterielTotal;
    } else {
        // Add material cost to Organizer
        totalMaterialOrganisateur = coutMaterielTotal;
    }

    const prixParStagiaire = selection.participants > 0 ? totalStagiaires / selection.participants : 0;

    // 6. Intervenants Costs
    const baseIntervenant = formulaPrice * nights;

    // Determine Tier
    let tier = 'tier1';
    if (selection.participants >= INTERVENANT_THRESHOLDS.tier3.min) tier = 'tier3';
    else if (selection.participants >= INTERVENANT_THRESHOLDS.tier2.min) tier = 'tier2';

    const formulaKey = isCocooning ? 'cocooning' : 'standard';
    // @ts-ignore
    const percentToPayMain = ORGANIZER_COST_PERCENTAGE.main[formulaKey][tier];
    const amountToPayMain = baseIntervenant * (percentToPayMain / 100);

    const animateurPrincipal = {
        base: baseIntervenant,
        discountPercent: 100 - percentToPayMain,
        percentToPay: percentToPayMain,
        amountToPay: amountToPayMain
    };

    let intervenantSupp = undefined;
    if (selection.intervenants.count === 2) {
        // @ts-ignore
        const percentToPayExtra = ORGANIZER_COST_PERCENTAGE.extra[tier];
        const amountToPayExtra = baseIntervenant * (percentToPayExtra / 100);
        intervenantSupp = {
            base: baseIntervenant,
            percentToPay: percentToPayExtra,
            amountToPay: amountToPayExtra
        };
    }

    // 7. Final Organizer Total
    let totalOrganisateur = animateurPrincipal.amountToPay;
    if (intervenantSupp) {
        totalOrganisateur += intervenantSupp.amountToPay;
    }

    // Add Room (Always Organizer)
    totalOrganisateur += coutSalleTotal;

    // Add Material (if designated)
    totalOrganisateur += totalMaterialOrganisateur;

    const capacityPerRoom = isCocooning ? 2 : 3.5;
    const nbChambresParticipants = Math.ceil(selection.participants / capacityPerRoom);
    const nbChambresTotal = nbChambresParticipants + selection.intervenants.count;

    return {
        baseStagiaires,
        coutSalleBase,
        coutChauffage: heaterCost,
        coutSalleTotal,
        coutMaterielIndiv,
        coutSonoVideo,
        coutMaterielTotal,
        totalStagiaires,
        prixParStagiaire,
        animateurPrincipal,
        intervenantSupp,
        totalOrganisateur,
        nbChambresParticipants,
        nbChambresTotal
    };
}
