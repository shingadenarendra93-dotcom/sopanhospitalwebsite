import { Appointment, ReminderSettings } from '../types';

/**
 * Format a human-readable reminder message for WhatsApp or Email
 */
export function formatAppointmentReminderMessage(appointment: Appointment, leadTimeHours: number = 24): string {
  const hospitalName = 'Sopan Hospital & Neurology Institute';
  const address = appointment.visitType === 'Tele-Neurology Video Consultation'
    ? 'Secure HD Tele-Neurology Video Room (Link sent via SMS/WhatsApp)'
    : 'Shrihari Kute Marg, Near Sandip Hotel, Mumbai Naka, Nashik - 422001';

  return `🏥 *APPOINTMENT REMINDER - ${hospitalName.toUpperCase()}*

Namaste ${appointment.patientName},

This is an automated reminder for your upcoming neurological consultation with:
👨‍⚕️ *${appointment.doctorName}*
🩺 Department: *${appointment.department}*
🗓️ Date: *${appointment.date}*
⏰ Allocated Slot: *${appointment.timeSlot}*
🎫 Token Number: *${appointment.tokenNumber}*
📍 Format: *${appointment.visitType}*
🏢 Location: ${address}

📋 *Important Patient Checklist:*
• Please report 15 minutes before your slot time.
• Carry prior brain MRI/CT films, EEG reports, and current medication prescription slips.
• If diabetic or on blood thinners (Ecosprin/Warfarin), bring your daily dosage diary.

📞 *Hospital Desk:* 0253 2317364
🚨 *24/7 Stroke & Trauma Helpline:* +91 94220 11223
🌐 Nashik, Maharashtra`;
}

/**
 * Generate a standard RFC 5545 iCalendar (.ics) file for Google Calendar, Apple Calendar, Outlook
 */
export function generateIcsCalendarFile(appointment: Appointment): string {
  // Parse appointment date and time
  const [year, month, day] = appointment.date.split('-').map(Number);
  
  // Parse time slot e.g. "11:00 AM" or "02:30 PM"
  let hours = 10;
  let minutes = 0;
  if (appointment.timeSlot) {
    const timeMatch = appointment.timeSlot.match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (timeMatch) {
      hours = Number(timeMatch[1]);
      minutes = Number(timeMatch[2]);
      const ampm = timeMatch[3].toUpperCase();
      if (ampm === 'PM' && hours < 12) hours += 12;
      if (ampm === 'AM' && hours === 12) hours = 0;
    }
  }

  const pad = (n: number) => String(n).padStart(2, '0');
  
  // Format as YYYYMMDDTHHMMSS
  const startStr = `${year}${pad(month)}${pad(day)}T${pad(hours)}${pad(minutes)}00`;
  // Default appointment duration: 45 minutes
  const endMinutes = minutes + 45;
  const endHours = hours + Math.floor(endMinutes / 60);
  const normalizedEndMinutes = endMinutes % 60;
  const endStr = `${year}${pad(month)}${pad(day)}T${pad(endHours)}${pad(normalizedEndMinutes)}00`;
  const nowStr = new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  const summary = `Neurology OPD: ${appointment.doctorName} [Token: ${appointment.tokenNumber}]`;
  const location = appointment.visitType === 'Tele-Neurology Video Consultation'
    ? 'Tele-Neurology Video Room'
    : 'Sopan Hospital, Shrihari Kute Marg, Mumbai Naka, Nashik';
  const description = `Appointment with ${appointment.doctorName}\\nToken: ${appointment.tokenNumber}\\nDepartment: ${appointment.department}\\nPatient: ${appointment.patientName}\\nFormat: ${appointment.visitType}\\nReason: ${appointment.symptoms}\\nHospital Phone: 0253 2317364`;

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Sopan Hospital//Appointment Reminder//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:sopan-apt-${appointment.id}-${Date.now()}@sopan-hospital.com`,
    `DTSTAMP:${nowStr}`,
    `DTSTART:${startStr}`,
    `DTEND:${endStr}`,
    `SUMMARY:${summary}`,
    `LOCATION:${location}`,
    `DESCRIPTION:${description}`,
    'STATUS:CONFIRMED',
    // 24 Hour Alarm reminder
    'BEGIN:VALARM',
    'TRIGGER:-PT24H',
    'ACTION:DISPLAY',
    `DESCRIPTION:Reminder: Appointment with ${appointment.doctorName} tomorrow at ${appointment.timeSlot}`,
    'END:VALARM',
    // 2 Hour Alarm reminder
    'BEGIN:VALARM',
    'TRIGGER:-PT2H',
    'ACTION:DISPLAY',
    `DESCRIPTION:Reminder: Appointment with ${appointment.doctorName} in 2 hours`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
}

/**
 * Trigger download of the generated .ics file in browser
 */
export function downloadIcsFile(appointment: Appointment): void {
  const icsData = generateIcsCalendarFile(appointment);
  const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `Sopan_Hospital_Appointment_${appointment.tokenNumber}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
