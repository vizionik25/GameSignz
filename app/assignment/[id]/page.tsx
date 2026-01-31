import { headers } from "next/headers";
import { getWhopSDK } from "@/lib/whop-sdk";
import { assignmentService } from "@/lib/assignment-service";
import Link from "next/link";
import { ArrowLeft, Share2, Flag, FileText, Download } from "lucide-react";
import VoteButtons from "@/components/VoteButtons";
import CommentSection from "@/components/CommentSection";
import { redirect } from "next/navigation";

export default async function AssignmentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const sdk = getWhopSDK();
  const headersList = await headers();
  const { userId } = await sdk.verifyUserToken(headersList);

  if (!userId) redirect("/");

  const [assignment, comments] = await Promise.all([
    assignmentService.getAssignmentById(id),
    assignmentService.getComments(id)
  ]);

  if (!assignment) {
    return (
      <div className="p-8 text-center bg-gray-50 dark:bg-gray-900 min-h-screen">
        <p className="text-red-500 mb-4">Assignment Not Found</p>
        <Link href="/" className="text-blue-500 underline">Back Home</Link>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Quest Board
        </Link>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          {/* Header Section */}
          <div className="p-6 md:p-8 border-b border-gray-100 dark:border-gray-700">
            <div className="flex gap-6">
              <div className="min-w-[3rem]">
                <VoteButtons 
                  assignmentId={assignment.id} 
                  initialVotes={assignment.vote_count} 
                  size="lg"
                />
              </div>

              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-3">
                  {assignment.tags?.map(tag => (
                    <span key={tag} className="px-2.5 py-1 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 text-xs font-medium rounded-full">
                      {tag}
                    </span>
                  ))}
                  <span className="text-sm text-gray-500">
                    Posted {new Date(assignment.created_at).toLocaleDateString()}
                  </span>
                </div>

                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-4">
                  {assignment.title}
                </h1>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-500 to-blue-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      @{assignment.users?.username}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Content Body */}
          <div className="p-6 md:p-8">
            <div className="prose dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {assignment.description}
            </div>

            {/* File Attachment */}
            {assignment.file_url && (
              <div className="mt-8 p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg border border-gray-200 dark:border-gray-700 flex items-center justify-between group hover:border-blue-500/50 transition-colors">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm text-blue-600">
                    <FileText size={24} />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100 text-sm">
                      {assignment.file_name || "Attached File"}
                    </p>
                    <p className="text-xs text-gray-500">Project Attachment</p>
                  </div>
                </div>
                <a 
                  href={assignment.file_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  download
                >
                  <Download size={20} />
                </a>
              </div>
            )}
          </div>

          {/* Actions Bar */}
          <div className="bg-gray-50 dark:bg-gray-900/30 px-6 py-4 border-t border-gray-100 dark:border-gray-700 flex justify-between items-center">
            <div className="flex items-center gap-6">
              <span className="flex items-center gap-2 text-gray-600 dark:text-gray-400 font-medium">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                Active Discussion
              </span>
            </div>
            <button className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors font-medium">
              <Share2 size={18} />
              Share
            </button>
          </div>
        </div>

        {/* Comments Section */}
        <CommentSection assignmentId={assignment.id} initialComments={comments} />
      </div>
    </main>
  );
}
