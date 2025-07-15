import { InspectionItem } from '../types';
import { PHARMACY_INSPECTION_FORM } from './officialInspectionForms';

// Comprehensive Pharmacy Inspection Form based on Rwanda standards
export const PHARMACY_INSPECTION_ITEMS: InspectionItem[] = [
  // 1. Licensing & Registration
  {
    id: 'pharm-lic-1',
    question: 'Is the pharmacy licensed by Rwanda Food and Drugs Authority (Rwanda FDA)?',
    category: 'Licensing & Registration',
    maxScore: 10,
  },
  {
    id: 'pharm-lic-2',
    question: 'Is the pharmacy registration certificate displayed prominently?',
    category: 'Licensing & Registration',
    maxScore: 5,
  },
  {
    id: 'pharm-lic-3',
    question: 'Is the pharmacy operating within the scope of its license?',
    category: 'Licensing & Registration',
    maxScore: 8,
  },
  {
    id: 'pharm-lic-4',
    question: 'Are all required permits and certificates up to date?',
    category: 'Licensing & Registration',
    maxScore: 7,
  },

  // 2. Personnel & Qualifications
  {
    id: 'pharm-staff-1',
    question: 'Is there a qualified pharmacist on duty during operating hours?',
    category: 'Personnel & Qualifications',
    maxScore: 15,
  },
  {
    id: 'pharm-staff-2',
    question: 'Are staff members properly trained and certified?',
    category: 'Personnel & Qualifications',
    maxScore: 10,
  },
  {
    id: 'pharm-staff-3',
    question: 'Are continuing education records maintained for all staff?',
    category: 'Personnel & Qualifications',
    maxScore: 8,
  },
  {
    id: 'pharm-staff-4',
    question: 'Is there adequate supervision of non-pharmacist staff?',
    category: 'Personnel & Qualifications',
    maxScore: 7,
  },

  // 3. Storage & Handling
  {
    id: 'pharm-storage-1',
    question: 'Are medications stored at appropriate temperatures (2-8°C for refrigerated items)?',
    category: 'Storage & Handling',
    maxScore: 12,
  },
  {
    id: 'pharm-storage-2',
    question: 'Are controlled substances properly secured in locked cabinets?',
    category: 'Storage & Handling',
    maxScore: 15,
  },
  {
    id: 'pharm-storage-3',
    question: 'Are medications protected from light, moisture, and contamination?',
    category: 'Storage & Handling',
    maxScore: 10,
  },
  {
    id: 'pharm-storage-4',
    question: 'Is there proper segregation of different types of medications?',
    category: 'Storage & Handling',
    maxScore: 8,
  },
  {
    id: 'pharm-storage-5',
    question: 'Are storage areas clean, organized, and well-maintained?',
    category: 'Storage & Handling',
    maxScore: 8,
  },

  // 4. Inventory Management
  {
    id: 'pharm-inv-1',
    question: 'Are expired medications properly identified and segregated?',
    category: 'Inventory Management',
    maxScore: 12,
  },
  {
    id: 'pharm-inv-2',
    question: 'Is there a documented system for disposing of expired medications?',
    category: 'Inventory Management',
    maxScore: 10,
  },
  {
    id: 'pharm-inv-3',
    question: 'Are inventory records accurate and up to date?',
    category: 'Inventory Management',
    maxScore: 8,
  },
  {
    id: 'pharm-inv-4',
    question: 'Is there a first-in, first-out (FIFO) system in place?',
    category: 'Inventory Management',
    maxScore: 7,
  },
  {
    id: 'pharm-inv-5',
    question: 'Are controlled substances properly tracked and documented?',
    category: 'Inventory Management',
    maxScore: 15,
  },

  // 5. Dispensing Practices
  {
    id: 'pharm-disp-1',
    question: 'Are prescriptions properly verified before dispensing?',
    category: 'Dispensing Practices',
    maxScore: 12,
  },
  {
    id: 'pharm-disp-2',
    question: 'Is patient counseling provided for all dispensed medications?',
    category: 'Dispensing Practices',
    maxScore: 10,
  },
  {
    id: 'pharm-disp-3',
    question: 'Are medication labels complete and accurate?',
    category: 'Dispensing Practices',
    maxScore: 8,
  },
  {
    id: 'pharm-disp-4',
    question: 'Is there a system to check for drug interactions and allergies?',
    category: 'Dispensing Practices',
    maxScore: 10,
  },
  {
    id: 'pharm-disp-5',
    question: 'Are dispensing records properly maintained?',
    category: 'Dispensing Practices',
    maxScore: 8,
  },

  // 6. Quality Assurance
  {
    id: 'pharm-qa-1',
    question: 'Is there a quality management system in place?',
    category: 'Quality Assurance',
    maxScore: 10,
  },
  {
    id: 'pharm-qa-2',
    question: 'Are standard operating procedures (SOPs) documented and followed?',
    category: 'Quality Assurance',
    maxScore: 8,
  },
  {
    id: 'pharm-qa-3',
    question: 'Is there a system for reporting and investigating errors?',
    category: 'Quality Assurance',
    maxScore: 8,
  },
  {
    id: 'pharm-qa-4',
    question: 'Are regular internal audits conducted?',
    category: 'Quality Assurance',
    maxScore: 7,
  },

  // 7. Facility & Equipment
  {
    id: 'pharm-facility-1',
    question: 'Is the pharmacy facility clean and well-maintained?',
    category: 'Facility & Equipment',
    maxScore: 8,
  },
  {
    id: 'pharm-facility-2',
    question: 'Are refrigeration units properly maintained and monitored?',
    category: 'Facility & Equipment',
    maxScore: 10,
  },
  {
    id: 'pharm-facility-3',
    question: 'Is there adequate lighting and ventilation?',
    category: 'Facility & Equipment',
    maxScore: 7,
  },
  {
    id: 'pharm-facility-4',
    question: 'Are security measures adequate to prevent theft?',
    category: 'Facility & Equipment',
    maxScore: 8,
  },
  {
    id: 'pharm-facility-5',
    question: 'Is there proper waste management and disposal?',
    category: 'Facility & Equipment',
    maxScore: 7,
  },
];

