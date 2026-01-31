import { headers } from "next/headers";
import { getWhopSDK } from "@/lib/whop-sdk";
import { leaderboardService } from "@/lib/leaderboard-service";
import Link from "next/link";
import { ArrowLeft, Trophy, Medal, Star } from "lucide-react";
import { redirect } from "next/navigation";

export default async function LeaderboardPage({
  searchParams,
}: {
  searchParams: Promise<{ companyId?: string }>;
}) {
  const sdk = getWhopSDK();
  const headersList = await headers();
  const { userId } = await sdk.verifyUserToken(headersList);

  if (!userId) redirect("/");

  const { companyId: queryCompanyId } = await searchParams;
  const targetCompanyId = queryCompanyId || "demo_company";

  // Verify membership
  const memberships = await sdk.authorizedUsers.list({ 
    user_id: userId,
    company_id: targetCompanyId
  });

  const companyId = memberships.data.length > 0 ? targetCompanyId : "demo_company";

  const leaderboard = await leaderboardService.getLeaderboard(companyId);

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Quest Board
        </Link>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="bg-gradient-to-br from-blue-600 to-purple-700 p-8 text-white text-center">
            <Trophy size={48} className="mx-auto mb-4 text-yellow-400" />
            <h1 className="text-3xl font-bold">Community Leaderboard</h1>
            <p className="text-blue-100 mt-2">The top questors in your community</p>
          </div>

          <div className="p-6">
            <div className="space-y-3">
              {leaderboard.map((entry, index) => {
                const isTopThree = index < 3;
                const colors = [
                  "text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20",
                  "text-gray-400 bg-gray-50 dark:bg-gray-900/20",
                  "text-orange-500 bg-orange-50 dark:bg-orange-900/20"
                ];

                return (
                  <div 
                    key={entry.user_id}
                    className={`flex items-center justify-between p-4 rounded-xl border ${
                      entry.user_id === userId 
                        ? "border-blue-500 bg-blue-50/30 dark:bg-blue-900/10" 
                        : "border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-900/30"
                    } transition-colors`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                        isTopThree ? colors[index] : "text-gray-500 bg-gray-100 dark:bg-gray-800"
                      }`}>
                        {index === 0 ? <Medal size={16} /> : index + 1}
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center text-white">
                          {entry.users?.username?.[0]?.toUpperCase() || "?"}
                        </div>
                        <div>
                          <p className="font-bold text-gray-900 dark:text-gray-100">
                            @{entry.users?.username} {entry.user_id === userId && <span className="text-xs text-blue-500 ml-1 font-normal">(You)</span>}
                          </p>
                          <p className="text-xs text-gray-500">Level {entry.current_level}</p>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="font-black text-lg text-blue-600 dark:text-blue-400">{entry.current_xp}</p>
                      <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Total XP</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {leaderboard.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Star size={32} className="mx-auto mb-2 opacity-20" />
                <p>The journey is just beginning. Post an assignment to start earning XP!</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
