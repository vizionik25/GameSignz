import { headers } from "next/headers";
import { getWhopSDK } from "@/lib/whop-sdk";
import { assignmentService } from "@/lib/assignment-service";
import AdminClient from "./AdminClient";
import { redirect } from "next/navigation";

import AdminStats from "./AdminStats";

export default async function AdminPage() {
  const sdk = getWhopSDK();
  const headersList = await headers();
  const { userId } = await sdk.verifyUserToken(headersList);

  if (!userId) redirect("/");

  const memberships = await sdk.authorizedUsers.list({ user_id: userId });
  const companyId = memberships.data[0]?.company_id || "demo_company";

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