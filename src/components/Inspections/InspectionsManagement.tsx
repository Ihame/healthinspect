import React, { useEffect, useState, useCallback } from 'react';
import { Plus, Search, Edit, Trash2, Calendar, MapPin, Eye } from 'lucide-react';
import { getInspections, getFacilities, createPharmacyInspection, createInspection, supabase, uploadInspectionImage, createHospitalInspection, getHospitalInspectionById, createInspectionSchedule, getInspectionSchedules, getUsers } from '../../lib/supabase';
import type { User, Facility, FacilityType, InspectionSchedule } from '../../types';
import { OFFICIAL_PHARMACY_INSPECTION_FORM } from '../../data/officialInspectionForms';
import { useAuth } from '../../context/AuthContext';
import SimpleHospitalClinicInspectionForm from './SimpleHospitalClinicInspectionForm';
import { getUserPermissions } from '../../utils/permissions';
import HospitalClinicChecklistForm from './HospitalClinicChecklistForm';
import { useRef } from 'react';


const deleteInspection = async (inspectionId: string) => {
  await supabase.from('inspections').delete().eq('id', inspectionId);
  await supabase.from('inspection_items').delete().eq('inspection_id', inspectionId);
  await supabase.from('pharmacy_inspection_items').delete().eq('inspection_id', inspectionId);
};

