import { jsPDF } from 'jspdf';
import { Appointment } from '../types';

/**
 * Generates and downloads an official, beautifully formatted PDF Token Slip
 * for Confirmed Sopan Hospital OPD Appointments.
 */
export function generateTokenSlipPdf(appointment: Appointment): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth(); // 210mm
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;

  // --- BRAND COLORS ---
  const navy = [11, 60, 149] as const;      // #0B3C95
  const bronze = [142, 91, 62] as const;    // #8E5B3E
  const darkCharcoal = [39, 35, 30] as const;// #27231E
  const slateMuted = [100, 116, 139] as const; // #64748B
  const emerald = [5, 150, 105] as const;    // #059669
  const softBg = [250, 247, 242] as const;   // #FAF7F2
  const borderLight = [229, 231, 235] as const; // #E5E7EB

  // --- 1. OUTER DECORATIVE BORDER ---
  doc.setDrawColor(218, 205, 192);
  doc.setLineWidth(0.6);
  doc.rect(margin - 4, margin - 4, contentWidth + 8, 275, 'S');

  doc.setDrawColor(142, 91, 62);
  doc.setLineWidth(0.2);
  doc.rect(margin - 2.5, margin - 2.5, contentWidth + 5, 272, 'S');

  // --- 2. HEADER BANNER ---
  doc.setFillColor(...softBg);
  doc.rect(margin, margin, contentWidth, 38, 'F');
  doc.setDrawColor(...borderLight);
  doc.rect(margin, margin, contentWidth, 38, 'S');

  // Hospital Name
  doc.setTextColor(...navy);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('SOPAN HOSPITAL & NEUROLOGY INSTITUTE', margin + contentWidth / 2, margin + 8, { align: 'center' });

  // Tagline
  doc.setTextColor(...bronze);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.text('NABH ACCREDITED ADVANCED NEUROSCIENCE & STROKE CENTER', margin + contentWidth / 2, margin + 14, { align: 'center' });

  // Address
  doc.setTextColor(...darkCharcoal);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Shrihari Kute Marg, Near Sandip Hotel, Mumbai Naka, Nashik - 422001, Maharashtra', margin + contentWidth / 2, margin + 19, { align: 'center' });

  // Hotline / Contact
  doc.setTextColor(185, 28, 28); // Rose/Red for emergency
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('24/7 Stroke Helpline: 0253 2317364  |  WhatsApp: +91 9405545521', margin + contentWidth / 2, margin + 24, { align: 'center' });

  // Director details
  doc.setTextColor(...darkCharcoal);
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7.5);
  doc.text('Director & Chief Consultant: Dr. Sanjay Sopan Varade (MD, DM Neuro CMC Vellore) • 35+ Years Clinical Practice', margin + contentWidth / 2, margin + 30, { align: 'center' });

  // --- 3. SLIP TITLE & TOKEN HIGHLIGHT CARD ---
  let currentY = margin + 44;

  // Title Box
  doc.setFillColor(...navy);
  doc.roundedRect(margin, currentY, contentWidth * 0.58, 24, 3, 3, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.text('OPD APPOINTMENT TOKEN SLIP', margin + 6, currentY + 9);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  doc.text('Official Outpatient Consultation Pass', margin + 6, currentY + 16);

  // Status & Token Box (Right side)
  const tokenBoxX = margin + contentWidth * 0.60;
  const tokenBoxW = contentWidth * 0.40;

  doc.setFillColor(236, 253, 245); // Emerald-50
  doc.roundedRect(tokenBoxX, currentY, tokenBoxW, 24, 3, 3, 'F');
  doc.setDrawColor(...emerald);
  doc.setLineWidth(0.6);
  doc.roundedRect(tokenBoxX, currentY, tokenBoxW, 24, 3, 3, 'S');

  doc.setTextColor(...emerald);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('STATUS: CONFIRMED', tokenBoxX + tokenBoxW / 2, currentY + 7, { align: 'center' });

  doc.setTextColor(...navy);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(`TOKEN: ${appointment.tokenNumber || 'NEURO-01'}`, tokenBoxX + tokenBoxW / 2, currentY + 16, { align: 'center' });

  currentY += 30;

  // --- 4. PATIENT & CLINICAL DETAILS GRID ---
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(...borderLight);
  doc.setLineWidth(0.4);
  doc.roundedRect(margin, currentY, contentWidth, 90, 3, 3, 'FD');

  // Section Header
  doc.setFillColor(243, 244, 246);
  doc.rect(margin, currentY, contentWidth, 9, 'F');
  doc.setTextColor(...navy);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('PATIENT & APPOINTMENT SCHEDULE DETAILS', margin + 5, currentY + 6);

  currentY += 16;

  const col1X = margin + 6;
  const col1ValX = margin + 44;
  const col2X = margin + contentWidth * 0.52;
  const col2ValX = margin + contentWidth * 0.52 + 38;
  const rowHeight = 11;

  const drawRow = (
    label1: string, val1: string,
    label2: string, val2: string,
    y: number
  ) => {
    doc.setTextColor(...slateMuted);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8.5);
    doc.text(label1, col1X, y);
    doc.text(label2, col2X, y);

    doc.setTextColor(...darkCharcoal);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.text(val1, col1ValX, y);
    doc.text(val2, col2ValX, y);
  };

  drawRow(
    'Patient Name:', appointment.patientName,
    'Age & Gender:', `${appointment.patientAge || '—'} Yrs  /  ${appointment.patientGender || 'Not Specified'}`,
    currentY
  );

  currentY += rowHeight;
  drawRow(
    'Mobile Number:', appointment.patientPhone || '—',
    'Email Address:', appointment.patientEmail || 'Not Provided',
    currentY
  );

  currentY += rowHeight;
  drawRow(
    'Specialist Doctor:', appointment.doctorName || 'Dr. Sanjay Sopan Varade',
    'Department:', appointment.department || 'Comprehensive Stroke Center',
    currentY
  );

  currentY += rowHeight;
  drawRow(
    'Appointment Date:', appointment.date || '—',
    'Allocated Time:', appointment.timeSlot || '10:00 AM - 01:00 PM',
    currentY
  );

  currentY += rowHeight;
  drawRow(
    'Daily OPD Queue:', `Slot #${appointment.slotNumber || 1} of 50`,
    'Consultation Type:', appointment.visitType || 'In-Person Hospital OPD',
    currentY
  );

  currentY += rowHeight;
  doc.setTextColor(...slateMuted);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.text('Reason for Visit:', col1X, currentY);

  doc.setTextColor(...darkCharcoal);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  const symptomsText = appointment.symptoms || 'General neurological consultation & review';
  const splitSymptoms = doc.splitTextToSize(symptomsText, contentWidth - 46);
  doc.text(splitSymptoms, col1ValX, currentY);

  currentY += 20;

  // --- 5. IMPORTANT PATIENT INSTRUCTIONS BOX ---
  doc.setFillColor(...softBg);
  doc.roundedRect(margin, currentY, contentWidth, 48, 3, 3, 'F');
  doc.setDrawColor(218, 205, 192);
  doc.roundedRect(margin, currentY, contentWidth, 48, 3, 3, 'S');

  doc.setTextColor(...bronze);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.text('IMPORTANT INSTRUCTIONS FOR PATIENT & CAREGIVER:', margin + 6, currentY + 8);

  doc.setTextColor(...darkCharcoal);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8);
  const instructions = [
    '1. Reporting Time: Please arrive at the OPD reception desk 15 minutes before your scheduled slot.',
    '2. Token Slip Verification: Present this downloaded token pass or show it on your mobile device at registration.',
    '3. Medical Records: Bring previous prescriptions, hospital discharge cards, MRI/CT scan films, and EEG recordings.',
    '4. Fasting / Lab Tests: If blood investigations (lipid profile, blood sugar) are requested, remain 10-12 hours fasting.',
    '5. Acute Stroke Alert: If acute facial droop, arm weakness, or speech loss appears, rush to our 24/7 Casualty without waiting.'
  ];

  let instY = currentY + 15;
  instructions.forEach(inst => {
    doc.text(inst, margin + 6, instY);
    instY += 6.5;
  });

  currentY += 56;

  // --- 6. FOOTER & DIGITAL VERIFICATION ---
  // Barcode aesthetic
  doc.setTextColor(...darkCharcoal);
  doc.setFont('courier', 'bold');
  doc.setFontSize(14);
  doc.text('||| | |||| || | ||| |||| | || | |||| |||', margin + contentWidth / 2, currentY, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(...slateMuted);
  doc.text(`Booking Ref: ${appointment.id.toUpperCase()}  •  Issued: ${new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}`, margin + contentWidth / 2, currentY + 6, { align: 'center' });

  // Digital verification stamp
  currentY += 14;
  doc.setDrawColor(...borderLight);
  doc.line(margin, currentY, margin + contentWidth, currentY);

  currentY += 6;
  doc.setTextColor(...emerald);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('✓ DIGITALLY VERIFIED BY SOPAN HOSPITAL OPD DESK', margin + 6, currentY);

  doc.setTextColor(...slateMuted);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.text('Dr. Sanjay Sopan Varade Clinic Desk  |  Computer Generated Token Slip', margin + contentWidth - 6, currentY, { align: 'right' });

  // Trigger browser download
  const cleanPatientName = (appointment.patientName || 'Patient').replace(/[^a-zA-Z0-9]/g, '_');
  const fileName = `Sopan_Hospital_Token_Slip_${appointment.tokenNumber || 'OPD'}_${cleanPatientName}.pdf`;
  doc.save(fileName);
}
