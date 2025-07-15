export type UserRole = 'super_admin' | 'admin' | 'pharmacy_supervisor' | 'hospital_supervisor' | 'pharmacy_inspector' | 'hospital_inspector';

export type FacilityType = 'pharmacy' | 'hospital' | 'clinic';

export interface User {
  id: string;
  email: string;
  phone?: string;
  name: string;
  role: UserRole;
  district?: string;
  isActive: boolean;
  canManageUsers?: boolean;
  canManageFacilities?: boolean;
  facilityTypes?: FacilityType[];
  createdAt: Date;
}

export interface Facility {
  id: string;
  name: string;
  type: FacilityType;
  district: string;
  address: string;
  phone: string;
  email?: string;
  registrationNumber: string;
  assignedInspectorId?: string;
  lastInspectionDate?: Date;
  complianceScore?: number;
  isActive: boolean;
  createdAt: Date;
}

export interface InspectionItem {
  id: string;
  question: string;
  category: string;
  maxScore: number;
  response?: 'yes' | 'no' | 'na';
  actualScore?: number;
  comments?: string;
  images?: string[];
}

export interface Inspection {
  id: string;
  facilityId: string;
  inspectorId: string;
  inspectorName: string;
  facilityName: string;
  district: string;
  startDate: Date;
  completedDate?: Date;
  status: 'draft' | 'submitted' | 'reviewed' | 'approved';
  items: InspectionItem[];
  totalScore: number;
  maxPossibleScore: number;
  compliancePercentage: number;
  signature?: string;
  notes?: string;
  correctiveActions?: CorrectiveAction[];
}

export interface CorrectiveAction {
  id: string;
  inspectionId: string;
  facilityId: string;
  item: string;
  description: string;
  deadline: Date;
  status: 'pending' | 'in_progress' | 'resolved';
  assignedTo?: string;
  resolvedDate?: Date;
  notes?: string;
}

export interface District {
  id: string;
  name: string;
  province: string;
}