import { User, FacilityType } from '../types';

export interface Permission {
  canViewDashboard: boolean;
  canViewFacilities: boolean;
  canAddFacilities: boolean;
  canEditFacilities: boolean;
  canDeleteFacilities: boolean;
  canViewInspections: boolean;
  canConductInspections: boolean;
  canViewReports: boolean;
  canViewUsers: boolean;
  canAddUsers: boolean;
  canEditUsers: boolean;
  canDeleteUsers: boolean;
  canSuspendUsers: boolean;
  facilityTypes: FacilityType[];
  canViewAllDistricts: boolean;
}

export const getUserPermissions = (user: User): Permission => {
  const basePermissions: Permission = {
    canViewDashboard: true,
    canViewFacilities: true, // Most users need to see facilities
    canAddFacilities: false,
    canEditFacilities: false,
    canDeleteFacilities: false,
    canViewInspections: true, // Most users need to see inspections
    canConductInspections: false,
    canViewReports: false,
    canViewUsers: false,
    canAddUsers: false,
    canEditUsers: false,
    canDeleteUsers: false,
    canSuspendUsers: false,
    facilityTypes: [],
    canViewAllDistricts: false,
  };

  switch (user.role) {
    case 'super_admin':
      return {
        ...basePermissions,
        canViewFacilities: true,
        canAddFacilities: true,
        canEditFacilities: true,
        canDeleteFacilities: true,
        canViewInspections: true,
        canConductInspections: true,
        canViewReports: true,
        canViewUsers: true,
        canAddUsers: true,
        canEditUsers: true,
        canDeleteUsers: true,
        canSuspendUsers: true,
        facilityTypes: ['pharmacy', 'hospital', 'clinic'],
        canViewAllDistricts: true,
      };

    case 'admin':
      return {
        ...basePermissions,
        canViewFacilities: true,
        canAddFacilities: true,
        canEditFacilities: true,
        canDeleteFacilities: false, // Can't delete
        canViewInspections: true,
        canConductInspections: true,
        canViewReports: true,
        canViewUsers: true,
        canAddUsers: false, // Can't manage users
        canEditUsers: false,
        canDeleteUsers: false,
        canSuspendUsers: false,
        facilityTypes: ['pharmacy', 'hospital', 'clinic'],
        canViewAllDistricts: true,
      };

    case 'pharmacy_supervisor':
      return {
        ...basePermissions,
        canViewFacilities: true,
        canAddFacilities: true,
        canEditFacilities: true,
        canDeleteFacilities: false,
        canViewInspections: true,
        canConductInspections: true,
        canViewReports: true,
        canViewUsers: true, // Can view but not manage
        facilityTypes: ['pharmacy'],
        canViewAllDistricts: true,
      };

    case 'hospital_supervisor':
      return {
        ...basePermissions,
        canViewFacilities: true,
        canAddFacilities: true,
        canEditFacilities: true,
        canDeleteFacilities: false,
        canViewInspections: true,
        canConductInspections: true,
        canViewReports: true,
        canViewUsers: true, // Can view but not manage
        facilityTypes: ['hospital', 'clinic'],
        canViewAllDistricts: true,
      };

    case 'pharmacy_inspector':
      return {
        ...basePermissions,
        canConductInspections: true,
        canViewReports: false, // Inspectors don't need reports
        canViewUsers: false,
        facilityTypes: ['pharmacy'],
        canViewAllDistricts: false, // Only assigned district
      };

    case 'hospital_inspector':
      return {
        ...basePermissions,
        canConductInspections: true,
        canViewReports: false, // Inspectors don't need reports
        canViewUsers: false,
        facilityTypes: ['hospital', 'clinic'],
        canViewAllDistricts: false, // Only assigned district
      };

    default:
      return basePermissions;
  }
};

export const canAccessFacilityType = (user: User, facilityType: FacilityType): boolean => {
  const permissions = getUserPermissions(user);
  console.log(`Checking access for ${user.role} to ${facilityType}:`, permissions.facilityTypes);
  return permissions.facilityTypes.includes(facilityType);
};

export const canManageUsers = (user: User): boolean => {
  const permissions = getUserPermissions(user);
  return permissions.canAddUsers || permissions.canEditUsers || permissions.canDeleteUsers;
};

export const canManageFacilities = (user: User): boolean => {
  const permissions = getUserPermissions(user);
  return permissions.canAddFacilities || permissions.canEditFacilities;
};

export const getRoleDisplayName = (role: UserRole): string => {
  switch (role) {
    case 'super_admin': return 'Super Administrator';
    case 'admin': return 'General Administrator';
    case 'pharmacy_supervisor': return 'Pharmacy Supervisor';
    case 'hospital_supervisor': return 'Hospital Supervisor';
    case 'pharmacy_inspector': return 'Pharmacy Inspector';
    case 'hospital_inspector': return 'Hospital Inspector';
    default: return role;
  }
};

export const getRoleColor = (role: UserRole): string => {
  switch (role) {
    case 'super_admin': return 'bg-purple-100 text-purple-800';
    case 'admin': return 'bg-blue-100 text-blue-800';
    case 'pharmacy_supervisor': return 'bg-green-100 text-green-800';
    case 'hospital_supervisor': return 'bg-red-100 text-red-800';
    case 'pharmacy_inspector': return 'bg-green-50 text-green-700';
    case 'hospital_inspector': return 'bg-red-50 text-red-700';
    default: return 'bg-gray-100 text-gray-800';
  }
};