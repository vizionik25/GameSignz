"use server";

import { headers } from "next/headers";
import { getWhopSDK } from "@/lib/whop-sdk";
import { assignmentService } from "@/lib/assignment-service";
import { revalidatePath } from "next/cache";

export async function castVote(assignmentId: string, voteType: 1 | -1) {
  const sdk = getWhopSDK();
  const headersList = await headers();
  const { userId } = await sdk.verifyUserToken(headersList);

  if (!userId) throw new Error("Unauthorized");

  await assignmentService.vote(assignmentId, userId, voteType);
  
  revalidatePath("/");
  revalidatePath(`/assignment/${assignmentId}`);
}
