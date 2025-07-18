import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  MapPin,
  Phone,
  Calendar,
  X,
  Save
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getUserPermissions } from '../../utils/permissions';
import { Facility, FacilityType } from '../../types';
import { supabase } from '../../lib/supabase';
import { RWANDA_DISTRICTS } from '../../data/facilities';

interface FacilityManagementProps {
  onStartInspection?: (facility: Facility) => void;
}

const FacilityManagement: React.FC<FacilityManagementProps> = ({ onStartInspection }) => {
  const { currentUser } = useAuth();
  const permissions = currentUser ? getUserPermissions(currentUser) : null;
  
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingFacility, setEditingFacility] = useState<Facility | null>(null);

  // Form state
  const [facilityForm, setFacilityForm] = useState({
    name: '',
    type: 'pharmacy' as FacilityType,
    district: '',
    address: '',
    phone: '',
    email: '',
    registrationNumber: ''
  });

  useEffect(() => {
    loadFacilities();
  }, []);

  const loadFacilities = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('facilities')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;

      const mappedFacilities: Facility[] = data.map(f => ({
        id: f.id,
        name: f.name,
        type: f.type as FacilityType,
        district: f.district,
        address: f.address,
        phone: f.phone,
        email: f.email || undefined,
        registrationNumber: f.registration_number,
        assignedInspectorId: f.assigned_inspector_id || undefined,
        lastInspectionDate: f.last_inspection_date ? new Date(f.last_inspection_date) : undefined,
        complianceScore: f.compliance_score || undefined,
        isActive: f.is_active,
        createdAt: new Date(f.created_at),
      }));

      setFacilities(mappedFacilities);
    } catch (error) {
      // Comment out any throw statements and log the error for debugging
      console.error('Error in loadFacilities:', error);
      // throw error; // <-- REMOVE or COMMENT OUT this line
    } finally {
      setLoading(false);
    }
  };

  const handleAddFacility = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('facilities')
        .insert({
          name: facilityForm.name,
          type: facilityForm.type,
          district: facilityForm.district,
          address: facilityForm.address,
          phone: facilityForm.phone,
          email: facilityForm.email || null,
          registration_number: facilityForm.registrationNumber,
          is_active: true
        });

      if (error) throw error;

      alert('Facility added successfully!');
      setShowAddModal(false);
      resetForm();
      loadFacilities();
    } catch (error: any) {
      console.error('Error adding facility:', error);
      alert(`Error adding facility: ${error.message}`);
    }
  };

  const handleEditFacility = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingFacility) return;

    try {
      const { error } = await supabase
        .from('facilities')
        .update({
          name: facilityForm.name,
          type: facilityForm.type,
          district: facilityForm.district,
          address: facilityForm.address,
          phone: facilityForm.phone,
          email: facilityForm.email || null,
          registration_number: facilityForm.registrationNumber
        })
        .eq('id', editingFacility.id);

      if (error) throw error;

      alert('Facility updated successfully!');
      setEditingFacility(null);
      resetForm();
      loadFacilities();
    } catch (error: any) {
      console.error('Error updating facility:', error);
      alert(`Error updating facility: ${error.message}`);
    }
  };

  const handleDeleteFacility = async (facilityId: string) => {
    if (!confirm('Are you sure you want to delete this facility? This action cannot be undone.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('facilities')
        .delete()
        .eq('id', facilityId);

      if (error) throw error;

      setFacilities(prev => prev.filter(f => f.id !== facilityId));
      alert('Facility deleted successfully');
    } catch (error) {
      console.error('Error deleting facility:', error);
      alert('Error deleting facility');
    }
  };

  const resetForm = () => {
    setFacilityForm({
      name: '',
      type: 'pharmacy',
      district: '',
      address: '',
      phone: '',
      email: '',
      registrationNumber: ''
    });
  };

  const openEditModal = (facility: Facility) => {
    setEditingFacility(facility);
    setFacilityForm({
      name: facility.name,
      type: facility.type,
      district: facility.district,
      address: facility.address,
      phone: facility.phone,
      email: facility.email || '',
      registrationNumber: facility.registrationNumber
    });
  };

  const filteredFacilities = facilities.filter(facility => {
    const matchesSearch = facility.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         facility.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || facility.type === selectedType;
    const matchesDistrict = selectedDistrict === 'all' || facility.district.toLowerCase() === selectedDistrict;
    
    return matchesSearch && matchesType && matchesDistrict;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'hospital': return 'bg-blue-100 text-blue-800';
      case 'pharmacy': return 'bg-green-100 text-green-800';
      case 'clinic': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!(permissions?.canAddFacilities || permissions?.canEditFacilities)) {
    return (
      <div className="p-6 text-center">
        <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h3>
        <p className="text-gray-600">You don't have permission to manage facilities.</p>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Facility Management</h1>
          <p className="text-gray-600">
            Manage health facilities across Rwanda
          </p>
        </div>
        
        <button 
          onClick={() => setShowAddModal(true)}
          className="mt-4 lg:mt-0 bg-green-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-green-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Facility
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Facilities</p>
              <p className="text-2xl font-bold text-gray-900">{facilities.length}</p>
            </div>
            <Building2 className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pharmacies</p>
              <p className="text-2xl font-bold text-green-600">
                {facilities.filter(f => f.type === 'pharmacy').length}
              </p>
            </div>
            <Building2 className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Hospitals</p>
              <p className="text-2xl font-bold text-blue-600">
                {facilities.filter(f => f.type === 'hospital').length}
              </p>
            </div>
            <Building2 className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Clinics</p>
              <p className="text-2xl font-bold text-purple-600">
                {facilities.filter(f => f.type === 'clinic').length}
              </p>
            </div>
            <Building2 className="w-8 h-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search facilities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>

          <div className="lg:w-48">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="all">All Types</option>
              <option value="hospital">Hospitals</option>
              <option value="pharmacy">Pharmacies</option>
              <option value="clinic">Clinics</option>
            </select>
          </div>

          <div className="lg:w-48">
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="all">All Districts</option>
              {RWANDA_DISTRICTS.map(district => (
                <option key={district} value={district.toLowerCase()}>
                  {district}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Facilities Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Facility
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  District
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Registration
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredFacilities.map((facility) => (
                <tr key={facility.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Building2 className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{facility.name}</div>
                        <div className="text-sm text-gray-500">{facility.address}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${getTypeColor(facility.type)}`}>
                      {facility.type}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <MapPin className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900 capitalize">{facility.district}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{facility.phone}</div>
                    {facility.email && (
                      <div className="text-sm text-gray-500">{facility.email}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {facility.registrationNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    {permissions?.canConductInspections && onStartInspection && (
                      <button
                        onClick={() => onStartInspection(facility)}
                        className="text-green-600 hover:text-green-800"
                        title="Start Inspection"
                      >
                        <span className="inline-flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M9 17v-2a4 4 0 0 1 4-4h4"/><path d="M17 13l4 4-4 4"/></svg>
                          Inspect
                        </span>
                      </button>
                    )}
                    <button 
                      onClick={() => openEditModal(facility)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Edit Facility"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => handleDeleteFacility(facility.id)}
                      className="text-red-600 hover:text-red-800"
                      title="Delete Facility"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Facility Modal */}
      {(showAddModal || editingFacility) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingFacility ? 'Edit Facility' : 'Add New Facility'}
              </h3>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setEditingFacility(null);
                  resetForm();
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>
            
            <form onSubmit={editingFacility ? handleEditFacility : handleAddFacility} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Facility Name *
                </label>
                <input
                  type="text"
                  value={facilityForm.name}
                  onChange={(e) => setFacilityForm(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Type *
                  </label>
                  <select
                    value={facilityForm.type}
                    onChange={(e) => setFacilityForm(prev => ({ ...prev, type: e.target.value as FacilityType }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    required
                  >
                    <option value="pharmacy">Pharmacy</option>
                    <option value="hospital">Hospital</option>
                    <option value="clinic">Clinic</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    District *
                  </label>
                  <select
                    value={facilityForm.district}
                    onChange={(e) => setFacilityForm(prev => ({ ...prev, district: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    required
                  >
                    <option value="">Select District</option>
                    {RWANDA_DISTRICTS.map(district => (
                      <option key={district} value={district.toLowerCase()}>
                        {district}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address *
                </label>
                <textarea
                  value={facilityForm.address}
                  onChange={(e) => setFacilityForm(prev => ({ ...prev, address: e.target.value }))}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={facilityForm.phone}
                    onChange={(e) => setFacilityForm(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="+250788123456"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={facilityForm.email}
                    onChange={(e) => setFacilityForm(prev => ({ ...prev, email: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Registration Number *
                </label>
                <input
                  type="text"
                  value={facilityForm.registrationNumber}
                  onChange={(e) => setFacilityForm(prev => ({ ...prev, registrationNumber: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  required
                />
              </div>
              
              <div className="flex justify-end space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddModal(false);
                    setEditingFacility(null);
                    resetForm();
                  }}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {editingFacility ? 'Update' : 'Create'} Facility
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredFacilities.length === 0 && (
        <div className="text-center py-12">
          <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No facilities found</h3>
          <p className="text-gray-600">
            Try adjusting your search or filter criteria
          </p>
        </div>
      )}
    </div>
  );
};

export default FacilityManagement;