import { BarChart3, Users, FileText } from "lucide-react";

export default function AdminStats({ 
  stats 
}: { 
  stats: { totalAssignments: number; totalUsers: number } 
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4">
        <div className="p-3 bg-blue-50 dark:bg-blue-900/30 text-blue-600 rounded-lg">
          <Users size={24} />
        </div>
        <div>
          <p className="text-sm text-gray-500 font-medium">Active Participants</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.totalUsers}</p>
        </div>
      </div>
      
      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4">
        <div className="p-3 bg-purple-50 dark:bg-purple-900/30 text-purple-600 rounded-lg">
          <FileText size={24} />
        </div>
        <div>
          <p className="text-sm text-gray-500 font-medium">Assignments Posted</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stats.totalAssignments}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm flex items-center gap-4">
        <div className="p-3 bg-green-50 dark:bg-green-900/30 text-green-600 rounded-lg">
          <BarChart3 size={24} />
        </div>
        <div>
          <p className="text-sm text-gray-500 font-medium">Avg. Engagement</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            {stats.totalAssignments > 0 ? (stats.totalUsers / stats.totalAssignments).toFixed(1) : 0}%
          </p>
        </div>
      </div>
    </div>
  );
}
