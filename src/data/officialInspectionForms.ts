// Official RSSB Pharmacy Inspection Form - Exact replica
export interface OfficialInspectionItem {
  id: string;
  number: string;
  description: string;
  targetedPoints: string[];
  status?: 'compliant' | 'non_compliant' | 'not_applicable';
  observation?: string;
}

export const OFFICIAL_PHARMACY_INSPECTION_FORM: OfficialInspectionItem[] = [
  {
    id: 'item-1',
    number: '1',
    description: 'Presence of functional generator',
    targetedPoints: [
      'Presence of power generator',
      'System of installation done',
      'Ready for use'
    ]
  },
  {
    id: 'item-2',
    number: '2',
    description: 'Water filter with drinking cups',
    targetedPoints: [
      'Presence of water dispenser',
      'Clean drinking water for patients available',
      'Single use cups',
      'Availability of drinking water at patient\'s disposal'
    ]
  },
  {
    id: 'item-3',
    number: '3',
    description: 'Functional Refrigerator',
    targetedPoints: [
      'Presence of Refrigerator connected on power supply',
      'Refrigerator in working condition with thermometer to check temperature',
      'No non-medical items in refrigerator eg.(Food staff)',
      'Updated daily temperature control sheet'
    ]
  },
  {
    id: 'item-4',
    number: '4',
    description: 'Storage condition of drugs (Protecting drugs from damage)',
    targetedPoints: [
      'Stores is free from pest (cockroaches, rates, mice)',
      'Presence of sufficient aeration',
      'Drugs stored on pallets, shelves etc',
      'Absence of humidity',
      'Compliance to Narcotic drugs storage requirement',
      'Windows may have curtains for protecting of drugs from exposure to excessive heat, light or may have other protection'
    ]
  },
  {
    id: 'item-5',
    number: '5',
    description: 'Cleanliness and sanitation',
    targetedPoints: [
      'Painted counter and shelves',
      'Availability of water supply and sink',
      'Clean toilet with required hygienic materials',
      'Cleaned floor, Ceiling and walls',
      'Shelves, counter and drugs are free from dust',
      'Facility is well maintained—no cracks, holes or sign of water damage in store'
    ]
  },
  {
    id: 'item-6',
    number: '6',
    description: 'Presence of pharmacist recognized by RSSB and RFDA',
    targetedPoints: [
      'Physical presence of Pharmacist',
      'Is RFDA authorization license in his name',
      'NPC license to practice',
      'Letter informing RSSB/RFDA (If new responsible pharmacist)',
      'Appropriate patient counselling is done',
      'Patients are greeted and treated with respect',
      'Conformity to the dressing code with required attire'
    ]
  },
  {
    id: 'item-7',
    number: '7',
    description: 'Presence of nurse recognized by RSSB',
    targetedPoints: [
      'License from National Nursing and Midwives Council',
      'Patients are greeted and treated with respect',
      'Appropriate patient counselling is done',
      'Conformity to the dressing code with required attire'
    ]
  },
  {
    id: 'item-8',
    number: '8',
    description: 'Current owner recognized by RDB',
    targetedPoints: [
      'Trade license from RDB',
      'Pharmacy shareholders'
    ]
  },
  {
    id: 'item-9',
    number: '9',
    description: 'Computer functioning with software',
    targetedPoints: [
      'Dispensing process steps are followed',
      'Billing is done using software',
      'Expired drugs alarm in a software'
    ]
  },
  {
    id: 'item-10',
    number: '10',
    description: 'Physical stock and theoretical stock',
    targetedPoints: [
      'Stock updating while delivering (physical and theoretical stock should match)'
    ]
  },
  {
    id: 'item-11',
    number: '11',
    description: 'Availability of sufficient stock based on location of the pharmacy',
    targetedPoints: [
      'Sufficient stock for meeting the patient diverse needs: range of pharmacy per range of products',
      'Accessibility and availability of medicines to RSSB affiliates'
    ]
  },
  {
    id: 'item-12',
    number: '12',
    description: 'Location in premises recognized by RSSB',
    targetedPoints: [
      'Accessibility of pharmacy premises',
      'Pharmacy premises recognized by RSSB'
    ]
  },
  {
    id: 'item-13',
    number: '13',
    description: 'Traceability of medicines',
    targetedPoints: [
      'Medicines are safe for Patient : product dispensed to patient is both genuine and appropriate',
      'Invoices from wholesalers for any specified product',
      'Prevention of counterfeit pharmaceutical products'
    ]
  },
  {
    id: 'item-14',
    number: '14',
    description: 'Suspected fraudulent practice detected',
    targetedPoints: [
      'Presence of un authentic prescriptions',
      'Prescription drugs not dispensed as written',
      'Dispensing expired, fake, diluted or illegal drugs',
      'Altering prescriptions to increase the quantity',
      'Presence of prescriptions without owners'
    ]
  },
  {
    id: 'item-15',
    number: '15',
    description: 'Malpractice related to misuse of the list',
    targetedPoints: [
      'Availability of the list and prices of reimbursable medicines',
      'Availability of bills and medical prescriptions',
      'Auditing bills and verify whether they comply to the prices list of reimbursable medicines',
      'Obligation to serve medicines without denial'
    ]
  },
  {
    id: 'item-16',
    number: '16',
    description: 'Management of expired drugs',
    targetedPoints: [
      'Absence of expired medicines in the dispensing shelves',
      'Presence of expiry indicator on medicines near to expiry or presence of separate shelve',
      'Presence of a separate stock for already expired medicines',
      'Presence of record for disposal of medicines'
    ]
  },
  {
    id: 'item-17',
    number: '17',
    description: 'Verification of eligibility of affiliates and compliance with IHBS kwivuza system billing(Article 5)',
    targetedPoints: [
      'Awareness of staff to check eligibility status',
      'Checking RSSB affiliates eligibility before serving them',
      'Timely recording of patients in kwivuza (physical vouchers vs. system)'
    ]
  },
  {
    id: 'item-18',
    number: '18',
    description: 'Validity of bills (Article 3)',
    targetedPoints: [
      'Presence of patient names and contact on bills',
      'Presence of authentic patient signature on bills (Prescriptions and bills which will be found without patient\'s signatures will be confiscated and request to be signed by the patient at RSSB)'
    ]
  },
  {
    id: 'item-19',
    number: '19',
    description: 'Feedback on price and content of the list',
    targetedPoints: [
      'Prices that were set low/high on RSSB list',
      'Medicines not on the RSSB list but commonly prescribed'
    ]
  }
];

