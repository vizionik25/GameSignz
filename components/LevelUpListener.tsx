"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Confetti } from "@/components/Confetti"; // We will create this
import { Trophy, X } from "lucide-react";
import { useRouter } from "next/navigation";

import { checkAndSyncRewards } from "@/app/actions/rewards";

export default function LevelUpListener({ 
  userId, 
  companyId 
}: { 
  userId: string, 
  companyId: string 
}) {
  const [newLevel, setNewLevel] = useState<number | null>(null);
  const [reward, setReward] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    const channel = supabase
      .channel("level-up-tracker")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "user_progress",
          filter: `user_id=eq.${userId} AND company_id=eq.${companyId}`
        },
        async (payload) => {
          const oldLevel = payload.old.current_level;
          const currentLevel = payload.new.current_level;

          if (currentLevel > oldLevel) {
            setNewLevel(currentLevel);
            
            // Sync rewards server-side
            const result = await checkAndSyncRewards(companyId);
            if (result?.reward) {
              setReward(result.reward);
            }

            // Refresh server components to show new level in UI immediately
            router.refresh();
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, companyId, router]);

  if (!newLevel) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-300">
      <Confetti />
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center relative border-4 border-yellow-400 transform animate-in zoom-in-95 duration-300">
        <button 
          onClick={() => setNewLevel(null)}
          className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
        >
          <X size={20} />
        </button>

        <div className="w-20 h-20 bg-yellow-100 dark:bg-yellow-900/30 rounded-full flex items-center justify-center mx-auto mb-6 text-yellow-500">
          <Trophy size={40} />
        </div>

        <h2 className="text-3xl font-black text-gray-900 dark:text-gray-100 mb-2">
          LEVEL UP!
        </h2>
        <p className="text-gray-500 dark:text-gray-300 text-lg mb-6">
          You reached <span className="text-blue-600 font-bold">Level {newLevel}</span>
        </p>

        {reward && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/30 rounded-xl border border-green-200 dark:border-green-800">
            <p className="text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-wider mb-1">
              New Reward Unlocked
            </p>
            <p className="font-medium text-gray-900 dark:text-gray-100">
              {reward}
            </p>
          </div>
        )}

        <button
          onClick={() => setNewLevel(null)}
          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-blue-500/20 transition-all hover:scale-105"
        >
          Claim Rewards
        </button>
      </div>
    </div>
  );
}
