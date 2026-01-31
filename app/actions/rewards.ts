"use server";

import { headers } from "next/headers";
import { getWhopSDK } from "@/lib/whop-sdk";
import { assignmentService } from "@/lib/assignment-service";

export async function checkAndSyncRewards() {
  const sdk = getWhopSDK();
  const headersList = await headers();
  const { userId } = await sdk.verifyUserToken(headersList);

  if (!userId) return null;

  const memberships = await sdk.authorizedUsers.list({ user_id: userId });
  const companyId = memberships.data[0]?.company_id;
  
  if (!companyId) return null;

  // 1. Get current level and config
  const [progress, levels] = await Promise.all([
    assignmentService.getUserProgress(userId, companyId),
    assignmentService.getLevelConfigs(companyId)
  ]);

  if (!progress) return null;

  // 2. Find config for current level
  const currentLevelConfig = levels.find(l => l.level_number === progress.current_level);

  if (currentLevelConfig && currentLevelConfig.reward_name) {
    // 3. Sync Logic (Placeholder)
    // Here we would call Whop SDK to grant roles or access passes.
    // Example: await sdk.members.update({ user_id: userId, role: "expert" });
    
    // For now, we just log it. This is where you'd hook into your specific reward logic.
    console.log(`[REWARD SYNC] User ${userId} reached Level ${progress.current_level}. Reward: ${currentLevelConfig.reward_name}`);
    
    return {
      success: true,
      reward: currentLevelConfig.reward_name
    };
  }

  return null;
}
