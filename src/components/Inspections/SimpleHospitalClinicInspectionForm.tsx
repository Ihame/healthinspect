import React, { useState } from 'react';

const FACILITY_TYPES = ["Clinic", "Polyclinic", "Hospital", "Dispensary"];
const SERVICES = [
  "General Medicine", "Gyneco-Obstetrical", "Internal Medicine", "Pediatrics",
  "Dental", "Laboratory", "Radiography", "Maternity"
];
const ROOM_TYPES = ["Private", "General Ward"];
const PAYMENT_METHODS = ["MoMo", "Cash", "Other"];
const PRACTITIONER_ROLES = ["Doctor", "Technician"];
const PRACTITIONER_STATUS = ["Permanent", "Part-Time"];
const FORM_APPROVAL = ["Before treatment", "After treatment"];
const KEY_ISSUES = [
  "Missing patient records", "Missing lab results", "Expired reagents",
  "Billing mismatch", "No clinical notes"
];

const Section: React.FC<{ title: string, children: React.ReactNode, description?: string }> = ({ title, children, description }) => (
  <section className="mb-8">
    <h2 className="text-lg font-semibold mb-2 text-green-700">{title}</h2>
    {description && <p className="text-xs text-gray-500 mb-2">{description}</p>}
    <div className="space-y-2">{children}</div>
  </section>
);