export const PHARMACY_INSPECTION_FORM = [
  {
    section: 'Power & Utilities',
    number: 1,
    description: 'Presence of functional generator',
    targetedPoints: [
      'Presence of power generator',
      'System of installation done',
      'Ready for use',
    ],
    status: '',
    observation: '',
    images: [],
  },
  {
    section: 'Water & Sanitation',
    number: 2,
    description: 'Water filter with drinking cups',
    targetedPoints: [
      'Presence of water dispenser',
      'Clean drinking water for patients available',
      'Single use cups',
      'Availability of drinking water at patient’s disposal',
    ],
    status: '',
    observation: '',
    images: [],
  },
  {
    section: 'Refrigeration',
    number: 3,
    description: 'Functional Refrigerator',
    targetedPoints: [
      'Presence of Refrigerator connected on power supply',
      'Refrigerator in working condition with thermometer to check temperature',
      'No non-medical items in refrigerator eg.(Food staff)',
      'Updated daily temperature control sheet',
    ],
    status: '',
    observation: '',
    images: [],
  },
  {
    section: 'Storage & Stock',
    number: 4,
    description: 'Storage condition of drugs (Protecting drugs from damage)',
    targetedPoints: [
      'Stores is free from pest (cockroaches, rats, mice)',
      'Presence of sufficient aeration',
      'Drugs stored on pallets, shelves etc',
      'Absence of humidity',
      'Compliance to Narcotic drugs storage requirement',
      'Windows may have curtains for protecting of drugs from exposure to excessive heat, light or may have other protection',
    ],
    status: '',
    observation: '',
    images: [],
  },
  {
    section: 'Cleanliness',
    number: 5,
    description: 'Cleanliness and sanitation',
    targetedPoints: [
      'Painted counter and shelves',
      'Availability of water supply and sink',
      'Clean toilet with required hygienic materials',
      'Cleaned floor, Ceiling and walls',
      'Shelves, counter and drugs are free from dust',
      'Facility is well maintained—no cracks, holes or sign of water damage in store',
    ],
    status: '',
    observation: '',
    images: [],
  },
  {
    section: 'Staff & Licensing',
    number: 6,
    description: 'Presence of pharmacist recognized by RSSB and RFDA',
    targetedPoints: [
      'Physical presence of Pharmacist',
      'Is RFDA authorization license in his name',
      'NPC license to practice',
      'Letter informing RSSB/RFDA (If new responsible pharmacist)',
      'Appropriate patient counselling is done',
      'Patients are greeted and treated with respect',
      'Conformity to the dressing code with required attire',
    ],
    status: '',
    observation: '',
    images: [],
  },
  {
    section: 'Staff & Licensing',
    number: 7,
    description: 'Presence of nurse recognized by RSSB',
    targetedPoints: [
      'License from National Nursing and Midwives Council',
      'Patients are greeted and treated with respect',
      'Appropriate patient counselling is done',
      'Conformity to the dressing code with required attire',
    ],
    status: '',
    observation: '',
    images: [],
  },
  {
    section: 'Staff & Licensing',
    number: 8,
    description: 'Current owner recognized by RDB',
    targetedPoints: [
      'Trade license from RDB',
      'Pharmacy shareholders',
    ],
    status: '',
    observation: '',
    images: [],
  },
  {
    section: 'Software & Billing',
    number: 9,
    description: 'Computer functioning with software',
    targetedPoints: [
      'Dispensing process steps are followed',
      'Billing is done using software',
      'Expired drugs alarm in a software',
    ],
    status: '',
    observation: '',
    images: [],
  },
  {
    section: 'Stock & Storage',
    number: 10,
    description: 'Physical stock and theoretical stock',
    targetedPoints: [
      'Stock updating while delivering (physical and theoretical stock should match)',
    ],
    status: '',
    observation: '',
    images: [],
  },
  {
    section: 'Stock & Storage',
    number: 11,
    description: 'Availability of sufficient stock based on location of the pharmacy',
    targetedPoints: [
      'Sufficient stock for meeting the patient diverse needs: range of pharmacy per range of products',
      'Accessibility and availability of medicines to RSSB affiliates',
    ],
    status: '',
    observation: '',
    images: [],
  },
  {
    section: 'Stock & Storage',
    number: 12,
    description: 'Location in premises recognized by RSSB',
    targetedPoints: [
      'Accessibility of pharmacy premises',
      'Pharmacy premises recognized by RSSB',
    ],
    status: '',
    observation: '',
    images: [],
  },
  {
    section: 'Traceability & Compliance',
    number: 13,
    description: 'Traceability of medicines',
    targetedPoints: [
      'Medicines are safe for Patient: product dispensed to patient is both genuine and appropriate',
      'Invoices from wholesalers for any specified product',
      'Prevention of counterfeit pharmaceutical products',
    ],
    status: '',
    observation: '',
    images: [],
  },
  {
    section: 'Traceability & Compliance',
    number: 14,
    description: 'Suspected fraudulent practice detected',
    targetedPoints: [
      'Presence of unauthentic prescriptions',
      'Prescription drugs not dispensed as written',
      'Dispensing expired, fake, diluted or illegal drugs',
      'Altering prescriptions to increase the quantity',
      'Presence of prescriptions without owners',
    ],
    status: '',
    observation: '',
    images: [],
  },
  {
    section: 'Traceability & Compliance',
    number: 15,
    description: 'Malpractice related to misuse of the list',
    targetedPoints: [
      'Availability of the list and prices of reimbursable medicines',
      'Availability of bills and medical prescriptions',
      'Auditing bills and verify whether they comply to the prices list of reimbursable medicines',
      'Obligation to serve medicines without denial',
    ],
    status: '',
    observation: '',
    images: [],
  },
  {
    section: 'Expired Drugs',
    number: 16,
    description: 'Management of expired drugs',
    targetedPoints: [
      'Absence of expired medicines in the dispensing shelves',
      'Presence of expiry indicator on medicines near to expiry or presence of separate shelve',
      'Presence of a separate stock for already expired medicines',
      'Presence of record for disposal of medicines',
    ],
    status: '',
    observation: '',
    images: [],
  },
  {
    section: 'Patient Safety & Feedback',
    number: 17,
    description: 'Verification of eligibility of affiliates and compliance with IHBS kwivuza system billing (Article 5)',
    targetedPoints: [
      'Awareness of staff to check eligibility status',
      'Checking RSSB affiliates eligibility before serving them',
      'Timely recording of patients in kwivuza (physical vouchers vs. system)',
    ],
    status: '',
    observation: '',
    images: [],
  },
  {
    section: 'Patient Safety & Feedback',
    number: 18,
    description: 'Validity of bills (Article 3)',
    targetedPoints: [
      'Presence of patient names and contact on bills',
      'Presence of authentic patient signature on bills',
      'Prescriptions and bills which will be found without patient’s signatures will be confiscated and request to be signed by the patient at RSSB',
    ],
    status: '',
    observation: '',
    images: [],
  },
  {
    section: 'Patient Safety & Feedback',
    number: 19,
    description: 'Feedback on price and content of the list',
    targetedPoints: [
      'Prices that were set low/high on RSSB list',
      'Medicines not on the RSSB list but commonly prescribed',
    ],
    status: '',
    observation: '',
    images: [],
  },
];