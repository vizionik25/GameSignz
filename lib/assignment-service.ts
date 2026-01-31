import { supabase, getAdminSupabase } from "./supabase";

export interface Comment {
  id: string;
  content: string;
  user_id: string;
  created_at: string;
  users?: {
    username: string;
    avatar_url: string;
  };
}

// ... existing interfaces ...
export interface Assignment {
  id: string;
  title: string;
  description: string;
  user_id: string;
  company_id: string;
  vote_count: number;
  comment_count: number;
  tags: string[];
  file_url?: string;
  file_name?: string;
  created_at: string;
  users?: {
    username: string;
    avatar_url: string;
  };
}

// ... LevelConfig, UserProgress ...

export const assignmentService = {
  // ... existing methods ...
  async getAssignments(companyId: string): Promise<Assignment[]> {
    const { data, error } = await supabase
      .from("assignments")
      .select(`
        *,
        users (
          username,
          avatar_url
        )
      `)
      .eq("company_id", companyId)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getAssignmentById(id: string): Promise<Assignment | null> {
    const { data, error } = await supabase
      .from("assignments")
      .select(`
        *,
        users (
          username,
          avatar_url
        )
      `)
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  },

  async createAssignment(assignment: {
    title: string;
    description: string;
    tags: string[];
    user_id: string;
    company_id: string;
    file_url?: string;
    file_name?: string;
  }) {
    const { data, error } = await supabase
      .from("assignments")
      .insert([assignment])
      .select()
      .single();

    if (error) throw error;
    return data;
  },
  
  async vote(assignmentId: string, userId: string, voteType: 1 | -1) {
    const { error } = await supabase.rpc("handle_vote", {
      p_assignment_id: assignmentId,
      p_user_id: userId,
      p_vote_type: voteType,
    });

    if (error) throw error;
  },

  async getLevelConfigs(companyId: string) {
    const { data, error } = await supabase
      .from("level_configs")
      .select("*")
      .eq("company_id", companyId)
      .order("level_number", { ascending: true });
    if (error) throw error;
    return data || [];
  },

  async saveLevelConfigs(companyId: string, configs: any[]) {
     const { error: deleteError } = await supabase
      .from("level_configs")
      .delete()
      .eq("company_id", companyId);
    if (deleteError) throw deleteError;

    const { error: insertError } = await supabase
      .from("level_configs")
      .insert(configs.map(c => ({ ...c, company_id: companyId })));
    if (insertError) throw insertError;
  },

  async getUserProgress(userId: string, companyId: string) {
    const { data, error } = await supabase
      .from("user_progress")
      .select("current_xp, current_level")
      .eq("user_id", userId)
      .eq("company_id", companyId)
      .single();
    if (error && error.code !== "PGRST116") throw error;
    return data;
  },

  // --- NEW METHODS ---

  async uploadFile(file: File, path: string): Promise<string> {
    const adminClient = getAdminSupabase(); // Use admin client to bypass upload RLS for simplicity
    
    const { data, error } = await adminClient
      .storage
      .from('assignments')
      .upload(path, file, {
        upsert: false,
        contentType: file.type
      });

    if (error) throw error;
    
    // Get public URL
    const { data: { publicUrl } } = adminClient
      .storage
      .from('assignments')
      .getPublicUrl(path);
      
    return publicUrl;
  },

  async getComments(assignmentId: string): Promise<Comment[]> {
    const { data, error } = await supabase
      .from("comments")
      .select(`
        *,
        users (
          username,
          avatar_url
        )
      `)
      .eq("assignment_id", assignmentId)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async getCompanyStats(companyId: string) {
    const { count: totalAssignments } = await supabase
      .from("assignments")
      .select("*", { count: "exact", head: true })
      .eq("company_id", companyId);

    const { count: totalUsers } = await supabase
      .from("user_progress")
      .select("*", { count: "exact", head: true })
      .eq("company_id", companyId);

    return {
      totalAssignments: totalAssignments || 0,
      totalUsers: totalUsers || 0,
    };
  },
};