// Comprehensive Hospital Inspection Form
export const HOSPITAL_INSPECTION_ITEMS: InspectionItem[] = [
  // 1. Licensing & Accreditation
  {
    id: 'hosp-lic-1',
    question: 'Is the hospital licensed by the Ministry of Health?',
    category: 'Licensing & Accreditation',
    maxScore: 15,
  },
  {
    id: 'hosp-lic-2',
    question: 'Are all required certificates and permits displayed?',
    category: 'Licensing & Accreditation',
    maxScore: 8,
  },
  {
    id: 'hosp-lic-3',
    question: 'Is the hospital operating within its licensed capacity?',
    category: 'Licensing & Accreditation',
    maxScore: 10,
  },
  {
    id: 'hosp-lic-4',
    question: 'Are specialized department licenses up to date?',
    category: 'Licensing & Accreditation',
    maxScore: 8,
  },

  // 2. Medical Staff & Qualifications
  {
    id: 'hosp-staff-1',
    question: 'Are all medical staff properly licensed and credentialed?',
    category: 'Medical Staff & Qualifications',
    maxScore: 15,
  },
  {
    id: 'hosp-staff-2',
    question: 'Is there adequate medical staff coverage for all shifts?',
    category: 'Medical Staff & Qualifications',
    maxScore: 12,
  },
  {
    id: 'hosp-staff-3',
    question: 'Are continuing medical education requirements met?',
    category: 'Medical Staff & Qualifications',
    maxScore: 10,
  },
  {
    id: 'hosp-staff-4',
    question: 'Is there proper supervision of medical residents and interns?',
    category: 'Medical Staff & Qualifications',
    maxScore: 8,
  },
  {
    id: 'hosp-staff-5',
    question: 'Are nursing staff ratios adequate for patient care?',
    category: 'Medical Staff & Qualifications',
    maxScore: 12,
  },

  // 3. Infection Prevention & Control
  {
    id: 'hosp-ipc-1',
    question: 'Is there an active infection prevention and control program?',
    category: 'Infection Prevention & Control',
    maxScore: 15,
  },
  {
    id: 'hosp-ipc-2',
    question: 'Are hand hygiene protocols properly implemented?',
    category: 'Infection Prevention & Control',
    maxScore: 12,
  },
  {
    id: 'hosp-ipc-3',
    question: 'Is personal protective equipment (PPE) available and used correctly?',
    category: 'Infection Prevention & Control',
    maxScore: 10,
  },
  {
    id: 'hosp-ipc-4',
    question: 'Are isolation procedures properly followed?',
    category: 'Infection Prevention & Control',
    maxScore: 10,
  },
  {
    id: 'hosp-ipc-5',
    question: 'Is medical waste properly segregated and disposed of?',
    category: 'Infection Prevention & Control',
    maxScore: 12,
  },
  {
    id: 'hosp-ipc-6',
    question: 'Are sterilization and disinfection procedures adequate?',
    category: 'Infection Prevention & Control',
    maxScore: 10,
  },

  // 4. Patient Safety & Quality
  {
    id: 'hosp-safety-1',
    question: 'Is there a patient safety program with incident reporting?',
    category: 'Patient Safety & Quality',
    maxScore: 12,
  },
  {
    id: 'hosp-safety-2',
    question: 'Are medication errors tracked and prevented?',
    category: 'Patient Safety & Quality',
    maxScore: 10,
  },
  {
    id: 'hosp-safety-3',
    question: 'Is patient identification properly verified?',
    category: 'Patient Safety & Quality',
    maxScore: 8,
  },
  {
    id: 'hosp-safety-4',
    question: 'Are fall prevention measures in place?',
    category: 'Patient Safety & Quality',
    maxScore: 8,
  },
  {
    id: 'hosp-safety-5',
    question: 'Is there a quality improvement program?',
    category: 'Patient Safety & Quality',
    maxScore: 10,
  },

  // 5. Medical Equipment & Technology
  {
    id: 'hosp-equip-1',
    question: 'Are medical devices properly maintained and calibrated?',
    category: 'Medical Equipment & Technology',
    maxScore: 12,
  },
  {
    id: 'hosp-equip-2',
    question: 'Is emergency equipment readily available and functional?',
    category: 'Medical Equipment & Technology',
    maxScore: 15,
  },
  {
    id: 'hosp-equip-3',
    question: 'Are equipment maintenance records up to date?',
    category: 'Medical Equipment & Technology',
    maxScore: 8,
  },
  {
    id: 'hosp-equip-4',
    question: 'Is there backup power for critical equipment?',
    category: 'Medical Equipment & Technology',
    maxScore: 10,
  },
  {
    id: 'hosp-equip-5',
    question: 'Are medical gases properly stored and monitored?',
    category: 'Medical Equipment & Technology',
    maxScore: 8,
  },

  // 6. Pharmacy & Medication Management
  {
    id: 'hosp-pharm-1',
    question: 'Is the hospital pharmacy properly licensed and staffed?',
    category: 'Pharmacy & Medication Management',
    maxScore: 12,
  },
  {
    id: 'hosp-pharm-2',
    question: 'Are medications stored under appropriate conditions?',
    category: 'Pharmacy & Medication Management',
    maxScore: 10,
  },
  {
    id: 'hosp-pharm-3',
    question: 'Is there a medication reconciliation process?',
    category: 'Pharmacy & Medication Management',
    maxScore: 8,
  },
  {
    id: 'hosp-pharm-4',
    question: 'Are high-risk medications properly managed?',
    category: 'Pharmacy & Medication Management',
    maxScore: 10,
  },
  {
    id: 'hosp-pharm-5',
    question: 'Is there 24/7 pharmacy coverage or on-call service?',
    category: 'Pharmacy & Medication Management',
    maxScore: 8,
  },

  // 7. Laboratory Services
  {
    id: 'hosp-lab-1',
    question: 'Are laboratory services properly licensed and accredited?',
    category: 'Laboratory Services',
    maxScore: 12,
  },
  {
    id: 'hosp-lab-2',
    question: 'Is there quality control for laboratory testing?',
    category: 'Laboratory Services',
    maxScore: 10,
  },
  {
    id: 'hosp-lab-3',
    question: 'Are laboratory results reported in a timely manner?',
    category: 'Laboratory Services',
    maxScore: 8,
  },
  {
    id: 'hosp-lab-4',
    question: 'Is there proper specimen handling and storage?',
    category: 'Laboratory Services',
    maxScore: 8,
  },
  {
    id: 'hosp-lab-5',
    question: 'Are critical values properly communicated?',
    category: 'Laboratory Services',
    maxScore: 8,
  },

  // 8. Emergency Services
  {
    id: 'hosp-emerg-1',
    question: 'Is the emergency department properly equipped and staffed?',
    category: 'Emergency Services',
    maxScore: 15,
  },
  {
    id: 'hosp-emerg-2',
    question: 'Are emergency response protocols in place?',
    category: 'Emergency Services',
    maxScore: 10,
  },
  {
    id: 'hosp-emerg-3',
    question: 'Is there a disaster preparedness plan?',
    category: 'Emergency Services',
    maxScore: 8,
  },
  {
    id: 'hosp-emerg-4',
    question: 'Are triage protocols properly implemented?',
    category: 'Emergency Services',
    maxScore: 8,
  },
  {
    id: 'hosp-emerg-5',
    question: 'Is there adequate ambulance and transport services?',
    category: 'Emergency Services',
    maxScore: 8,
  },

  // 9. Patient Records & Information Management
  {
    id: 'hosp-records-1',
    question: 'Are patient records complete, accurate, and secure?',
    category: 'Patient Records & Information Management',
    maxScore: 12,
  },
  {
    id: 'hosp-records-2',
    question: 'Is patient confidentiality properly maintained?',
    category: 'Patient Records & Information Management',
    maxScore: 10,
  },
  {
    id: 'hosp-records-3',
    question: 'Are medical records properly stored and accessible?',
    category: 'Patient Records & Information Management',
    maxScore: 8,
  },
  {
    id: 'hosp-records-4',
    question: 'Is there a system for medical record retention?',
    category: 'Patient Records & Information Management',
    maxScore: 7,
  },
  {
    id: 'hosp-records-5',
    question: 'Are electronic health records properly implemented?',
    category: 'Patient Records & Information Management',
    maxScore: 8,
  },

  // 10. Facility Management & Environment
  {
    id: 'hosp-facility-1',
    question: 'Is the hospital facility clean and well-maintained?',
    category: 'Facility Management & Environment',
    maxScore: 10,
  },
  {
    id: 'hosp-facility-2',
    question: 'Are patient rooms adequate and comfortable?',
    category: 'Facility Management & Environment',
    maxScore: 8,
  },
  {
    id: 'hosp-facility-3',
    question: 'Is there adequate water supply and sanitation?',
    category: 'Facility Management & Environment',
    maxScore: 10,
  },
  {
    id: 'hosp-facility-4',
    question: 'Are fire safety and evacuation procedures in place?',
    category: 'Facility Management & Environment',
    maxScore: 10,
  },
  {
    id: 'hosp-facility-5',
    question: 'Is there adequate parking and accessibility for disabled patients?',
    category: 'Facility Management & Environment',
    maxScore: 7,
  },
];

