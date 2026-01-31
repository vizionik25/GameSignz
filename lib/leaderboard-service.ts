import { supabase } from "./supabase";

export interface LeaderboardEntry {
  user_id: string;
  current_xp: number;
  current_level: number;
  users: {
    username: string;
    avatar_url: string;
  };
}

export const leaderboardService = {
  async getLeaderboard(companyId: string, limit = 10): Promise<LeaderboardEntry[]> {
    const { data, error } = await supabase
      .from("user_progress")
      .select(`
        user_id,
        current_xp,
        current_level,
        users (
          username,
          avatar_url
        )
      `)
      .eq("company_id", companyId)
      .order("current_xp", { ascending: false })
      .limit(limit);

    if (error) throw error;
    return data as unknown as LeaderboardEntry[];
  }
};
