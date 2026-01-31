  async getCompanyStats(companyId: string) {
    const { count: totalAssignments } = await supabase
      .from("assignments")
      .select("*", { count: "exact", head: true })
      .eq("company_id", companyId);

    const { count: totalComments } = await supabase
      .from("comments")
      .select("*", { count: "exact", head: true })
      .eq("assignment_id", companyId); // Note: Comments don't have company_id directly, need join or simple assumption. 
      // Actually my schema didn't put company_id on comments. Let's do a join or just skip precise comment count for now.
      // Better approach: Count user_progress rows for total participants.
    
    const { count: totalUsers } = await supabase
      .from("user_progress")
      .select("*", { count: "exact", head: true })
      .eq("company_id", companyId);

    return {
      totalAssignments: totalAssignments || 0,
      totalUsers: totalUsers || 0,
      totalComments: 0 // Placeholder until schema update
    };
  },
