import { createClient } from '@supabase/supabase-js';
import { Database } from '../types/database';
import { Inspection } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

console.log('🔗 Connecting to Supabase:', supabaseUrl);
console.log('🔑 Using API Key:', supabaseAnonKey ? 'Present' : 'Missing');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Missing Supabase environment variables');
  throw new Error('Missing Supabase environment variables. Please check your .env file.');
}

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    flowType: 'pkce'
  }
});

// Test connection
(async () => {
  try {
    await supabase.from('users').select('count').single();
    console.log('✅ Supabase connection successful');
  } catch (error) {
    console.log('⚠️ Supabase connection issue:', error);
  }
})();

export const getFacilities = async (filters?: {
  district?: string;
  type?: string;
  assignedInspectorId?: string;
}) => {
  console.log('🏥 Loading facilities with filters:', filters);
  
  try {
    let query = supabase
      .from('facilities')
      .select('*')
      .order('name', { ascending: true });

    if (filters?.district && filters.district !== 'all') {
      query = query.eq('district', filters.district);
      console.log('Applying district filter:', filters.district);
    }
    
    if (filters?.type && filters.type !== 'all') {
      query = query.eq('type', filters.type);
    }
    
    if (filters?.assignedInspectorId) {
      query = query.eq('assigned_inspector_id', filters.assignedInspectorId);
      console.log('Applying assigned inspector filter:', filters.assignedInspectorId);
    }

    const { data, error } = await query;
    
    if (error) {
      console.error('❌ Database query failed:', error.message);
      throw error;
    }
    
    console.log('✅ Loaded facilities from database:', data?.length || 0);
    return data || [];
  } catch (err) {
    console.error('❌ Error loading facilities:', err);
    throw err;
  }
};

export const getInspections = async (filters?: {
  inspectorId?: string;
  facilityId?: string;
  district?: string;
  status?: string;
}) => {
  console.log('📋 Loading inspections with filters:', filters);
  
  try {
    let query = supabase
      .from('inspections')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.inspectorId) {
      query = query.eq('inspector_id', filters.inspectorId);
    }
    
    if (filters?.facilityId) {
      query = query.eq('facility_id', filters.facilityId);
    }
    
    if (filters?.district) {
      query = query.eq('district', filters.district);
    }
    
    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    const { data, error } = await query;
    
    if (error) {
      console.error('❌ Inspections query failed:', error);
      throw error;
    }
    
    console.log('✅ Loaded inspections from database:', data?.length || 0);
    return data || [];
  } catch (err) {
    console.error('❌ Error loading inspections:', err);
    // Return empty array if database fails
    return [];
  }
};

export const createInspection = async (inspectionData: any) => {
  try {
    // Insert the main inspection record
    const { data: inspection, error: inspectionError } = await supabase
      .from('inspections')
      .insert({
        facility_id: inspectionData.facilityId,
        inspector_id: inspectionData.inspectorId,
        inspector_name: inspectionData.inspectorName,
        facility_name: inspectionData.facilityName,
        district: inspectionData.district,
        start_date: new Date().toISOString(),
        completed_date: inspectionData.status === 'submitted' ? new Date().toISOString() : null,
        status: inspectionData.status,
        total_score: inspectionData.totalScore,
        max_possible_score: inspectionData.maxPossibleScore,
        compliance_percentage: inspectionData.compliancePercentage,
        signature: inspectionData.signature,
        notes: inspectionData.notes
      })
      .select()
      .single();

    if (inspectionError) throw inspectionError;

    // Insert inspection items
    if (inspectionData.items && inspectionData.items.length > 0) {
      // Check if this is a pharmacy inspection
      const isPharmacyInspection = inspectionData.items[0] && 
        (inspectionData.items[0].description || inspectionData.items[0].number);

      const itemsToInsert = inspectionData.items.map((item: any) => {
        if (isPharmacyInspection) {
          // For pharmacy inspections, store the data properly
          return {
            inspection_id: inspection.id,
            question: `${item.number}. ${item.description}`,
            category: 'pharmacy_inspection',
            max_score: 1, // Each item is worth 1 point
            response: item.status,
            actual_score: item.status === 'compliant' || item.status === 'not_applicable' ? 1 : 0,
            comments: item.observation || '',
            images: item.images || []
          };
        } else {
          // For regular inspections
          return {
            inspection_id: inspection.id,
            question: item.question,
            category: item.category,
            max_score: item.maxScore,
            response: item.response,
            actual_score: item.actualScore,
            comments: item.comments,
            images: item.images || []
          };
        }
      });

      const { error: itemsError } = await supabase
        .from('inspection_items')
        .insert(itemsToInsert);

      if (itemsError) throw itemsError;
    }

    return inspection;
  } catch (error) {
    console.error('Error creating inspection:', error);
    throw error;
  }
};

