// Realistische demo data voor ARCHON.AI dashboard
// Gebaseerd op echte KMO data uit de bouwsector

export const demoKlanten = [
  {
    id: "1",
    naam: "Jansen Bouwbedrijf",
    email: "info@jansenbouw.nl",
    telefoon: "020 123 4567",
    adres: "Industrieweg 123, 1234 AB Amsterdam",
    status: "actief",
    omzet: 125000,
    facturen: 12,
    laatstContact: "2024-01-15"
  },
  {
    id: "2", 
    naam: "De Vries Installaties",
    email: "contact@devriesinstallaties.nl",
    telefoon: "030 987 6543",
    adres: "Bedrijventerrein 45, 5678 GH Rotterdam",
    status: "actief",
    omzet: 87500,
    facturen: 8,
    laatstContact: "2024-01-14"
  },
  {
    id: "3",
    naam: "Bakker Schilderwerken",
    email: "hallo@bakkerschilderwerken.nl", 
    telefoon: "06 123 45678",
    adres: "Dorpsstraat 89, 9876 XY Utrecht",
    status: "actief",
    omzet: 65000,
    facturen: 4,
    laatstContact: "2024-01-10"
  },
  {
    id: "4",
    naam: "Van den Berg Tuinontwerp",
    email: "info@vandenbergtuin.nl",
    telefoon: "071 234 5678",
    adres: "Laan van Vollenhove 234, 3456 ZZ Den Haag",
    status: "inactief",
    omzet: 43000,
    facturen: 2,
    laatstContact: "2023-12-01"
  }
];

export const demoFacturen = [
  {
    id: "F2024-001",
    klantId: "1",
    klantNaam: "Jansen Bouwbedrijf",
    factuurNummer: "F2024-001",
    datum: "2024-01-10",
    vervaldatum: "2024-01-24",
    bedrag: 12500,
    btw: 2625,
    status: "openstaand",
    project: "Nieuwbouw Amsterdam-Zuid",
    beschrijving: "Betonfundering en riolering",
    betaaldatum: null
  },
  {
    id: "F2024-002", 
    klantId: "2",
    klantNaam: "De Vries Installaties",
    factuurNummer: "F2024-002",
    datum: "2024-01-08",
    vervaldatum: "2024-01-22",
    bedrag: 8750,
    btw: 1837.50,
    status: "vervallen",
    project: "Installatie HVAC systeem",
    beschrijving: "Complete klimaatbeheersysteem inclusief installatie",
    betaaldatum: "2024-01-20"
  },
  {
    id: "F2024-003",
    klantId: "3",
    klantNaam: "Bakker Schilderwerken", 
    factuurNummer: "F2024-003",
    datum: "2024-01-05",
    vervaldatum: "2024-01-19",
    bedrag: 3250,
    btw: 682.50,
    status: "openstaand",
    project: "Schilderwerk woonhuis",
    beschrijving: "Binnen- en buitenschilderwerk volledig afgerond",
    betaaldatum: null
  }
];

export const demoProjecten = [
  {
    id: "P2024-001",
    titel: "Nieuwbouw Amsterdam-Zuid",
    klantId: "1",
    klantNaam: "Jansen Bouwbedrijf",
    startdatum: "2024-01-01",
    verwachteEinddatum: "2024-06-30",
    status: "actief",
    budget: 250000,
    besteed: 125000,
    beschrijving: "Complete nieuwbouw met 4 verdiepingen, tuin en garage",
    voortgang: 35,
    teamleden: 8
  },
  {
    id: "P2024-002",
    titel: "Installatie HVAC systeem",
    klantId: "2", 
    klantNaam: "De Vries Installaties",
    startdatum: "2024-01-10",
    verwachteEinddatum: "2024-01-25",
    status: "voltooid",
    budget: 15000,
    besteed: 12000,
    beschrijving: "Installatie van klimaatbeheersysteem in kantoorgebouw",
    voortgang: 100,
    teamleden: 2
  },
  {
    id: "P2024-003",
    titel: "Schilderwerk woonhuis",
    klantId: "3",
    klantNaam: "Bakker Schilderwerken",
    startdatum: "2024-01-15", 
    verwachteEinddatum: "2024-02-15",
    status: "actief",
    budget: 8500,
    besteed: 6000,
    beschrijving: "Volledig schilderwerk binnen en buiten",
    voortgang: 60,
    teamleden: 3
  }
];

export const demoTransacties = [
  {
    id: "T2024-001",
    datum: "2024-01-15",
    type: "inkomst",
    omschrijving: "Betaling factuur F2024-002",
    bedrag: 8750,
    categorie: "factuur",
    rekening: "NL12ABCD34567890",
    klantId: "2",
    factuurId: "F2024-002"
  },
  {
    id: "T2024-002",
    datum: "2024-01-14",
    type: "inkomst",
    omschrijving: "Aanbetaling project P2024-001",
    bedrag: 50000,
    categorie: "project",
    rekening: "NL12ABCD34567890",
    klantId: "1",
    projectId: "P2024-001"
  },
  {
    id: "T2024-003",
    datum: "2024-01-12",
    type: "uitgave",
    omschrijving: "Bouwmaterialen - hout en isolatie",
    bedrag: -3250,
    categorie: "materialen",
    rekening: "NL12ABCD34567890",
    projectId: "P2024-001"
  },
  {
    id: "T2024-004",
    datum: "2024-01-10",
    type: "uitgave",
    omschrijving: "Brandstof bedrijfsbus",
    bedrag: -450,
    categorie: "brandstof",
    rekening: "NL12ABCD34567890"
  },
  {
    id: "T2024-005",
    datum: "2024-01-08",
    type: "uitgave",
    omschrijving: "Verzekering bedrijfsaansprakelijkheid",
    bedrag: -275,
    categorie: "verzekering",
    rekening: "NL12ABCD34567890"
  }
];