const InspectionsManagement: React.FC = () => {
  const [inspections, setInspections] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [showPharmacyModal, setShowPharmacyModal] = useState(false);
  const [pharmacies, setPharmacies] = useState<any[]>([]);
  const [pharmacyLoading, setPharmacyLoading] = useState(false);
  const [pharmacySearch, setPharmacySearch] = useState('');
  const { currentUser } = useAuth();
  const [showInspectionForm, setShowInspectionForm] = useState(false);
  const [selectedPharmacy, setSelectedPharmacy] = useState<any | null>(null);
  const [inspectionForm, setInspectionForm] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [showFacilityModal, setShowFacilityModal] = useState(false);
  const [facilities, setFacilities] = useState<any[]>([]);
  const [facilityLoading, setFacilityLoading] = useState(false);
  const [facilitySearch, setFacilitySearch] = useState('');
  const [editInspection, setEditInspection] = useState<any | null>(null);
  const [editForm, setEditForm] = useState<any[]>([]);
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [reportInspection, setReportInspection] = useState<any | null>(null);
  const [selectedInspector, setSelectedInspector] = useState<string>('all');
  const [selectedFacilityType, setSelectedFacilityType] = useState<string>('all');
  const [dateFrom, setDateFrom] = useState<string>('');
  const [dateTo, setDateTo] = useState<string>('');
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleForm, setScheduleForm] = useState({
    facilityId: '',
    facilityType: '' as FacilityType | '',
    inspectionType: '',
    scheduledDate: '',
    scheduledTime: '',
    assignedInspectors: [] as string[],
    notes: ''
  });
  const [scheduling, setScheduling] = useState(false);
  const [scheduledInspections, setScheduledInspections] = useState<InspectionSchedule[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const permissions = currentUser ? getUserPermissions(currentUser) : null;
  // Add state for facility search in the schedule modal
  const [scheduleFacilitySearch, setScheduleFacilitySearch] = useState('');
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const popupTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<InspectionSchedule | null>(null);


  useEffect(() => {
    loadInspections();
  }, []);

  const loadInspections = async () => {
    setLoading(true);
    try {
      const data = await getInspections();
      // Map DB fields to camelCase for UI
      const mapped = data.map((insp: any) => ({
        ...insp,
        facilityName: insp.facility_name,
        inspectorName: insp.inspector_name,
        startDate: insp.start_date ? new Date(insp.start_date) : null,
      }));
      setInspections(mapped);
    } catch (err) {
      // handle error
    } finally {
      setLoading(false);
    }
  };

  // Open modal for pharmacy (with role check)
  const openPharmacyModal = async () => {
    if (currentUser?.role === 'hospital_inspector') {
      alert('You are not allowed to inspect pharmacies.');
      return;
    }
    setSelectedFacilityType('pharmacy');
    setShowPharmacyModal(true);
    setPharmacyLoading(true);
    try {
      const data = await getFacilities({ type: 'pharmacy' });
      setPharmacies(data);
    } catch (err) {
      setPharmacies([]);
    } finally {
      setPharmacyLoading(false);
    }
  };

  const handleStartInspection = (pharmacy: any) => {
    setSelectedPharmacy(pharmacy);
    setInspectionForm(OFFICIAL_PHARMACY_INSPECTION_FORM.map(item => ({ ...item, status: '', observation: '', images: [] })));
    setShowInspectionForm(true);
    setShowPharmacyModal(false);
  };

  const handleFormChange = (idx: number, field: string, value: string) => {
    setInspectionForm(prev => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  };

  const handleSubmitInspection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !selectedPharmacy) return;
    setSubmitting(true);
    try {
      await createPharmacyInspection({
        facilityId: selectedPharmacy.id,
        inspectorId: currentUser?.id || '',
        inspectorName: currentUser?.name || '',
        facilityName: selectedPharmacy.name,
        district: selectedPharmacy.district,
        status: 'submitted',
        items: inspectionForm,
        totalScore: 0, // Calculate if needed
        maxPossibleScore: 0, // Calculate if needed
        compliancePercentage: 0, // Calculate if needed
        signature: '',
        notes: ''
      });
      setSubmitSuccess(true);
      setShowInspectionForm(false);
      setSelectedPharmacy(null);
      setInspectionForm([]);
      loadInspections();
    } catch (err) {
      alert('Failed to submit inspection.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredPharmacies = pharmacies.filter((pharm) =>
    (pharm.name?.toLowerCase() || '').includes(pharmacySearch.toLowerCase())
  );

  // After loading inspections and facilities, map inspections to include facilityType
  const inspectionsWithFacilityType = inspections.map(insp => {
    const facility = facilities.find(f => f.id === insp.facilityId);
    return { ...insp, facilityType: facility?.type || '' };
  });

  // Use inspectionsWithFacilityType for filtering and display
  const filteredInspections = inspectionsWithFacilityType.filter((insp) => {
    const matchesSearch =
      (insp.facilityName?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (insp.inspectorName?.toLowerCase() || '').includes(searchTerm.toLowerCase());
    const matchesStatus = selectedStatus === 'all' || (insp.status || '') === selectedStatus;
    const matchesFacilityType = selectedFacilityType === 'all' || (insp.facilityType || '') === selectedFacilityType;
    const matchesInspector = selectedInspector === 'all' || (insp.inspectorName || '') === selectedInspector;
    const matchesDateFrom = !dateFrom || (insp.startDate && insp.startDate >= new Date(dateFrom));
    const matchesDateTo = !dateTo || (insp.startDate && insp.startDate <= new Date(dateTo));
    return matchesSearch && matchesStatus && matchesFacilityType && matchesInspector && matchesDateFrom && matchesDateTo;
  });

  // Open modal for hospital/clinic (with role check)
  const openFacilityModal = async (type: 'hospital' | 'clinic') => {
    if (currentUser?.role === 'pharmacy_inspector') {
      alert('You are not allowed to inspect hospitals or clinics.');
      return;
    }
    setSelectedFacilityType(type);
    setShowFacilityModal(true);
    setFacilityLoading(true);
    try {
      const data = await getFacilities({ type });
      setFacilities(data);
    } catch (err) {
      setFacilities([]);
    } finally {
      setFacilityLoading(false);
    }
  };

  const handleStartFacilityInspection = (facility: any) => {
    setSelectedPharmacy(facility); // reuse selectedPharmacy for all
    setShowInspectionForm(true);
    setShowFacilityModal(false);
  };

  const handleSubmitFacilityInspection = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !selectedPharmacy) return;
    setSubmitting(true);
    try {
      await createInspection({
        facilityId: selectedPharmacy.id,
        inspectorId: currentUser?.id || '',
        inspectorName: currentUser?.name || '',
        facilityName: selectedPharmacy.name,
        district: selectedPharmacy.district,
        status: 'submitted',
        items: inspectionForm,
        totalScore: 0,
        maxPossibleScore: 0,
        compliancePercentage: 0,
        signature: '',
        notes: ''
      });
      setSubmitSuccess(true);
      setShowInspectionForm(false);
      setSelectedPharmacy(null);
      setInspectionForm([]);
      loadInspections();
    } catch (err) {
      alert('Failed to submit inspection.');
    } finally {
      setSubmitting(false);
    }
  };

  // Edit inspection
  const handleEditInspection = (insp: any) => {
    setEditInspection(insp);
    setEditForm(insp.items || []);
  };
  const handleEditFormChange = (idx: number, field: string, value: string) => {
    setEditForm(prev => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item));
  };
  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editInspection) return;
    setEditSubmitting(true);
    try {
      // Delete old items
      await supabase.from('inspection_items').delete().eq('inspection_id', editInspection.id);
      // Insert new items
      const itemsToInsert = editForm.map(item => ({
        inspection_id: editInspection.id,
        question: item.question,
        category: item.category,
        max_score: item.maxScore,
        response: item.response,
        actual_score: item.response === 'yes' ? item.maxScore : 0,
        comments: item.comments,
        images: item.images || []
      }));
      await supabase.from('inspection_items').insert(itemsToInsert);
      setEditInspection(null);
      setEditForm([]);
      loadInspections();
    } catch (err) {
      alert('Failed to update inspection.');
    } finally {
      setEditSubmitting(false);
    }
  };

  // Delete inspection
  const handleDeleteInspection = async () => {
    if (!deleteId) return;
    await deleteInspection(deleteId);
    setDeleteId(null);
    loadInspections();
  };

  const filteredFacilities: any[] = facilities.filter((f: any) =>
    (f.name?.toLowerCase() || '').includes(facilitySearch.toLowerCase())
  );

  // Image upload handler for inspection form
  const handleImageChange = async (idx: number, file: File) => {
    if (!selectedPharmacy) return;
    setUploadingIdx(idx);
    try {
      const url = await uploadInspectionImage(file, selectedPharmacy.id, inspectionForm[idx].id || inspectionForm[idx].number);
      setInspectionForm(prev => prev.map((item, i) => i === idx ? { ...item, images: [url] } : item));
    } catch (err) {
      alert('Failed to upload image.');
    } finally {
      setUploadingIdx(null);
      setUploadProgress(0);
    }
  };

  // Validation for inspection form
  const isFormValid = inspectionForm.every(item => item.status && (item.status !== 'non_compliant' || (item.images && item.images.length > 0)));

  // Update handleViewReport to fetch latest data
  const handleViewReport = async (insp: any) => { // Changed to any to avoid conflict with imported Inspection type
    // Try to fetch the latest inspection data from the backend
    let latestData = insp;
    try {
      if (insp.facilityType === 'hospital' || insp.facilityType === 'clinic') {
        // Use getHospitalInspectionById if available
        const data = await getHospitalInspectionById(insp.id);
        if (data) latestData = data;
      } else {
        // For pharmacy or other, you may have getPharmacyInspectionById or similar
        // If not, fallback to insp
      }
    } catch (err) {
      // fallback to insp
    }
    setReportInspection(latestData);
  };

  // Load scheduled inspections
  useEffect(() => {
    loadScheduledInspections();
  }, []);

  const loadScheduledInspections = async () => {
    try {
      const data = await getInspectionSchedules();
      setScheduledInspections(data);
    } catch (err) {
      setScheduledInspections([]);
    }
  };

  const handleScheduleInspection = async (e: React.FormEvent) => {
    e.preventDefault();
    setScheduling(true);
    try {
      await createInspectionSchedule({
        ...scheduleForm,
        createdBy: currentUser?.id || ''
      });
      setShowScheduleModal(false);
      setScheduleForm({
        facilityId: '',
        facilityType: '',
        inspectionType: '',
        scheduledDate: '',
        scheduledTime: '',
        assignedInspectors: [],
        notes: ''
      });
      loadScheduledInspections();
    } catch (err) {
      alert('Failed to schedule inspection.');
    } finally {
      setScheduling(false);
    }
  };

  // Fetch users for inspector assignment
  useEffect(() => {
    loadUsers();
  }, []);
  const loadUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      setUsers([]);
    }
  };

  // Set facilityType automatically when facility is selected
  const handleFacilityChange = (facilityId: string) => {
    setScheduleForm(f => {
      const facility = facilities.find(fac => fac.id === facilityId);
      return {
        ...f,
        facilityId,
        facilityType: facility ? facility.type : ''
      };
    });
  };

  // Add this useEffect to ensure facilities are loaded for the schedule modal
  useEffect(() => {
    if (showScheduleModal) {
      (async () => {
        try {
          const data = await getFacilities();
          setFacilities(data);
        } catch (err) {
          setFacilities([]);
        }
      })();
    }
  }, [showScheduleModal]);

  // When submitSuccess changes to true, show popup and auto-close
  useEffect(() => {
    if (submitSuccess) {
      setShowSuccessPopup(true);
      if (popupTimeoutRef.current) clearTimeout(popupTimeoutRef.current);
      popupTimeoutRef.current = setTimeout(() => setShowSuccessPopup(false), 3000);
      setSubmitSuccess(false); // reset for next submission
    }
    return () => {
      if (popupTimeoutRef.current) clearTimeout(popupTimeoutRef.current);
    };
  }, [submitSuccess]);

  // Filter scheduled inspections for inspectors: only show those assigned to them
  const isInspector = currentUser?.role === 'pharmacy_inspector' || currentUser?.role === 'hospital_inspector';
  const visibleScheduledInspections = isInspector
    ? scheduledInspections.filter(s => Array.isArray(s.assigned_inspectors) && typeof currentUser?.id === 'string' && s.assigned_inspectors.includes(currentUser.id))
    : scheduledInspections;

  // Handler to show notes modal
  const handleShowNotes = (schedule: InspectionSchedule) => {
    setSelectedSchedule(schedule);
    setShowNotesModal(true);
  };
  // Handler to update status (for inspector)
  const handleUpdateScheduleStatus = useCallback(async (schedule: InspectionSchedule, newStatus: string) => {
    await supabase.from('inspection_schedules').update({ status: newStatus }).eq('id', schedule.id);
    loadScheduledInspections();
  }, [loadScheduledInspections]);
  // Handler to delete schedule (for admin/supervisor)
  const handleDeleteSchedule = useCallback(async (schedule: InspectionSchedule) => {
    await supabase.from('inspection_schedules').delete().eq('id', schedule.id);
    loadScheduledInspections();
  }, [loadScheduledInspections]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Inspections Management</h1>
          <p className="text-gray-600">Manage all health facility inspections</p>
        </div>
        <div className="flex gap-4">
          {permissions?.canConductInspections && (
            <>
              <button className="mt-4 lg:mt-0 bg-green-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-green-700 transition-colors" onClick={openPharmacyModal}>
                <Plus className="w-4 h-4 mr-2" />
                Inspect Pharmacy
              </button>
              <button className="mt-4 lg:mt-0 bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-blue-700 transition-colors" onClick={() => openFacilityModal('hospital')}>
                <Plus className="w-4 h-4 mr-2" />
                Inspect Hospital
              </button>
              <button className="mt-4 lg:mt-0 bg-purple-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-purple-700 transition-colors" onClick={() => openFacilityModal('clinic')}>
                <Plus className="w-4 h-4 mr-2" />
                Inspect Clinic
              </button>
            </>
          )}
          {!permissions?.canConductInspections && (
            <p className="text-red-600">You do not have permission to conduct new inspections.</p>
          )}
          {permissions?.canAddFacilities && (
            <button
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg ml-2"
              onClick={() => setShowScheduleModal(true)}
            >
              Schedule Inspection
            </button>
          )}
        </div>
      </div>
      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4 items-end">
          <div className="flex-1">
            <label className="block text-xs font-semibold mb-1">Search</label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by facility or inspector..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Inspector</label>
            <select value={selectedInspector} onChange={e => setSelectedInspector(e.target.value)} className="w-full px-3 py-2 border rounded">
              <option value="all">All</option>
              {[...new Set(inspectionsWithFacilityType.map(i => i.inspectorName).filter(Boolean))].map(name => (
                <option key={name} value={name}>{name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Facility Type</label>
            <select value={selectedFacilityType} onChange={e => setSelectedFacilityType(e.target.value)} className="w-full px-3 py-2 border rounded">
              <option value="all">All</option>
              {[...new Set(inspectionsWithFacilityType.map(i => i.facilityType).filter(Boolean))].map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Status</label>
            <select value={selectedStatus} onChange={e => setSelectedStatus(e.target.value)} className="w-full px-3 py-2 border rounded">
              <option value="all">All</option>
              {[...new Set(inspectionsWithFacilityType.map(i => i.status).filter(Boolean))].map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Date From</label>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="w-full px-3 py-2 border rounded" />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1">Date To</label>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="w-full px-3 py-2 border rounded" />
          </div>
          <div>
            <label className="block text-xs font-semibold mb-1 text-white">Reset</label>
            <button onClick={() => { setSearchTerm(''); setSelectedInspector('all'); setSelectedFacilityType('all'); setSelectedStatus('all'); setDateFrom(''); setDateTo(''); }} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">Reset Filters</button>
          </div>
        </div>
      </div>
      {/* Inspections Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Facility</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Inspector</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">District</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredInspections.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-gray-400">No inspections found.</td>
              </tr>
            ) : (
              filteredInspections.map((insp, idx) => (
                <tr key={insp.id} className="hover:bg-green-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{insp.facilityName || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{insp.inspectorName || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 capitalize">{insp.district}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${insp.status === 'submitted' ? 'bg-blue-100 text-blue-800' : insp.status === 'approved' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{insp.status}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{insp.startDate ? new Date(insp.startDate).toLocaleDateString() : '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap flex gap-2 items-center">
                    {/* View Report */}
                    <button title="View Report" onClick={() => handleViewReport(insp)} className="text-blue-600 hover:text-blue-800" aria-label="View Report">
                      <Eye className="w-5 h-5" />
                    </button>
                    {/* Only super_admin can edit/delete */}
                    {currentUser?.role === 'super_admin' && (
                      <>
                        <button title="Edit Inspection" onClick={() => handleEditInspection(insp)} className="text-green-600 hover:text-green-800" aria-label="Edit Inspection">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536M9 13h3l8-8a2.828 2.828 0 00-4-4l-8 8v3h3z" /></svg>
                        </button>
                        <button title="Delete Inspection" onClick={() => setDeleteId(insp.id)} className="text-red-600 hover:text-red-800" aria-label="Delete Inspection">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {/* Inspect Modal */}
      {showPharmacyModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Select Pharmacy to Inspect</h3>
              <button onClick={() => setShowPharmacyModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <span className="text-gray-500">&times;</span>
              </button>
            </div>
            <div className="p-6">
              <input
                type="text"
                placeholder="Search pharmacies..."
                value={pharmacySearch}
                onChange={e => setPharmacySearch(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4"
              />
              {pharmacyLoading ? (
                <div className="text-center py-8 text-gray-400">Loading...</div>
              ) : filteredPharmacies.length === 0 ? (
                <div className="text-center py-8 text-gray-400">No pharmacies found.</div>
              ) : (
                <ul>
                  {filteredPharmacies.map(pharm => (
                    <li key={pharm.id} className="flex justify-between items-center py-2 border-b">
                      <span>{pharm.name} <span className="text-xs text-gray-500">({pharm.district})</span></span>
                      <button className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700" onClick={() => handleStartInspection(pharm)}>
                        Inspect
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
      {showInspectionForm && selectedPharmacy && selectedFacilityType === 'pharmacy' && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Pharmacy Inspection: {selectedPharmacy.name}</h3>
              <button onClick={() => setShowInspectionForm(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <span className="text-gray-500">&times;</span>
              </button>
            </div>
            <form onSubmit={handleSubmitInspection} className="p-6 space-y-4">
              {inspectionForm.map((item: any, idx) => (
                <div key={item.id} className="mb-4 border-b pb-4">
                  <div className="font-semibold mb-1">{item.number}. {item.description}</div>
                  {item.targetedPoints ? (
                    <div className="text-xs text-gray-500 mb-2">{item.targetedPoints.join(', ')}</div>
                  ) : (
                    <div className="text-xs text-gray-500 mb-2">{item.category}</div>
                  )}
                  <div className="flex gap-4 mb-2">
                    <label>
                      <input type="radio" name={`status-${idx}`} value="compliant" checked={item.status === 'compliant'} onChange={() => handleFormChange(idx, 'status', 'compliant')} required /> Compliant
                    </label>
                    <label>
                      <input type="radio" name={`status-${idx}`} value="non_compliant" checked={item.status === 'non_compliant'} onChange={() => handleFormChange(idx, 'status', 'non_compliant')} /> Non-compliant
                    </label>
                    <label>
                      <input type="radio" name={`status-${idx}`} value="not_applicable" checked={item.status === 'not_applicable'} onChange={() => handleFormChange(idx, 'status', 'not_applicable')} /> N/A
                    </label>
                  </div>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Observation (optional)"
                    value={item.observation}
                    onChange={e => handleFormChange(idx, 'observation', e.target.value)}
                  />
                  <input type="file" accept="image/*" onChange={e => e.target.files && handleImageChange(idx, e.target.files[0])} />
                  {item.images && item.images[0] && <img src={item.images[0]} alt="evidence" className="h-16 mt-2" />}
                </div>
              ))}
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setShowInspectionForm(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit Inspection'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {showInspectionForm && selectedPharmacy && (selectedFacilityType === 'hospital' || selectedFacilityType === 'clinic') && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">{selectedFacilityType === 'hospital' ? 'Hospital' : 'Clinic'} Inspection: {selectedPharmacy.name}</h3>
              <button onClick={() => setShowInspectionForm(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <span className="text-gray-500">&times;</span>
              </button>
            </div>
            <HospitalClinicChecklistForm
              facilityName={selectedPharmacy.name}
              inspectorId={currentUser?.id}
              inspectorName={currentUser?.name}
              onSubmit={async (formData) => {
                setSubmitting(true);
                try {
                  await createHospitalInspection({
                    facilityId: selectedPharmacy.id,
                    inspectorId: currentUser?.id || '',
                    inspectorName: currentUser?.name || '',
                    facilityName: selectedPharmacy.name,
                    district: formData.district,
                    location: formData.location,
                    status: 'submitted',
                    items: formData.items,
                    team: formData.team,
                  });
                  setSubmitSuccess(true);
                  setShowInspectionForm(false);
                  setSelectedPharmacy(null);
                  loadInspections();
                } catch (err) {
                  console.error('Hospital inspection submission error:', err);
                  alert('Failed to submit inspection. See console for details.');
                } finally {
                  setSubmitting(false);
                }
              }}
            />
          </div>
        </div>
      )}
      {showFacilityModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Select Facility to Inspect</h3>
              <button onClick={() => setShowFacilityModal(false)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <span className="text-gray-500">&times;</span>
              </button>
            </div>
            <div className="p-6">
              <input
                type="text"
                placeholder="Search facilities..."
                value={facilitySearch}
                onChange={e => setFacilitySearch(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg mb-4"
              />
              {facilityLoading ? (
                <div className="text-center py-8 text-gray-400">Loading...</div>
              ) : filteredFacilities.length === 0 ? (
                <div className="text-center py-8 text-gray-400">No facilities found.</div>
              ) : (
                <ul>
                  {filteredFacilities.map((f: any) => (
                    <li key={f.id} className="flex justify-between items-center py-2 border-b">
                      <span>{f.name} <span className="text-xs text-gray-500">({f.district})</span></span>
                      <button className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700" onClick={() => handleStartFacilityInspection(f)}>
                        Inspect
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>
      )}
      {editInspection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Edit Inspection: {editInspection.facilityName}</h3>
              <button onClick={() => setEditInspection(null)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <span className="text-gray-500">&times;</span>
              </button>
            </div>
            <form onSubmit={handleSubmitEdit} className="p-6 space-y-4">
              {editForm.map((item: any, idx) => (
                <div key={item.id} className="mb-4 border-b pb-4">
                  <div className="font-semibold mb-1">{item.number}. {item.question}</div>
                  <div className="text-xs text-gray-500 mb-2">{item.category}</div>
                  <div className="flex gap-4 mb-2">
                    <label>
                      <input type="radio" name={`response-${idx}`} value="yes" checked={item.response === 'yes'} onChange={() => handleEditFormChange(idx, 'response', 'yes')} /> Yes
                    </label>
                    <label>
                      <input type="radio" name={`response-${idx}`} value="no" checked={item.response === 'no'} onChange={() => handleEditFormChange(idx, 'response', 'no')} /> No
                    </label>
                    <label>
                      <input type="radio" name={`response-${idx}`} value="na" checked={item.response === 'na'} onChange={() => handleEditFormChange(idx, 'response', 'na')} /> N/A
                    </label>
                  </div>
                  <textarea
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Comments (optional)"
                    value={item.comments}
                    onChange={e => handleEditFormChange(idx, 'comments', e.target.value)}
                  />
                </div>
              ))}
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setEditInspection(null)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700" disabled={editSubmitting}>{editSubmitting ? 'Updating...' : 'Update Inspection'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {deleteId && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Confirm Deletion</h3>
              <button onClick={() => setDeleteId(null)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <span className="text-gray-500">&times;</span>
              </button>
            </div>
            <div className="p-6 text-center">
              <p className="text-gray-800 mb-4">Are you sure you want to delete this inspection?</p>
              <div className="flex justify-end gap-3">
                <button type="button" onClick={() => setDeleteId(null)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">Cancel</button>
                <button type="button" onClick={handleDeleteInspection} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}
      {reportInspection && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto print:max-h-full print:overflow-visible print-area">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 print:hidden">
              <h3 className="text-lg font-semibold text-gray-900">Inspection Report: {reportInspection.facilityName}</h3>
              <button onClick={() => setReportInspection(null)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <span className="text-gray-500">&times;</span>
              </button>
            </div>
            {reportInspection.items && reportInspection.items[0] && reportInspection.items[0].targetedPoints ? (
              <div className="p-6">
                <div className="mb-4">
                  <div className="font-bold text-xl mb-1">{reportInspection.facilityName}</div>
                  <div className="text-gray-600">{reportInspection.district} | {reportInspection.status} | {reportInspection.startDate ? new Date(reportInspection.startDate).toLocaleDateString() : '-'}</div>
                  <div className="text-gray-600">Inspector: {reportInspection.inspectorName}</div>
                </div>
                <h2 className="text-lg font-semibold mb-4 text-green-700">Inspection Items</h2>
                <div className="space-y-6">
                  {/* Sort items by numeric value of number, fallback to 0 if missing. Items with numbers come first. */}
                  {[...reportInspection.items]
                    .sort((a: any, b: any) => {
                      const numA = a.number !== undefined ? Number(a.number) : 0;
                      const numB = b.number !== undefined ? Number(b.number) : 0;
                      // Items with numbers come before those without
                      if (!isNaN(numA) && !isNaN(numB)) return numA - numB;
                      if (!isNaN(numA)) return -1;
                      if (!isNaN(numB)) return 1;
                      return 0;
                    })
                    .map((item: any) => (
                      <div key={item.id} className="border rounded-lg p-4 bg-gray-50 shadow-sm">
                        <div className="flex items-center mb-2">
                          <span className="font-bold text-lg text-blue-800 mr-3">{item.number}</span>
                          <span className="font-semibold text-gray-900 text-base">{item.description}</span>
                          <span className={`ml-4 px-3 py-1 rounded-full text-xs font-bold border ${item.status === 'COMPLIANT' ? 'bg-green-100 text-green-800 border-green-300' : item.status === 'NON_COMPLIANT' ? 'bg-red-100 text-red-800 border-red-300' : 'bg-gray-100 text-gray-800 border-gray-300'}`}>{item.status ? item.status.replace('_', ' ').toUpperCase() : 'NOT ANSWERED'}</span>
                        </div>
                        <div className="ml-7 mb-2">
                          <div className="font-medium text-gray-700 mb-1">Targeted Points:</div>
                          <ul className="list-disc pl-5 space-y-1">
                            {item.targetedPoints && item.targetedPoints.map((point: string, i: number) => (
                              <li key={i} className="text-sm text-gray-700">{point}</li>
                            ))}
                          </ul>
                        </div>
                        {item.observation && (
                          <div className="ml-7 mt-2">
                            <div className="font-medium text-gray-700 mb-1">Observation:</div>
                            <div className="text-sm text-gray-800 bg-white rounded-lg p-3 border border-gray-200">{item.observation}</div>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
                {/* Inspection Team (if present) */}
                {reportInspection.team && reportInspection.team.length > 0 && (
                  <div className="mt-8 mb-4">
                    <h4 className="font-semibold mb-2">Inspection Team Members</h4>
                    <table className="w-full text-xs md:text-sm border">
                      <thead className="bg-gray-100">
                        <tr>
                          <th className="border px-2 py-1">Full Name</th>
                          <th className="border px-2 py-1">Position</th>
                        </tr>
                      </thead>
                      <tbody>
                        {reportInspection.team.map((member: any, idx: number) => (
                          <tr key={idx}>
                            <td className="border px-2 py-1">{member.name || member.fullName}</td>
                            <td className="border px-2 py-1">{member.position}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                <div className="print:hidden flex justify-end mt-6">
                  <button onClick={() => window.print()} className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900">Print</button>
                </div>
              </div>
            ) : (
              // ... existing report rendering for pharmacy/other ...
              <div className="p-6">
                <div className="mb-4">
                  <div className="font-bold text-xl mb-1">{reportInspection.facilityName}</div>
                  <div className="text-gray-600">{reportInspection.district} | {reportInspection.status} | {reportInspection.startDate ? new Date(reportInspection.startDate).toLocaleDateString() : '-'}</div>
                  <div className="text-gray-600">Inspector: {reportInspection.inspectorName}</div>
                </div>
                <table className="w-full text-sm mb-6">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-2 text-left">#</th>
                      <th className="p-2 text-left">Question</th>
                      <th className="p-2 text-left">Status</th>
                      <th className="p-2 text-left">Observation</th>
                      <th className="p-2 text-left">Image</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(reportInspection.items || []).map((item: any, idx: number) => (
                      <tr key={item.id || idx} className="border-b">
                        <td className="p-2 align-top">{item.number || idx + 1}</td>
                        <td className="p-2 align-top">{item.question || item.description}</td>
                        <td className="p-2 align-top">{item.status || item.response}</td>
                        <td className="p-2 align-top">{item.observation || item.comments}</td>
                        <td className="p-2 align-top">
                          {item.images && item.images[0] && (
                            <img src={item.images[0]} alt="evidence" className="h-16" />
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="print:hidden flex justify-end">
                  <button onClick={() => window.print()} className="px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900">Print</button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {/* Schedule Inspection Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-lg w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Schedule Inspection</h3>
            <form onSubmit={handleScheduleInspection} className="space-y-4">
              {/* Facility selection with search */}
              <div>
                <label className="block mb-1 font-medium">Facility</label>
                <input
                  type="text"
                  placeholder="Search facilities..."
                  value={scheduleFacilitySearch}
                  onChange={e => setScheduleFacilitySearch(e.target.value)}
                  className="w-full border rounded px-3 py-2 mb-2"
                />
                <select
                  value={scheduleForm.facilityId}
                  onChange={e => handleFacilityChange(e.target.value)}
                  className="w-full border rounded px-3 py-2 max-h-40 overflow-y-auto"
                  required
                >
                  <option value="">Select facility</option>
                  {facilities
                    .filter(f =>
                      f.name.toLowerCase().includes(scheduleFacilitySearch.toLowerCase()) ||
                      (f.district && f.district.toLowerCase().includes(scheduleFacilitySearch.toLowerCase())) ||
                      (f.type && f.type.toLowerCase().includes(scheduleFacilitySearch.toLowerCase()))
                    )
                    .map(f => (
                      <option key={f.id} value={f.id}>
                        {f.name} ({f.type}, {f.district})
                      </option>
                    ))}
                </select>
              </div>
              {/* Inspection type */}
              <div>
                <label className="block mb-1 font-medium">Inspection Type</label>
                <select
                  value={scheduleForm.inspectionType}
                  onChange={e => setScheduleForm(f => ({ ...f, inspectionType: e.target.value }))}
                  className="w-full border rounded px-3 py-2"
                  required
                >
                  <option value="">Select type</option>
                  <option value="routine">Routine</option>
                  <option value="follow-up">Follow-up</option>
                  <option value="special">Special</option>
                </select>
              </div>
              {/* Date and time */}
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="block mb-1 font-medium">Date</label>
                  <input
                    type="date"
                    value={scheduleForm.scheduledDate}
                    onChange={e => setScheduleForm(f => ({ ...f, scheduledDate: e.target.value }))}
                    className="w-full border rounded px-3 py-2"
                    required
                  />
                </div>
                <div className="flex-1">
                  <label className="block mb-1 font-medium">Time</label>
                  <input
                    type="time"
                    value={scheduleForm.scheduledTime}
                    onChange={e => setScheduleForm(f => ({ ...f, scheduledTime: e.target.value }))}
                    className="w-full border rounded px-3 py-2"
                    required
                  />
                </div>
              </div>
              {/* Assign inspectors (custom multi-select with checkboxes) */}
              <div>
                <label className="block mb-1 font-medium">Assign Inspectors</label>
                <div className="border rounded px-3 py-2 max-h-40 overflow-y-auto bg-white">
                  {users.filter(u => u.role.includes('inspector')).map(u => (
                    <label key={u.id} className="flex items-center gap-2 py-1 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={scheduleForm.assignedInspectors.includes(u.id)}
                        onChange={e => {
                          setScheduleForm(f => {
                            const selected = new Set(f.assignedInspectors);
                            if (e.target.checked) {
                              selected.add(u.id);
                            } else {
                              selected.delete(u.id);
                            }
                            return { ...f, assignedInspectors: Array.from(selected) };
                          });
                        }}
                      />
                      <span>{u.name} ({u.role.replace('_', ' ')})</span>
                    </label>
                  ))}
                </div>
              </div>
              {/* Notes */}
              <div>
                <label className="block mb-1 font-medium">Notes</label>
                <textarea
                  value={scheduleForm.notes}
                  onChange={e => setScheduleForm(f => ({ ...f, notes: e.target.value }))}
                  className="w-full border rounded px-3 py-2"
                  rows={2}
                />
              </div>
              <div className="flex justify-end gap-2">
                <button type="button" onClick={() => setShowScheduleModal(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg" disabled={scheduling}>{scheduling ? 'Scheduling...' : 'Create Schedule'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Notes Modal */}
      {showNotesModal && selectedSchedule && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-lg px-8 py-6 text-center max-w-md w-full">
            <div className="text-lg font-semibold mb-2">Inspection Notes</div>
            <div className="text-gray-700 mb-4 whitespace-pre-line text-left">{selectedSchedule.notes || 'No notes provided.'}</div>
            <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700" onClick={() => setShowNotesModal(false)}>Close</button>
          </div>
        </div>
      )}
      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-lg px-8 py-6 text-center">
            <div className="text-green-600 text-3xl mb-2">✔️</div>
            <div className="text-lg font-semibold mb-2">Inspection Submitted!</div>
            <div className="text-gray-600 mb-4">Your inspection has been successfully submitted.</div>
            <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700" onClick={() => setShowSuccessPopup(false)}>OK</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InspectionsManagement; 