export const createFacility = async (facilityData: any) => {
  console.log('🏥 Creating facility:', facilityData.name);
  
  try {
    const { data: facility, error } = await supabase
      .from('facilities')
      .insert({
        name: facilityData.name,
        type: facilityData.type,
        district: facilityData.district,
        address: facilityData.address,
        phone: facilityData.phone,
        email: facilityData.email || null,
        registration_number: facilityData.registrationNumber,
        assigned_inspector_id: facilityData.assignedInspectorId || null,
        is_active: facilityData.isActive !== false,
      })
      .select()
      .single();

    if (error) {
      console.error('❌ Failed to create facility:', error);
      throw error;
    }

    console.log('✅ Facility created:', facility.id);
    return facility;
  } catch (err) {
    console.error('❌ Error creating facility:', err);
    throw err;
  }
};

export const updateFacility = async (facilityId: string, facilityData: any) => {
  console.log('🏥 Updating facility:', facilityId);
  
  try {
    const { data: facility, error } = await supabase
      .from('facilities')
      .update({
        name: facilityData.name,
        type: facilityData.type,
        district: facilityData.district,
        address: facilityData.address,
        phone: facilityData.phone,
        email: facilityData.email || null,
        registration_number: facilityData.registrationNumber,
      })
      .eq('id', facilityId)
      .select()
      .single();

    if (error) {
      console.error('❌ Failed to update facility:', error);
      throw error;
    }

    console.log('✅ Facility updated:', facility.id);
    return facility;
  } catch (err) {
    console.error('❌ Error updating facility:', err);
    throw err;
  }
};

export const deleteFacility = async (facilityId: string) => {
  console.log('🗑️ Deleting facility:', facilityId);
  
  try {
    const { error } = await supabase
      .from('facilities')
      .delete()
      .eq('id', facilityId);

    if (error) {
      console.error('❌ Failed to delete facility:', error);
      throw error;
    }

    console.log('✅ Facility deleted:', facilityId);
  } catch (err) {
    console.error('❌ Error deleting facility:', err);
    throw err;
  }
};

export const createUser = async (userData: any) => {
  console.log('👤 Creating user:', userData.email);
  
  try {
    // Create auth user first
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true
    });

    if (authError) {
      console.error('❌ Failed to create auth user:', authError);
      throw authError;
    }

    // Create user profile
    const { data: user, error: profileError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email: userData.email,
        name: userData.name,
        phone: userData.phone || null,
        role: userData.role,
        district: userData.district || null,
        is_active: true
      })
      .select()
      .single();

    if (profileError) {
      console.error('❌ Failed to create user profile:', profileError);
      throw profileError;
    }

    console.log('✅ User created:', user.id);
    return user;
  } catch (err) {
    console.error('❌ Error creating user:', err);
    throw err;
  }
};
export const getUsers = async () => {
  console.log('👥 Loading users from database');
  
  try {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('❌ Users query failed:', error);
      throw error;
    }
    
    console.log('✅ Loaded users from database:', data?.length || 0);
    return data || [];
  } catch (err) {
    console.error('❌ Error loading users:', err);
    throw err;
  }
};

export const getInspectionById = async (inspectionId: string) => {
  try {
    // First, check if this is a pharmacy inspection by looking at the inspection record
    const { data: inspection, error: inspectionError } = await supabase
      .from('inspections')
      .select('*')
      .eq('id', inspectionId)
      .single();

    if (inspectionError) throw inspectionError;

    // Check if there are pharmacy inspection items for this inspection
    const { data: pharmacyItems, error: pharmacyError } = await supabase
      .from('pharmacy_inspection_items')
      .select('*')
      .eq('inspection_id', inspectionId);

    // If pharmacy items exist, use the pharmacy inspection function
    if (pharmacyItems && pharmacyItems.length > 0) {
      return await getPharmacyInspectionById(inspectionId);
    }

    // Otherwise, use the regular inspection function
    const { data: items, error: itemsError } = await supabase
      .from('inspection_items')
      .select('*')
      .eq('inspection_id', inspectionId);

    if (itemsError) throw itemsError;

    // Transform the data to match our Inspection interface
    const transformedInspection: Inspection = {
      id: inspection.id,
      facilityId: inspection.facility_id,
      inspectorId: inspection.inspector_id,
      inspectorName: inspection.inspector_name,
      facilityName: inspection.facility_name,
      district: inspection.district,
      startDate: new Date(inspection.start_date),
      completedDate: inspection.completed_date ? new Date(inspection.completed_date) : undefined,
      status: inspection.status,
      items: items.map(item => ({
        id: item.id,
        question: item.question,
        category: item.category,
        maxScore: item.max_score,
        response: item.response,
        actualScore: item.actual_score,
        comments: item.comments,
        images: item.images as string[] || []
      })),
      totalScore: inspection.total_score,
      maxPossibleScore: inspection.max_possible_score,
      compliancePercentage: inspection.compliance_percentage,
      signature: inspection.signature,
      notes: inspection.notes
    };

    return transformedInspection;
  } catch (error) {
    console.error('Error fetching inspection by ID:', error);
    throw error;
  }
};

