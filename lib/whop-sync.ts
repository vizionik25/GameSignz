import { getWhopSDK } from "./whop-sdk";
import { supabase } from "./supabase";

/**
 * Ensures a company and user record exists in Supabase.
 * This should be called early in the request lifecycle.
 */
export async function ensureWhopSync(userId: string, companyId: string) {
  // 1. Ensure Company exists
  const { data: company } = await supabase
    .from("companies")
    .select("id")
    .eq("id", companyId)
    .single();

  if (!company) {
    await supabase.from("companies").insert([{ id: companyId }]);
    
    // Seed default levels for new company
    await supabase.from("level_configs").insert([
      { company_id: companyId, level_number: 1, xp_required: 0, reward_name: "Novice" },
      { company_id: companyId, level_number: 2, xp_required: 100, reward_name: "Contributor" },
      { company_id: companyId, level_number: 3, xp_required: 500, reward_name: "Expert" }
    ]);
  }

  // 2. Ensure User exists and is synced
  const { data: user } = await supabase
    .from("users")
    .select("id")
    .eq("id", userId)
    .single();

  if (!user) {
    const sdk = getWhopSDK();
    const whopUser = await sdk.users.retrieve(userId);

    await supabase.from("users").insert([{
      id: userId,
      username: whopUser.username || `user_${userId.slice(0, 5)}`,
      avatar_url: (whopUser as any).profile_picture_url || (whopUser as any).profile_pic_url || (whopUser as any).profile_picture
    }]);

    // Initialize progress
    await supabase.from("user_progress").insert([{
      user_id: userId,
      company_id: companyId,
      current_xp: 0,
      current_level: 1
    }]);
  }
}
