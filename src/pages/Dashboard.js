import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Calendar,
  Briefcase,
  Layers
} from 'lucide-react';
import { getDashboardSummary } from '../services/dashboard';
import { useQuery } from '@tanstack/react-query';


const Dashboard = () => {
  const navigate = useNavigate();

  // 1. Dashboard summary counts query
  const { data: summary } = useQuery({
    queryKey: ['dashboard', 'summary'],
    queryFn: getDashboardSummary,
    select: (data) => data.data,
    staleTime: 30000 // 30 seconds stale
  });

  return (
    <div className="space-y-8 pb-10">
      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Projects Card */}
        <div onClick={() => navigate('/projects')} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-between group">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Projects</p>
            <h3 className="text-3xl font-black text-slate-800">{summary?.totalProjects ?? '...'}</h3>
          </div>
          <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl group-hover:bg-blue-100 transition-colors">
            <Briefcase size={22} />
          </div>
        </div>

        {/* Inquiries Card */}
        <div onClick={() => navigate('/inquiries')} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-between group">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Inquiries</p>
            <h3 className="text-3xl font-black text-slate-800">{summary?.totalInquiries ?? '...'}</h3>
          </div>
          <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl group-hover:bg-indigo-100 transition-colors">
            <Users size={22} />
          </div>
        </div>

        {/* Follow Ups Card */}
        <div onClick={() => navigate('/follow-ups')} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-between group">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Followups</p>
            <h3 className="text-3xl font-black text-slate-800">{summary?.pendingFollowups ?? '...'}</h3>
          </div>
          <div className="p-4 bg-amber-50 text-amber-600 rounded-2xl group-hover:bg-amber-100 transition-colors">
            <Calendar size={22} />
          </div>
        </div>

        {/* Material Approvals Card */}
        <div onClick={() => navigate('/materials')} className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-between group">
          <div className="space-y-1">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pending Approvals</p>
            <h3 className="text-3xl font-black text-slate-800">{summary?.pendingMaterialApprovals ?? '...'}</h3>
          </div>
          <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl group-hover:bg-rose-100 transition-colors">
            <Layers size={22} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