export const createPharmacyInspection = async (inspectionData: any) => {
  try {
    // Insert the main inspection record
    const { data: inspection, error: inspectionError } = await supabase
      .from('inspections')
      .insert({
        facility_id: inspectionData.facilityId,
        inspector_id: inspectionData.inspectorId,
        inspector_name: inspectionData.inspectorName,
        facility_name: inspectionData.facilityName,
        district: inspectionData.district,
        start_date: new Date().toISOString(),
        completed_date: inspectionData.status === 'submitted' ? new Date().toISOString() : null,
        status: inspectionData.status,
        total_score: inspectionData.totalScore,
        max_possible_score: inspectionData.maxPossibleScore,
        compliance_percentage: inspectionData.compliancePercentage,
        signature: inspectionData.signature,
        notes: inspectionData.notes
      })
      .select()
      .single();

    if (inspectionError) throw inspectionError;

    // Insert pharmacy inspection items
    if (inspectionData.items && inspectionData.items.length > 0) {
      const pharmacyItemsToInsert = inspectionData.items.map((item: any) => ({
        inspection_id: inspection.id,
        number: item.number,
        description: item.description,
        targeted_points: item.targetedPoints,
        status: item.status,
        observation: item.observation || ''
      }));

      const { error: itemsError } = await supabase
        .from('pharmacy_inspection_items')
        .insert(pharmacyItemsToInsert);

      if (itemsError) throw itemsError;
    }

    return inspection;
  } catch (error) {
    console.error('Error creating pharmacy inspection:', error);
    throw error;
  }
};

export const getPharmacyInspectionById = async (inspectionId: string) => {
  try {
    // Get the main inspection data
    const { data: inspection, error: inspectionError } = await supabase
      .from('inspections')
      .select('*')
      .eq('id', inspectionId)
      .single();

    if (inspectionError) throw inspectionError;

    // Get the pharmacy inspection items
    const { data: pharmacyItems, error: itemsError } = await supabase
      .from('pharmacy_inspection_items')
      .select('*')
      .eq('inspection_id', inspectionId)
      .order('number', { ascending: true });

    if (itemsError) throw itemsError;

    // Transform the data to match our Inspection interface
    const transformedInspection: Inspection = {
      id: inspection.id,
      facilityId: inspection.facility_id,
      inspectorId: inspection.inspector_id,
      inspectorName: inspection.inspector_name,
      facilityName: inspection.facility_name,
      district: inspection.district,
      startDate: new Date(inspection.start_date),
      completedDate: inspection.completed_date ? new Date(inspection.completed_date) : undefined,
      status: inspection.status,
      items: pharmacyItems.map(item => ({
        id: item.id,
        question: `${item.number}. ${item.description}`,
        category: 'pharmacy_inspection',
        maxScore: 1,
        response: item.status,
        actualScore: item.status === 'compliant' || item.status === 'not_applicable' ? 1 : 0,
        comments: item.observation,
        images: [],
        // Pharmacy-specific fields
        number: item.number,
        description: item.description,
        targetedPoints: item.targeted_points as string[],
        status: item.status as 'compliant' | 'non_compliant' | 'not_applicable',
        observation: item.observation
      })),
      totalScore: inspection.total_score,
      maxPossibleScore: inspection.max_possible_score,
      compliancePercentage: inspection.compliance_percentage,
      signature: inspection.signature,
      notes: inspection.notes
    };

    return transformedInspection;
  } catch (error) {
    console.error('Error fetching pharmacy inspection by ID:', error);
    throw error;
  }
};

export const uploadInspectionImage = async (file: File, inspectionId: string, itemId: string): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const filePath = `${inspectionId}/${itemId}-${Date.now()}.${fileExt}`;
  const { error } = await supabase.storage.from('inspection-evidence').upload(filePath, file, { upsert: true });
  if (error) throw error;
  const { data } = supabase.storage.from('inspection-evidence').getPublicUrl(filePath);
  return data.publicUrl;
};