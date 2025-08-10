import React, { useEffect, useState, useRef, useCallback } from 'react';
import { getInspectionSchedules, getFacilities, getUsers, supabase } from '../../lib/supabase';
import type { InspectionSchedule, Facility, User } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { getUserPermissions } from '../../utils/permissions';
import { Search, Edit, Trash2, FileText, UserCircle, CheckCircle, PlayCircle, Clock } from 'lucide-react';

const ScheduledInspections: React.FC = () => {
  const { currentUser } = useAuth();
  const [scheduledInspections, setScheduledInspections] = useState<InspectionSchedule[]>([]);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [showNotesModal, setShowNotesModal] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<InspectionSchedule | null>(null);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const popupTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const permissions = currentUser ? getUserPermissions(currentUser) : null;
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date'|'status'|'facility'>('date');

  useEffect(() => {
    loadScheduledInspections();
    loadFacilities();
    loadUsers();
  }, []);

  const loadScheduledInspections = async () => {
    try {
      const data = await getInspectionSchedules();
      setScheduledInspections(data);
    } catch (err) {
      setScheduledInspections([]);
    }
  };
  const loadFacilities = async () => {
    try {
      const data = await getFacilities();
      setFacilities(data);
    } catch (err) {
      setFacilities([]);
    }
  };
  const loadUsers = async () => {
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (err) {
      setUsers([]);
    }
  };

  // Inspector filtering
  const isInspector = currentUser?.role === 'pharmacy_inspector' || currentUser?.role === 'hospital_inspector';
  const visibleScheduledInspections = isInspector
    ? scheduledInspections.filter(s => Array.isArray(s.assigned_inspectors) && typeof currentUser?.id === 'string' && s.assigned_inspectors.includes(currentUser.id))
    : scheduledInspections;

  // Filtering and sorting
  const filteredInspections = visibleScheduledInspections.filter(s => {
    const facility = facilities.find(f => f.id === s.facility_id);
    const inspectorNames = Array.isArray(s.assigned_inspectors)
      ? s.assigned_inspectors.map((id: string) => users.find(u => u.id === id)?.name).join(', ')
      : '';
    return (
      (facility?.name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (s.inspection_type?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (inspectorNames?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );
  });
  const sortedInspections = [...filteredInspections].sort((a, b) => {
    if (sortBy === 'date') {
      return (a.scheduled_date || '').localeCompare(b.scheduled_date || '');
    } else if (sortBy === 'status') {
      return (a.status || '').localeCompare(b.status || '');
    } else if (sortBy === 'facility') {
      const fa = facilities.find(f => f.id === a.facility_id)?.name || '';
      const fb = facilities.find(f => f.id === b.facility_id)?.name || '';
      return fa.localeCompare(fb);
    }
    return 0;
  });

  // Handler to show notes modal
  const handleShowNotes = (schedule: InspectionSchedule) => {
    setSelectedSchedule(schedule);
    setShowNotesModal(true);
  };
  // Handler to update status (for inspector)
  const handleUpdateScheduleStatus = useCallback(async (schedule: InspectionSchedule, newStatus: string) => {
    await supabase.from('inspection_schedules').update({ status: newStatus }).eq('id', schedule.id);
    loadScheduledInspections();
    setShowSuccessPopup(true);
    if (popupTimeoutRef.current) clearTimeout(popupTimeoutRef.current);
    popupTimeoutRef.current = setTimeout(() => setShowSuccessPopup(false), 3000);
  }, [loadScheduledInspections]);
  // Handler to delete schedule (for admin/supervisor)
  const handleDeleteSchedule = useCallback(async (schedule: InspectionSchedule) => {
    await supabase.from('inspection_schedules').delete().eq('id', schedule.id);
    loadScheduledInspections();
  }, [loadScheduledInspections]);

  return (
    <div className="p-2 sm:p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-4 sm:mb-6">Scheduled Inspections</h1>
      {/* Search and Sort Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mb-4">
        <div className="flex items-center bg-white border border-gray-200 rounded-lg px-3 py-2 w-full sm:w-72">
          <Search className="w-4 h-4 text-gray-400 mr-2" />
          <input
            type="text"
            placeholder="Search by facility, type, inspector..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full outline-none text-sm bg-transparent"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-gray-600">Sort by:</label>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as any)}
            className="border border-gray-200 rounded px-2 py-1 text-sm"
          >
            <option value="date">Date</option>
            <option value="status">Status</option>
            <option value="facility">Facility</option>
          </select>
        </div>
      </div>
      {/* Responsive Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedInspections.map((s: InspectionSchedule) => {
          const facility = facilities.find(f => f.id === s.facility_id);
          const isAssigned = Array.isArray(s.assigned_inspectors) && typeof currentUser?.id === 'string' && s.assigned_inspectors.includes(currentUser.id);
          const inspectorObjs = Array.isArray(s.assigned_inspectors)
            ? s.assigned_inspectors.map((id: string) => users.find(u => u.id === id)).filter(Boolean)
            : [];
          // Status badge color
          const statusColor = s.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' :
            s.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
            s.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
          return (
            <div key={s.id} className="bg-white rounded-xl shadow border border-gray-100 flex flex-col p-4 relative">
              {/* Facility and Type */}
              <div className="flex items-center gap-2 mb-2">
                <span className="font-semibold text-lg truncate" title={facility?.name}>{facility ? facility.name : '-'}</span>
                <span className="ml-2 px-2 py-0.5 rounded-full bg-gray-100 text-xs font-medium capitalize">{s.inspection_type}</span>
              </div>
              {/* Date & Time */}
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                <span><FileText className="inline w-4 h-4 mr-1" />{s.scheduled_date}</span>
                <span><Clock className="inline w-4 h-4 mr-1" />{s.scheduled_time}</span>
              </div>
              {/* Inspectors */}
              <div className="flex flex-wrap items-center gap-2 mb-2">
                {inspectorObjs.length > 0 ? inspectorObjs.map((u: any) => (
                  <span key={u.id} className="flex items-center gap-1 bg-gray-50 rounded-full px-2 py-0.5 text-xs">
                    <UserCircle className="w-4 h-4 text-gray-400" />
                    {u.name?.split(' ').map((n: string) => n[0]).join('')}
                    <span className="ml-1 text-gray-700">{u.name?.split(' ')[0]}</span>
                  </span>
                )) : <span className="text-xs text-gray-400">No inspectors</span>}
              </div>
              {/* Status */}
              <div className="mb-2">
                <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${statusColor}`}>{s.status}</span>
              </div>
              {/* Notes Preview */}
              {s.notes && <div className="text-xs text-gray-500 mb-2 line-clamp-2">{s.notes}</div>}
              {/* Actions */}
              <div className="flex flex-wrap gap-2 mt-auto">
                <button className="flex items-center gap-1 px-2 py-1 bg-gray-200 rounded text-xs" title="View Notes" onClick={() => handleShowNotes(s)}>
                  <FileText className="w-4 h-4" /> Notes
                </button>
                {isAssigned && s.status === 'scheduled' && (
                  <button className="flex items-center gap-1 px-2 py-1 bg-blue-600 text-white rounded text-xs" title="Start Inspection" onClick={() => handleUpdateScheduleStatus(s, 'in_progress')}>
                    <PlayCircle className="w-4 h-4" /> Start
                  </button>
                )}
                {isAssigned && s.status === 'in_progress' && (
                  <button className="flex items-center gap-1 px-2 py-1 bg-green-600 text-white rounded text-xs" title="Mark Completed" onClick={() => handleUpdateScheduleStatus(s, 'completed')}>
                    <CheckCircle className="w-4 h-4" /> Complete
                  </button>
                )}
                {permissions?.canAddFacilities && (
                  <>
                    <button className="flex items-center gap-1 px-2 py-1 bg-yellow-500 text-white rounded text-xs" title="Edit" onClick={() => {/* TODO: implement edit modal */}}>
                      <Edit className="w-4 h-4" /> Edit
                    </button>
                    <button className="flex items-center gap-1 px-2 py-1 bg-red-600 text-white rounded text-xs" title="Delete" onClick={() => handleDeleteSchedule(s)}>
                      <Trash2 className="w-4 h-4" /> Delete
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
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
            <div className="text-lg font-semibold mb-2">Status Updated!</div>
            <div className="text-gray-600 mb-4">The inspection status has been updated.</div>
            <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700" onClick={() => setShowSuccessPopup(false)}>OK</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduledInspections; 