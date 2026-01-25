
export const demoData = {
    facturen: [
        {
            id: "FAC-001",
            nummer: "FAC-2024-001",
            klant: "De Vries Bouwgroep",
            bedrag: 25500,
            datum: "2024-01-15",
            vervaldatum: "2024-01-29",
            status: "betaald",
            items: 1
        },
        {
            id: "FAC-002",
            nummer: "FAC-2024-002",
            klant: "J. Pietersen",
            bedrag: 7500,
            datum: "2024-02-01",
            vervaldatum: "2024-02-15",
            status: "overtijd",
            items: 3
        },
        {
            id: "FAC-003",
            nummer: "FAC-2024-003",
            klant: "Bakkerij 't Hoekje",
            bedrag: 1250,
            datum: new Date().toISOString().split("T")[0],
            vervaldatum: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
            status: "openstaand",
            items: 2
        }
    ],
    transacties: [
        {
            id: "TRX-001",
            titel: "Betaling Factuur #2024-001",
            beschrijving: "Inkomende betaling De Vries Bouwgroep",
            bedrag: 25500,
            type: "inkomst",
            categorie: "Facturen",
            datum: "2024-01-20",
            iconKey: "banknote"
        },
        {
            id: "TRX-002",
            titel: "Brandstof Mercedes Sprinter",
            beschrijving: "Tanken Shell Station",
            bedrag: 125.50,
            type: "uitgave",
            categorie: "Brandstof",
            datum: "2024-01-22",
            iconKey: "fuel"
        },
        {
            id: "TRX-003",
            titel: "Bouwmaat Materialen",
            beschrijving: "Inkoop hout en bevestigingsmateriaal",
            bedrag: 450.00,
            type: "uitgave",
            categorie: "Materialen",
            datum: new Date().toISOString().split("T")[0],
            iconKey: "cart"
        },
        {
            id: "TRX-004",
            titel: "Abonnement Software",
            beschrijving: "Maandelijkse kosten Archon",
            bedrag: 45.00,
            type: "uitgave",
            categorie: "Utilities",
            datum: new Date().toISOString().split("T")[0],
            iconKey: "zap"
        }
    ],
    klanten: [
        {
            id: "KL-001",
            naam: "De Vries Bouwgroep",
            bedrijf: "De Vries Bouwgroep BV",
            email: "info@devriesbouw.nl",
            telefoon: "020-1234567",
            adres: "Bouwstraat 1, Amsterdam",
            type: "zakelijk",
            status: "actief",
            totaalOmzet: 45000,
            laatsteFactuur: new Date().toISOString().split("T")[0],
            avatar: ""
        },
        {
            id: "KL-002",
            naam: "J. Pietersen",
            email: "j.pietersen@email.com",
            telefoon: "06-12345678",
            adres: "Kerkstraat 12, Utrecht",
            type: "particulier",
            status: "actief",
            totaalOmzet: 2300,
            laatsteFactuur: new Date(Date.now() - 86400000 * 5).toISOString().split("T")[0],
            avatar: ""
        },
        {
            id: "KL-003",
            naam: "Bakkerij 't Hoekje",
            bedrijf: "Bakkerij 't Hoekje VOF",
            email: "contact@hoekje.nl",
            telefoon: "030-9876543",
            adres: "Dorpsstraat 45, Zeist",
            type: "zakelijk",
            status: "actief",
            totaalOmzet: 12500,
            laatsteFactuur: new Date(Date.now() - 86400000 * 10).toISOString().split("T")[0],
            avatar: ""
        }
    ],
    projects: [
        {
            id: "PRJ-001",
            name: "Renovatie Grachtenpand",
            client: "De Vries Bouwgroep",
            location: "Amsterdam Centrum",
            budget: 85000,
            spent: 32000,
            status: "Actief",
            progress: 45,
            deadline: "2024-06-30",
            image: "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&auto=format&fit=crop&q=60",
            paymentMilestones: [
                { id: "m1", name: "Voorschot", amount: 25500, dueDate: "2024-01-15", status: "betaald", percentage: 30 },
                { id: "m2", name: "Ruwbouw", amount: 25500, dueDate: "2024-03-30", status: "open", percentage: 30 },
                { id: "m3", name: "Oplevering", amount: 34000, dueDate: "2024-06-30", status: "open", percentage: 40 }
            ],
            team: []
        },
        {
            id: "PRJ-002",
            name: "Uitbouw Woonkamer",
            client: "J. Pietersen",
            location: "Utrecht",
            budget: 25000,
            spent: 2500,
            status: "Planning",
            progress: 10,
            deadline: "2024-05-15",
            image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&auto=format&fit=crop&q=60",
            paymentMilestones: [
                { id: "m1", name: "Start", amount: 7500, dueDate: "2024-02-01", status: "verzonden", percentage: 30 }
            ],
            team: []
        }
    ],
    appointments: [
        {
            id: "1",
            title: "Kick-off Project Alpha",
            type: "meeting",
            date: new Date().toISOString().split("T")[0],
            time: "10:00",
            duration: "1h",
            client: "Acme Corp",
            location: "Kantoor Amsterdam",
            attendees: ["https://i.pravatar.cc/150?u=1", "https://i.pravatar.cc/150?u=2"],
            status: "confirmed"
        },
        {
            id: "2",
            title: "Site Visit Renovatie",
            type: "site_visit",
            date: new Date(Date.now() + 86400000).toISOString().split("T")[0],
            time: "14:00",
            duration: "2h",
            client: "Bouwgroep Zuid",
            location: "Utrechtseweg 12",
            attendees: ["https://i.pravatar.cc/150?u=3"],
            status: "pending"
        },
        {
            id: "3",
            title: "Facturen Controleren",
            type: "deadline",
            date: new Date(Date.now() + 172800000).toISOString().split("T")[0],
            time: "09:00",
            duration: "30m",
            client: "Intern",
            attendees: [],
            status: "confirmed"
        }
    ],
    emails: [
        {
            id: "1",
            sender: "Pieter de Vries",
            subject: "Aanvraag Offerte Renovatie",
            time: "09:41",
            category: "offerte",
            priority: "high",
            preview: "Goedemorgen, graag zou ik een offerte ontvangen voor de renovatie van...",
            mailbox: "inbox",
            body: "Goedemorgen,\n\nGraag zou ik een offerte ontvangen voor de renovatie van mijn kantoorpand aan de Keizersgracht. Het gaat om ca. 200m2.\n\nKunnen we hiervoor een afspraak maken?\n\nMet vriendelijke groet,\nPieter de Vries"
        },
        {
            id: "2",
            sender: "Admin Support",
            subject: "Factuur #2023-889 Betaald",
            time: "Gisteren",
            category: "factuur",
            priority: "medium",
            preview: "Uw factuur #2023-889 is succesvol betaald en verwerkt in onze admin...",
            mailbox: "inbox",
            body: "Beste relatie,\n\nHierbij bevestigen wij de goede ontvangst van betaling voor factuur #2023-889.\n\nMet vriendelijke groet,\nAdmin Team"
        }
    ]
};

export const seedLocalStorage = () => {
    // Simulated user ID from Supabase
    const MOCK_UID = "mock-user-123";

    // Helper to set local storage in the format expected by the mock Supabase
    const setStore = (key: string, value: any) => {
        const storeKey = `supabase:users/${MOCK_UID}/state/${key}`;
        localStorage.setItem(storeKey, JSON.stringify({ value }));
    };

    setStore('facturen', demoData.facturen);
    setStore('transacties', demoData.transacties);
    setStore('klanten', demoData.klanten);
    setStore('projects', demoData.projects);
    setStore('appointments', demoData.appointments);
    setStore('emails', demoData.emails); // Note: Email page uses 'emails' key? checking Email.tsx might be needed but this is safe

    // Also clear visited flag so tours might run again if desired? No, better keep tours off for demo

    window.location.reload();
};
