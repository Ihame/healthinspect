import React, { useState } from 'react';
import { createHospitalInspection } from '../../lib/supabase';

// Utility components for form fields
const Input = ({ label, ...props }: any) => (
  <div className="mb-3">
    <label className="block text-sm font-medium mb-1">{label}</label>
    <input {...props} className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500" />
  </div>
);
const Textarea = ({ label, ...props }: any) => (
  <div className="mb-3">
    <label className="block text-sm font-medium mb-1">{label}</label>
    <textarea {...props} className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500" />
  </div>
);
const Select = ({ label, options, ...props }: any) => (
  <div className="mb-3">
    <label className="block text-sm font-medium mb-1">{label}</label>
    <select {...props} className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500">
      <option value="">Select...</option>
      {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  </div>
);
const Checkbox = ({ label, ...props }: any) => (
  <label className="inline-flex items-center mr-4 mb-2">
    <input type="checkbox" {...props} className="form-checkbox h-4 w-4 text-green-600" />
    <span className="ml-2 text-sm">{label}</span>
  </label>
);
const Toggle = ({ label, checked, onChange }: any) => (
  <div className="flex items-center mb-3">
    <span className="mr-2 text-sm">{label}</span>
    <button type="button" onClick={() => onChange(!checked)} className={`w-10 h-6 flex items-center bg-gray-200 rounded-full p-1 duration-300 ease-in-out ${checked ? 'bg-green-400' : ''}`}> <span className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ease-in-out ${checked ? 'translate-x-4' : ''}`}></span></button>
    <span className="ml-2 text-xs font-semibold">{checked ? 'Yes' : 'No'}</span>
  </div>
);
const MultiSelect = ({ label, options, value, onChange }: any) => (
  <div className="mb-3">
    <label className="block text-sm font-medium mb-1">{label}</label>
    <select multiple value={value} onChange={e => onChange(Array.from(e.target.selectedOptions, (o: any) => o.value))} className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500">
      {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
    </select>
  </div>
);

// Add a reusable CheckboxGroup component
const CheckboxGroup = ({ label, options, value, onChange }: { label: string, options: string[], value: string[], onChange: (val: string[]) => void }) => (
  <div className="mb-3">
    <label className="block text-sm font-medium mb-1">{label}</label>
    <div className="flex flex-wrap gap-3">
      {options.map(opt => (
        <label key={opt} className="inline-flex items-center">
          <input
            type="checkbox"
            className="form-checkbox h-4 w-4 text-green-600"
            checked={value.includes(opt)}
            onChange={e => {
              if (e.target.checked) onChange([...value, opt]);
              else onChange(value.filter(v => v !== opt));
            }}
          />
          <span className="ml-2 text-sm">{opt}</span>
        </label>
      ))}
    </div>
  </div>
);

// Collapsible section component
const CollapsibleSection = ({ title, children, openDefault = false }: { title: string, children: React.ReactNode, openDefault?: boolean }) => {
  const [open, setOpen] = useState<boolean>(openDefault);
  return (
    <div className="mb-4 border rounded-lg bg-white shadow">
      <button type="button" className="w-full flex justify-between items-center px-4 py-3 text-lg font-semibold bg-gray-100 rounded-t-lg focus:outline-none" onClick={() => setOpen((o: boolean) => !o)}>
        {title}
        <span>{open ? '▲' : '▼'}</span>
      </button>
      {open && <div className="p-4">{children}</div>}
    </div>
  );
};

interface HospitalClinicInspectionFormProps {
  facilityId: string;
  facilityName: string;
  district: string;
  inspectorId: string;
  inspectorName: string;
  onSuccess?: () => void;
}

const HospitalClinicInspectionForm: React.FC<HospitalClinicInspectionFormProps> = ({
  facilityId,
  facilityName,
  district,
  inspectorId,
  inspectorName,
  onSuccess
}) => {
  // State for all fields (simplified for brevity)
  const [facility, setFacility] = useState({
    name: '', address: '', phone: '', email: '', type: '', licenseExpiry: ''
  });
  const [team, setTeam] = useState([{ name: '', position: '' }]);
  const [visitDates, setVisitDates] = useState({ from: '', to: '' });
  const [services, setServices] = useState<string[]>([]);
  const [allServicesListed, setAllServicesListed] = useState(false);
  const [practitioners, setPractitioners] = useState([{ name: '', role: '', specialty: '', status: '', present: false, notes: '' }]);
  const [patientJourney, setPatientJourney] = useState<{ eligibility: boolean; formsAvailable: boolean; formsApproved: string; paymentMethods: string[]; copaymentProof: boolean }>({ eligibility: false, formsAvailable: false, formsApproved: '', paymentMethods: [], copaymentProof: false });
  const [voucher, setVoucher] = useState({ count: '', signedBy: { patient: false, prescriber: false, facility: false }, stamp: false, valuesWritten: false });
  const [labImaging, setLabImaging] = useState({ equipment: false, expired: false, expiredDetails: '', allTests: false, testDetails: '', records: false, imagingResults: false });
  const [procedures, setProcedures] = useState({ system: '', discrepancies: false, discrepancyDetails: '' });
  const [hospitalization, setHospitalization] = useState<{ rooms: string; roomTypes: string[]; facilities: boolean; facilitiesList: any[] }>({ rooms: '', roomTypes: [], facilities: false, facilitiesList: [] });
  const [consumables, setConsumables] = useState({ ebm: false, expired: false, expiredDetails: '', highCost: false });
  const [dataProtection, setDataProtection] = useState({ electronic: false, physical: false, restricted: false, backup: false });
  const [feedback, setFeedback] = useState({ mechanism: false, complaints: '' });
  const [findings, setFindings] = useState<{ summary: string; issues: string[]; recommendations: string }>({ summary: '', issues: [], recommendations: '' });
  const [signatures, setSignatures] = useState([{ name: '', position: '', date: '', signature: '' }]);
  const [responsiblePerson, setResponsiblePerson] = useState('');
  const [saving, setSaving] = useState(false);

  // Handlers for repeatable fields
  const addTeamMember = () => setTeam([...team, { name: '', position: '' }]);
  const addPractitioner = () => setPractitioners([...practitioners, { name: '', role: '', specialty: '', status: '', present: false, notes: '' }]);
  const addSignature = () => setSignatures([...signatures, { name: '', position: '', date: '', signature: '' }]);

  const resetForm = () => {
    setFacility({ name: '', address: '', phone: '', email: '', type: '', licenseExpiry: '' });
    setTeam([{ name: '', position: '' }]);
    setVisitDates({ from: '', to: '' });
    setServices([]);
    setAllServicesListed(false);
    setPractitioners([{ name: '', role: '', specialty: '', status: '', present: false, notes: '' }]);
    setPatientJourney({ eligibility: false, formsAvailable: false, formsApproved: '', paymentMethods: [], copaymentProof: false });
    setVoucher({ count: '', signedBy: { patient: false, prescriber: false, facility: false }, stamp: false, valuesWritten: false });
    setLabImaging({ equipment: false, expired: false, expiredDetails: '', allTests: false, testDetails: '', records: false, imagingResults: false });
    setProcedures({ system: '', discrepancies: false, discrepancyDetails: '' });
    setHospitalization({ rooms: '', roomTypes: [], facilities: false, facilitiesList: [] });
    setConsumables({ ebm: false, expired: false, expiredDetails: '', highCost: false });
    setDataProtection({ electronic: false, physical: false, restricted: false, backup: false });
    setFeedback({ mechanism: false, complaints: '' });
    setFindings({ summary: '', issues: [], recommendations: '' });
    setSignatures([{ name: '', position: '', date: '', signature: '' }]);
    setResponsiblePerson('');
  };

  const saveInspection = async (status: 'draft' | 'submitted') => {
    setSaving(true);
    try {
      await createHospitalInspection({
        facilityId,
        inspectorId,
        inspectorName,
        facilityName,
        district,
        status,
        items: [], // If you have checklist items, pass them here
        responsiblePerson,
        practitioners,
        services,
        allServicesListed,
        patientJourney,
        voucher,
        labImaging,
        procedures,
        hospitalization,
        consumables,
        dataProtection,
        feedback,
        findings,
        signatures,
        team,
      });
      alert(status === 'draft' ? 'Draft saved successfully!' : 'Inspection saved successfully!');
      if (status === 'submitted') {
        resetForm();
        if (onSuccess) onSuccess();
      }
    } catch (err) {
      alert('Failed to save inspection. See console for details.');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await saveInspection('submitted');
  };

  const handleSaveDraft = async (e: React.MouseEvent) => {
    e.preventDefault();
    await saveInspection('draft');
  };

  return (
    <form className="max-w-2xl mx-auto p-4 bg-gray-50 min-h-screen" onSubmit={handleSubmit}>
      {/* Modern header */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-extrabold text-green-700 mb-1">Hospital/Clinic Inspection</h1>
        <p className="text-lg text-gray-600">Comprehensive Quality & Compliance Assessment</p>
        <div className="mt-2 flex justify-center gap-4 text-sm text-gray-500">
          <span>Ministry of Health - Rwanda</span>
          <span>|</span>
          <span>RSSB</span>
        </div>
      </div>
      {/* 0. Responsible Person (NEW, always open) */}
      <div className="mb-6 bg-white rounded-lg shadow p-4 border">
        <h2 className="text-lg font-semibold mb-2">Responsible Person</h2>
        <Textarea
          label="Name, License/Accreditation Status, Physical Presence, and Notes"
          value={responsiblePerson}
          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setResponsiblePerson(e.target.value)}
          placeholder="E.g. Name: Dr. Habyalimana Jean Baptiste\nLicense: Valid until 30 June 2026\nPhysical presence: Permanent Doctor, present during visit.\nOther notes..."
        />
      </div>
      {/* 1. Medical Practitioners (NEW, always open) */}
      <div className="mb-6 bg-white rounded-lg shadow p-4 border">
        <h2 className="text-lg font-semibold mb-2">List of Medical Practitioners</h2>
        <p className="text-xs text-gray-500 mb-2">Doctors, Technicians, indicate if permanent or part-time, and add any relevant notes.</p>
        {practitioners.map((pr, idx) => (
          <div key={idx} className="grid grid-cols-1 md:grid-cols-6 gap-2 mb-2">
            <Input label="Full Name" value={pr.name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPractitioners(practitioners.map((p, i) => i === idx ? { ...p, name: e.target.value } : p))} />
            <Select label="Role" value={pr.role} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setPractitioners(practitioners.map((p, i) => i === idx ? { ...p, role: e.target.value } : p))} options={["Doctor", "Technician"]} />
            <Input label="Specialty" value={pr.specialty} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPractitioners(practitioners.map((p, i) => i === idx ? { ...p, specialty: e.target.value } : p))} />
            <Select label="Status" value={pr.status} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setPractitioners(practitioners.map((p, i) => i === idx ? { ...p, status: e.target.value } : p))} options={["Permanent", "Part-Time"]} />
            <Toggle label="Present?" checked={pr.present} onChange={(val: boolean) => setPractitioners(practitioners.map((p, i) => i === idx ? { ...p, present: val } : p))} />
            <div className="col-span-1 md:col-span-6">
              <Textarea
                label="Notes/Details"
                value={pr.notes || ''}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setPractitioners(practitioners.map((p, i) => i === idx ? { ...p, notes: e.target.value } : p))}
                placeholder="E.g. Responsible doctor, present/absent, special remarks, etc."
              />
            </div>
          </div>
        ))}
        <button type="button" className="text-green-700 underline text-sm" onClick={addPractitioner}>+ Add Practitioner</button>
      </div>
      {/* 2. Facility Information */}
      <CollapsibleSection title="Facility Information" openDefault>
        <Input label="Facility Name" value={facility.name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFacility({ ...facility, name: e.target.value })} />
        <Textarea label="Facility Address" value={facility.address} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFacility({ ...facility, address: e.target.value })} />
        <Input label="Phone" type="tel" value={facility.phone} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFacility({ ...facility, phone: e.target.value })} />
        <Input label="Email" type="email" value={facility.email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFacility({ ...facility, email: e.target.value })} />
        <Select label="Type of Facility" value={facility.type} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setFacility({ ...facility, type: e.target.value })} options={["Clinic", "Polyclinic", "Hospital", "Dispensary"]} />
        <Input label="License Expiry Date" type="date" value={facility.licenseExpiry} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFacility({ ...facility, licenseExpiry: e.target.value })} />
      </CollapsibleSection>
      {/* 3. Inspection Team */}
      <CollapsibleSection title="Inspection Team">
        <div className="flex gap-2 mb-3">
          <Input label="Date From" type="date" value={visitDates.from} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVisitDates({ ...visitDates, from: e.target.value })} />
          <Input label="Date To" type="date" value={visitDates.to} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVisitDates({ ...visitDates, to: e.target.value })} />
        </div>
        {team.map((member, idx) => (
          <div key={idx} className="flex gap-2 mb-2">
            <Input label="Full Name" value={member.name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTeam(team.map((m, i) => i === idx ? { ...m, name: e.target.value } : m))} />
            <Input label="Position" value={member.position} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTeam(team.map((m, i) => i === idx ? { ...m, position: e.target.value } : m))} />
          </div>
        ))}
        <button type="button" className="text-green-700 underline text-sm" onClick={addTeamMember}>+ Add Team Member</button>
      </CollapsibleSection>
      {/* 4. Services Offered */}
      <CollapsibleSection title="Services Offered">
        <CheckboxGroup
          label="Services Provided"
          options={["General Medicine","Gyneco-Obstetrical","Internal Medicine","Pediatrics","Dental","Laboratory","Radiography","Maternity"]}
          value={services}
          onChange={setServices}
        />
        <Toggle label="Are all services listed on the RSSB monthly list?" checked={allServicesListed} onChange={(val: boolean) => setAllServicesListed(val)} />
      </CollapsibleSection>
      {/* 5. Patient Journey & Billing */}
      <CollapsibleSection title="Patient Journey & Billing">
        <Toggle label="Eligibility Check at Reception?" checked={patientJourney.eligibility} onChange={(val: boolean) => setPatientJourney({ ...patientJourney, eligibility: val })} />
        <Toggle label="RSSB Forms Available?" checked={patientJourney.formsAvailable} onChange={(val: boolean) => setPatientJourney({ ...patientJourney, formsAvailable: val })} />
        <Select label="When are forms approved?" value={patientJourney.formsApproved} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setPatientJourney({ ...patientJourney, formsApproved: e.target.value })} options={["Before treatment", "After treatment"]} />
        <CheckboxGroup
          label="Payment Methods Used"
          options={["MoMo", "Cash", "Other"]}
          value={patientJourney.paymentMethods}
          onChange={(val: string[]) => setPatientJourney({ ...patientJourney, paymentMethods: val })}
        />
        <Toggle label="Proof of 15% Co-payment available?" checked={patientJourney.copaymentProof} onChange={(val: boolean) => setPatientJourney({ ...patientJourney, copaymentProof: val })} />
      </CollapsibleSection>
      {/* 6. Voucher Verification */}
      <CollapsibleSection title="Voucher Verification">
        <Input label="Number of Vouchers Inspected" type="number" value={voucher.count} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVoucher({ ...voucher, count: e.target.value })} />
        <div className="flex flex-wrap gap-2 mb-2">
          <Checkbox label="Patient" checked={voucher.signedBy.patient} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVoucher({ ...voucher, signedBy: { ...voucher.signedBy, patient: e.target.checked } })} />
          <Checkbox label="Prescriber" checked={voucher.signedBy.prescriber} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVoucher({ ...voucher, signedBy: { ...voucher.signedBy, prescriber: e.target.checked } })} />
          <Checkbox label="Health Facility" checked={voucher.signedBy.facility} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setVoucher({ ...voucher, signedBy: { ...voucher.signedBy, facility: e.target.checked } })} />
        </div>
        <Toggle label="Facility Stamp Present?" checked={voucher.stamp} onChange={(val: boolean) => setVoucher({ ...voucher, stamp: val })} />
        <Toggle label="Are 100%, 15%, 85% values written before patient leaves?" checked={voucher.valuesWritten} onChange={(val: boolean) => setVoucher({ ...voucher, valuesWritten: val })} />
      </CollapsibleSection>
      {/* 7. Laboratory & Imaging Services */}
      <CollapsibleSection title="Laboratory & Imaging Services">
        <Toggle label="Equipment Functional?" checked={labImaging.equipment} onChange={(val: boolean) => setLabImaging({ ...labImaging, equipment: val })} />
        <Toggle label="Expired reagents or drugs found?" checked={labImaging.expired} onChange={(val: boolean) => setLabImaging({ ...labImaging, expired: val })} />
        {labImaging.expired && <Textarea label="Details of expired items" value={labImaging.expiredDetails} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setLabImaging({ ...labImaging, expiredDetails: e.target.value })} />}
        <Toggle label="Are all billed lab tests performed?" checked={labImaging.allTests} onChange={(val: boolean) => setLabImaging({ ...labImaging, allTests: val })} />
        {labImaging.allTests === false && <Textarea label="Details" value={labImaging.testDetails} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setLabImaging({ ...labImaging, testDetails: e.target.value })} />}
        <Toggle label="Are lab records complete?" checked={labImaging.records} onChange={(val: boolean) => setLabImaging({ ...labImaging, records: val })} />
        <Toggle label="Are all imaging results recorded?" checked={labImaging.imagingResults} onChange={(val: boolean) => setLabImaging({ ...labImaging, imagingResults: val })} />
      </CollapsibleSection>
      {/* 8. Procedures & SMS System */}
      <CollapsibleSection title="Procedures & SMS System">
        <Input label="System in Use" value={procedures.system} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setProcedures({ ...procedures, system: e.target.value })} />
        <Toggle label="Are there discrepancies in billed procedures?" checked={procedures.discrepancies} onChange={(val: boolean) => setProcedures({ ...procedures, discrepancies: val })} />
        {procedures.discrepancies && <Textarea label="Details of discrepancies" value={procedures.discrepancyDetails} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setProcedures({ ...procedures, discrepancyDetails: e.target.value })} />}
      </CollapsibleSection>
      {/* 9. Hospitalization Info */}
      <CollapsibleSection title="Hospitalization Info">
        <Input label="Total Number of Rooms" type="number" value={hospitalization.rooms} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setHospitalization({ ...hospitalization, rooms: e.target.value })} />
        <CheckboxGroup
          label="Room Types"
          options={["Private", "General Ward"]}
          value={hospitalization.roomTypes}
          onChange={(val: string[]) => setHospitalization({ ...hospitalization, roomTypes: val })}
        />
        <Toggle label="Basic Facilities Present?" checked={hospitalization.facilities} onChange={(val: boolean) => setHospitalization({ ...hospitalization, facilities: val })} />
      </CollapsibleSection>
      {/* 10. Consumables */}
      <CollapsibleSection title="Consumables">
        <Toggle label="EBM Used?" checked={consumables.ebm} onChange={(val: boolean) => setConsumables({ ...consumables, ebm: val })} />
        <Toggle label="Expired medicines found?" checked={consumables.expired} onChange={(val: boolean) => setConsumables({ ...consumables, expired: val })} />
        {consumables.expired && <Textarea label="Details of expired medicines" value={consumables.expiredDetails} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setConsumables({ ...consumables, expiredDetails: e.target.value })} />}
        <Toggle label="Any high-cost consumables?" checked={consumables.highCost} onChange={(val: boolean) => setConsumables({ ...consumables, highCost: val })} />
      </CollapsibleSection>
      {/* 11. Data Protection Compliance */}
      <CollapsibleSection title="Data Protection Compliance">
        <Toggle label="Data stored electronically?" checked={dataProtection.electronic} onChange={(val: boolean) => setDataProtection({ ...dataProtection, electronic: val })} />
        <Toggle label="Physical files secured?" checked={dataProtection.physical} onChange={(val: boolean) => setDataProtection({ ...dataProtection, physical: val })} />
        <Toggle label="Is access restricted to authorized staff?" checked={dataProtection.restricted} onChange={(val: boolean) => setDataProtection({ ...dataProtection, restricted: val })} />
        <Toggle label="Is backup in place?" checked={dataProtection.backup} onChange={(val: boolean) => setDataProtection({ ...dataProtection, backup: val })} />
      </CollapsibleSection>
      {/* 12. Feedback & Complaint Handling */}
      <CollapsibleSection title="Feedback & Complaint Handling">
        <Toggle label="Is a feedback mechanism in place?" checked={feedback.mechanism} onChange={(val: boolean) => setFeedback({ ...feedback, mechanism: val })} />
        <Textarea label="How are complaints handled?" value={feedback.complaints} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFeedback({ ...feedback, complaints: e.target.value })} />
      </CollapsibleSection>
      {/* 13. Inspection Findings */}
      <CollapsibleSection title="Inspection Findings">
        <Textarea label="Summary of Observations" value={findings.summary} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFindings({ ...findings, summary: e.target.value })} />
        <CheckboxGroup
          label="Key Issues Found"
          options={["Missing patient records","Missing lab results","Expired reagents","Billing mismatch","No clinical notes"]}
          value={findings.issues}
          onChange={(val: string[]) => setFindings({ ...findings, issues: val })}
        />
        <Textarea label="Recommendations" value={findings.recommendations} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setFindings({ ...findings, recommendations: e.target.value })} />
      </CollapsibleSection>
      {/* 14. Signatures */}
      <CollapsibleSection title="Signatures">
        {signatures.map((sig, idx) => (
          <div key={idx} className="flex gap-2 mb-2">
            <Input label="Full Name" value={sig.name} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSignatures(signatures.map((s, i) => i === idx ? { ...s, name: e.target.value } : s))} />
            <Input label="Position" value={sig.position} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSignatures(signatures.map((s, i) => i === idx ? { ...s, position: e.target.value } : s))} />
            <Input label="Date" type="date" value={sig.date} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSignatures(signatures.map((s, i) => i === idx ? { ...s, date: e.target.value } : s))} />
            <Input label="Signature (type name)" value={sig.signature} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSignatures(signatures.map((s, i) => i === idx ? { ...s, signature: e.target.value } : s))} />
          </div>
        ))}
        <button type="button" className="text-green-700 underline text-sm" onClick={addSignature}>+ Add Signature</button>
      </CollapsibleSection>
      {/* Submit/Reset */}
      <div className="flex gap-4 justify-center mt-8">
        <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded font-semibold hover:bg-green-700" disabled={saving}>Submit</button>
        <button type="button" className="bg-gray-300 text-gray-800 px-6 py-2 rounded font-semibold hover:bg-gray-400" onClick={resetForm} disabled={saving}>Reset</button>
        <button type="button" className="bg-yellow-400 text-white px-6 py-2 rounded font-semibold hover:bg-yellow-500" onClick={handleSaveDraft} disabled={saving}>Save as Draft</button>
      </div>
    </form>
  );
};

export default HospitalClinicInspectionForm; 