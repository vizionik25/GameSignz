"use client";

import { useActionState } from "react";
import { submitAssignment } from "./actions";
import Link from "next/link";
import { ArrowLeft, Upload } from "lucide-react";
import { useSearchParams } from "next/navigation";

export default function SubmitPage() {
  const [state, formAction, isPending] = useActionState(submitAssignment, null);
  const searchParams = useSearchParams();
  const companyId = searchParams.get("companyId") || "demo_company";

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Quest Board
        </Link>

        <div className="bg-white dark:bg-gray-800 rounded-xl p-8 shadow-sm border border-gray-100 dark:border-gray-700">
          <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">
            Submit New Assignment
          </h1>

          <form action={formAction} className="space-y-6">
            <input type="hidden" name="companyId" value={companyId} />
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Assignment Title
              </label>
              <input
                type="text"
                name="title"
                id="title"
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="e.g., Build a React To-Do List"
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Description & Reflection
              </label>
              <textarea
                name="description"
                id="description"
                rows={6}
                required
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                placeholder="Describe what you built, what you learned, and any challenges you faced..."
              />
            </div>

            <div>
              <label htmlFor="file" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Project Files (Optional)
              </label>
              <div className="relative">
                <input
                  type="file"
                  name="file"
                  id="file"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900 dark:file:text-blue-200"
                />
                <div className="absolute right-3 top-3 text-gray-400 pointer-events-none">
                  <Upload size={18} />
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-1">Upload ZIPs, PDFs, or Images.</p>
            </div>

            <div>
              <label htmlFor="tags" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Tags (comma separated)
              </label>
              <input
                type="text"
                name="tags"
                id="tags"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                placeholder="React, Frontend, Beginner"
              />
            </div>

            {state?.error && (
              <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">
                {state.error}
              </div>
            )}

            <div className="pt-4">
              <button
                type="submit"
                disabled={isPending}
                className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium shadow-lg shadow-blue-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center"
              >
                {isPending ? (
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  "Submit Assignment"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </main>
  );
}
