import React, { useState } from 'react';
import { useEffect } from 'react';
import { 
  FileText, 
  Calendar, 
  Building2, 
  User,
  Search,
  Eye,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Clock
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getInspections } from '../../lib/supabase';
import { Inspection } from '../../types';
import ReportsPDF from './ReportsPDF';
import InspectionDetailView from './InspectionDetailView';
import { RWANDA_DISTRICTS } from '../../data/facilities';

const ReportsList: React.FC = () => {
  const { currentUser } = useAuth();
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [error, setError] = useState<string | null>(null);
  const [selectedInspection, setSelectedInspection] = useState<string | null>(null);

  useEffect(() => {
    const loadInspections = async () => {
      try {
        setLoading(true);
        setError(null); // Reset error before loading
        
        // Apply role-based filters
        const filters: any = {};
        
        // Inspectors only see their own inspections
        if (currentUser?.role.includes('inspector')) {
          filters.inspectorId = currentUser.id;
        }
        
        // Apply district filter if user is restricted to specific district
        if (currentUser?.district && currentUser.role !== 'super_admin') {
          filters.district = currentUser.district;
        }
        
        const data = await getInspections(filters);
        
        // Map database data to Inspection interface
        const mappedInspections: Inspection[] = data.map(inspection => ({
          id: inspection.id,
          facilityId: inspection.facility_id,
          facilityName: inspection.facility_name,
          district: inspection.district,
          inspectorId: inspection.inspector_id,
          inspectorName: inspection.inspector_name,
          startDate: new Date(inspection.start_date),
          completedDate: inspection.completed_date ? new Date(inspection.completed_date) : undefined,
          status: inspection.status,
          items: [], // Will be populated separately if needed
          totalScore: inspection.total_score,
          maxPossibleScore: inspection.max_possible_score,
          compliancePercentage: inspection.compliance_percentage,
          signature: inspection.signature || undefined,
          notes: inspection.notes || undefined,
        }));
        
        setInspections(mappedInspections);
      } catch (error) {
        console.error('Error loading inspections:', error);
        setError('Failed to load inspection reports. Please try again or contact support.');
        setInspections([]);
      } finally {
        setLoading(false);
      }
    };

    if (currentUser) {
      loadInspections();
    }
  }, [currentUser]);

  const filteredInspections = inspections.filter(inspection => {
    const matchesSearch = inspection.facilityName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         inspection.inspectorName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDistrict = selectedDistrict === 'all' || inspection.district.toLowerCase() === selectedDistrict.toLowerCase();
    const matchesStatus = selectedStatus === 'all' || inspection.status === selectedStatus;
    
    return matchesSearch && matchesDistrict && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-800';
      case 'submitted': return 'bg-blue-100 text-blue-800';
      case 'reviewed': return 'bg-yellow-100 text-yellow-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getComplianceColor = (percentage: number) => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getComplianceIcon = (percentage: number) => {
    if (percentage >= 90) return <TrendingUp className="w-4 h-4 text-green-600" />;
    if (percentage >= 80) return <TrendingUp className="w-4 h-4 text-yellow-600" />;
    return <TrendingDown className="w-4 h-4 text-red-600" />;
  };

  const stats = {
    totalInspections: filteredInspections.length,
    averageCompliance: filteredInspections.length > 0 
      ? filteredInspections.reduce((sum, insp) => sum + insp.compliancePercentage, 0) / filteredInspections.length 
      : 0,
    nonCompliantCount: filteredInspections.filter(insp => insp.compliancePercentage < 80).length,
    pendingReview: filteredInspections.filter(insp => insp.status === 'submitted').length,
  };

  const handleViewDetails = (inspectionId: string) => {
    setSelectedInspection(inspectionId);
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
    <div className="p-6 max-w-7xl mx-auto">
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <span className="ml-2 text-gray-600">Loading reports...</span>
        </div>
      )}
      {error && (
        <div className="text-center text-red-600 mb-4">
          {error}
        </div>
      )}

      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Inspection Reports</h1>
        <p className="text-gray-600">
          View and analyze inspection reports across health facilities
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Inspections</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalInspections}</p>
            </div>
            <FileText className="w-8 h-8 text-blue-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Average Compliance</p>
              <p className="text-2xl font-bold text-green-600">{stats.averageCompliance.toFixed(1)}%</p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Non-Compliant</p>
              <p className="text-2xl font-bold text-red-600">{stats.nonCompliantCount}</p>
            </div>
            <AlertTriangle className="w-8 h-8 text-red-500" />
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending Review</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.pendingReview}</p>
            </div>
            <Clock className="w-8 h-8 text-yellow-500" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* Search */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search facilities or inspectors..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>

          {/* District Filter */}
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

          {/* Status Filter */}
          <div className="lg:w-48">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="all">All Status</option>
              <option value="draft">Draft</option>
              <option value="submitted">Submitted</option>
              <option value="reviewed">Reviewed</option>
              <option value="approved">Approved</option>
            </select>
          </div>
        </div>
      </div>

      {/* Reports Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Mobile Cards View */}
        <div className="block lg:hidden">
          {filteredInspections.map((inspection) => (
            <div key={inspection.id} className="border-b border-gray-200 p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-gray-900 truncate">{inspection.facilityName}</h3>
                  <p className="text-sm text-gray-600">{inspection.district}</p>
                  <p className="text-sm text-gray-500">{inspection.inspectorName}</p>
                </div>
                <div className="flex items-center ml-4">
                  {getComplianceIcon(inspection.compliancePercentage)}
                  <span className={`ml-1 font-medium ${getComplianceColor(inspection.compliancePercentage)}`}>
                    {inspection.compliancePercentage.toFixed(1)}%
                  </span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(inspection.status)}`}>
                    {inspection.status}
                  </span>
                  <span className="text-sm text-gray-500">
                    {inspection.startDate.toLocaleDateString()}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button className="text-blue-600 hover:text-blue-800 text-sm">
                    View
                  </button>
                  <ReportsPDF inspection={inspection} />
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Desktop Table View */}
        <div className="overflow-x-auto">
          <table className="w-full hidden lg:table">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Facility
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Inspector
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Compliance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredInspections.map((inspection) => (
                <tr key={inspection.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Building2 className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {inspection.facilityName}
                        </div>
                        <div className="text-sm text-gray-500 capitalize">
                          {inspection.district}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <User className="w-5 h-5 text-gray-400 mr-3" />
                      <div className="text-sm text-gray-900">
                        {inspection.inspectorName}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                      <div className="text-sm text-gray-900">
                        {new Date(inspection.startDate).toLocaleDateString()}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(inspection.status)}`}>
                      {inspection.status.charAt(0).toUpperCase() + inspection.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      {getComplianceIcon(inspection.compliancePercentage)}
                      <span className={`ml-2 font-medium ${getComplianceColor(inspection.compliancePercentage)}`}>
                        {inspection.compliancePercentage.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewDetails(inspection.id)}
                        className="flex items-center px-3 py-1 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm"
                      >
                        <Eye className="w-4 h-4 mr-1" />
                        View Details
                      </button>
                      <button
                        onClick={() => handleViewDetails(inspection.id)}
                        className="flex items-center px-3 py-1 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm"
                      >
                        <FileText className="w-4 h-4 mr-1" />
                        PDF
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Empty State */}
      {!loading && filteredInspections.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No reports found</h3>
          <p className="text-gray-600">
            {inspections.length === 0 
              ? 'No inspection reports have been created yet.'
              : 'Try adjusting your search or filter criteria'
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default ReportsList;