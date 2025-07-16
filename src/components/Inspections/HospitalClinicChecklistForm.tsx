import React, { useState } from 'react';

const CHECKLIST = [
  {
    number: 1,
    description: 'Power Backup',
    targetedPoints: [
      'Functional generator present',
      'Proper installation',
      'Ready and operational',
    ],
  },
  {
    number: 2,
    description: 'Water Supply',
    targetedPoints: [
      'Clean water source',
      'Water dispenser for patients',
      'Single-use cups provided',
      'Water accessible in waiting areas',
    ],
  },
  {
    number: 3,
    description: 'Cold Chain Management',
    targetedPoints: [
      'Functional refrigerator, powered',
      'Thermometer present',
      'No food/personal items inside',
      'Temperature log available and updated',
    ],
  },
  {
    number: 4,
    description: 'Drug Storage Conditions',
    targetedPoints: [
      'Pest-free environment',
      'Adequate ventilation',
      'Drugs stored on shelves/pallets',
      'No humidity or mold',
      'Narcotics stored securely',
      'Curtains or protection from excessive heat/light',
    ],
  },
  {
    number: 5,
    description: 'Cleanliness & Sanitation',
    targetedPoints: [
      'Painted shelves/counter',
      'Water & sink available',
      'Clean toilet with supplies',
      'Floors, ceilings, and walls cleaned',
      'Dust-free drug storage',
      'No cracks, water damage, or mold',
    ],
  },
  {
    number: 6,
    description: 'Pharmacist Presence & Conduct',
    targetedPoints: [
      'Pharmacist present',
      'RFDA license in their name',
      'NPC practice license',
      'Letter of notification to RSSB/RFDA (if new)',
      'Patient counselling done',
      'Professional attire',
      'Respectful interaction with patients',
    ],
  },
  {
    number: 7,
    description: 'Nurse Presence & Conduct',
    targetedPoints: [
      'Licensed by National Nursing & Midwifery Council',
      'Patient respect & counselling',
      'Proper attire',
    ],
  },
  {
    number: 8,
    description: 'Ownership & Legal Documents',
    targetedPoints: [
      'Valid RDB Trade License',
      'Shareholder list documented',
    ],
  },
  {
    number: 9,
    description: 'Hospital Information System',
    targetedPoints: [
      'Computer present and operational',
      'Dispensing process followed',
      'Billing through software',
      'Expired drug alert system',
    ],
  },
  {
    number: 10,
    description: 'Stock Consistency',
    targetedPoints: [
      'Physical vs theoretical stock match',
      'Stocks updated at dispensing',
    ],
  },
  {
    number: 11,
    description: 'Medicine Availability',
    targetedPoints: [
      'Sufficient range of products per department',
      'Accessible to RSSB beneficiaries',
    ],
  },
  {
    number: 12,
    description: 'Facility Authorization',
    targetedPoints: [
      'Recognized by RSSB',
      'Physically accessible',
    ],
  },
  {
    number: 13,
    description: 'Medicine Traceability',
    targetedPoints: [
      'Valid invoices from wholesalers',
      'No counterfeits',
      'Only authentic medications used',
    ],
  },
  {
    number: 14,
    description: 'Fraud Detection',
    targetedPoints: [
      'Unauthorized prescriptions',
      'Mismatched dispensation',
      'Fake/expired/diluted medications',
      'Altered quantities',
      'Orphan prescriptions (no patient)',
    ],
  },
  {
    number: 15,
    description: 'RSSB Reimbursement List Compliance',
    targetedPoints: [
      'Reimbursement list & pricing available',
      'Bills & prescriptions present',
      'Pricing compliance verified',
      'No medicine denied if available',
    ],
  },
  {
    number: 16,
    description: 'Expired Drug Handling',
    targetedPoints: [
      'No expired meds on shelves',
      'Near-expiry marked clearly',
      'Expired stock stored separately',
      'Disposal records maintained',
    ],
  },
  {
    number: 17,
    description: 'IHBS/Kwivuza System Use',
    targetedPoints: [
      'Staff check affiliate eligibility',
      'Pre-service eligibility confirmed',
      'Proper patient registration in system',
      'Physical vs digital voucher match',
    ],
  },
  {
    number: 18,
    description: 'Billing Validity',
    targetedPoints: [
      'Patient names & contact on bills',
      'Patient signature present',
      'Bills without signatures submitted to RSSB',
    ],
  },
  {
    number: 19,
    description: 'Feedback on RSSB List',
    targetedPoints: [
      'Items with price concerns (too high/low)',
      'Commonly prescribed items missing from list',
    ],
  },
];