export const demoUitgaven = [
  {
    id: "U2024-001",
    datum: "2024-01-10",
    categorie: "materialen",
    omschrijving: "Bouwmaterialen - hout en isolatie",
    bedrag: 3250,
    btw: 682.50,
    project: "P2024-001",
    leverancier: "Bouwmarkt Amsterdam",
    factureerbaar: true,
    betaald: false
  },
  {
    id: "U2024-002", 
    datum: "2024-01-08",
    categorie: "brandstof",
    omschrijving: "Brandstof bedrijfsbus",
    bedrag: 450,
    btw: 94.50,
    project: null,
    leverancier: "Shell",
    factureerbaar: true,
    betaald: true
  },
  {
    id: "U2024-003",
    datum: "2024-01-05",
    categorie: "gereedschap",
    omschrijving: "Aankoop boormachine",
    bedrag: 1200,
    btw: 252,
    project: "P2024-001",
    leverancier: "Toolstation",
    factureerbaar: true,
    betaald: false
  },
  {
    id: "U2024-004",
    datum: "2024-01-12",
    categorie: "verzekering",
    omschrijving: "Bedrijfsaansprakelijkheidsverzekering",
    bedrag: 275,
    btw: 57.75,
    project: null,
    leverancier: "Interpolis",
    factureerbaar: false,
    betaald: true
  }
];

export const demoAgenda = [
  {
    id: "A2024-001",
    titel: "Projectoverleg Jansen Bouw",
    type: "overleg",
    startdatum: "2024-01-16T09:00:00",
    einddatum: "2024-01-16T10:30:00",
    locatie: "Nieuwbouw Amsterdam-Zuid",
    klantId: "1",
    klantNaam: "Jansen Bouwbedrijf",
    beschrijving: "Bespreking voortgang en planning volgende fase",
    deelnemers: ["Jansen Bouw", "Architectenbureau", "Installatiebedrijf"]
  },
  {
    id: "A2024-002",
    titel: "Installatie HVAC systeem",
    type: "werkzaamheid",
    startdatum: "2024-01-17T08:00:00",
    einddatum: "2024-01-17T17:00:00",
    locatie: "Kantoor De Vries",
    klantId: "2",
    klantNaam: "De Vries Installaties",
    beschrijving: "Installatie klimaatbeheersysteem",
    deelnemers: ["De Vries Installaties", "Technicus"]
  },
  {
    id: "A2024-003",
    titel: "Schilderwerk woonhuis",
    type: "werkzaamheid",
    startdatum: "2024-01-18T09:00:00",
    einddatum: "2024-01-18T17:00:00",
    locatie: "Woning Bakker",
    klantId: "3",
    klantNaam: "Bakker Schilderwerken",
    beschrijving: "Buitenschilderwerk gevel en kozijnen",
    deelnemers: ["Bakker Schilderwerken"]
  }
];

export const demoBankrekeningen = [
  {
    id: "B2024-001",
    naam: "Zakelijke Rekening",
    bank: "ING Bank",
    rekeningnummer: "NL12INGB34567890",
    iban: "NL12INGB34567890",
    type: "zakelijk",
    saldo: 45230.50,
    creditlimiet: 25000,
    status: "actief"
  },
  {
    id: "B2024-002",
    naam: "Spaarrekening",
    bank: "Rabobank",
    rekeningnummer: "NL12RABO34567890",
    iban: "NL12RABO34567890",
    type: "spaar",
    saldo: 12000.00,
    creditlimiet: 0,
    status: "actief"
  }
];

export const demoInzichten = {
  omzetTrends: [
    { maand: "augustus 2023", omzet: 180000 },
    { maand: "september 2023", omzet: 195000 },
    { maand: "oktober 2023", omzet: 210000 },
    { maand: "november 2023", omzet: 225000 },
    { maand: "december 2023", omzet: 248000 },
    { maand: "januari 2024", omzet: 248000 }
  ],
  cashflow: {
    inkomsten: 248000,
    uitgaven: 124500,
    netto: 123500,
    trend: "stabiel"
  },
  topKlanten: [
    { naam: "Jansen Bouwbedrijf", omzet: 125000, groei: 15 },
    { naam: "De Vries Installaties", omzet: 87500, groei: 8 },
    { naam: "Bakker Schilderwerken", omzet: 65000, groei: 12 }
  ],
  projectenStatus: {
    actief: 2,
    voltooid: 8,
    gepland: 3
  }
};
