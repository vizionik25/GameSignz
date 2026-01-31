import { headers } from "next/headers";
import { getWhopSDK } from "@/lib/whop-sdk";
import { assignmentService } from "@/lib/assignment-service";
import AdminClient from "./AdminClient";
import { redirect } from "next/navigation";

import AdminStats from "./AdminStats";

export default async function AdminPage({
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

  // Verify membership/admin status
  const memberships = await sdk.authorizedUsers.list({ 
    user_id: userId,
    company_id: targetCompanyId
  });
  
  // If we found a specific company but user is not authorized, redirect
  if (targetCompanyId !== "demo_company" && memberships.data.length === 0) {
    redirect("/");
  }

  const companyId = targetCompanyId;

  const [initialLevels, stats] = await Promise.all([
    assignmentService.getLevelConfigs(companyId),
    assignmentService.getCompanyStats(companyId)
  ]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <AdminStats stats={stats} />
        <AdminClient initialLevels={initialLevels} companyId={companyId} />
      </div>
    </div>
  );
}