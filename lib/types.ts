export type Formula = 'essentiel' | 'venez_leger' | 'cocooning';
export type Room = 'pina' | 'patio' | 'pina_patio';
export type ActivityType = 'yoga' | 'meditation' | 'dev_perso' | 'seminaire' | 'autre';

export interface ClientInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  eventName?: string;
  consent: boolean;
}

export interface EventDetails {
  activity: ActivityType;
  startDate: Date | undefined;
  endDate: Date | undefined;
  startTime?: string;
  endTime?: string;
  nights: number;
}

export interface QuoteSelection {
  participants: number;
  formula: Formula;
  room: Room;
  heater: boolean; // formula 3 only
  individualEquipment: boolean; // formula 1 only (inclus others)
  audioVideo: boolean;
  materialPaidBy: 'organizer' | 'participant'; // New field
  intervenants: {
    count: 1 | 2;
    // We don't store calculated costs here, just the input
  };
}

export interface PricingResult {
  baseStagiaires: number;
  coutSalleBase: number;
  coutChauffage: number;
  coutSalleTotal: number;
  coutMaterielIndiv: number;
  coutSonoVideo: number;
  coutMaterielTotal: number;
  totalStagiaires: number;
  prixParStagiaire: number;

  // Intervenants
  animateurPrincipal: {
    base: number;
    discountPercent: number; // 0, 25, 33, 50, 100 (stored as amount paid: 100, 75, 66, 50, 0)
    // actually rules say "pays X%", so discount is (1-X) or we store "percentToPay".
    // Rules: "paie 75% de baseIntervenant"
    percentToPay: number;
    amountToPay: number;
  };
  intervenantSupp?: {
    base: number;
    percentToPay: number;
    amountToPay: number;
  };
  totalOrganisateur: number; // total animateurs

  // Meta
  nbChambresParticipants: number;
  nbChambresTotal: number; // +1 for organizer
}

export interface QuoteState {
  id: string;
  step: number;
  client: ClientInfo;
  event: EventDetails;
  selection: QuoteSelection;
  pricing: PricingResult;
  lastSentStep?: number;
}
