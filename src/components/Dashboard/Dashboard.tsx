import React from 'react';
import { useState, useEffect } from 'react';
import { 
  Building2, 
  ClipboardCheck, 
  AlertTriangle, 
  TrendingUp,
  Clock,
  ClipboardList,
  Eye,
  FileText,
  Users
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getFacilities, getInspections } from '../../lib/supabase';
import { getUserPermissions } from '../../utils/permissions';
import { Facility, Inspection } from '../../types';

interface DashboardProps {
  onNavigateToTab?: (tab: string) => void;
  onStartInspection?: (facility?: Facility) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigateToTab, onStartInspection }) => {
  const { currentUser } = useAuth();
  const permissions = currentUser ? getUserPermissions(currentUser) : null;
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Role-specific dashboard content
  const isInspector = currentUser?.role.includes('inspector');
  const isSupervisor = currentUser?.role.includes('supervisor');
  const isAdmin = currentUser?.role === 'super_admin' || currentUser?.role === 'admin';

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setLoading(true);
        setError(null); // Reset error before loading
        
        // Load facilities based on user role
        const filters: any = {};
        
        // Inspectors only see their assigned facilities
        if (currentUser?.role.includes('inspector')) {
          filters.assignedInspectorId = currentUser.id;
        }
        
        // Apply facility type restrictions based on role
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
        console.error('Error loading dashboard data:', error);
        setError('Failed to load dashboard data. Please try again or contact support.');
      } finally {
        setLoading(false);
      }
    };

    if (currentUser && permissions) {
      loadDashboardData();
    }
  }, [currentUser, permissions]);
  
  // Calculate real stats from database
  const totalFacilities = facilities.length;
  const hospitalCount = facilities.filter(f => f.type === 'hospital').length;
  const pharmacyCount = facilities.filter(f => f.type === 'pharmacy').length;
  const clinicCount = facilities.filter(f => f.type === 'clinic').length;
  const avgCompliance = totalFacilities > 0 ? facilities.reduce((sum, f) => sum + (f.complianceScore || 0), 0) / totalFacilities : 0;
  const nonCompliantCount = facilities.filter(f => (f.complianceScore || 0) < 80).length;
  
  // Inspection stats
  const thisMonthInspections = inspections.filter(i => {
    const inspectionDate = new Date(i.startDate);
    const now = new Date();
    return inspectionDate.getMonth() === now.getMonth() && inspectionDate.getFullYear() === now.getFullYear();
  }).length;
  
  const pendingInspections = inspections.filter(i => i.status === 'draft' || i.status === 'submitted').length;

  // Create dynamic description based on user role
  const getStatsDescription = () => {
    if (permissions?.facilityTypes.length === 1) {
      const type = permissions.facilityTypes[0];
      if (type === 'pharmacy') return `${pharmacyCount} Pharmacies`;
      if (type === 'hospital') return `${hospitalCount} Hospitals, ${clinicCount} Clinics`;
      return `${type} facilities only`;
    }
    return `${hospitalCount} Hospitals, ${pharmacyCount} Pharmacies, ${clinicCount} Clinics`;
  };

  // Inspector-specific stats
  const inspectorStats = [
    {
      title: 'My Facilities',
      value: totalFacilities.toString(),
      change: getStatsDescription(),
      icon: Building2,
      color: 'bg-blue-500',
      trend: 'up'
    },
    {
      title: 'Pending Inspections',
      value: pendingInspections.toString(),
      change: 'Awaiting completion',
      icon: ClipboardCheck,
      color: 'bg-yellow-500',
      trend: 'up'
    },
    {
      title: 'Completed This Month',
      value: thisMonthInspections.toString(),
      change: 'This month',
      icon: ClipboardCheck,
      color: 'bg-green-500',
      trend: 'up'
    },
    {
      title: 'Average Score',
      value: `${avgCompliance.toFixed(1)}%`,
      change: 'Compliance rate',
      icon: TrendingUp,
      color: 'bg-green-600',
      trend: 'up'
    }
  ];

  // Admin/Supervisor stats
  const stats = [
    {
      title: 'Total Facilities',
      value: totalFacilities.toString(),
      change: getStatsDescription(),
      icon: Building2,
      color: 'bg-blue-500',
      trend: 'up'
    },
    {
      title: 'Inspections This Month',
      value: thisMonthInspections.toString(),
      change: 'This month',
      icon: ClipboardCheck,
      color: 'bg-green-500',
      trend: 'up'
    },
    {
      title: 'Non-Compliant',
      value: nonCompliantCount.toString(),
      change: 'Below 80% compliance',
      icon: AlertTriangle,
      color: 'bg-red-500',
      trend: 'down'
    },
    {
      title: 'Compliance Rate',
      value: `${avgCompliance.toFixed(1)}%`,
      change: 'Average compliance',
      icon: TrendingUp,
      color: 'bg-green-600',
      trend: 'up'
    }
  ];

  const statsToShow = isInspector ? inspectorStats : stats;

  // Use real inspection data
  const recentInspections = inspections.slice(0, 4).map(inspection => ({
    id: inspection.id,
    facility: inspection.facilityName,
    inspector: inspection.inspectorName,
    date: inspection.startDate.toLocaleDateString(),
    score: Math.round(inspection.compliancePercentage),
    status: inspection.status === 'approved' ? 'completed' : inspection.status
  }));

  // Generate upcoming inspections from facilities without recent inspections
  const upcomingInspections = facilities
    .filter(f => !f.lastInspectionDate || 
      (new Date().getTime() - f.lastInspectionDate.getTime()) > (30 * 24 * 60 * 60 * 1000)) // 30 days
    .slice(0, 4)
    .map((facility, index) => ({
      id: facility.id,
      facility: facility.name,
      scheduledDate: new Date(Date.now() + (index + 1) * 7 * 24 * 60 * 60 * 1000).toLocaleDateString(), // Next weeks
      inspector: currentUser?.name || 'Inspector',
      type: facility.type
    }));

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800';
      case 'submitted': return 'bg-yellow-100 text-yellow-800';
      case 'reviewed': return 'bg-blue-100 text-blue-800';
      case 'in_progress': return 'bg-blue-100 text-blue-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600';
    if (score >= 80) return 'text-yellow-600';
    return 'text-red-600';
  };

  // Quick action handlers
  const handleStartInspection = () => {
    if (onStartInspection) {
      onStartInspection();
    } else if (onNavigateToTab) {
      onNavigateToTab('facilities');
    }
  };

  const handleViewFacilities = () => {
    if (onNavigateToTab) {
      onNavigateToTab('facility-management');
    }
  };

  const handleViewReports = () => {
    if (onNavigateToTab) {
      onNavigateToTab('reports');
    }
  };

  const handleViewIssues = () => {
    if (onNavigateToTab) {
      onNavigateToTab('issues');
    }
  };

  const handleViewUsers = () => {
    if (onNavigateToTab) {
      onNavigateToTab('users');
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen bg-gray-50">
      {loading && (
        <div className="flex flex-col items-center justify-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mb-4"></div>
          <span className="text-lg text-gray-600">Loading dashboard...</span>
        </div>
      )}
      {error && (
        <div className="text-center text-red-600 mb-4 text-lg font-semibold">
          {error}
        </div>
      )}
      
      {/* Welcome Section */}
      <div className="mb-10 flex flex-col items-center justify-center text-center">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">
          Welcome, {currentUser?.name}
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl">
          {isInspector
            ? "Your inspection performance and assignments at a glance."
            : "Monitor, analyze, and act on health facility inspections across Rwanda."
          }
        </p>
      </div>

      {/* Stats Grid - clickable cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
        {statsToShow.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <button
              key={index}
              className={`bg-white rounded-2xl shadow-lg border border-gray-200 p-8 flex flex-col items-center justify-center hover:shadow-xl transition cursor-pointer group w-full focus:outline-none focus:ring-2 focus:ring-green-500`}
              onClick={() => {
                // Navigate or filter based on stat
                if (stat.title.includes('Facility')) handleViewFacilities();
                if (stat.title.includes('Inspection')) handleStartInspection();
                if (stat.title.includes('Compliance')) handleViewReports();
                if (stat.title.includes('Non-Compliant')) handleViewIssues();
              }}
              aria-label={stat.title}
            >
              <div className={`p-4 rounded-full mb-4 ${stat.color} group-hover:scale-110 transition-transform`}>
                <Icon className="w-8 h-8 text-white" />
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
              <p className="text-base text-gray-600 mb-2">{stat.title}</p>
              <div className={`text-sm font-medium flex items-center gap-1 ${stat.trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>{stat.trend === 'up' ? <span>▲</span> : <span>▼</span>}{stat.change}</div>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
        {/* Recent Inspections */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl font-semibold text-gray-900">
              {isInspector ? 'My Recent Inspections' : 'Recent Inspections'}
            </h2>
            <button
              onClick={handleViewReports}
              className="text-green-600 hover:text-green-700 text-base font-medium"
            >
              View All
            </button>
          </div>
          <div className="space-y-6">
            {recentInspections.length > 0 ? recentInspections.map((inspection) => (
              <div key={inspection.id} className="flex items-center justify-between p-6 bg-gray-50 rounded-xl hover:bg-green-50 transition">
                <div className="flex-1">
                  <h3 className="font-medium text-gray-900 text-lg mb-1">{inspection.facility}</h3>
                  {!isInspector && <p className="text-base text-gray-600">{inspection.inspector}</p>}
                  <p className="text-xs text-gray-500">{inspection.date}</p>
                </div>
                <div className="flex items-center space-x-4">
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(inspection.status)}`}>{inspection.status.replace('_', ' ')}</div>
                  <div className={`font-bold text-lg ${getScoreColor(inspection.score)}`}>{inspection.score}%</div>
                </div>
              </div>
            )) : (
              <div className="text-center py-12">
                <ClipboardList className="w-16 h-16 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 text-lg">No inspections yet</p>
              </div>
            )}
          </div>
        </div>
        {/* Upcoming Inspections for Inspectors */}
        {isInspector && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-semibold text-gray-900">My Upcoming Inspections</h2>
            </div>
            <div className="space-y-6">
              {upcomingInspections.length > 0 ? upcomingInspections.map((inspection) => (
                <div key={inspection.id} className="flex items-center p-6 bg-gray-50 rounded-xl hover:bg-blue-50 transition">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Clock className="w-6 h-6 text-blue-600" />
                    </div>
                  </div>
                  <div className="ml-6 flex-1">
                    <h3 className="font-medium text-gray-900 text-lg mb-1">{inspection.facility}</h3>
                    <p className="text-xs text-gray-500">Scheduled: {inspection.scheduledDate}</p>
                  </div>
                  <div className="flex-shrink-0">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${inspection.type === 'hospital' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>{inspection.type}</span>
                  </div>
                </div>
              )) : (
                <div className="text-center py-12">
                  <Clock className="w-16 h-16 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 text-lg">No upcoming inspections</p>
                </div>
              )}
            </div>
          </div>
        )}
        {/* System Overview for Admins/Supervisors */}
        {!isInspector && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-semibold text-gray-900">System Overview</h2>
              <button
                onClick={handleViewReports}
                className="text-green-600 hover:text-green-700 text-base font-medium"
              >
                View All
              </button>
            </div>
            <div className="space-y-6">
              {recentInspections.length > 0 ? recentInspections.map((inspection) => (
                <div key={inspection.id} className="flex items-center justify-between p-6 bg-gray-50 rounded-xl hover:bg-green-50 transition">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 text-lg mb-1">{inspection.facility}</h3>
                    <p className="text-xs text-gray-500">{inspection.date}</p>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(inspection.status)}`}>{inspection.status.replace('_', ' ')}</div>
                    <div className={`font-bold text-lg ${getScoreColor(inspection.score)}`}>{inspection.score}%</div>
                  </div>
                </div>
              )) : (
                <div className="text-center py-12">
                  <ClipboardList className="w-16 h-16 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 text-lg">No inspections yet</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions - visually improved */}
      <div className="mt-10 bg-white rounded-2xl shadow-lg border border-gray-200 p-8">
        <h2 className="text-2xl font-semibold text-gray-900 mb-8">
          {isInspector ? 'Inspector Actions' : 'Quick Actions'}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {permissions?.canConductInspections && (
            <button
              onClick={handleStartInspection}
              className="flex items-center p-6 bg-green-50 rounded-xl hover:bg-green-100 transition-colors cursor-pointer shadow group"
            >
              <ClipboardCheck className="w-10 h-10 text-green-600 mr-4 group-hover:scale-110 transition-transform" />
              <div className="text-left">
                <p className="font-medium text-gray-900 text-lg">Start New Inspection</p>
                <p className="text-base text-gray-600">Begin facility inspection</p>
              </div>
            </button>
          )}
          <button
            onClick={handleViewFacilities}
            className="flex items-center p-6 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors cursor-pointer shadow group"
          >
            <Building2 className="w-10 h-10 text-blue-600 mr-4 group-hover:scale-110 transition-transform" />
            <div className="text-left">
              <p className="font-medium text-gray-900 text-lg">{isInspector ? 'My Facilities' : 'View Facilities'}</p>
              <p className="text-base text-gray-600">{isInspector ? 'View assigned facilities' : 'Manage health facilities'}</p>
            </div>
          </button>
          <button
            onClick={handleViewReports}
            className="flex items-center p-6 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors cursor-pointer shadow group"
          >
            <FileText className="w-10 h-10 text-purple-600 mr-4 group-hover:scale-110 transition-transform" />
            <div className="text-left">
              <p className="font-medium text-gray-900 text-lg">View Reports</p>
              <p className="text-base text-gray-600">Check inspection reports</p>
            </div>
          </button>
          {!isInspector && (
            <button
              onClick={handleViewIssues}
              className="flex items-center p-6 bg-yellow-50 rounded-xl hover:bg-yellow-100 transition-colors cursor-pointer shadow group"
            >
              <AlertTriangle className="w-10 h-10 text-yellow-600 mr-4 group-hover:scale-110 transition-transform" />
              <div className="text-left">
                <p className="font-medium text-gray-900 text-lg">View Issues</p>
                <p className="text-base text-gray-600">Check compliance issues</p>
              </div>
            </button>
          )}
          {permissions?.canViewUsers && (
            <button
              onClick={handleViewUsers}
              className="flex items-center p-6 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors cursor-pointer shadow group"
            >
              <Users className="w-10 h-10 text-indigo-600 mr-4 group-hover:scale-110 transition-transform" />
              <div className="text-left">
                <p className="font-medium text-gray-900 text-lg">User Management</p>
                <p className="text-base text-gray-600">Manage system users</p>
              </div>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;