const SimpleHospitalClinicInspectionForm: React.FC<{ onSubmit?: (data: any) => void, onCancel?: () => void, facilityInfo?: any }> = ({ onSubmit, onCancel, facilityInfo }) => {
  // Facility Info (pre-filled if provided)
  const [facility, setFacility] = useState({
    name: facilityInfo?.name || '',
    address: facilityInfo?.address || '',
    phone: facilityInfo?.phone || '',
    email: facilityInfo?.email || '',
    type: facilityInfo?.type || '',
    licenseExpiry: facilityInfo?.licenseExpiry || ''
  });

  // Inspection Team
  const [team, setTeam] = useState([{ name: '', position: '' }]);
  const [visitDate, setVisitDate] = useState('');

  // Services
  const [services, setServices] = useState<string[]>([]);
  const [allServicesListed, setAllServicesListed] = useState(false);

  // Practitioners
  const [practitioners, setPractitioners] = useState([
    { name: '', role: '', specialty: '', status: '', present: false }
  ]);

  // Patient Journey
  const [patientJourney, setPatientJourney] = useState<{
    eligibility: boolean;
    formsAvailable: boolean;
    formsApproved: string;
    paymentMethods: string[];
    copaymentProof: boolean;
  }>({
    eligibility: false, formsAvailable: false, formsApproved: '', paymentMethods: [], copaymentProof: false
  });

  // Findings
  const [findings, setFindings] = useState<{ summary: string; issues: string[]; recommendations: string }>({ summary: '', issues: [], recommendations: '' });

  // Observations & Team
  const [observation, setObservation] = useState('');
  const [teamNames, setTeamNames] = useState('');

  // Handlers
  const addTeamMember = () => setTeam([...team, { name: '', position: '' }]);
  const addPractitioner = () => setPractitioners([...practitioners, { name: '', role: '', specialty: '', status: '', present: false }]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      facility, team, visitDate, services, allServicesListed, practitioners,
      patientJourney, findings, observation, teamNames
    };
    if (onSubmit) onSubmit(data);
    else alert('Form submitted! (Demo only)');
  };

  return (
    <form className="max-w-xl mx-auto p-6 bg-white rounded-lg shadow-md" onSubmit={handleSubmit}>
      <h1 className="text-2xl font-bold mb-6 text-center text-green-800">Health Facility Inspection</h1>
      {/* Facility Info */}
      <Section title="Facility Information" description="Please confirm or fill in the facility details.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Facility Name</label>
            <input className="input" required value={facility.name} onChange={e => setFacility({ ...facility, name: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium">Type of Facility</label>
            <select className="input" required value={facility.type} onChange={e => setFacility({ ...facility, type: e.target.value })}>
              <option value="">Select...</option>
              {FACILITY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Phone</label>
            <input className="input" value={facility.phone} onChange={e => setFacility({ ...facility, phone: e.target.value })} />
          </div>
          <div>
            <label className="block text-sm font-medium">Email</label>
            <input className="input" value={facility.email} onChange={e => setFacility({ ...facility, email: e.target.value })} />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium">Facility Address</label>
          <textarea className="input" required value={facility.address} onChange={e => setFacility({ ...facility, address: e.target.value })} />
        </div>
        <div>
          <label className="block text-sm font-medium">License Expiry Date</label>
          <input className="input" type="date" value={facility.licenseExpiry} onChange={e => setFacility({ ...facility, licenseExpiry: e.target.value })} />
        </div>
      </Section>
      {/* Inspection Team */}
      <Section title="Inspection Team" description="Who is conducting this inspection?">
        <div>
          <label className="block text-sm font-medium">Date of Visit</label>
          <input className="input" type="date" value={visitDate} onChange={e => setVisitDate(e.target.value)} required />
        </div>
        {team.map((member, idx) => (
          <div key={idx} className="flex gap-2 mb-2">
            <input className="input" placeholder="Full Name" value={member.name} onChange={e => setTeam(team.map((m, i) => i === idx ? { ...m, name: e.target.value } : m))} required />
            <input className="input" placeholder="Position" value={member.position} onChange={e => setTeam(team.map((m, i) => i === idx ? { ...m, position: e.target.value } : m))} required />
          </div>
        ))}
        <button type="button" className="text-green-700 underline text-sm" onClick={addTeamMember}>+ Add Team Member</button>
      </Section>
      {/* Services Offered */}
      <Section title="Services Offered" description="Select all services provided by this facility.">
        <select multiple className="input" value={services} onChange={e => setServices(Array.from(e.target.selectedOptions, o => o.value))}>
          {SERVICES.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <label className="flex items-center mt-2">
          <input type="checkbox" checked={allServicesListed} onChange={e => setAllServicesListed(e.target.checked)} />
          <span className="ml-2">All services listed on RSSB monthly list?</span>
        </label>
      </Section>
      {/* Medical Practitioners */}
      <Section title="Medical Practitioners" description="Add all practitioners present during the visit.">
        {practitioners.map((pr, idx) => (
          <div key={idx} className="flex flex-wrap gap-2 mb-2">
            <input className="input" placeholder="Full Name" value={pr.name} onChange={e => setPractitioners(practitioners.map((p, i) => i === idx ? { ...p, name: e.target.value } : p))} />
            <select className="input" value={pr.role} onChange={e => setPractitioners(practitioners.map((p, i) => i === idx ? { ...p, role: e.target.value } : p))}>
              <option value="">Role</option>
              {PRACTITIONER_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
            <input className="input" placeholder="Specialty" value={pr.specialty} onChange={e => setPractitioners(practitioners.map((p, i) => i === idx ? { ...p, specialty: e.target.value } : p))} />
            <select className="input" value={pr.status} onChange={e => setPractitioners(practitioners.map((p, i) => i === idx ? { ...p, status: e.target.value } : p))}>
              <option value="">Status</option>
              {PRACTITIONER_STATUS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <label className="flex items-center">
              <input type="checkbox" checked={pr.present} onChange={e => setPractitioners(practitioners.map((p, i) => i === idx ? { ...p, present: e.target.checked } : p))} />
              <span className="ml-2">Present?</span>
            </label>
          </div>
        ))}
        <button type="button" className="text-green-700 underline text-sm" onClick={addPractitioner}>+ Add Practitioner</button>
      </Section>
      {/* Patient Journey & Billing */}
      <Section title="Patient Journey & Billing" description="Quick checks on patient flow and billing.">
        <label className="flex items-center">
          <input type="checkbox" checked={patientJourney.eligibility} onChange={e => setPatientJourney({ ...patientJourney, eligibility: e.target.checked })} />
          <span className="ml-2">Eligibility Check at Reception?</span>
        </label>
        <label className="flex items-center">
          <input type="checkbox" checked={patientJourney.formsAvailable} onChange={e => setPatientJourney({ ...patientJourney, formsAvailable: e.target.checked })} />
          <span className="ml-2">RSSB Forms Available?</span>
        </label>
        <select className="input" value={patientJourney.formsApproved} onChange={e => setPatientJourney({ ...patientJourney, formsApproved: e.target.value })}>
          <option value="">When are forms approved?</option>
          {FORM_APPROVAL.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
        <select multiple className="input" value={patientJourney.paymentMethods} onChange={e => setPatientJourney({ ...patientJourney, paymentMethods: Array.from(e.target.selectedOptions, o => o.value) })}>
          {PAYMENT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <label className="flex items-center">
          <input type="checkbox" checked={patientJourney.copaymentProof} onChange={e => setPatientJourney({ ...patientJourney, copaymentProof: e.target.checked })} />
          <span className="ml-2">Proof of 15% Co-payment available?</span>
        </label>
      </Section>
      {/* Inspection Findings */}
      <Section title="Inspection Findings" description="Summary and recommendations.">
        <textarea className="input" placeholder="Summary of Observations" value={findings.summary} onChange={e => setFindings({ ...findings, summary: e.target.value })} />
        <select multiple className="input" value={findings.issues} onChange={e => setFindings({ ...findings, issues: Array.from(e.target.selectedOptions, o => o.value) })}>
          {KEY_ISSUES.map(i => <option key={i} value={i}>{i}</option>)}
        </select>
        <textarea className="input" placeholder="Recommendations" value={findings.recommendations} onChange={e => setFindings({ ...findings, recommendations: e.target.value })} />
      </Section>
      {/* Observations & Team */}
      <Section title="Other Observations & Team" description="Any other notes and the names of the inspection team.">
        <textarea className="input" placeholder="Other observations..." value={observation} onChange={e => setObservation(e.target.value)} />
        <textarea className="input" placeholder="Names of team members who did the inspection" value={teamNames} onChange={e => setTeamNames(e.target.value)} />
      </Section>
      <div className="flex gap-4 justify-center mt-8">
        <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded font-semibold hover:bg-green-700">Submit</button>
        {onCancel && <button type="button" className="bg-gray-300 text-gray-800 px-6 py-2 rounded font-semibold hover:bg-gray-400" onClick={onCancel}>Cancel</button>}
      </div>
      <style>{`
        .input { display: block; width: 100%; margin-bottom: 8px; padding: 8px; border: 1px solid #ccc; border-radius: 4px; }
      `}</style>
    </form>
  );
};

export default SimpleHospitalClinicInspectionForm; 