import { headers } from "next/headers";
import { getWhopSDK } from "@/lib/whop-sdk";
import { ensureWhopSync } from "@/lib/whop-sync";
import { assignmentService } from "@/lib/assignment-service";
import Link from "next/link";
import { MessageSquare, Trophy } from "lucide-react";
import VoteButtons from "@/components/VoteButtons";
import { redirect } from "next/navigation";

import LevelUpListener from "@/components/LevelUpListener";

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ companyId?: string }>;
}) {
  const sdk = getWhopSDK();
  const headersList = await headers();
  const { userId } = await sdk.verifyUserToken(headersList);

  if (!userId) {
    // For demo purposes, maybe we don't redirect if it's a public view?
    // But verifyUserToken suggests auth is required.
    // If we are outside whop, headers might be missing.
    // Let's redirect to a login page or just show unauthorized if strict.
    // But for this assignment app, let's assume strict auth.
    // redirect("/login"); // or similar
    // For now, let's just return logic handling "no user".
    // But the rest of code expects userId.
    // If we are developing locally, maybe we mock it?
    // But whop-sdk checks headers.
    return (
        <div className="p-8 text-center">
            <h1 className="text-2xl font-bold">Authentication Required</h1>
            <p>Please open this app within Whop.</p>
        </div>
    );
  }

  const { companyId: queryCompanyId } = await searchParams;
  const targetCompanyId = queryCompanyId || "demo_company";
  
  // Verify membership
  const memberships = await sdk.authorizedUsers.list({ 
    user_id: userId,
    company_id: targetCompanyId
  });

  const companyId = memberships.data.length > 0 ? targetCompanyId : "demo_company";

  // Sync user to our DB
  await ensureWhopSync(userId, companyId);

  const [assignments, progress] = await Promise.all([
    assignmentService.getAssignments(companyId),
    assignmentService.getUserProgress(userId, companyId)
  ]);

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-4 md:p-8">
      <LevelUpListener userId={userId} companyId={companyId} />
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Quest Board
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Join the community, share your work, and level up!
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
            <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-lg text-blue-600">
              <Trophy size={24} />
            </div>
            <div>
              <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">Your Progress</p>
              <div className="flex items-center gap-2">
                <span className="font-bold">Level {progress?.current_level || 1}</span>
                <span className="text-sm text-gray-400">•</span>
                <span className="text-sm font-medium text-blue-500">{progress?.current_xp || 0} XP</span>
              </div>
            </div>
            <Link
              href="/leaderboard"
              className="px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 rounded-lg text-sm font-medium transition-colors hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              Leaderboard
            </Link>
            <Link
              href="/submit"
              className="ml-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Post
            </Link>
          </div>
        </div>

        <div className="space-y-4">
          {assignments.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl p-12 text-center border border-gray-100 dark:border-gray-700">
              <p className="text-gray-500">No assignments posted yet. Be the first!</p>
              <Link href="/submit" className="text-blue-500 font-medium mt-2 inline-block">
                Create a submission
              </Link>
            </div>
          ) : (
            assignments.map((assignment) => (
              <div
                key={assignment.id}
                className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700 hover:border-blue-500/30 transition-all"
              >
                <div className="flex gap-4">
                  {/* Vote Column */}
                  <div className="min-w-[3rem]">
                    <VoteButtons 
                      assignmentId={assignment.id} 
                      initialVotes={assignment.vote_count} 
                    />
                  </div>

                  {/* Content Column */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-5 h-5 rounded-full bg-gray-200" />
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                        Posted by <span className="text-blue-500">@{assignment.users?.username}</span>
                      </span>
                      <span className="text-xs text-gray-400">• {new Date(assignment.created_at).toLocaleDateString()}</span>
                    </div>
                    
                    <Link href={`/assignment/${assignment.id}`} className="group">
                      <h2 className="text-xl font-bold mb-2 group-hover:text-blue-500 transition-colors">
                        {assignment.title}
                      </h2>
                    </Link>
                    
                    <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-2">
                      {assignment.description}
                    </p>

                    <div className="flex items-center justify-between">
                      <div className="flex gap-2">
                        {assignment.tags?.map(tag => (
                          <span key={tag} className="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-xs rounded-full text-gray-600 dark:text-gray-300">
                            {tag}
                          </span>
                        ))}
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                          <MessageSquare size={16} />
                          <span>{assignment.comment_count} Comments</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        
        <div className="mt-8 text-center">
          <Link href="/admin" className="text-sm text-gray-400 hover:text-gray-600">
            Admin Settings
          </Link>
        </div>
      </div>
    </main>
  );
}