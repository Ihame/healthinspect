import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Building2, 
  MapPin, 
  Phone, 
  Calendar,
  TrendingDown,
  Eye,
  FileText,
  Filter,
  Search
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getFacilities, getInspections } from '../../lib/supabase';
import { Facility, Inspection } from '../../types';
import { getUserPermissions } from '../../utils/permissions';
import { RWANDA_DISTRICTS } from '../../data/facilities';
import InspectionDetailView from './InspectionDetailView';

const ComplianceIssues: React.FC = () => {
  const { currentUser } = useAuth();
  const permissions = currentUser ? getUserPermissions(currentUser) : null;
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [selectedInspection, setSelectedInspection] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Load facilities
        const filters: any = {};
        if (currentUser?.role.includes('inspector')) {
          filters.assignedInspectorId = currentUser.id;
        }
        if (permissions?.facilityTypes.length === 1) {
          filters.type = permissions.facilityTypes[0];
        }
        
        const facilitiesData = await getFacilities(filters);
        const mappedFacilities: Facility[] = facilitiesData.map(f => ({
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
        
        // Load inspections
        const inspectionFilters: any = {};
        if (currentUser?.role.includes('inspector')) {
          inspectionFilters.inspectorId = currentUser.id;
        }
        
        const inspectionsData = await getInspections(inspectionFilters);
        const mappedInspections: Inspection[] = inspectionsData.map(i => ({
          id: i.id,
          facilityId: i.facility_id,
          facilityName: i.facility_name,
          district: i.district,
          inspectorId: i.inspector_id,
          inspectorName: i.inspector_name,
          startDate: new Date(i.start_date),
          completedDate: i.completed_date ? new Date(i.completed_date) : undefined,
          status: i.status,
          items: [],
          totalScore: i.total_score,
          maxPossibleScore: i.max_possible_score,
          compliancePercentage: i.compliance_percentage,
          signature: i.signature || undefined,
          notes: i.notes || undefined,
        }));
        
        setInspections(mappedInspections);
      } catch (error) {
        console.error('Error loading compliance data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentUser, permissions]);

  const handleViewDetails = (inspectionId: string) => {
    setSelectedInspection(inspectionId);
  };

  const handleBackFromDetails = () => {
    setSelectedInspection(null);
  };

  // Filter facilities with compliance issues
  const nonCompliantFacilities = facilities.filter(f => (f.complianceScore || 0) < 80);
  const lowComplianceFacilities = facilities.filter(f => (f.complianceScore || 0) >= 80 && (f.complianceScore || 0) < 90);
  
  // Filter inspections with low scores
  const lowScoreInspections = inspections.filter(i => i.compliancePercentage < 80);

  const filteredNonCompliant = nonCompliantFacilities.filter(facility => {
    const matchesSearch = facility.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         facility.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = selectedType === 'all' || facility.type === selectedType;
    const matchesDistrict = selectedDistrict === 'all' || facility.district === selectedDistrict;
    
    return matchesSearch && matchesType && matchesDistrict;
  });

  const getComplianceColor = (score?: number) => {
    if (!score) return 'text-gray-400';
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getComplianceBadge = (score?: number) => {
    if (!score) return { text: 'No Data', color: 'bg-gray-100 text-gray-800' };
    if (score >= 90) return { text: 'Compliant', color: 'bg-green-100 text-green-800' };
    if (score >= 80) return { text: 'Warning', color: 'bg-yellow-100 text-yellow-800' };
    return { text: 'Critical', color: 'bg-red-100 text-red-800' };
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
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Compliance Issues</h1>
        <p className="text-lg text-gray-600">
          Monitor facilities with compliance issues and low inspection scores
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Critical Issues</p>
              <p className="text-2xl font-bold text-red-600">{nonCompliantFacilities.length}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Warning Level</p>
              <p className="text-2xl font-bold text-yellow-600">{lowComplianceFacilities.length}</p>
            </div>
            <TrendingDown className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Low Score Inspections</p>
              <p className="text-2xl font-bold text-orange-600">{lowScoreInspections.length}</p>
            </div>
            <FileText className="w-8 h-8 text-orange-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Facilities</p>
              <p className="text-2xl font-bold text-gray-900">{facilities.length}</p>
            </div>
            <Building2 className="w-8 h-8 text-gray-500" />
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

      {/* Issues List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            Facilities with Compliance Issues ({filteredNonCompliant.length})
          </h2>
        </div>
        
        <div className="divide-y divide-gray-200">
          {filteredNonCompliant.length > 0 ? filteredNonCompliant.map((facility) => {
            const badge = getComplianceBadge(facility.complianceScore);
            const facilityInspections = inspections.filter(i => i.facilityId === facility.id);
            const latestInspection = facilityInspections[0]; // Most recent
            
            return (
              <div key={facility.id} className="p-6 hover:bg-gray-50 transition-colors">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center mb-2">
                      <Building2 className="w-5 h-5 text-gray-400 mr-3" />
                      <h3 className="text-lg font-medium text-gray-900">{facility.name}</h3>
                      <span className={`ml-3 px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
                        {badge.text}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span className="capitalize">{facility.district}</span>
                      </div>
                      <div className="flex items-center">
                        <Phone className="w-4 h-4 mr-2" />
                        <span>{facility.phone}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>
                          {facility.lastInspectionDate 
                            ? `Last: ${facility.lastInspectionDate.toLocaleDateString()}`
                            : 'No inspections'
                          }
                        </span>
                      </div>
                    </div>
                    
                    {latestInspection && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Latest Inspection Score:</span>
                          <span className={`font-semibold ${getComplianceColor(latestInspection.compliancePercentage)}`}>
                            {latestInspection.compliancePercentage.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    {latestInspection && (
                      <button
                        onClick={() => handleViewDetails(latestInspection.id)}
                        className="flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View Report
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          }) : (
            <div className="p-12 text-center">
              <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No compliance issues found</h3>
              <p className="text-gray-600">
                All facilities are meeting compliance standards or no data available.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComplianceIssues; 