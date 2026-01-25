/**
 * Archon Email Templates
 * Premium, modern email templates consistent with dashboard design
 */

// Shared styles for all emails
const brandColor = '#7c3aed'; // Archon purple
const textColor = '#1e293b';
const mutedColor = '#64748b';
const backgroundColor = '#f8fafc';

const baseStyles = `
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    background-color: ${backgroundColor};
    margin: 0;
    padding: 20px;
    color: ${textColor};
  }
  .container {
    max-width: 600px;
    margin: 0 auto;
    background: #ffffff;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
  }
  .header {
    background: linear-gradient(135deg, ${brandColor} 0%, #9333ea 100%);
    padding: 40px 30px;
    text-align: center;
  }
  .header h1 {
    color: #ffffff;
    margin: 0;
    font-size: 28px;
    font-weight: 700;
    letter-spacing: -0.5px;
  }
  .header p {
    color: rgba(255, 255, 255, 0.8);
    margin: 8px 0 0 0;
    font-size: 14px;
  }
  .content {
    padding: 40px 30px;
  }
  .content p {
    line-height: 1.6;
    margin: 0 0 16px 0;
  }
  .button {
    display: inline-block;
    background: ${brandColor};
    color: #ffffff !important;
    padding: 14px 28px;
    text-decoration: none;
    border-radius: 8px;
    font-weight: 600;
    margin: 20px 0;
  }
  .button:hover {
    background: #6d28d9;
  }
  .highlight-box {
    background: ${backgroundColor};
    border-radius: 8px;
    padding: 20px;
    margin: 20px 0;
  }
  .footer {
    background: ${backgroundColor};
    padding: 30px;
    text-align: center;
    color: ${mutedColor};
    font-size: 12px;
  }
  .footer a {
    color: ${brandColor};
    text-decoration: none;
  }
  .amount {
    font-size: 32px;
    font-weight: 700;
    color: ${brandColor};
  }
  table.items {
    width: 100%;
    border-collapse: collapse;
    margin: 20px 0;
  }
  table.items th {
    text-align: left;
    padding: 12px;
    background: ${backgroundColor};
    font-size: 12px;
    text-transform: uppercase;
    color: ${mutedColor};
  }
  table.items td {
    padding: 12px;
    border-bottom: 1px solid #f1f5f9;
  }
`;

interface EmailData {
    recipientName: string;
    companyName: string;
}

interface OfferteEmailData extends EmailData {
    offerteNummer: string;
    totaal: number;
    items: Array<{ description: string; totaal: number }>;
    vervalDatum: string;
    viewUrl?: string;
}

interface FactuurEmailData extends EmailData {
    factuurNummer: string;
    totaal: number;
    items: Array<{ description: string; totaal: number }>;
    vervalDatum: string;
    iban?: string;
    paymentUrl?: string;
}

interface WelcomeEmailData extends EmailData {
    loginUrl: string;
}

interface ReminderEmailData extends EmailData {
    factuurNummer: string;
    totaal: number;
    vervalDatum: string;
    dagenTeGaan: number;
    paymentUrl?: string;
}

// Helper function to format currency
const formatCurrency = (amount: number): string => {
    return `€${amount.toFixed(2).replace('.', ',')}`;
};

// Base template wrapper
const wrapTemplate = (title: string, subtitle: string, content: string): string => `
<!DOCTYPE html>
<html lang="nl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>${baseStyles}</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>ARCHON</h1>
      <p>${subtitle}</p>
    </div>
    <div class="content">
      ${content}
    </div>
    <div class="footer">
      <p>Dit bericht is verstuurd via <a href="https://archon.app">Archon Dashboard</a></p>
      <p>© ${new Date().getFullYear()} Archon. Alle rechten voorbehouden.</p>
    </div>
  </div>
</body>
</html>
`;

// Offerte Email Template
export const offerteEmail = (data: OfferteEmailData): { subject: string; html: string; text: string } => {
    const subject = `Nieuwe offerte #${data.offerteNummer} van ${data.companyName}`;

    const itemRows = data.items.map(item =>
        `<tr><td>${item.description}</td><td style="text-align: right;">${formatCurrency(item.totaal)}</td></tr>`
    ).join('');

    const content = `
    <p>Beste ${data.recipientName},</p>
    <p>Hierbij ontvangt u onze offerte voor de door u aangevraagde werkzaamheden.</p>
    
    <div class="highlight-box">
      <table style="width: 100%;">
        <tr>
          <td>Offerte nummer:</td>
          <td style="text-align: right; font-weight: 600;">${data.offerteNummer}</td>
        </tr>
        <tr>
          <td>Geldig tot:</td>
          <td style="text-align: right;">${data.vervalDatum}</td>
        </tr>
      </table>
    </div>

    <table class="items">
      <thead>
        <tr>
          <th>Omschrijving</th>
          <th style="text-align: right;">Bedrag</th>
        </tr>
      </thead>
      <tbody>
        ${itemRows}
      </tbody>
      <tfoot>
        <tr style="font-weight: 600;">
          <td>Totaal (incl. BTW)</td>
          <td style="text-align: right;" class="amount">${formatCurrency(data.totaal)}</td>
        </tr>
      </tfoot>
    </table>

    ${data.viewUrl ? `<p style="text-align: center;"><a href="${data.viewUrl}" class="button">Bekijk Offerte</a></p>` : ''}

    <p>Heeft u vragen over deze offerte? Neem gerust contact met ons op.</p>
    
    <p>Met vriendelijke groet,<br><strong>${data.companyName}</strong></p>
  `;

    const text = `Beste ${data.recipientName},\n\nHierbij ontvangt u offerte #${data.offerteNummer}.\n\nTotaal: ${formatCurrency(data.totaal)}\nGeldig tot: ${data.vervalDatum}\n\nMet vriendelijke groet,\n${data.companyName}`;

    return {
        subject,
        html: wrapTemplate('Offerte', 'Nieuwe offerte voor u', content),
        text
    };
};

// Factuur Email Template
export const factuurEmail = (data: FactuurEmailData): { subject: string; html: string; text: string } => {
    const subject = `Factuur #${data.factuurNummer} van ${data.companyName}`;

    const itemRows = data.items.map(item =>
        `<tr><td>${item.description}</td><td style="text-align: right;">${formatCurrency(item.totaal)}</td></tr>`
    ).join('');

    const content = `
    <p>Beste ${data.recipientName},</p>
    <p>Hierbij ontvangt u onze factuur voor de geleverde werkzaamheden.</p>
    
    <div class="highlight-box">
      <table style="width: 100%;">
        <tr>
          <td>Factuur nummer:</td>
          <td style="text-align: right; font-weight: 600;">${data.factuurNummer}</td>
        </tr>
        <tr>
          <td>Vervaldatum:</td>
          <td style="text-align: right;">${data.vervalDatum}</td>
        </tr>
        ${data.iban ? `<tr>
          <td>IBAN:</td>
          <td style="text-align: right;">${data.iban}</td>
        </tr>` : ''}
      </table>
    </div>

    <table class="items">
      <thead>
        <tr>
          <th>Omschrijving</th>
          <th style="text-align: right;">Bedrag</th>
        </tr>
      </thead>
      <tbody>
        ${itemRows}
      </tbody>
      <tfoot>
        <tr style="font-weight: 600;">
          <td>Totaal (incl. BTW)</td>
          <td style="text-align: right;" class="amount">${formatCurrency(data.totaal)}</td>
        </tr>
      </tfoot>
    </table>

    ${data.paymentUrl ? `<p style="text-align: center;"><a href="${data.paymentUrl}" class="button">Nu Betalen</a></p>` : ''}

    <p>Wij verzoeken u vriendelijk het bedrag binnen de gestelde termijn over te maken${data.iban ? ` naar ${data.iban}` : ''}.</p>
    
    <p>Met vriendelijke groet,<br><strong>${data.companyName}</strong></p>
  `;

    const text = `Beste ${data.recipientName},\n\nHierbij ontvangt u factuur #${data.factuurNummer}.\n\nTotaal: ${formatCurrency(data.totaal)}\nVervaldatum: ${data.vervalDatum}\n${data.iban ? `IBAN: ${data.iban}\n` : ''}\nMet vriendelijke groet,\n${data.companyName}`;

    return {
        subject,
        html: wrapTemplate('Factuur', 'Nieuwe factuur', content),
        text
    };
};

