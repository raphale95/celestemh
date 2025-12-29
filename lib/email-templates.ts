import { QuoteState } from './types';

export function getStepEmailHtml(data: QuoteState) {
    const { client, step, id } = data;
    return `
    <div style="font-family: sans-serif; color: #333;">
      <h2 style="color: #047857;">Nouveau prospect - Étape ${step}/8</h2>
      <p><strong>Client:</strong> ${client.firstName} ${client.lastName} (${client.email})</p>
      <p><strong>ID Devis:</strong> ${id}</p>
      <hr />
      <h3>Progression</h3>
      <p>Le client vient de valider l'étape ${step}.</p>
      <pre style="background: #f4f4f4; padding: 10px; border-radius: 5px;">
        ${JSON.stringify(data.selection, null, 2)}
      </pre>
      <p><a href="${process.env.NEXT_PUBLIC_BASE_URL}">Voir le site</a></p>
    </div>
  `;
}

export function getFinalEmailHtml(data: QuoteState) {
    const { client, id, pricing } = data;
    return `
      <div style="font-family: sans-serif; color: #333;">
        <h2 style="color: #047857;">Simulation Terminée !</h2>
        <p><strong>Client:</strong> ${client.firstName} ${client.lastName}</p>
        <p><strong>Email:</strong> ${client.email}</p>
        <p><strong>Téléphone:</strong> ${client.phone}</p>
        <hr />
        <h3>Récapitulatif financier</h3>
        <ul>
          <li><strong>Formule:</strong> ${data.selection.formula}</li>
          <li><strong>Participants:</strong> ${data.selection.participants}</li>
          <li><strong>Total Stagiaires:</strong> ${pricing.totalStagiaires.toFixed(2)} €</li>
          <li><strong>Total Organisateur:</strong> ${pricing.totalOrganisateur.toFixed(2)} €</li>
        </ul>
        <p>Le devis PDF complet est joint à cet email.</p>
      </div>
    `;
}
