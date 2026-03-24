// npm install @react-pdf/renderer
// Usage: <InvoicePDF payment={paymentInfo} />
//        or PDFDownloadLink / PDFViewer (see bottom of file)

import React from 'react';
import {
    Document,
    Page,
    View,
    Text,
    StyleSheet,
} from '@react-pdf/renderer';
import { formatNumber, formatteCurrency } from '../(admin)/stock/functions';
import { useTranslation } from 'react-i18next';




const fmt = {
    date: (d: string | number | Date): string =>
        new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' }),
    amount: (a: string): string =>
        formatteCurrency(a),
};

const STATUS_COLOR = { completed: '#16A34A', pending: '#CA8A04', failed: '#DC2626' };
const STATUS_BG = { completed: '#DCFCE7', pending: '#FEF9C3', failed: '#FEE2E2' };

const C = {
    navy: '#0F172A',
    navy2: '#1E293B',
    slate: '#334155',
    muted: '#94A3B8',
    light: '#F1F5F9',
    white: '#FFFFFF',
    accent: '#6366F1',
    accent2: '#818CF8',
    border: '#E2E8F0',
};

const s = StyleSheet.create({
    page: {
        backgroundColor: C.white,
        fontFamily: 'Helvetica',
        paddingBottom: 25,
    },

    headerBand: {
        backgroundColor: C.navy,
        paddingHorizontal: 18,
        paddingTop: 14,
        paddingBottom: 12,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
    },
    companyName: {
        fontSize: 22,
        fontFamily: 'Helvetica-Bold',
        color: C.white,
        letterSpacing: 0.5,
    },
    companyTagline: {
        fontSize: 9,
        color: C.muted,
        marginTop: 3,
        letterSpacing: 1.5,
    },
    invoiceMeta: { alignItems: 'flex-end' },
    invoiceLabel: {
        fontSize: 9,
        color: C.muted,
        letterSpacing: 2,
        textTransform: 'uppercase',
        marginBottom: 4,
    },
    invoiceNumber: {
        fontSize: 16,
        fontFamily: 'Helvetica-Bold',
        color: C.white,
    },

    statusBadge: {
        marginTop: 8,
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 12,
        alignSelf: 'flex-end',
    },
    statusText: {
        fontSize: 10,
        fontFamily: 'Helvetica-Bold',
    },

    accentStripe: {
        backgroundColor: C.accent,
        height: 4,
    },

    body: {
        paddingHorizontal: 24,
        paddingTop: 16,
    },

    planBlock: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: 24,
        marginBottom: 28,
        height: 20,
    },
    planRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    planName: {
        fontSize: 20,
        fontFamily: 'Helvetica-Bold',
        color: C.white,
        marginBottom: 3,
    },
    planTierBadge: {
        backgroundColor: 'rgba(255,255,255,0.2)',
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 4,
        alignSelf: 'flex-start',
        marginTop: 4,
    },
    planTierText: {
        fontSize: 8,
        fontFamily: 'Helvetica-Bold',
        color: C.white,
        letterSpacing: 1.5,
    },
    amountLabel: {
        fontSize: 9,
        color: 'rgba(255,255,255,0.6)',
        letterSpacing: 1.5,
        marginBottom: 2,
    },
    amountValue: {
        fontSize: 32,
        fontFamily: 'Helvetica-Bold',
        color: C.white,
        letterSpacing: -0.5,
    },
    featuresRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 6,
        marginTop: 4,
    },

    infoSection: {
        flexDirection: 'row',
        gap: 20,
        marginBottom: 18,
        justifyContent: 'space-between',
    },
    infoCard: {
        // flex: 1,
        borderRadius: 10,
        padding: 10,
    },
    infoCardTitle: {
        fontSize: 9,
        fontFamily: 'Helvetica-Bold',
        color: C.slate,
        letterSpacing: 1.5,
        marginBottom: 12,
        textTransform: 'uppercase',
    },
    infoRow: {
        marginBottom: 8,
    },
    infoKey: {
        fontSize: 8,
        color: C.muted,
        marginBottom: 2,
    },
    infoVal: {
        fontSize: 10,
        fontFamily: 'Helvetica-Bold',
        color: C.navy,
    },
    infoValMono: {
        fontSize: 9,
        fontFamily: 'Courier',
        color: C.accent,
    },

    tableSection: { marginVertical: 12 },
    tableTitle: {
        fontSize: 11,
        fontFamily: 'Helvetica-Bold',
        color: C.navy,
        marginBottom: 10,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: C.navy2,
        borderRadius: 6,
        paddingVertical: 8,
        paddingHorizontal: 12,
        marginBottom: 2,
    },
    tableHeaderText: {
        fontSize: 8,
        fontFamily: 'Helvetica-Bold',
        color: C.white,
        letterSpacing: 0.5,
        textTransform: 'uppercase',
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderBottomWidth: 1,
        borderBottomColor: C.border,
    },
    tableRowAlt: { backgroundColor: '#F8FAFC' },
    tableCell: { fontSize: 9, color: C.navy2 },
    col1: { flex: 3 },
    col2: { flex: 1, textAlign: 'center' },
    col3: { flex: 1, textAlign: 'right' },
    col4: { flex: 1, textAlign: 'right' },

    totalsBlock: {
        marginTop: 4,
        marginLeft: 'auto',
        width: 240,
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 5,
        paddingHorizontal: 12,
        borderBottomWidth: 1,
        borderBottomColor: C.border,
    },
    totalKey: { fontSize: 9, color: C.muted },
    totalVal: { fontSize: 9, color: C.navy2, fontFamily: 'Helvetica-Bold' },
    totalRowFinal: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 8,
        backgroundColor: C.navy,
        borderRadius: 6,
        paddingHorizontal: 18,
        marginTop: 4,
    },
    totalKeyFinal: { fontSize: 10, color: C.white, fontFamily: 'Helvetica-Bold' },
    totalValFinal: { fontSize: 12, color: C.white, fontFamily: 'Helvetica-Bold' },

    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: C.navy2,
        paddingHorizontal: 18,
        paddingVertical: 14,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    footerText: { fontSize: 8, color: C.muted },
    footerAccent: { fontSize: 8, color: C.accent2, fontFamily: 'Helvetica-Bold' },

    sectionDivider: {
        height: 1,
        backgroundColor: C.border,
        marginBottom: 20,
    },

    notesBox: {
        borderLeftWidth: 3,
        borderLeftColor: C.accent,
        paddingLeft: 12,
        marginBottom: 24,
    },
    notesTitle: { fontSize: 9, color: C.muted, marginBottom: 4 },
    notesText: { fontSize: 9, color: C.slate },
});


