import { z } from 'zod';

export const clientInfoSchema = z.object({
    firstName: z.string().min(2, "Le prénom est requis"),
    lastName: z.string().min(2, "Le nom est requis"),
    email: z.string().email("Email invalide"),
    phone: z.string().min(10, "Numéro de téléphone requis"),
    eventName: z.string().optional(),
    consent: z.boolean().refine((val) => val === true, {
        message: "Vous devez accepter les conditions pour continuer"
    }),
});

export const eventDetailsSchema = z.object({
    activity: z.enum(['yoga', 'meditation', 'dev_perso', 'seminaire', 'autre'] as const),
    startDate: z.date(),
    endDate: z.date(),
    startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Format HH:MM requis"),
    endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Format HH:MM requis"),
}).refine((data) => {
    if (!data.startDate || !data.endDate) return false;
    return data.endDate > data.startDate;
}, {
    message: "La date de fin doit être après la date de début",
    path: ["endDate"],
});

export const participantsSchema = z.object({
    participants: z.number()
        .min(8, "Minimum 8 participants")
        .max(29, "Maximum 29 participants"),
    formula: z.enum(['essentiel', 'venez_leger', 'cocooning']),
    privatization: z.boolean().default(false),
});

export const roomSchema = z.object({
    room: z.enum(['pina', 'patio', 'pina_patio']),
    heater: z.boolean().default(false),
});

export const materialsSchema = z.object({
    individualEquipment: z.boolean().default(false),
    audioVideo: z.boolean().default(false),
    materialPaidBy: z.enum(['organizer', 'participant']).default('organizer'),
});

export const intervenantsSchema = z.object({
    // Accept string or number input, coerce to number, enforce 1 or 2
    count: z.union([z.string(), z.number()])
        .transform((val) => Number(val))
        .refine((val) => val === 1 || val === 2)
        .transform((val) => val as 1 | 2),
});

// Full state schema for API validation if needed
export const quoteSchema = z.object({
    client: clientInfoSchema,
    event: eventDetailsSchema,
    selection: participantsSchema.merge(roomSchema).merge(materialsSchema).merge(intervenantsSchema),
});
