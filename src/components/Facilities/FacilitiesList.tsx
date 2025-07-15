import React, { useState } from 'react';
import { useEffect } from 'react';
import { 
  Building2, 
  Plus, 
  Search, 
  Filter, 
  MapPin,
  Phone,
  Calendar,
  ChevronRight,
  ClipboardList
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getFacilities, getInspections } from '../../lib/supabase';
import { Facility } from '../../types';
import { getUserPermissions, canAccessFacilityType } from '../../utils/permissions';
import { RWANDA_DISTRICTS } from '../../data/facilities';
import InspectionDetailView from '../Reports/InspectionDetailView';

interface FacilitiesListProps {
  onStartInspection: (facility: Facility) => void;
  onAddFacility?: () => void;
  refreshKey?: number;
}

const FacilitiesList: React.FC<FacilitiesListProps> = ({ onStartInspection, onAddFacility, refreshKey }) => {
  const { currentUser } = useAuth();
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const permissions = currentUser ? getUserPermissions(currentUser) : null;
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [selectedInspection, setSelectedInspection] = useState<string | null>(null);

  useEffect(() => {
    const loadFacilities = async () => {
      try {
        setLoading(true);
        
        // Apply role-based filters
        const filters: any = {};
        
        // Inspectors only see their assigned facilities
        if (currentUser?.role.includes('inspector')) {
          filters.assignedInspectorId = currentUser.id;
        }
        
        // Apply facility type restrictions based on role
        if (permissions?.facilityTypes.length === 1) {
          filters.type = permissions.facilityTypes[0];
        }
        
        const data = await getFacilities(filters);
        
        const mappedFacilities: Facility[] = data.map(f => ({
          id: f.id,
          name: f.name,
          type: f.type as 'pharmacy' | 'hospital' | 'clinic',
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
        console.error('Error loading facilities:', error);
        setFacilities([]);
      } finally {
        setLoading(false);
      }
    };

    loadFacilities();
  }, [currentUser, permissions, refreshKey]);

  const filteredFacilities = facilities.filter(facility => {
    const matchesSearch = facility.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         facility.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || facility.type === selectedType;
    const matchesDistrict = selectedDistrict === 'all' || facility.district === selectedDistrict;
    
    return matchesSearch && matchesType && matchesDistrict;
  });

  // Role-based title and description
  const getPageTitle = () => {
    if (currentUser?.role.includes('inspector')) {
      return 'My Assigned Facilities';
    }
    return 'Health Facilities';
  };
  
  const getPageDescription = () => {
    if (currentUser?.role.includes('inspector')) {
      const facilityType = permissions?.facilityTypes[0];
      return `View and inspect your assigned ${facilityType} facilities`;
    }
    if (permissions?.facilityTypes.length === 1) {
      return `Manage ${permissions.facilityTypes[0]} facilities`;
    }
    return 'Manage and inspect registered health facilities across Rwanda';
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'hospital': return 'bg-blue-100 text-blue-800';
      case 'pharmacy': return 'bg-green-100 text-green-800';
      case 'clinic': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getComplianceColor = (score?: number) => {
    if (!score) return 'text-gray-400';
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const handleViewDetails = async (facility: Facility) => {
    try {
      // Get the latest inspection for this facility
      const inspections = await getInspections({ facilityId: facility.id });
      
      if (inspections && inspections.length > 0) {
        // Get the most recent inspection
        const latestInspection = inspections[0]; // Already sorted by created_at desc
        setSelectedInspection(latestInspection.id);
      } else {
        alert('No inspections found for this facility yet.');
      }
    } catch (error) {
      console.error('Error loading facility inspections:', error);
      alert('Error loading facility details. Please try again.');
    }
  };

  const handleBackFromDetails = () => {
    setSelectedInspection(null);
  };

  // If viewing details, show the detail view
  if (selectedInspection) {
    return (
      <InspectionDetailView
        inspectionId={selectedInspection}
        onBack={handleBackFromDetails}
      />
    );
  }

  return (
    <div className="p-4 lg:p-6 max-w-7xl mx-auto">
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <span className="ml-2 text-gray-600">Loading facilities...</span>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-6">
        <div className="mb-4 lg:mb-0">
          <h1 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-2">{getPageTitle()}</h1>
          <p className="text-gray-600 text-sm lg:text-base">
            {getPageDescription()}
          </p>
        </div>
        
        {permissions?.canAddFacilities && !currentUser?.role.includes('inspector') && (
          <button 
            onClick={onAddFacility}
            className="w-full lg:w-auto bg-green-600 text-white px-4 py-3 rounded-lg flex items-center justify-center hover:bg-green-700 transition-colors font-medium"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Facility
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="md:col-span-2 lg:col-span-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search facilities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
              />
            </div>
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
            >
              <option value="all">All Types</option>
              {permissions?.facilityTypes.includes('hospital') && (
                <option value="hospital">Hospitals</option>
              )}
              {permissions?.facilityTypes.includes('pharmacy') && (
                <option value="pharmacy">Pharmacies</option>
              )}
              {permissions?.facilityTypes.includes('clinic') && (
                <option value="clinic">Clinics</option>
              )}
            </select>
          </div>

          {/* District Filter */}
          <div>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-sm"
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

      {/* Results Count */}
      <div className="mb-4">
        <p className="text-sm text-gray-600">
          {currentUser?.role.includes('inspector') 
            ? `You have ${filteredFacilities.length} assigned facilities`
            : `Showing ${filteredFacilities.length} facilities`
          }
        </p>
      </div>

      {/* Facilities Grid - Responsive Design */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-4 lg:gap-6">
        {filteredFacilities.map((facility) => (
          <div key={facility.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 lg:p-6 hover:shadow-md transition-shadow h-full flex flex-col">
            {/* Header */}
            <div className="flex items-start justify-between mb-4 flex-shrink-0">
              <div className="flex items-start flex-1 min-w-0">
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-green-100 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Building2 className="w-5 h-5 lg:w-6 lg:h-6 text-green-600" />
                </div>
                <div className="ml-3 flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-sm lg:text-base leading-tight mb-1 truncate" title={facility.name}>
                    {facility.name}
                  </h3>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(facility.type)}`}>
                    {facility.type}
                  </span>
                </div>
              </div>
              
              {facility.complianceScore && (
                <div className={`text-right flex-shrink-0 ml-2 ${getComplianceColor(facility.complianceScore)}`}>
                  <div className="text-sm lg:text-lg font-bold">{facility.complianceScore}%</div>
                  <div className="text-xs text-gray-500">Compliance</div>
                </div>
              )}
            </div>

            {/* Details */}
            <div className="space-y-2 mb-4 flex-1">
              <div className="flex items-start text-xs lg:text-sm text-gray-600">
                <MapPin className="w-3 h-3 lg:w-4 lg:h-4 mr-2 mt-0.5 flex-shrink-0" />
                <span className="flex-1 line-clamp-2" title={facility.address}>{facility.address}</span>
              </div>
              <div className="flex items-center text-xs lg:text-sm text-gray-600">
                <Phone className="w-3 h-3 lg:w-4 lg:h-4 mr-2 flex-shrink-0" />
                <span className="truncate" title={facility.phone}>{facility.phone}</span>
              </div>
              {facility.lastInspectionDate && (
                <div className="flex items-start text-xs lg:text-sm text-gray-600">
                  <Calendar className="w-3 h-3 lg:w-4 lg:h-4 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="flex-1">Last: {facility.lastInspectionDate.toLocaleDateString()}</span>
                </div>
              )}
            </div>

            {/* Registration Number */}
            <div className="mb-4 flex-shrink-0">
              <span className="text-xs text-gray-500 break-all">Reg: {facility.registrationNumber}</span>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 mt-auto flex-shrink-0">
              {permissions?.canConductInspections && (
                <button
                  onClick={() => onStartInspection(facility)}
                  className="w-full bg-green-600 text-white px-3 py-2 rounded-lg flex items-center justify-center hover:bg-green-700 transition-colors text-xs lg:text-sm font-medium"
                >
                  <ClipboardList className="w-3 h-3 lg:w-4 lg:h-4 mr-1" />
                  Start Inspection
                </button>
              )}
              
              {!currentUser?.role.includes('inspector') && (
                <button
                  onClick={() => handleViewDetails(facility)}
                  className="w-full bg-gray-100 text-gray-700 px-3 py-2 rounded-lg flex items-center justify-center hover:bg-gray-200 transition-colors text-xs lg:text-sm"
                >
                  View Details
                  <ChevronRight className="w-3 h-3 lg:w-4 lg:h-4 ml-1" />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {!loading && filteredFacilities.length === 0 && (
        <div className="text-center py-12 px-4">
          <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {currentUser?.role.includes('inspector') 
              ? 'No facilities assigned'
              : 'No facilities found'
            }
          </h3>
          <p className="text-gray-600">
            {currentUser?.role.includes('inspector')
              ? 'Contact your supervisor to get facilities assigned to you'
              : 'Try adjusting your search or filter criteria'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default FacilitiesList;