import { SELLER_LEGAL_INFO, CONTRACT_SECTIONS } from './legalInfo';

const SITE_URL = 'https://fathrobot--fathrobot-5c48d.us-central1.hosted.app';

/* ================================================================
   YORDAMCHI FUNKSIYALAR
   ================================================================ */
async function createPdfDoc() {
  const { jsPDF } = await import('jspdf/dist/jspdf.umd.min.js');
  return new jsPDF({ unit: 'mm', format: 'a4' });
}

async function loadLogoDataUrl() {
  const res = await fetch('/logos/fath-robot.png');
  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

async function generateQrDataUrl(text) {
  const QRCode = (await import('qrcode')).default;
  return QRCode.toDataURL(text, {
    width: 200,
    margin: 1,
    color: { dark: '#0f172a', light: '#ffffff' },
    errorCorrectionLevel: 'M',
  });
}

/** Hujjat ma'lumotlaridan VRF tekshiruv kodi */
function generateVerificationCode(docNumber, licenseKey, buyerName) {
  const raw = `${docNumber}|${licenseKey}|${buyerName || ''}|FATH-SEC-2025`;
  let hash = 0;
  for (let i = 0; i < raw.length; i++) {
    hash = ((hash << 5) - hash + raw.charCodeAt(i)) | 0;
  }
  const hex = Math.abs(hash).toString(16).toUpperCase().padStart(8, '0');
  return `VRF-${hex.slice(0, 4)}-${hex.slice(4, 8)}`;
}

/* ================================================================
   HIMOYA ELEMENTLARI
   ================================================================ */

/** Diagonal watermark — har sahifada */
function drawWatermark(doc) {
  doc.saveGraphicsState();
  const gs = new doc.GState({ opacity: 0.035 });
  doc.setGState(gs);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(50);
  doc.setTextColor(15, 23, 42);
  for (let row = 0; row < 4; row++) {
    doc.text('FATH ROBOT', 105, 55 + row * 70, { angle: 30, align: 'center' });
  }
  doc.restoreGraphicsState();
}

/** Xavfsizlik chegarasi — ikki qatlam ramka */
function drawSecurityBorder(doc) {
  doc.setDrawColor(3, 105, 161);
  doc.setLineWidth(0.6);
  doc.rect(5, 4, 200, 288);
  doc.setDrawColor(14, 165, 233);
  doc.setLineWidth(0.2);
  doc.rect(7, 6, 196, 284);
  // Burchak naqshlari
  [[5, 4], [193, 4], [5, 280], [193, 280]].forEach(([cx, cy]) => {
    doc.setDrawColor(3, 105, 161);
    doc.setLineWidth(0.35);
    doc.line(cx, cy, cx + 12, cy);
    doc.line(cx, cy, cx, cy + 12);
  });
}

/** 3pt mikro-matn (fotokopiyadа ko'rinmaydi) */
function drawMicrotext(doc, y) {
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(2.5);
  doc.setTextColor(210, 218, 226);
  doc.text(('FATH-ROBOT-RASMIY-HUJJAT  •  ').repeat(7), 14, y, { maxWidth: 182 });
}

/* ================================================================
   SARLAVHA — Professional dizayn
   ================================================================ */
function drawHeader(doc, title, subtitle, logoDataUrl, docNumber, verificationCode) {
  // Gradient header fon
  const steps = 40;
  for (let i = 0; i < steps; i++) {
    const r = Math.round(15 + (3 - 15) * (i / steps));
    const g = Math.round(23 + (105 - 23) * (i / steps));
    const b = Math.round(42 + (161 - 42) * (i / steps));
    doc.setFillColor(r, g, b);
    doc.rect(5, 4 + i * (38 / steps), 200, 38 / steps + 0.3, 'F');
  }

  // Logo (oq fonda doira)
  if (logoDataUrl) {
    doc.setFillColor(255, 255, 255);
    doc.circle(22, 19, 9, 'F');
    doc.addImage(logoDataUrl, 'PNG', 14, 11, 16, 16);
  }

  // Brend va sarlavhalar
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(18);
  doc.setTextColor(255, 255, 255);
  doc.text('FATH ROBOT', 36, 17);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(186, 230, 253);
  doc.text(title, 36, 24);

  doc.setFontSize(7.5);
  doc.setTextColor(147, 197, 253);
  doc.text(subtitle, 36, 30);

  // O'ng tomonda hujjat raqami va VRF
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7);
  doc.setTextColor(255, 255, 255);
  doc.text(docNumber || '', 200, 17, { align: 'right' });
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(6.5);
  doc.setTextColor(186, 230, 253);
  doc.text(verificationCode || '', 200, 23, { align: 'right' });

  // Pastki chiziq
  doc.setDrawColor(14, 165, 233);
  doc.setLineWidth(0.5);
  doc.line(5, 42, 205, 42);
}

/* ================================================================
   KEY-VALUE VA MATN YORDAMCHILARI
   ================================================================ */
function drawWrapped(doc, text, x, y, width, lineH = 4.2) {
  const lines = doc.splitTextToSize(String(text || '-'), width);
  lines.forEach((ln, i) => doc.text(ln, x, y + i * lineH));
  return y + lines.length * lineH;
}

function drawKV(doc, key, value, y, labelW = 50) {
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(51, 65, 85);
  doc.text(`${key}:`, 16, y);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(30, 41, 59);
  return drawWrapped(doc, value || '-', 16 + labelW, y, 182 - labelW);
}

function drawSection(doc, title, y) {
  doc.setDrawColor(14, 165, 233);
  doc.setLineWidth(0.3);
  doc.line(14, y - 1, 196, y - 1);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(3, 105, 161);
  doc.text(title, 16, y + 4);
  return y + 8;
}

/* ================================================================
   FOOTER VA PAGINATION
   ================================================================ */
function drawFooter(doc, pageNum, vCode) {
  drawMicrotext(doc, 281);
  doc.setDrawColor(3, 105, 161);
  doc.setLineWidth(0.3);
  doc.line(14, 283, 196, 283);
  doc.setFontSize(6.5);
  doc.setTextColor(100, 116, 139);
  doc.setFont('helvetica', 'normal');
  doc.text('FATH ROBOT — rasmiy himoyalangan hujjat', 14, 287);
  doc.text(`${vCode || ''}  •  ${pageNum}-sahifa`, 196, 287, { align: 'right' });
}

function checkPage(doc, y, needed, pr, vCode) {
  if (y + needed > 262) {
    drawFooter(doc, pr.num, vCode);
    doc.addPage();
    pr.num += 1;
    drawWatermark(doc);
    drawSecurityBorder(doc);
    return 18;
  }
  return y;
}

/* ================================================================
   QR KOD VA TEKSHIRUV BLOKI
   ================================================================ */
