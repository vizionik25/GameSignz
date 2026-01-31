"use client";

import { useState, useTransition } from "react";
import { LevelConfig } from "@/lib/assignment-service";
import { saveLevels } from "./actions";
import Link from "next/link";
import { ArrowLeft, Save, Plus, Trash2, CheckCircle } from "lucide-react";

export default function AdminPage({ 
  initialLevels,
  companyId 
}: { 
  initialLevels: LevelConfig[],
  companyId: string 
}) {
  const [levels, setLevels] = useState<Omit<LevelConfig, "id">[]>(
    initialLevels.map(({ id, ...rest }) => rest)
  );
  const [isPending, startTransition] = useTransition();
  const [showSaved, setShowSaved] = useState(false);

  const handleUpdateLevel = (index: number, field: keyof Omit<LevelConfig, "id">, value: string | number) => {
    const newLevels = [...levels];
    newLevels[index] = { ...newLevels[index], [field]: value };
    setLevels(newLevels);
  };

  const handleDeleteLevel = (index: number) => {
    setLevels(levels.filter((_, i) => i !== index));
  };

  const handleAddLevel = () => {
    const nextLevel = levels.length > 0 ? levels[levels.length - 1].level_number + 1 : 1;
    const nextXp = levels.length > 0 ? levels[levels.length - 1].xp_required + 500 : 100;
    setLevels([...levels, { level_number: nextLevel, xp_required: nextXp, reward_name: "New Reward" }]);
  };

  const onSave = () => {
    startTransition(async () => {
      await saveLevels(levels);
      setShowSaved(true);
      setTimeout(() => setShowSaved(false), 3000);
    });
  };

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <Link 
            href="/" 
            className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to App
          </Link>
          
          <div className="flex items-center gap-4">
            {showSaved && (
              <span className="flex items-center gap-1 text-green-600 text-sm font-medium animate-in fade-in slide-in-from-right-4">
                <CheckCircle size={16} /> Saved Successfully
              </span>
            )}
            <button 
              onClick={onSave}
              disabled={isPending}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors shadow-lg shadow-blue-500/20 disabled:opacity-50"
            >
              {isPending ? <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={18} />}
              Save Config
            </button>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-6 border-b border-gray-100 dark:border-gray-700">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
              Leveling Configuration
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Configure XP thresholds and rewards for Company ID: <code className="text-xs bg-gray-100 dark:bg-gray-900 px-1 py-0.5 rounded">{companyId}</code>
            </p>
          </div>

          <div className="p-6">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700 text-sm font-medium text-gray-500 dark:text-gray-400">
                    <th className="pb-3 pl-2">Level</th>
                    <th className="pb-3">XP Required</th>
                    <th className="pb-3">Reward Name</th>
                    <th className="pb-3 text-right pr-2">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                  {levels.map((lvl, index) => (
                    <tr key={index} className="group">
                      <td className="py-4 pl-2 font-medium text-gray-900 dark:text-white">
                        #{lvl.level_number}
                      </td>
                      <td className="py-4 pr-4">
                        <input
                          type="number"
                          value={lvl.xp_required}
                          onChange={(e) => handleUpdateLevel(index, 'xp_required', parseInt(e.target.value))}
                          className="w-full max-w-[120px] px-3 py-1.5 rounded border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </td>
                      <td className="py-4 pr-4">
                        <input
                          type="text"
                          value={lvl.reward_name}
                          onChange={(e) => handleUpdateLevel(index, 'reward_name', e.target.value)}
                          className="w-full px-3 py-1.5 rounded border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-900 focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                      </td>
                      <td className="py-4 text-right pr-2">
                        <button 
                          onClick={() => handleDeleteLevel(index)}
                          className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <button
              onClick={handleAddLevel}
              className="mt-6 flex items-center gap-2 px-4 py-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-colors font-medium text-sm"
            >
              <Plus size={18} />
              Add New Level
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
