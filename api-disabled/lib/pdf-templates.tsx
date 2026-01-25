import React from 'react';
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';

const styles = StyleSheet.create({
    page: {
        padding: 40,
        backgroundColor: '#ffffff',
        fontFamily: 'Helvetica',
        fontSize: 10,
        color: '#334155',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 40,
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
        paddingBottom: 20,
    },
    logoSection: {
        flexDirection: 'column',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#000000',
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 10,
        color: '#64748b',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    infoSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 30,
    },
    column: {
        flexDirection: 'column',
        width: '43%',
    },
    label: {
        fontSize: 8,
        color: '#94a3b8',
        textTransform: 'uppercase',
        marginBottom: 4,
        fontWeight: 'bold',
    },
    value: {
        fontSize: 10,
        marginBottom: 2,
        color: '#1e293b',
    },
    table: {
        marginTop: 20,
        borderWidth: 0,
    },
    tableHeader: {
        flexDirection: 'row',
        backgroundColor: '#f8fafc',
        borderBottomWidth: 1,
        borderBottomColor: '#e2e8f0',
        padding: 8,
        fontWeight: 'bold',
    },
    tableRow: {
        flexDirection: 'row',
        borderBottomWidth: 1,
        borderBottomColor: '#f1f5f9',
        padding: 8,
        alignItems: 'center',
    },
    colDesc: { width: '50%' },
    colQty: { width: '15%', textAlign: 'right' },
    colPrice: { width: '15%', textAlign: 'right' },
    colTotal: { width: '20%', textAlign: 'right' },
    totalsSection: {
        marginTop: 30,
        flexDirection: 'row',
        justifyContent: 'flex-end',
    },
    totalsContainer: {
        width: '40%',
    },
    totalRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: 4,
    },
    grandTotal: {
        borderTopWidth: 1,
        borderTopColor: '#e2e8f0',
        marginTop: 8,
        paddingTop: 8,
        fontWeight: 'bold',
        fontSize: 14,
        color: '#7c3aed',
    },
    footer: {
        position: 'absolute',
        bottom: 40,
        left: 40,
        right: 40,
        borderTopWidth: 1,
        borderTopColor: '#f1f5f9',
        paddingTop: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
        color: '#94a3b8',
        fontSize: 8,
    },
    accentLine: {
        height: 4,
        width: 40,
        backgroundColor: '#7c3aed',
        marginBottom: 10,
    }
});

interface Item {
    description: string;
    hoeveelheid: number;
    prijsPerStuk: number;
    totaal: number;
}

interface DocumentData {
    type: 'Offerte' | 'Factuur';
    nummer: string;
    datum: string;
    vervalDatum?: string;
    klantNaam: string;
    klantAdres?: string;
    klantEmail?: string;
    items: Item[];
    subtotaal: number;
    btwTotaal: number;
    totaal: number;
    notities?: string;
    bedrijf: {
        naam: string;
        adres?: string;
        email?: string;
        telefoon?: string;
        kvk?: string;
        btw?: string;
        iban?: string;
    };
}

export const ArchonDocument = ({ data }: { data: DocumentData }) => (
    <Document>
        <Page size="A4" style={styles.page}>
            <View style={styles.header}>
                <View style={styles.logoSection}>
                    <View style={styles.accentLine} />
                    <Text style={styles.title}>ARCHON</Text>
                    <Text style={styles.subtitle}>{data.type}</Text>
                </View>
                <View style={{ textAlign: 'right' }}>
                    <Text style={styles.value}>{data.type} #: {data.nummer}</Text>
                    <Text style={styles.value}>Datum: {data.datum}</Text>
                    {data.vervalDatum && <Text style={styles.value}>Vervaldatum: {data.vervalDatum}</Text>}
                </View>
            </View>

            <View style={styles.infoSection}>
                <View style={styles.column}>
                    <Text style={styles.label}>Van</Text>
                    <Text style={{ ...styles.value, fontWeight: 'bold' }}>{data.bedrijf.naam}</Text>
                    {data.bedrijf.adres && <Text style={styles.value}>{data.bedrijf.adres}</Text>}
                    {data.bedrijf.email && <Text style={styles.value}>{data.bedrijf.email}</Text>}
                    {data.bedrijf.telefoon && <Text style={styles.value}>{data.bedrijf.telefoon}</Text>}
                </View>
                <View style={styles.column}>
                    <Text style={styles.label}>Aan</Text>
                    <Text style={{ ...styles.value, fontWeight: 'bold' }}>{data.klantNaam}</Text>
                    {data.klantAdres && <Text style={styles.value}>{data.klantAdres}</Text>}
                    {data.klantEmail && <Text style={styles.value}>{data.klantEmail}</Text>}
                </View>
            </View>

            <View style={styles.table}>
                <View style={styles.tableHeader}>
                    <Text style={{ ...styles.colDesc }}>Omschrijving</Text>
                    <Text style={{ ...styles.colQty }}>Aantal</Text>
                    <Text style={{ ...styles.colPrice }}>Prijs</Text>
                    <Text style={{ ...styles.colTotal }}>Totaal</Text>
                </View>
                {data.items.map((item, index) => (
                    <View key={index} style={styles.tableRow}>
                        <Text style={styles.colDesc}>{item.description}</Text>
                        <Text style={styles.colQty}>{item.hoeveelheid}</Text>
                        <Text style={styles.colPrice}>€{item.prijsPerStuk.toFixed(2).replace('.', ',')}</Text>
                        <Text style={styles.colTotal}>€{item.totaal.toFixed(2).replace('.', ',')}</Text>
                    </View>
                ))}
            </View>

            <View style={styles.totalsSection}>
                <View style={styles.totalsContainer}>
                    <View style={styles.totalRow}>
                        <Text>Subtotaal</Text>
                        <Text>€{data.subtotaal.toFixed(2).replace('.', ',')}</Text>
                    </View>
                    <View style={styles.totalRow}>
                        <Text>BTW (21%)</Text>
                        <Text>€{data.btwTotaal.toFixed(2).replace('.', ',')}</Text>
                    </View>
                    <View style={{ ...styles.totalRow, ...styles.grandTotal }}>
                        <Text>Totaal</Text>
                        <Text>€{data.totaal.toFixed(2).replace('.', ',')}</Text>
                    </View>
                </View>
            </View>

            {data.notities && (
                <View style={{ marginTop: 40 }}>
                    <Text style={styles.label}>Notities</Text>
                    <Text style={styles.value}>{data.notities}</Text>
                </View>
            )}

            <View style={styles.footer}>
                <View>
                    {data.bedrijf.kvk && <Text>KvK: {data.bedrijf.kvk}</Text>}
                    {data.bedrijf.btw && <Text>BTW: {data.bedrijf.btw}</Text>}
                </View>
                <View style={{ textAlign: 'right' }}>
                    {data.bedrijf.iban && <Text>IBAN: {data.bedrijf.iban}</Text>}
                    <Text>Gegenereerd door Archon Dashboard</Text>
                </View>
            </View>
        </Page>
    </Document>
);
