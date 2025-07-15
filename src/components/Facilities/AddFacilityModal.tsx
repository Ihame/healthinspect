import React, { useState } from 'react';
import { X, Building2, Plus, Save } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getUserPermissions } from '../../utils/permissions';
import { RWANDA_DISTRICTS } from '../../data/facilities';

interface AddFacilityModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (facilityData: any) => void;
}

const AddFacilityModal: React.FC<AddFacilityModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const { currentUser } = useAuth();
  const permissions = currentUser ? getUserPermissions(currentUser) : null;
  
  const [formData, setFormData] = useState({
    name: '',
    type: permissions?.facilityTypes[0] || 'pharmacy',
    district: '',
    address: '',
    phone: '',
    email: '',
    registrationNumber: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!isOpen) return null;

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.name.trim()) newErrors.name = 'Facility name is required';
    if (!formData.district) newErrors.district = 'District is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
    if (!formData.registrationNumber.trim()) newErrors.registrationNumber = 'Registration number is required';
    
    // Phone validation
    if (formData.phone && !formData.phone.match(/^\+250\d{9}$/)) {
      newErrors.phone = 'Phone must be in format +250XXXXXXXXX';
    }
    
    // Email validation (optional)
    if (formData.email && !formData.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      newErrors.email = 'Invalid email format';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    
    try {
      // Generate registration number if not provided
      const regNumber = formData.registrationNumber || 
        `${formData.type.toUpperCase()}-${formData.district.toUpperCase()}-${Date.now()}`;
      
      const facilityData = {
        ...formData,
        registrationNumber: regNumber,
        assignedInspectorId: currentUser?.id,
        isActive: true,
      };
      
      await onSubmit(facilityData);
      
      // Reset form
      setFormData({
        name: '',
        type: permissions?.facilityTypes[0] || 'pharmacy',
        district: '',
        address: '',
        phone: '',
        email: '',
        registrationNumber: '',
      });
      
      onClose();
    } catch (error) {
      console.error('Error adding facility:', error);
      setErrors({ submit: 'Failed to add facility. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
              <Building2 className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Add New Facility</h2>
              <p className="text-sm text-gray-600">
                Add a new {permissions?.facilityTypes.join(' or ')} facility to the system
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {errors.submit && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {errors.submit}
            </div>
          )}

          {/* Facility Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Facility Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Enter facility name"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                errors.name ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
          </div>

          {/* Facility Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Facility Type *
            </label>
            <select
              value={formData.type}
              onChange={(e) => handleInputChange('type', e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              {permissions?.facilityTypes.map(type => (
                <option key={type} value={type}>
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>

          {/* District */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              District *
            </label>
            <select
              value={formData.district}
              onChange={(e) => handleInputChange('district', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                errors.district ? 'border-red-300' : 'border-gray-300'
              }`}
            >
              <option value="">Select District</option>
              {RWANDA_DISTRICTS.map(district => (
                <option key={district} value={district.toLowerCase()}>
                  {district}
                </option>
              ))}
            </select>
            {errors.district && <p className="mt-1 text-sm text-red-600">{errors.district}</p>}
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Address *
            </label>
            <textarea
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              placeholder="Enter full address"
              rows={3}
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none ${
                errors.address ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.address && <p className="mt-1 text-sm text-red-600">{errors.address}</p>}
          </div>

          {/* Phone and Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number *
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="+250788123456"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.phone ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.phone && <p className="mt-1 text-sm text-red-600">{errors.phone}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="facility@example.rw"
                className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                }`}
              />
              {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
            </div>
          </div>

          {/* Registration Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Registration Number *
            </label>
            <input
              type="text"
              value={formData.registrationNumber}
              onChange={(e) => handleInputChange('registrationNumber', e.target.value)}
              placeholder="e.g., PHARM-GASABO-001"
              className={`w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                errors.registrationNumber ? 'border-red-300' : 'border-gray-300'
              }`}
            />
            {errors.registrationNumber && <p className="mt-1 text-sm text-red-600">{errors.registrationNumber}</p>}
            <p className="mt-1 text-sm text-gray-500">
              Format: {formData.type.toUpperCase()}-{formData.district.toUpperCase()}-XXX
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Adding...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Facility
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddFacilityModal;