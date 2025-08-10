import React from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Auth/Login';
import Dashboard from './components/Dashboard/Dashboard';
import FacilityManagement from './components/Facilities/FacilityManagement';
import ReportsList from './components/Reports/ReportsList';
import UserManagement from './components/Users/UserManagement';
import Sidebar from './components/Layout/Sidebar';
import Header from './components/Layout/Header';
import AddFacilityModal from './components/Facilities/AddFacilityModal';
import { getUserPermissions, canAccessFacilityType } from './utils/permissions';
import { createFacility } from './lib/supabase';
import { Facility } from './types';
import ComplianceIssues from './components/Reports/ComplianceIssues';
import { BrowserRouter as Router, Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import InspectionsManagement from './components/Inspections/InspectionsManagement';
import ScheduledInspections from './components/Inspections/ScheduledInspections';
import ChangePasswordModal from './components/Auth/ChangePasswordModal';

const AppContent: React.FC = () => {
  const { currentUser, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [selectedFacility, setSelectedFacility] = React.useState<Facility | null>(null);
  const [showAddFacilityModal, setShowAddFacilityModal] = React.useState(false);
  const [facilitiesRefreshKey, setFacilitiesRefreshKey] = React.useState(0);
  const [showChangePassword, setShowChangePassword] = React.useState(false);
  const permissions = currentUser ? getUserPermissions(currentUser) : null;
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return <Login />;
  }

  const handleStartInspection = (facility: Facility) => {
    if (currentUser && !canAccessFacilityType(currentUser, facility.type)) {
      alert(`You don't have permission to inspect ${facility.type} facilities.`);
      return;
    }
    setSelectedFacility(facility);
    navigate('/inspection-form');
  };

  const handleAddFacility = () => {
    setShowAddFacilityModal(true);
  };

  const handleAddFacilitySubmit = async (facilityData: any) => {
    try {
      await createFacility(facilityData);
      alert('Facility added successfully!');
      setShowAddFacilityModal(false);
      setFacilitiesRefreshKey(k => k + 1);
    } catch (error) {
      console.error('Error adding facility:', error);
      alert('Failed to add facility. Please try again.');
    }
  };

  const handleInspectionSubmit = (inspectionData: any) => {
    console.log('Inspection submitted:', inspectionData);
    setSelectedFacility(null);
    navigate('/dashboard');
  };

  const handleBackFromInspection = () => {
    setSelectedFacility(null);
    navigate('/facilities');
  };

  const getPageTitle = () => {
    const path = window.location.pathname;
    if (path.startsWith('/dashboard')) return 'Dashboard';
    if (path.startsWith('/facilities')) return 'Health Facilities';
    if (path.startsWith('/inspections')) return 'Inspections';
    if (path.startsWith('/reports')) return 'Reports';
    if (path.startsWith('/corrective-actions')) return 'Corrective Actions';
    if (path.startsWith('/users')) return 'User Management';
    if (path.startsWith('/facility-management')) return 'Facility Management';
    if (path.startsWith('/settings')) return 'Settings';
    if (path.startsWith('/inspection-form')) return 'Inspection Form';
    if (path.startsWith('/issues')) return 'Compliance Issues';
    return 'HealthInspect Rwanda';
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onTabChange={(tab) => navigate(tab)}
        activeTab={window.location.pathname.replace('/', '') || 'dashboard'}
      />
      <div className="flex-1 flex flex-col lg:ml-64 min-w-0">
        <Header
          onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
          title={getPageTitle()}
          onChangePassword={() => setShowChangePassword(true)}
        />
        <main className="flex-1 overflow-auto bg-gray-50">
          <Routes>
            <Route path="/" element={<Navigate to="/dashboard" />} />
            <Route path="/dashboard" element={<Dashboard onNavigateToTab={tab => navigate(tab)} onStartInspection={() => navigate('/facilities')} />} />
            <Route path="/facility-management" element={<FacilityManagement onStartInspection={handleStartInspection} />} />
            <Route path="/reports" element={<ReportsList />} />
            <Route path="/users" element={<UserManagement />} />
            <Route path="/issues" element={<ComplianceIssues />} />
            <Route path="/inspections" element={<InspectionsManagement />} />
            <Route path="/scheduled-inspections" element={<ScheduledInspections />} />
          </Routes>
        </main>
        <AddFacilityModal
          isOpen={showAddFacilityModal}
          onClose={() => setShowAddFacilityModal(false)}
          onSubmit={handleAddFacilitySubmit}
        />
        <ChangePasswordModal
          isOpen={showChangePassword}
          onClose={() => setShowChangePassword(false)}
        />
      </div>
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;