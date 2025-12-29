import React from 'react';
import { Page, Text, View, Document, StyleSheet, Font, Image } from '@react-pdf/renderer';
import { QuoteState } from '@/lib/types';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

// Register fonts if needed (standard fonts are Helvetica)
// Font.register({ family: 'Roboto', src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf' });

const styles = StyleSheet.create({
    page: { padding: 40, fontFamily: 'Times-Roman', fontSize: 10, color: '#2D2426' },
    header: { marginBottom: 20, flexDirection: 'row', justifyContent: 'space-between', borderBottom: '1 solid #800020', paddingBottom: 10 },
    brand: { fontSize: 22, color: '#800020', fontWeight: 'bold' },
    title: { fontSize: 16, marginBottom: 10, marginTop: 10, color: '#800020' },
    section: { marginBottom: 15, padding: 10, backgroundColor: '#F9F5F0', borderRadius: 4 },
    row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
    label: { color: '#A33045' },
    value: { fontWeight: 'bold', color: '#2D2426' },
    totalRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 8, paddingTop: 8, borderTop: '1 solid #C5A059' },
    totalLabel: { fontSize: 12, fontWeight: 'bold', color: '#800020' },
    totalValue: { fontSize: 12, fontWeight: 'bold', color: '#C5A059' },
    footer: { position: 'absolute', bottom: 30, left: 40, right: 40, textAlign: 'center', color: '#A33045', fontSize: 8 },
    h2: { fontSize: 12, fontWeight: 'bold', marginBottom: 6, color: '#800020' },
});

