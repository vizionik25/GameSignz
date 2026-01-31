"use server";

import { headers } from "next/headers";
import { getWhopSDK } from "@/lib/whop-sdk";
import { assignmentService } from "@/lib/assignment-service";
import { redirect } from "next/navigation";

export async function submitAssignment(prevState: any, formData: FormData) {
  const sdk = getWhopSDK();
  const headersList = await headers();
  const { userId } = await sdk.verifyUserToken(headersList);

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const companyId = formData.get("companyId") as string || "demo_company";

  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const tagsString = formData.get("tags") as string;
  const tags = tagsString ? tagsString.split(",").map(t => t.trim()) : [];
  const file = formData.get("file") as File;

  let fileUrl = undefined;
  let fileName = undefined;

  if (file && file.size > 0) {
    try {
      const timestamp = Date.now();
      const cleanFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
      const path = `${companyId}/${userId}/${timestamp}_${cleanFileName}`;
      
      fileUrl = await assignmentService.uploadFile(file, path);
      fileName = file.name;
    } catch (error) {
      console.error("Upload failed:", error);
      return { error: "Failed to upload file. Please try again." };
    }
  }

  await assignmentService.createAssignment({
    title,
    description,
    tags,
    user_id: userId,
    company_id: companyId,
    file_url: fileUrl,
    file_name: fileName
  });

  redirect("/");
}