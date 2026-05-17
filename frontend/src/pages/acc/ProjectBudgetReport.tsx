import React, { useState, useEffect } from 'react';
import api from '../../api/client';

const ProjectBudgetReport: React.FC = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBudgets = async () => {
      try {
        const res = await api.get('/api/accounting/reports/project-budgets');
        setProjects(res.data.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchBudgets();
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Project Budget Tracking</h1>
      </div>

      {loading ? (
        <div className="text-gray-500">Loading budgets...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map(proj => {
            // If project model wasn't previously capturing budgets, default to 0 for display
            const sanctioned = proj.budget?.sanctioned || proj.awardedAmount || proj.estimatedCost || 0;
            const utilized = proj.budget?.utilized || 0;
            const remaining = sanctioned - utilized;
            const percent = sanctioned > 0 ? Math.min(100, Math.round((utilized / sanctioned) * 100)) : 0;

            return (
              <div key={proj._id} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-100 dark:border-gray-700">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white line-clamp-1" title={proj.name}>{proj.name}</h3>
                    <p className="text-sm text-gray-500">{proj.projectId}</p>
                  </div>
                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                    {proj.status.replace(/_/g, ' ')}
                  </span>
                </div>

                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-500 dark:text-gray-400">Budget Utilization</span>
                      <span className="font-medium text-gray-900 dark:text-white">{percent}%</span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full ${percent >= 90 ? 'bg-red-500' : percent >= 75 ? 'bg-yellow-500' : 'bg-green-500'}`} 
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-gray-100 dark:border-gray-700">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Sanctioned</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">₹{sanctioned.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Utilized</p>
                      <p className="text-sm font-semibold text-gray-900 dark:text-white">₹{utilized.toLocaleString()}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider">Remaining Balance</p>
                      <p className={`text-lg font-bold ${remaining < 0 ? 'text-red-600' : 'text-green-600'}`}>
                        ₹{remaining.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProjectBudgetReport;