export const QuotePdf = ({ data, logoPath }: { data: QuoteState, logoPath?: string }) => {
    const { client, event, selection, pricing } = data;
    const formatDate = (d: string | Date | undefined) => d ? format(new Date(d), 'dd MMMM yyyy', { locale: fr }) : '-';

    return (
        <Document>
            <Page size="A4" style={styles.page}>

                {/* Header */}
                <View style={styles.header}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        {logoPath && (
                            <Image
                                src={logoPath}
                                style={{ width: 100, height: 100, marginBottom: 5, marginRight: 15 }}
                            />
                        )}
                        <View>
                            <Text style={styles.brand}>Céleste Maison d'Hôtes</Text>
                            <Text style={styles.label}>Devis estimatif</Text>
                        </View>
                    </View>
                    <View style={{ alignItems: 'flex-end', justifyContent: 'center' }}>
                        <Text>Réf: {data.id.slice(0, 8)}</Text>
                        <Text>Date: {format(new Date(), 'dd/MM/yyyy')}</Text>
                    </View>
                </View>

                {/* Client Info */}
                <View style={styles.section}>
                    <Text style={styles.h2}>Informations Client</Text>
                    <View style={styles.row}><Text style={styles.label}>Nom :</Text><Text style={styles.value}>{client.firstName} {client.lastName}</Text></View>
                    <View style={styles.row}><Text style={styles.label}>Email :</Text><Text style={styles.value}>{client.email}</Text></View>
                    <View style={styles.row}><Text style={styles.label}>Téléphone :</Text><Text style={styles.value}>{client.phone}</Text></View>
                    {client.eventName && <View style={styles.row}><Text style={styles.label}>Événement :</Text><Text style={styles.value}>{client.eventName}</Text></View>}
                </View>

                {/* Event Details */}
                <View style={styles.section}>
                    <Text style={styles.h2}>Détails du Séjour ({event.nights} nuits)</Text>
                    <View style={styles.row}><Text style={styles.label}>Activité :</Text><Text style={styles.value}>{event.activity}</Text></View>
                    <View style={styles.row}><Text style={styles.label}>Dates :</Text><Text style={styles.value}>Du {formatDate(event.startDate)} ({event.startTime || '-'}) au {formatDate(event.endDate)} ({event.endTime || '-'})</Text></View>
                    <View style={styles.row}><Text style={styles.label}>Participants :</Text><Text style={styles.value}>{selection.participants} pers.</Text></View>
                    <View style={styles.row}><Text style={styles.label}>Formule :</Text><Text style={styles.value}>{selection.formula.toUpperCase().replace('_', ' ')}</Text></View>
                    <View style={styles.row}><Text style={styles.label}>Salle :</Text><Text style={styles.value}>{selection.room.toUpperCase()}</Text></View>
                </View>

                {/* Breakdown Stagiaires */}
                {/* Breakdown Stagiaires */}
                <View style={styles.section}>
                    <Text style={styles.h2}>Coûts Stagiaires (Hébergement + Repas)</Text>
                    <View style={styles.row}>
                        <Text style={styles.label}>Hébergement & Pension</Text>
                        <Text style={styles.value}>{pricing.baseStagiaires.toFixed(2)} €</Text>
                    </View>
                    {(pricing.coutMaterielTotal > 0 && selection.materialPaidBy === 'participant') && (
                        <View style={styles.row}>
                            <Text style={styles.label}>Options & Matériel</Text>
                            <Text style={styles.value}>{pricing.coutMaterielTotal.toFixed(2)} €</Text>
                        </View>
                    )}

                    <View style={styles.totalRow}>
                        <Text style={styles.totalLabel}>TOTAL GROUPE STAGIAIRES</Text>
                        <Text style={styles.totalValue}>{pricing.totalStagiaires.toFixed(2)} €</Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'flex-end', marginTop: 2 }}>
                        <Text style={{ fontSize: 9, color: '#64748B' }}>
                            Soit {pricing.prixParStagiaire.toFixed(2)} € / participant
                        </Text>
                    </View>
                </View>

                {/* Breakdown Organisateur */}
                {(pricing.totalOrganisateur > 0 || pricing.animateurPrincipal.amountToPay === 0) && (
                    <View style={styles.section}>
                        <Text style={styles.h2}>Coûts Organisateur (Salle + Matériel + Équipe)</Text>
                        <View style={styles.row}>
                            <Text style={styles.label}>Animateur Principal (Remise {pricing.animateurPrincipal.discountPercent}%)</Text>
                            <Text style={styles.value}>{pricing.animateurPrincipal.amountToPay.toFixed(2)} €</Text>
                        </View>
                        {pricing.intervenantSupp && (
                            <View style={styles.row}>
                                <Text style={styles.label}>Intervenant Suppl. (Remise {100 - pricing.intervenantSupp.percentToPay}%)</Text>
                                <Text style={styles.value}>{pricing.intervenantSupp.amountToPay.toFixed(2)} €</Text>
                            </View>
                        )}
                        <View style={styles.row}>
                            <Text style={styles.label}>Location Salle ({selection.room.replace('_', ' + ')})</Text>
                            <Text style={styles.value}>{pricing.coutSalleTotal.toFixed(2)} €</Text>
                        </View>
                        {(pricing.coutMaterielTotal > 0 && (selection.materialPaidBy === 'organizer' || !selection.materialPaidBy)) && (
                            <View style={styles.row}>
                                <Text style={styles.label}>Options & Matériel</Text>
                                <Text style={styles.value}>{pricing.coutMaterielTotal.toFixed(2)} €</Text>
                            </View>
                        )}
                        <View style={styles.totalRow}>
                            <Text style={styles.totalLabel}>TOTAL ORGANISATEUR</Text>
                            <Text style={styles.totalValue}>{pricing.totalOrganisateur.toFixed(2)} €</Text>
                        </View>
                    </View>
                )}

                <Text style={{ marginTop: 20, fontSize: 10, color: '#800020' }}>
                    Ce document est une simulation tarifaire et ne constitue pas une réservation ferme.
                    Veuillez contacter le gérant pour valider les disponibilités.
                </Text>

                <Text style={styles.footer}>
                    Céleste Maison d'Hôtes - www.celestemaisondhotes.fr - Généré automatiquement
                </Text>
            </Page>
        </Document>
    );
};
