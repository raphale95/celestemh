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
        // Flat rate: 5€/day, max 10€ per person
        const costPerPerson = Math.min(10, 5 * nights);
        coutMaterielIndiv = selection.participants * costPerPerson;
    }

    let coutSonoVideo = 0;
    if (selection.audioVideo && !isCocooning) { // Included in Cocooning
        coutSonoVideo = PRICES.OPTIONS.sonoVideo;
    }

    const coutMaterielTotal = coutMaterielIndiv + coutSonoVideo;

    // 5. Cost Attribution
    const materialPayer = selection.materialPaidBy || 'organizer';

    let totalStagiaires = baseStagiaires;
    let totalMaterialOrganisateur = 0;

    // Distribute Individual Material Cost
    if (materialPayer === 'organizer') {
        totalMaterialOrganisateur += coutMaterielIndiv;
    }
    // If 'participant', it's "Paid on site" => 0€ in quote for them, 0€ for organizer.

    // Sono Video ALWAYS to Organizer (unless Cocooning where it's 0/included)
    // "le pack sono vidéo est payé automatiquement par l'organisateur"
    totalMaterialOrganisateur += coutSonoVideo;

    const prixParStagiaire = selection.participants > 0 ? (baseStagiaires / selection.participants) : 0;
    // Note: prixParStagiaire only reflects boarding if materials are paid on site or by organizer. 
    // If materials were added to stagiaires, it would be higher, but request says "0€ in quote" for participant payment.

    // 6. Rooms Calculation (Needed for Privatization)
    const capacityPerRoom = isCocooning ? 2 : 3; // F3=2, F1/F2=3 (Updated Step 4 Text says F1/F2 = chb de 3)
    const nbChambresParticipants = Math.ceil(selection.participants / capacityPerRoom);
    const nbChambresTotal = nbChambresParticipants + selection.intervenants.count;

    // 7. Privatization Logic
    let coutPrivatisation = 0;
    if (selection.privatization && (selection.formula === 'venez_leger' || selection.formula === 'cocooning')) {
        const occupied = nbChambresTotal;
        const emptyRooms = Math.max(0, 10 - occupied);
        coutPrivatisation = emptyRooms * 100 * nights;
    }

    // 8. Intervenants Costs
    const baseIntervenant = formulaPrice * nights;

    // Determine Percent To Pay (Updated Rules)
    let percentToPayMain = 100;
    if (selection.formula === 'cocooning') {
        percentToPayMain = 50; // F3: 50% fixed
    } else if (selection.formula === 'venez_leger') {
        percentToPayMain = selection.participants >= 12 ? 0 : 66; // F2: -12p=66%, +12p=Free
    } else { // essentiel
        percentToPayMain = selection.participants >= 12 ? 0 : 75; // F1: -12p=75%, +12p=Free
    }

    const amountToPayMain = baseIntervenant * (percentToPayMain / 100);

    const animateurPrincipal = {
        base: baseIntervenant,
        discountPercent: 100 - percentToPayMain,
        percentToPay: percentToPayMain,
        amountToPay: amountToPayMain
    };

    let intervenantSupp = undefined;
    if (selection.intervenants.count === 2) {
        // Extra intervenant logic not explicitly changed in "Feature Request Round 2"?
        // Prompt says "Update Discount Rules (F1... F2... F3...)".
        // It doesn't specify if this applies to BOTH intervenants or just Main.
        // Usually, 2nd intervenant has different rules (often full price or specific).
        // I will assume the rule applies to the Main Intervenant ("animateurPrincipal").
        // For the 2nd, I'll keep the previous Tier-based logic OR apply full price if not specified?
        // Let's keep existing tier constant logic for extra intervenant to be safe, 
        // OR apply same rule? "Intervenants" plural in title?
        // Prompt says "Step 7 (Intervenants) ... Update Discount Rules".
        // Let's assume it applies to the "Organizer Board Cost" generally.
        // But usually 2nd is paid.
        // I'll stick to maintaining `tier` logic for 2nd one unless I see specific instruction.
        // Wait, "ORGANIZER_COST_PERCENTAGE" constant was used.
        // I should probably simplify and assume the 2nd one mirrors the first OR stays full price.
        // Let's stick to the prompt: "Show Organizer Board Cost Details".
        // I will just use the same `percentToPayMain` for simplicity? No, that's risky.
        // I will keep the Tier logic for the second one as it wasn't explicitly revoked, 
        // but update the Main one as requested.
        // Existing constants for Extra: `ORGANIZER_COST_PERCENTAGE.extra`.

        // Recalculate tier just for Extra
        let tier = 'tier1';
        if (selection.participants >= INTERVENANT_THRESHOLDS.tier3.min) tier = 'tier3';
        else if (selection.participants >= INTERVENANT_THRESHOLDS.tier2.min) tier = 'tier2';

        // @ts-ignore
        const percentToPayExtra = ORGANIZER_COST_PERCENTAGE.extra[tier]; // Keep this
        const amountToPayExtra = baseIntervenant * (percentToPayExtra / 100);

        intervenantSupp = {
            base: baseIntervenant,
            percentToPay: percentToPayExtra,
            amountToPay: amountToPayExtra
        };
    }

    // 9. Final Organizer Total
    let totalOrganisateur = animateurPrincipal.amountToPay;
    if (intervenantSupp) {
        totalOrganisateur += intervenantSupp.amountToPay;
    }

    // Add Room + Privatization (Organizer pays)
    totalOrganisateur += coutSalleTotal;
    totalOrganisateur += coutPrivatisation;

    // Add Material (if designated)
    totalOrganisateur += totalMaterialOrganisateur;

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
        nbChambresTotal,
        coutPrivatisation
    };
}