// Health Center/Clinic Inspection Items
export const CLINIC_INSPECTION_ITEMS: InspectionItem[] = [
  // 1. Licensing & Registration
  {
    id: 'clinic-lic-1',
    question: 'Is the health center licensed by the Ministry of Health?',
    category: 'Licensing & Registration',
    maxScore: 12,
  },
  {
    id: 'clinic-lic-2',
    question: 'Are operating licenses and certificates displayed?',
    category: 'Licensing & Registration',
    maxScore: 8,
  },
  {
    id: 'clinic-lic-3',
    question: 'Is the facility operating within its licensed scope?',
    category: 'Licensing & Registration',
    maxScore: 8,
  },

  // 2. Healthcare Personnel
  {
    id: 'clinic-staff-1',
    question: 'Are healthcare providers properly licensed and qualified?',
    category: 'Healthcare Personnel',
    maxScore: 12,
  },
  {
    id: 'clinic-staff-2',
    question: 'Is there adequate staffing for patient volume?',
    category: 'Healthcare Personnel',
    maxScore: 10,
  },
  {
    id: 'clinic-staff-3',
    question: 'Are staff training records maintained?',
    category: 'Healthcare Personnel',
    maxScore: 8,
  },

  // 3. Clinical Services
  {
    id: 'clinic-clinical-1',
    question: 'Are clinical protocols and guidelines followed?',
    category: 'Clinical Services',
    maxScore: 10,
  },
  {
    id: 'clinic-clinical-2',
    question: 'Is patient assessment and care properly documented?',
    category: 'Clinical Services',
    maxScore: 10,
  },
  {
    id: 'clinic-clinical-3',
    question: 'Are referral systems properly implemented?',
    category: 'Clinical Services',
    maxScore: 8,
  },
  {
    id: 'clinic-clinical-4',
    question: 'Is there continuity of care for chronic conditions?',
    category: 'Clinical Services',
    maxScore: 8,
  },

  // 4. Infection Prevention
  {
    id: 'clinic-ipc-1',
    question: 'Are infection prevention measures properly implemented?',
    category: 'Infection Prevention',
    maxScore: 12,
  },
  {
    id: 'clinic-ipc-2',
    question: 'Is hand hygiene practiced consistently?',
    category: 'Infection Prevention',
    maxScore: 10,
  },
  {
    id: 'clinic-ipc-3',
    question: 'Are instruments properly sterilized?',
    category: 'Infection Prevention',
    maxScore: 10,
  },
  {
    id: 'clinic-ipc-4',
    question: 'Is medical waste properly managed?',
    category: 'Infection Prevention',
    maxScore: 8,
  },

  // 5. Facility & Equipment
  {
    id: 'clinic-facility-1',
    question: 'Is the facility clean and well-maintained?',
    category: 'Facility & Equipment',
    maxScore: 10,
  },
  {
    id: 'clinic-facility-2',
    question: 'Is medical equipment functional and properly maintained?',
    category: 'Facility & Equipment',
    maxScore: 10,
  },
  {
    id: 'clinic-facility-3',
    question: 'Is there adequate water and sanitation?',
    category: 'Facility & Equipment',
    maxScore: 10,
  },
  {
    id: 'clinic-facility-4',
    question: 'Are examination rooms private and appropriate?',
    category: 'Facility & Equipment',
    maxScore: 8,
  },

  // 6. Medication Management
  {
    id: 'clinic-med-1',
    question: 'Are medications properly stored and managed?',
    category: 'Medication Management',
    maxScore: 10,
  },
  {
    id: 'clinic-med-2',
    question: 'Is there proper inventory control for medications?',
    category: 'Medication Management',
    maxScore: 8,
  },
  {
    id: 'clinic-med-3',
    question: 'Are expired medications properly disposed of?',
    category: 'Medication Management',
    maxScore: 8,
  },

  // 7. Patient Safety & Quality
  {
    id: 'clinic-safety-1',
    question: 'Are patient safety measures in place?',
    category: 'Patient Safety & Quality',
    maxScore: 10,
  },
  {
    id: 'clinic-safety-2',
    question: 'Is there a quality improvement program?',
    category: 'Patient Safety & Quality',
    maxScore: 8,
  },
  {
    id: 'clinic-safety-3',
    question: 'Are patient complaints properly handled?',
    category: 'Patient Safety & Quality',
    maxScore: 7,
  },
];

export const getInspectionItems = (facilityType: string): any[] => {
  switch (facilityType) {
    case 'pharmacy':
      return PHARMACY_INSPECTION_FORM;
    case 'hospital':
      return HOSPITAL_INSPECTION_ITEMS;
    case 'clinic':
      return CLINIC_INSPECTION_ITEMS;
    default:
      return PHARMACY_INSPECTION_FORM;
  }
};