async function drawQrVerificationBlock(doc, vCode, qrDataUrl, y) {
  y = Math.max(y + 6, 220);

  // Fon paneli
  doc.setFillColor(240, 249, 255);
  doc.setDrawColor(3, 105, 161);
  doc.setLineWidth(0.3);
  doc.roundedRect(14, y, 182, 34, 2, 2, 'FD');

  // QR kod (chap tomonda)
  if (qrDataUrl) {
    doc.addImage(qrDataUrl, 'PNG', 18, y + 3, 28, 28);
  }

  // Matn (o'ngda)
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(3, 105, 161);
  doc.text('Hujjat haqiqiyligini tekshiring', 52, y + 8);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  doc.text('QR kodni skanerlang yoki quyidagi manzilga tashrif buyuring:', 52, y + 14);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(3, 105, 161);
  doc.text(`${SITE_URL}/verify?code=${vCode}`, 52, y + 20);

  // Tekshiruv kodi
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(15, 23, 42);
  doc.text(vCode, 192, y + 28, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(5.5);
  doc.setTextColor(100, 116, 139);
  doc.text('HIMOYALANGAN HUJJAT', 192, y + 32, { align: 'right' });

  return y + 36;
}

/* ================================================================
   IMZO BLOKI
   ================================================================ */
function drawSignatureBlock(doc, sellerName, buyerName, sellerAddress, y) {
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.15);

  // Chap: Sotuvchi
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(14, y, 86, 32, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(3, 105, 161);
  doc.text('SOTUVCHI', 18, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  doc.text(sellerName || '-', 18, y + 12);

  if (sellerAddress) {
    doc.setFontSize(6.5);
    doc.setTextColor(100, 116, 139);
    const addrLines = doc.splitTextToSize(sellerAddress, 78);
    addrLines.slice(0, 2).forEach((ln, i) => doc.text(ln, 18, y + 17 + i * 3.5));
  }

  doc.setDrawColor(100, 116, 139);
  doc.line(18, y + 26, 94, y + 26);
  doc.setFontSize(5.5);
  doc.setTextColor(148, 163, 184);
  doc.text('(imzo va sana)', 56, y + 30, { align: 'center' });

  // O'ng: Xaridor
  doc.setDrawColor(203, 213, 225);
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(110, y, 86, 32, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(3, 105, 161);
  doc.text('XARIDOR', 114, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.setTextColor(51, 65, 85);
  doc.text(buyerName || '-', 114, y + 12);

  doc.setDrawColor(100, 116, 139);
  doc.line(114, y + 26, 190, y + 26);
  doc.setFontSize(5.5);
  doc.setTextColor(148, 163, 184);
  doc.text('(imzo va sana)', 152, y + 30, { align: 'center' });

  return y + 36;
}

/* ================================================================
   GUVOHNOMA PDF — Professional dizayn
   ================================================================ */
export async function downloadCertificatePdf(license, toDateLabel) {
  const doc = await createPdfDoc();
  let logoDataUrl = '';
  try { logoDataUrl = await loadLogoDataUrl(); } catch {}

  const cert = license.certificate || {};
  const seller = cert.seller || SELLER_LEGAL_INFO;
  const buyer = cert.buyer || {};

  const docNumber = cert.documentNumber || `CERT-${(license.id || '').slice(0, 8).toUpperCase()}`;
  const vCode = generateVerificationCode(docNumber, license.licenseKey, buyer.fullName);
  const verifyUrl = `${SITE_URL}/verify?code=${vCode}`;

  let qrDataUrl = '';
  try { qrDataUrl = await generateQrDataUrl(verifyUrl); } catch {}

  // 1-sahifa
  drawWatermark(doc);
  drawSecurityBorder(doc);
  drawHeader(doc, 'LITSENZIYA GUVOHNOMASI', 'Rasmiy tasdiqlangan hujjat', logoDataUrl, docNumber, vCode);

  const pr = { num: 1 };
  let y = 48;

  // === Asosiy ma'lumotlar ===
  y = drawSection(doc, "Asosiy ma'lumotlar", y);
  y = drawKV(doc, 'Guvohnoma raqami', docNumber, y);
  y = drawKV(doc, 'Litsenziya kaliti', license.licenseKey || '-', y + 1.5);
  y = drawKV(doc, 'MT5 hisob raqami', license.accountId || cert.accountId || '-', y + 1.5);
  y = drawKV(doc, 'Tarif rejasi', license.planName || license.planId || '-', y + 1.5);
  y = drawKV(doc, 'Holati', license.status === 'active' ? 'Faol' : license.status || '-', y + 1.5);
  y = drawKV(doc, 'Amal muddati', toDateLabel(license.expiresAt), y + 1.5);

  // === Sotuvchi ===
  y += 4;
  y = checkPage(doc, y, 40, pr, vCode);
  y = drawSection(doc, "Sotuvchi ma'lumotlari", y);
  y = drawKV(doc, 'Brend', seller.brand || '-', y);
  y = drawKV(doc, 'Yuridik shakli', seller.legalForm || '-', y + 1.5);
  y = drawKV(doc, 'Rahbar F.I.Sh', seller.ownerFullName || '-', y + 1.5);
  y = drawKV(doc, 'INN / JSHSHIR', seller.inn || '-', y + 1.5);
  y = drawKV(doc, "Ro'yxat raqami", seller.registrationNumber || '-', y + 1.5);
  y = drawKV(doc, 'Yuridik manzil', seller.legalAddress || '-', y + 1.5);

  // === Xaridor ===
  y += 4;
  y = checkPage(doc, y, 30, pr, vCode);
  y = drawSection(doc, "Xaridor ma'lumotlari", y);
  y = drawKV(doc, 'F.I.Sh', buyer.fullName || '-', y);
  y = drawKV(doc, 'Pasport / ID', buyer.passport || '-', y + 1.5);
  y = drawKV(doc, 'Telefon raqami', buyer.phone || '-', y + 1.5);
  y = drawKV(doc, 'Manzil', buyer.address || '-', y + 1.5);

  // === Imzolar ===
  y += 6;
  y = checkPage(doc, y, 70, pr, vCode);
  y = drawSignatureBlock(doc, seller.ownerFullName, buyer.fullName, seller.legalAddress, y);

  // === QR kod va tekshiruv ===
  await drawQrVerificationBlock(doc, vCode, qrDataUrl, y);

  drawFooter(doc, pr.num, vCode);
  doc.save(`guvohnoma-${license.licenseKey || license.id}.pdf`);
}

/* ================================================================
   SHARTNOMA PDF — Professional dizayn
   ================================================================ */
export async function downloadContractPdf(license, toDateLabel) {
  const doc = await createPdfDoc();
  let logoDataUrl = '';
  try { logoDataUrl = await loadLogoDataUrl(); } catch {}

  const contract = license.contract || {};
  const cert = license.certificate || {};
  const seller = contract.seller || cert.seller || SELLER_LEGAL_INFO;
  const buyer = contract.buyer || cert.buyer || {};

  const docNumber = contract.contractNumber || `CTR-${(license.id || '').slice(0, 8).toUpperCase()}`;
  const vCode = generateVerificationCode(docNumber, license.licenseKey, buyer.fullName);
  const verifyUrl = `${SITE_URL}/verify?code=${vCode}`;

  let qrDataUrl = '';
  try { qrDataUrl = await generateQrDataUrl(verifyUrl); } catch {}

  // 1-sahifa
  drawWatermark(doc);
  drawSecurityBorder(doc);
  drawHeader(doc, 'YURIDIK SHARTNOMA', 'Litsenziya sotib olish va foydalanish shartnomasi', logoDataUrl, docNumber, vCode);

  const pr = { num: 1 };
  let y = 48;

  // === Shartnoma rekvizitlari ===
  y = drawSection(doc, 'Shartnoma rekvizitlari', y);
  y = drawKV(doc, 'Shartnoma raqami', docNumber, y);
  y = drawKV(doc, 'Litsenziya kaliti', license.licenseKey || '-', y + 1.5);
  y = drawKV(doc, 'MT5 hisob raqami', license.accountId || '-', y + 1.5);
  y = drawKV(doc, 'Tarif rejasi', license.planName || license.planId || '-', y + 1.5);
  y = drawKV(doc, 'Amal muddati', toDateLabel(license.expiresAt), y + 1.5);

  // === Tomonlar — Sotuvchi ===
  y += 4;
  y = checkPage(doc, y, 35, pr, vCode);
  y = drawSection(doc, 'Sotuvchi', y);
  y = drawKV(doc, 'Rahbar F.I.Sh', seller.ownerFullName || '-', y);
  y = drawKV(doc, 'Yuridik shakli', seller.legalForm || '-', y + 1.5);
  y = drawKV(doc, 'INN / JSHSHIR', seller.inn || '-', y + 1.5);
  y = drawKV(doc, 'Yuridik manzil', seller.legalAddress || '-', y + 1.5);

  // === Tomonlar — Xaridor ===
  y += 4;
  y = checkPage(doc, y, 25, pr, vCode);
  y = drawSection(doc, 'Xaridor', y);
  y = drawKV(doc, 'F.I.Sh', buyer.fullName || '-', y);
  y = drawKV(doc, 'Pasport / ID', buyer.passport || '-', y + 1.5);
  y = drawKV(doc, 'Telefon raqami', buyer.phone || '-', y + 1.5);

  // === Shartnoma bandlari ===
  const overrideTerms = Array.isArray(contract.terms) ? contract.terms : null;

  if (overrideTerms) {
    y += 4;
    y = checkPage(doc, y, 14, pr, vCode);
    y = drawSection(doc, 'Shartnoma bandlari', y);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(51, 65, 85);
    overrideTerms.forEach((term, idx) => {
      y = checkPage(doc, y, 10, pr, vCode);
      y = drawWrapped(doc, `${idx + 1}. ${term}`, 18, y, 174, 4) + 1;
    });
  } else {
    CONTRACT_SECTIONS.forEach((section) => {
      y += 4;
      y = checkPage(doc, y, 14, pr, vCode);
      y = drawSection(doc, section.title, y);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(51, 65, 85);
      section.items.forEach((item, idx) => {
        y = checkPage(doc, y, 10, pr, vCode);
        y = drawWrapped(doc, `${idx + 1}. ${item}`, 18, y, 174, 4) + 1;
      });
    });
  }

  // === Imzolar ===
  y += 6;
  y = checkPage(doc, y, 70, pr, vCode);
  y = drawSignatureBlock(doc, seller.ownerFullName, buyer.fullName, seller.legalAddress, y);

  // === QR kod va tekshiruv ===
  await drawQrVerificationBlock(doc, vCode, qrDataUrl, y);

  drawFooter(doc, pr.num, vCode);
  doc.save(`shartnoma-${license.licenseKey || license.id}.pdf`);
}