interface HospitalClinicChecklistFormProps {
  facilityName: string;
  inspectorId?: string;
  inspectorName?: string;
  onSubmit: (data: any) => void;
}

const HospitalClinicChecklistForm: React.FC<HospitalClinicChecklistFormProps> = ({ facilityName, inspectorId, inspectorName, onSubmit }) => {
  const [district, setDistrict] = useState('');
  const [location, setLocation] = useState('');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [items, setItems] = useState(
    CHECKLIST.map(item => ({
      ...item,
      status: '',
      observation: '',
    }))
  );
  const [team, setTeam] = useState([{ name: '', position: '' }]);

  const handleItemChange = (idx: number, field: 'status' | 'observation', value: string) => {
    setItems(prev => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  };

  const handleTeamChange = (idx: number, field: 'name' | 'position', value: string) => {
    setTeam(prev => prev.map((member, i) => i === idx ? { ...member, [field]: value } : member));
  };

  const addTeamMember = () => setTeam([...team, { name: '', position: '' }]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Validate team members
    for (const member of team) {
      const invalid = !member.name.trim() || !member.position.trim() ||
        ['yes', 'no', 'na'].includes(member.name.trim().toLowerCase()) ||
        ['yes', 'no', 'na'].includes(member.position.trim().toLowerCase());
      if (invalid) {
        alert('Please enter a valid full name and position for each team member.');
        return false;
      }
    }
    onSubmit({
      facilityName,
      district,
      location,
      date,
      items,
      team,
      inspectorId,
      inspectorName,
    });
  };

  return (
    <form className="max-w-3xl mx-auto p-6 bg-white rounded shadow" onSubmit={handleSubmit}>
      <h1 className="text-2xl font-bold mb-4 text-center text-green-800">Hospital/Clinic Inspection Checklist</h1>
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Facility Name</label>
          <input className="input" value={facilityName} disabled />
        </div>
        <div>
          <label className="block text-sm font-medium">District</label>
          <input className="input" value={district} onChange={e => setDistrict(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm font-medium">Location</label>
          <input className="input" value={location} onChange={e => setLocation(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm font-medium">Date of Inspection</label>
          <input className="input" type="date" value={date} onChange={e => setDate(e.target.value)} required />
        </div>
      </div>
      <div className="overflow-x-auto mb-8">
        <table className="min-w-full border text-xs md:text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="border px-2 py-1">N°</th>
              <th className="border px-2 py-1">DESCRIPTION</th>
              <th className="border px-2 py-1">TARGETED POINTS</th>
              <th className="border px-2 py-1">STATUS</th>
              <th className="border px-2 py-1">OBSERVATION</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={item.number} className="bg-white">
                <td className="border px-2 py-1 text-center font-semibold">{item.number}</td>
                <td className="border px-2 py-1 font-medium">{item.description}</td>
                <td className="border px-2 py-1">
                  <ul className="list-disc pl-4">
                    {item.targetedPoints.map((point: string, i: number) => (
                      <li key={i}>{point}</li>
                    ))}
                  </ul>
                </td>
                <td className="border px-2 py-1 text-center">
                  <select
                    className="input"
                    value={item.status}
                    onChange={e => handleItemChange(idx, 'status', e.target.value)}
                    required
                  >
                    <option value="">Select</option>
                    <option value="yes">Yes</option>
                    <option value="no">No</option>
                    <option value="na">N/A</option>
                  </select>
                </td>
                <td className="border px-2 py-1">
                  <input
                    className="input"
                    value={item.observation}
                    onChange={e => handleItemChange(idx, 'observation', e.target.value)}
                    placeholder="Observation"
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mb-8">
        <h2 className="text-lg font-semibold mb-2 text-green-700">Inspection Team Members</h2>
        <div className="space-y-2">
          {team.map((member, idx) => (
            <div key={idx} className="flex gap-2 mb-1">
              <input
                className="input flex-1"
                placeholder="Full Name"
                value={member.name}
                onChange={e => handleTeamChange(idx, 'name', e.target.value)}
                required
              />
              <input
                className="input flex-1"
                placeholder="Position"
                value={member.position}
                onChange={e => handleTeamChange(idx, 'position', e.target.value)}
                required
              />
            </div>
          ))}
          <button type="button" className="text-green-700 underline text-sm" onClick={addTeamMember}>+ Add Team Member</button>
        </div>
      </div>
      <div className="flex gap-4 justify-center mt-8">
        <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded font-semibold hover:bg-green-700">Submit</button>
      </div>
      <style>{`
        .input { display: block; width: 100%; margin-bottom: 4px; padding: 6px; border: 1px solid #ccc; border-radius: 4px; }
      `}</style>
    </form>
  );
};

export default HospitalClinicChecklistForm; 