// Welcome Email Template
export const welcomeEmail = (data: WelcomeEmailData): { subject: string; html: string; text: string } => {
    const subject = `Welkom bij Archon, ${data.recipientName}!`;

    const content = `
    <p style="font-size: 18px;">Hallo ${data.recipientName}! 👋</p>
    <p>Welkom bij <strong>Archon Dashboard</strong> - de slimste manier om je bedrijf te beheren.</p>
    
    <div class="highlight-box">
      <h3 style="margin-top: 0; color: ${brandColor};">Wat kun je allemaal?</h3>
      <ul style="padding-left: 20px;">
        <li>📄 Professionele offertes maken met AI</li>
        <li>💰 Facturen versturen en beheren</li>
        <li>👥 Klanten en projecten organiseren</li>
        <li>📊 Inzicht in je financiën</li>
        <li>🤖 AI-assistent voor slimme suggesties</li>
      </ul>
    </div>

    <p style="text-align: center;">
      <a href="${data.loginUrl}" class="button">Ga naar Dashboard</a>
    </p>

    <p>Hulp nodig? Onze AI-assistent staat 24/7 voor je klaar!</p>
    
    <p>Veel succes,<br><strong>Team Archon</strong></p>
  `;

    const text = `Hallo ${data.recipientName}!\n\nWelkom bij Archon Dashboard!\n\nGa naar je dashboard: ${data.loginUrl}\n\nVeel succes,\nTeam Archon`;

    return {
        subject,
        html: wrapTemplate('Welkom', 'Je account is klaar!', content),
        text
    };
};

// Payment Reminder Email
export const reminderEmail = (data: ReminderEmailData): { subject: string; html: string; text: string } => {
    const isOverdue = data.dagenTeGaan < 0;
    const subject = isOverdue
        ? `⚠️ Factuur #${data.factuurNummer} is verlopen`
        : `Herinnering: Factuur #${data.factuurNummer} verloopt over ${data.dagenTeGaan} dagen`;

    const content = `
    <p>Beste ${data.recipientName},</p>
    
    ${isOverdue
            ? `<p style="color: #dc2626;">Factuur <strong>#${data.factuurNummer}</strong> is <strong>${Math.abs(data.dagenTeGaan)} dagen geleden</strong> verlopen.</p>`
            : `<p>Dit is een vriendelijke herinnering dat factuur <strong>#${data.factuurNummer}</strong> over <strong>${data.dagenTeGaan} dagen</strong> verloopt.</p>`
        }
    
    <div class="highlight-box" style="${isOverdue ? 'border: 2px solid #dc2626;' : ''}">
      <table style="width: 100%;">
        <tr>
          <td>Factuur nummer:</td>
          <td style="text-align: right; font-weight: 600;">${data.factuurNummer}</td>
        </tr>
        <tr>
          <td>Openstaand bedrag:</td>
          <td style="text-align: right; font-weight: 600; color: ${brandColor};">${formatCurrency(data.totaal)}</td>
        </tr>
        <tr>
          <td>Vervaldatum:</td>
          <td style="text-align: right; ${isOverdue ? 'color: #dc2626;' : ''}">${data.vervalDatum}</td>
        </tr>
      </table>
    </div>

    ${data.paymentUrl ? `<p style="text-align: center;"><a href="${data.paymentUrl}" class="button">Nu Betalen</a></p>` : ''}

    <p>Heeft u reeds betaald? Dan kunt u deze herinnering als niet verzonden beschouwen.</p>
    <p>Vragen? Neem gerust contact met ons op.</p>
    
    <p>Met vriendelijke groet,<br><strong>${data.companyName}</strong></p>
  `;

    const text = `Beste ${data.recipientName},\n\n${isOverdue ? 'Factuur' : 'Herinnering: Factuur'} #${data.factuurNummer}\nBedrag: ${formatCurrency(data.totaal)}\nVervaldatum: ${data.vervalDatum}\n\nMet vriendelijke groet,\n${data.companyName}`;

    return {
        subject,
        html: wrapTemplate('Herinnering', isOverdue ? 'Factuur verlopen' : 'Betalingsherinnering', content),
        text
    };
};
