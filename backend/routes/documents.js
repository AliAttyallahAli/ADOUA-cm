const express = require('express');
const PDFDocument = require('pdfkit');
const QRCode = require('qrcode');
const router = express.Router();

// Générer carte Visa
router.get('/generate-card/:clientId', async (req, res) => {
  try {
    const { clientId } = req.params;
    
    // Récupérer les données du client
    db.get('SELECT * FROM clients WHERE id = ?', [clientId], async (err, client) => {
      if (err) throw err;
      if (!client) {
        return res.status(404).json({ error: 'Client non trouvé' });
      }

      // Récupérer le solde du wallet
      db.get('SELECT balance FROM wallets WHERE client_id = ?', [clientId], async (err, wallet) => {
        if (err) throw err;

        const doc = new PDFDocument({
          layout: 'landscape',
          size: [600, 380],
          margins: { top: 0, bottom: 0, left: 0, right: 0 }
        });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="carte_visa_${client.name}.pdf"`);

        doc.pipe(res);

        // Arrière-plan dégradé
        const gradient = doc.linearGradient(0, 0, 600, 380);
        gradient.stop(0, '#1a237e');
        gradient.stop(1, '#4a148c');
        doc.rect(0, 0, 600, 380).fill(gradient);

        // Zone blanche centrale
        doc.rect(20, 20, 560, 340)
           .fill('#ffffff')
           .stroke('#e0e0e0');

        // Logo et en-tête
        doc.fillColor('#1a237e')
           .fontSize(24)
           .font('Helvetica-Bold')
           .text('ADOUAS-MC VISA', 40, 40);

        doc.fillColor('#666')
           .fontSize(14)
           .font('Helvetica')
           .text('Micro Crédit Card', 40, 70);

        // Nom du client
        doc.fillColor('#000')
           .fontSize(20)
           .font('Helvetica-Bold')
           .text(client.name.toUpperCase(), 40, 130);

        // Numéro de compte
        doc.fillColor('#666')
           .fontSize(12)
           .text('Numéro de Compte:', 40, 170);

        doc.fillColor('#000')
           .fontSize(14)
           .font('Helvetica-Bold')
           .text(client.wallet_address, 40, 190);

        // Numéro de carte formaté
        const cardNumber = client.wallet_address.replace(/[^0-9]/g, '').padEnd(16, '0');
        const formattedCardNumber = cardNumber.match(/.{1,4}/g).join('  ');
        
        doc.fillColor('#000')
           .fontSize(18)
           .font('Helvetica-Bold')
           .text(formattedCardNumber, 40, 230);

        // Dates
        doc.fillColor('#666')
           .fontSize(10)
           .text('Valide jusqu\'au', 40, 270);

        doc.fillColor('#000')
           .fontSize(12)
           .font('Helvetica-Bold')
           .text('12/25', 40, 285);

        doc.fillColor('#666')
           .fontSize(10)
           .text('Depuis', 120, 270);

        doc.fillColor('#000')
           .fontSize(12)
           .font('Helvetica-Bold')
           .text(new Date(client.created_at).toLocaleDateString(), 120, 285);

        // Solde
        doc.fillColor('#666')
           .fontSize(10)
           .text('Solde Actuel', 40, 310);

        doc.fillColor('#2e7d32')
           .fontSize(14)
           .font('Helvetica-Bold')
           .text(`${parseFloat(wallet?.balance || 0).toLocaleString()} XOF`, 40, 325);

        // QR Code (simulé)
        doc.fillColor('#1a237e')
           .fontSize(10)
           .text('QR Code', 450, 270);

        doc.rect(450, 150, 120, 120)
           .fill('#f5f5f5')
           .stroke('#e0e0e0');

        doc.fillColor('#666')
           .fontSize(8)
           .text('Scan pour vérifier', 455, 275);
        doc.text('l\'authenticité', 455, 285);

        // Pied de page
        doc.fillColor('#666')
           .fontSize(8)
           .text('ADOUAS Micro Crédit - Votre partenaire de confiance', 40, 350);

        doc.end();
      });
    });
  } catch (error) {
    console.error('Erreur génération carte:', error);
    res.status(500).json({ error: 'Erreur lors de la génération de la carte' });
  }
});

// Générer rapport
router.post('/generate-report', async (req, res) => {
  try {
    const { type, startDate, endDate } = req.body;

    const doc = new PDFDocument();
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="rapport_${type}_${startDate}_${endDate}.pdf"`);

    doc.pipe(res);

    // En-tête
    doc.fontSize(20)
       .font('Helvetica-Bold')
       .text('ADOUAS-MC', 50, 50)
       .fontSize(12)
       .font('Helvetica')
       .text('Rapport ' + getReportTitle(type), 50, 75)
       .text(`Période: ${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`, 50, 95);

    // Contenu selon le type
    switch (type) {
      case 'transactions':
        await generateTransactionReport(doc, startDate, endDate);
        break;
      case 'loans':
        await generateLoanReport(doc, startDate, endDate);
        break;
      case 'clients':
        await generateClientReport(doc);
        break;
      case 'financial':
        await generateFinancialReport(doc, startDate, endDate);
        break;
    }

    doc.end();
  } catch (error) {
    console.error('Erreur génération rapport:', error);
    res.status(500).json({ error: 'Erreur lors de la génération du rapport' });
  }
});

// Générer relevé client
router.post('/generate-statement/:clientId', async (req, res) => {
  try {
    const { clientId } = req.params;
    const { startDate, endDate } = req.body;

    db.get('SELECT * FROM clients WHERE id = ?', [clientId], async (err, client) => {
      if (err) throw err;
      if (!client) {
        return res.status(404).json({ error: 'Client non trouvé' });
      }

      const doc = new PDFDocument();
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="releve_${client.name}.pdf"`);

      doc.pipe(res);

      // En-tête
      doc.fontSize(20)
         .font('Helvetica-Bold')
         .text('ADOUAS-MC', 50, 50)
         .fontSize(16)
         .text('Relevé de Compte Client', 50, 80);

      // Informations client
      doc.fontSize(12)
         .text(`Client: ${client.name}`, 50, 120)
         .text(`Compte: ${client.wallet_address}`, 50, 140)
         .text(`Période: ${startDate ? new Date(startDate).toLocaleDateString() : 'Début'} - ${endDate ? new Date(endDate).toLocaleDateString() : new Date().toLocaleDateString()}`, 50, 160)
         .text(`Date d'émission: ${new Date().toLocaleDateString()}`, 50, 180);

      // Solde actuel
      db.get('SELECT balance FROM wallets WHERE client_id = ?', [clientId], (err, wallet) => {
        doc.fontSize(14)
           .font('Helvetica-Bold')
           .text(`Solde actuel: ${parseFloat(wallet?.balance || 0).toLocaleString()} XOF`, 50, 220);

        // Historique des transactions
        let yPosition = 260;
        doc.fontSize(12)
           .font('Helvetica-Bold')
           .text('Historique des Transactions', 50, yPosition);

        yPosition += 30;

        const query = `
          SELECT * FROM transactions 
          WHERE (from_wallet = ? OR to_wallet = ?) 
          AND created_at BETWEEN ? AND ?
          ORDER BY created_at DESC
        `;

        db.all(query, [client.wallet_address, client.wallet_address, startDate || '2000-01-01', endDate || new Date().toISOString()], (err, transactions) => {
          transactions.forEach((transaction, index) => {
            if (yPosition > 700) {
              doc.addPage();
              yPosition = 50;
            }

            const isCredit = transaction.to_wallet === client.wallet_address;
            const amount = parseFloat(transaction.amount);
            
            doc.fontSize(10)
               .font('Helvetica')
               .text(new Date(transaction.created_at).toLocaleDateString(), 50, yPosition)
               .text(transaction.type, 120, yPosition)
               .text(transaction.description || '-', 200, yPosition)
               .text(isCredit ? '+' : '-', 400, yPosition)
               .text(`${amount.toLocaleString()} XOF`, 420, yPosition)
               .text(transaction.status, 500, yPosition);

            yPosition += 20;
          });

          // Pied de page
          doc.fontSize(8)
             .text('Ce document est un relevé officiel ADOUAS-MC', 50, 750)
             .text('Pour toute question, contactez-nous au +221 XX XXX XX XX', 50, 765);

          doc.end();
        });
      });
    });
  } catch (error) {
    console.error('Erreur génération relevé:', error);
    res.status(500).json({ error: 'Erreur lors de la génération du relevé' });
  }
});

// Fonctions helper
function getReportTitle(type) {
  const titles = {
    transactions: 'des Transactions',
    loans: 'des Prêts',
    clients: 'des Clients',
    financial: 'Financier'
  };
  return titles[type] || '';
}

async function generateTransactionReport(doc, startDate, endDate) {
  // Implémentation détaillée du rapport transactions
  doc.fontSize(14).text('Rapport détaillé des transactions...', 50, 150);
}

async function generateLoanReport(doc, startDate, endDate) {
  // Implémentation détaillée du rapport prêts
  doc.fontSize(14).text('Rapport détaillé des prêts...', 50, 150);
}

async function generateClientReport(doc) {
  // Implémentation détaillée du rapport clients
  doc.fontSize(14).text('Rapport détaillé des clients...', 50, 150);
}

async function generateFinancialReport(doc, startDate, endDate) {
  // Implémentation détaillée du rapport financier
  doc.fontSize(14).text('Rapport financier détaillé...', 50, 150);
}

module.exports = router;