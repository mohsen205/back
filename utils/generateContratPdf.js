const fs = require('fs');
const PDFDocument = require('pdfkit');
const path = require('path');

const generateContractPdf = (contrat, user, projets = [], outputPath) => {
  return new Promise((resolve, reject) => {
    try {
      const doc = new PDFDocument({ size: 'A4', margin: 40 });

      // Bloquer la création automatique de nouvelle page
      doc.addPage = () => { /* rien */ };

      const dir = path.dirname(outputPath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      const stream = fs.createWriteStream(outputPath);
      doc.pipe(stream);

      /** HEADER **/
      const headerHeight = 70;
      const footerHeight = 40;
      const headerColor = '#1F4E79';

      doc.rect(0, 0, doc.page.width, headerHeight).fill(headerColor);

      doc.fillColor('#f1d70f')
        .font('Helvetica-Bold')
        .fontSize(22)
        .text('Crowdfundg', 40, 25);

      const titleWidth = doc.widthOfString('CONTRAT JURIDIQUE');
      doc.fontSize(18)
        .text('CONTRAT JURIDIQUE', doc.page.width - 40 - titleWidth, 28);

      /** CONTENU CENTRÉ **/
      const content = [
        {
          title: '1. Informations sur le contrat',
          items: [
            `Objet : ${contrat.objet}`,
            `Montant : ${contrat.montant ?? 'N/A'} DNT`,
            `Direction : ${contrat.direction ?? 'N/A'}`,
            `Date signature : ${contrat.dateSignature?.toLocaleDateString() ?? 'N/A'}`,
            `Date effet : ${contrat.dateEffet?.toLocaleDateString() ?? 'N/A'}`,
            `Durée : ${contrat.duree ?? 'N/A'}`,
            `Date fin : ${contrat.dateFin?.toLocaleDateString() ?? 'N/A'}`,
            `Préavis : ${contrat.datePreavis?.toLocaleDateString() ?? 'N/A'}`
          ]
        },
        {
          title: '2. Informations sur le porteur',
          items: [
            `Nom : ${user.nom} ${user.prenom}`,
            `Email : ${user.email}`,
            `Téléphone : ${user.phone ?? 'N/A'}`
          ]
        },
        projets.length > 0 ? {
          title: '3. Projets associés',
          items: projets.map((p, i) =>
            `• ${i + 1}) ${p.nom} - ${p.description ?? 'Sans description'}`
          )
        } : null
      ].filter(Boolean);

      // Calcul hauteur contenu
      let totalHeight = 0;
      content.forEach(block => {
        totalHeight += doc.heightOfString(block.title, { width: doc.page.width - 100 }) + 8;
        block.items.forEach(item => {
          totalHeight += doc.heightOfString(item, { width: doc.page.width - 110 }) + 4;
        });
        totalHeight += 12;
      });

      const availableHeight = doc.page.height - headerHeight - footerHeight - 40;
      const startY = headerHeight + (availableHeight - totalHeight) / 2;

      let currentY = startY;

      content.forEach(section => {
        doc.fontSize(14).fillColor('#1F4E79').font('Helvetica-Bold')
          .text(section.title, 50, currentY, { width: doc.page.width - 100 });
        currentY += doc.heightOfString(section.title, { width: doc.page.width - 100 }) + 6;

        const blockHeight = section.items.reduce((acc, item) => acc + doc.heightOfString(item, { width: doc.page.width - 110 }) + 4, 0) + 8;
        doc.rect(45, currentY - 4, doc.page.width - 90, blockHeight).fill('#F0F0F0');

        currentY += 4;

        section.items.forEach(item => {
          doc.fontSize(11).fillColor('#000000').font('Helvetica')
            .text(item, 55, currentY, { width: doc.page.width - 110 });
          currentY += doc.heightOfString(item, { width: doc.page.width - 110 }) + 4;
        });

        currentY += 10;
      });

      /** FOOTER **/
      doc.fontSize(10)
        .fillColor('#999')
        .text(
          'Centre juridique Crowdfundg - Contact : (+216) 71 754 000',
          0,
          doc.page.height - footerHeight + 10,
          { align: 'center' }
        );

      doc.end();

      stream.on('finish', () => resolve());
      stream.on('error', reject);

    } catch (error) {
      reject(error);
    }
  });
};

module.exports = generateContractPdf;
