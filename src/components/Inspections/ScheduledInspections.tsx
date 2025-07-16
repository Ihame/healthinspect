import React, { useEffect, useState, useRef, useCallback } from 'react';
import { getInspectionSchedules, getFacilities, getUsers, supabase } from '../../lib/supabase';
import type { InspectionSchedule, Facility, User } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { getUserPermissions } from '../../utils/permissions';

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
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Scheduled Inspections</h1>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
        <table className="w-full text-sm border">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2">Facility</th>
              <th className="p-2">Type</th>
              <th className="p-2">Date</th>
              <th className="p-2">Time</th>
              <th className="p-2">Inspectors</th>
              <th className="p-2">Status</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {visibleScheduledInspections.map((s: InspectionSchedule) => {
              const facility = facilities.find(f => f.id === s.facility_id);
              const isAssigned = Array.isArray(s.assigned_inspectors) && typeof currentUser?.id === 'string' && s.assigned_inspectors.includes(currentUser.id);
              return (
                <tr key={s.id}>
                  <td className="p-2">{facility ? facility.name : '-'}</td>
                  <td className="p-2">{s.inspection_type}</td>
                  <td className="p-2">{s.scheduled_date}</td>
                  <td className="p-2">{s.scheduled_time}</td>
                  <td className="p-2">{Array.isArray(s.assigned_inspectors) ? s.assigned_inspectors.map((id: string) => users.find(u => u.id === id)?.name).join(', ') : ''}</td>
                  <td className="p-2">{s.status}</td>
                  <td className="p-2 flex flex-wrap gap-2">
                    <button className="px-2 py-1 bg-gray-200 rounded text-xs" onClick={() => handleShowNotes(s)}>Notes</button>
                    {isAssigned && s.status === 'scheduled' && (
                      <button className="px-2 py-1 bg-blue-600 text-white rounded text-xs" onClick={() => handleUpdateScheduleStatus(s, 'in_progress')}>Start</button>
                    )}
                    {isAssigned && s.status === 'in_progress' && (
                      <button className="px-2 py-1 bg-green-600 text-white rounded text-xs" onClick={() => handleUpdateScheduleStatus(s, 'completed')}>Mark Completed</button>
                    )}
                    {permissions?.canAddFacilities && (
                      <>
                        <button className="px-2 py-1 bg-yellow-500 text-white rounded text-xs" onClick={() => {/* TODO: implement edit modal */}}>Edit</button>
                        <button className="px-2 py-1 bg-red-600 text-white rounded text-xs" onClick={() => handleDeleteSchedule(s)}>Delete</button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
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