export const PlanInvoice = ({ payment }: { payment: PaymentInfo }) => {

    const ttc = Number(payment.amount) + Number(payment.taxe || "0");
    const { t } = useTranslation('common')

    return (
        <Document
            title={`Facture ${payment.invoice_number}`}
            author="InventoryFlow"
            subject={`Plan ${payment.plan.name}`}
        >
            <Page size="A5" style={s.page}>

                <View style={s.headerBand}>
                    <View style={s.headerRow}>
                        <View>
                            <Text style={s.companyName}>InventoryFlow</Text>
                            <Text style={s.companyTagline}>FACTURATION & ABONNEMENTS</Text>
                            <View style={[s.infoRow, { marginTop: 12 }]}>
                                <Text style={[s.infoKey, { color: C.muted }]}>300 charles street, Toronto ON M5R 2X6</Text>
                            </View>
                            <View style={s.infoRow}>
                                <Text style={[s.infoKey, { color: C.muted }]}>info@inventoryflow.com</Text>
                            </View>
                            <View style={s.infoRow}>
                                <Text style={[s.infoKey, { color: C.muted }]}>+1 (237) 123 456 789</Text>
                            </View>
                        </View>
                        <View style={s.invoiceMeta}>
                            <Text style={s.invoiceLabel}>Numéro de facture</Text>
                            <Text style={s.invoiceNumber}>{payment.invoice_number}</Text>
                            <View
                                style={[
                                    s.statusBadge,
                                    { backgroundColor: STATUS_BG[payment.status] },
                                ]}
                            >
                                <Text style={[s.statusText, { color: STATUS_COLOR[payment.status] }]}>
                                    {t(`payment.status_label.${payment.status}`)}
                                </Text>
                            </View>
                        </View>
                    </View>
                </View>
                <View style={s.accentStripe} />

                <View style={s.body}>

                    <View style={s.infoSection}>
                        <View style={s.infoCard}>
                            <Text style={s.infoCardTitle}>Paiement</Text>
                            <View style={s.infoRow}>
                                <Text style={s.infoKey}>Entreprise</Text>
                                <Text style={s.infoVal}>{payment.enterprise_name.toUpperCase()}</Text>
                            </View>
                            <View style={s.infoRow}>
                                <Text style={s.infoKey}>Méthode</Text>
                                <Text style={s.infoVal}>{payment.payment_method}</Text>
                            </View>
                            <View style={s.infoRow}>
                                <Text style={s.infoKey}>Date de paiement</Text>
                                <Text style={s.infoVal}>{fmt.date(payment.payment_date)}</Text>
                            </View>
                            <View style={s.infoRow}>
                                <Text style={s.infoKey}>Prochaine échéance</Text>
                                <Text style={s.infoVal}>{fmt.date(payment.next_due_date)}</Text>
                            </View>
                        </View>

                        <View style={s.infoCard}>
                            <Text style={s.infoCardTitle}>Référence</Text>
                            <View style={s.infoRow}>
                                <Text style={s.infoKey}>ID Paiement</Text>
                                <Text style={s.infoVal}>{payment.payment_id}</Text>
                            </View>
                            <View style={s.infoRow}>
                                <Text style={s.infoKey}>Créé le</Text>
                                <Text style={s.infoVal}>{fmt.date(payment.created_at)}</Text>
                            </View>
                            <View style={s.infoRow}>
                                <Text style={s.infoKey}>Statut</Text>
                                <Text style={[s.infoValMono, { color: STATUS_COLOR[payment.status] }]}>
                                    {t(`payment.status.${payment.status}`)}
                                </Text>
                            </View>
                        </View>
                    </View>

                    <View style={s.tableSection}>

                        <View style={s.tableHeader}>
                            <Text style={[s.tableHeaderText, s.col1]}>Description</Text>
                            <Text style={[s.tableHeaderText, s.col2]}>Qté</Text>
                            <Text style={[s.tableHeaderText, s.col3]}>P.U.</Text>
                            <Text style={[s.tableHeaderText, s.col4]}>Total</Text>
                        </View>

                        <View style={s.tableRow}>
                            <Text style={[s.tableCell, s.col1]}>
                                Abonnement {payment.plan.name} — {new Date(payment.payment_date).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                            </Text>
                            <Text style={[s.tableCell, s.col2, { textAlign: 'center' }]}>1</Text>
                            <Text style={[s.tableCell, s.col3, { textAlign: 'right' }]}>{formatNumber(Number(payment.amount), " ")}</Text>
                            <Text style={[s.tableCell, s.col4, { textAlign: 'right' }]}>{formatNumber(Number(payment.amount), " ")}</Text>
                        </View>

                        <View style={s.totalsBlock}>
                            <View style={s.totalRow}>
                                <Text style={s.totalKey}>Sous-total HT</Text>
                                <Text style={s.totalVal}>{formatNumber(Number(payment.amount), " ")}</Text>
                            </View>
                            <View style={[s.totalRow, { borderBottomWidth: 0 }]}>
                                <Text style={s.totalKey}>TVA (20 %)</Text>
                                <Text style={s.totalVal}>{formatNumber(Number(payment.taxe || "0"), " ")}</Text>
                            </View>
                            <View style={s.totalRowFinal}>
                                <Text style={s.totalKeyFinal}>TOTAL TTC</Text>
                                <Text style={s.totalValFinal}>{fmt.amount((ttc.toFixed(2)))}</Text>
                            </View>
                        </View>
                    </View>

                    {payment.description && (
                        <View style={s.notesBox}>
                            <Text style={s.notesTitle}>NOTES</Text>
                            <Text style={s.notesText}>{payment.description}</Text>
                        </View>
                    )}

                </View>

                <View style={s.footer} fixed>
                    <Text style={s.footerText}>
                        Facture émise le {fmt.date(payment.created_at)} · Valable 30 jours
                    </Text>
                    <Text style={s.footerText}>
                        <Text style={s.footerAccent}>#{payment.invoice_number}</Text>
                        · Généré automatiquement
                    </Text>
                </View>

            </Page>
        </Document>
    );
};


export default PlanInvoice;