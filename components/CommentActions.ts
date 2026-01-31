"use server";

import { headers } from "next/headers";
import { getWhopSDK } from "@/lib/whop-sdk";
import { assignmentService } from "@/lib/assignment-service";
import { revalidatePath } from "next/cache";

export async function postComment(assignmentId: string, content: string) {
  const sdk = getWhopSDK();
  const headersList = await headers();
  const { userId } = await sdk.verifyUserToken(headersList);

  if (!userId) throw new Error("Unauthorized");

  await assignmentService.createComment({
    assignment_id: assignmentId,
    user_id: userId,
    content
  });

  revalidatePath(`/assignment/${assignmentId}`);
}
