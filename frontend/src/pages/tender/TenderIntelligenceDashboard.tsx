import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getRecommendedTenders, getTenderDashboardStats, interactTender } from '../../api/intelligence';
import PageHeader from '../../components/shared/PageHeader';
import StatusPill from '../../components/shared/StatusPill';
import { formatINR, formatDate } from '../../utils/format';
import { Bookmark, BookmarkCheck, TrendingUp, Sparkles, Filter, ShieldCheck, Target } from 'lucide-react';

export default function TenderIntelligenceDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [recommendations, setRecommendations] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'BEST_FIT' | 'HIGH_VALUE' | 'LOW_COMPETITION' | 'ALL'>('BEST_FIT');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [recRes, statsRes] = await Promise.all([
        getRecommendedTenders(),
        getTenderDashboardStats()
      ]);
      setRecommendations(recRes.data);
      setStats(statsRes.data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load intelligence data');
    } finally {
      setLoading(false);
    }
  };

  const handleBookmark = async (tenderId: string, currentState: boolean) => {
    try {
      await interactTender(tenderId, { isBookmarked: !currentState });
      loadData(); // reload to reflect updated state
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-500">Loading intelligence data...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  const currentList = recommendations ? 
    (activeTab === 'BEST_FIT' ? recommendations.bestFit : 
     activeTab === 'HIGH_VALUE' ? recommendations.highValue : 
     activeTab === 'LOW_COMPETITION' ? recommendations.lowCompetition : recommendations.allAvailable) : [];

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Tender Intelligence" 
        subtitle="AI-driven tender discovery, recommendations, and opportunity detection engine"
        stage={4}
      />

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card-gov flex items-center p-4">
          <div className="p-3 bg-blue-100 text-blue-700 rounded-lg mr-4"><Target /></div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Best Fit Tenders</p>
            <p className="text-2xl font-bold">{recommendations?.bestFit?.length || 0}</p>
          </div>
        </div>
        <div className="card-gov flex items-center p-4">
          <div className="p-3 bg-green-100 text-green-700 rounded-lg mr-4"><Sparkles /></div>
          <div>
            <p className="text-sm text-slate-500 font-medium">High Value (1Cr+)</p>
            <p className="text-2xl font-bold">{recommendations?.highValue?.length || 0}</p>
          </div>
        </div>
        <div className="card-gov flex items-center p-4">
          <div className="p-3 bg-amber-100 text-amber-700 rounded-lg mr-4"><ShieldCheck /></div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Low Competition</p>
            <p className="text-2xl font-bold">{recommendations?.lowCompetition?.length || 0}</p>
          </div>
        </div>
        <div className="card-gov flex items-center p-4">
          <div className="p-3 bg-indigo-100 text-indigo-700 rounded-lg mr-4"><TrendingUp /></div>
          <div>
            <p className="text-sm text-slate-500 font-medium">External Tenders</p>
            <p className="text-2xl font-bold">{stats?.sourceBreakdown?.external || 0}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center space-x-2 border-b border-slate-200">
            {['BEST_FIT', 'HIGH_VALUE', 'LOW_COMPETITION', 'ALL'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`px-4 py-2 font-medium text-sm transition-colors ${
                  activeTab === tab ? 'border-b-2 border-govt-navy text-govt-navy' : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                {tab.replace('_', ' ')}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            {currentList.map((t: any) => {
              const isBookmarked = stats?.myInteractions?.find((i: any) => i.tender?._id === t._id)?.isBookmarked;
              
              const eligibilityColors: Record<string, string> = {
                ELIGIBLE: 'bg-green-100 text-green-800',
                PARTIALLY_ELIGIBLE: 'bg-yellow-100 text-yellow-800',
                NOT_ELIGIBLE: 'bg-red-100 text-red-800'
              };

              return (
                <div key={t._id} className="card-gov p-4 hover:border-govt-blue/30 transition-colors">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600">{t.tenderId}</span>
                        <StatusPill status={t.status} />
                        {t.source === 'EXTERNAL_PORTAL' && <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded font-medium">EXTERNAL</span>}
                        {t.eligibilityStatus && (
                          <span className={`text-xs px-2 py-0.5 rounded font-medium ${eligibilityColors[t.eligibilityStatus]}`}>
                            {t.eligibilityStatus.replace('_', ' ')}
                          </span>
                        )}
                        {t.matchTags?.map((tag: string, i: number) => (
                          <span key={i} className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-200 px-2 py-0.5 rounded-full font-medium">
                            {tag}
                          </span>
                        ))}
                      </div>
                      <Link to={`/tenders/${t._id}`} className="text-lg font-semibold text-govt-navy hover:underline block mt-2">
                        {t.title}
                      </Link>
                      <div className="flex gap-4 mt-2 text-sm text-slate-500">
                        <span>Dept: {t.department?.name || 'N/A'}</span>
                        <span>Value: {formatINR(t.estimatedCost, { compact: true })}</span>
                        <span>Ends: {formatDate(t.bidSubmissionEndDate)}</span>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleBookmark(t._id, isBookmarked)}
                      className={`p-2 rounded-full transition-colors ${isBookmarked ? 'bg-amber-100 text-amber-600' : 'bg-slate-100 text-slate-400 hover:bg-slate-200'}`}
                    >
                      {isBookmarked ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
                    </button>
                  </div>
                  
                  {/* Reasons for Rejection / Partial Eligibility */}
                  {t.rejectionReasons && t.rejectionReasons.length > 0 && (
                    <div className="mt-4 p-3 bg-red-50/50 border border-red-100 rounded-md">
                      <p className="text-xs font-semibold text-red-800 mb-1">Missing Requirements:</p>
                      <ul className="list-disc list-inside text-xs text-red-700 space-y-1">
                        {t.rejectionReasons.map((reason: string, idx: number) => (
                          <li key={idx}>{reason}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
            {currentList.length === 0 && (
              <div className="text-center py-10 text-slate-500 bg-white rounded-lg border border-dashed border-slate-300">
                <Filter className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                <p>No tenders found for this category</p>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="card-gov">
            <h3 className="px-4 py-3 border-b font-semibold bg-slate-50 text-slate-700 flex items-center">
              <TrendingUp className="w-4 h-4 mr-2" /> Trending Opportunities
            </h3>
            <div className="divide-y">
              {stats?.trendingTenders?.map((t: any) => (
                <div key={t._id} className="p-4 hover:bg-slate-50">
                  <Link to={`/tenders/${t._id}`} className="text-sm font-medium text-govt-navy hover:underline block truncate">
                    {t.title}
                  </Link>
                  <p className="text-xs text-slate-500 mt-1">{formatINR(t.estimatedCost)}</p>
                </div>
              ))}
              {!stats?.trendingTenders?.length && <p className="p-4 text-sm text-slate-500 text-center">No trending data</p>}
            </div>
          </div>

          <div className="card-gov">
            <h3 className="px-4 py-3 border-b font-semibold bg-slate-50 text-slate-700 flex items-center">
              <BookmarkCheck className="w-4 h-4 mr-2" /> My Bookmarks
            </h3>
            <div className="divide-y">
              {stats?.myInteractions?.filter((i: any) => i.isBookmarked).map((i: any) => (
                <div key={i._id} className="p-4 hover:bg-slate-50">
                  <Link to={`/tenders/${i.tender._id}`} className="text-sm font-medium text-govt-navy hover:underline block truncate">
                    {i.tender.title}
                  </Link>
                  <p className="text-xs text-slate-500 mt-1">Status: {i.tender.status}</p>
                </div>
              ))}
              {stats?.myInteractions?.filter((i: any) => i.isBookmarked).length === 0 && (
                <p className="p-4 text-sm text-slate-500 text-center">No bookmarked tenders</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
