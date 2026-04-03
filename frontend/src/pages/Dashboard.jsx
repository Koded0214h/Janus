import React, { useState, useEffect } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/Sidebar";
import { JanusSidebar } from "@/components/JanusSidebar";
import { JanusHeader } from "@/components/JanusHeader";
import FloatingActionMenu from "@/components/ui/FloatingActionMenu";
import { Pause, ShieldAlert, Fuel, Plus, Play, Loader2 } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import api from "@/lib/api";
import { useModal } from "@/context/ModalContext";

const portfolioData = [
  { name: "BTC", value: 40, color: "#44edb7" },
  { name: "ETH", value: 30, color: "#5D5FEF" },
  { name: "SUI", value: 20, color: "#f6a724" },
  { name: "USDC", value: 10, color: "#bacac1" },
];

const Dashboard = () => {
  const { showModal } = useModal();
  const [agentEnabled, setAgentEnabled] = useState(true);
  const [stats, setStats] = useState(null);
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [statsData, activityData, userData] = await Promise.all([
          api.get('/dashboard/stats/'),
          api.get('/dashboard/activity/'),
          api.get('/users/me/')
        ]);
        setStats(statsData);
        setActivities(activityData);
        setIsLoading(false);
        if (userData.wallet_address) {
          localStorage.setItem('user_address', userData.wallet_address);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      }
    };

    fetchDashboardData();
    const interval = setInterval(fetchDashboardData, 10000);
    return () => clearInterval(interval);
  }, []);

  const menuOptions = [
    {
      label: agentEnabled ? "Pause Autonomous Agent" : "Resume Autonomous Agent",
      Icon: agentEnabled ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />,
      onClick: () => setAgentEnabled(!agentEnabled),
    },
    {
      label: "Emergency Vault Exit",
      Icon: <ShieldAlert className="w-4 h-4" />,
      onClick: () => console.log("Emergency Exit triggered"),
    },
    {
      label: "Refill Gas Reserve",
      Icon: <Fuel className="w-4 h-4" />,
      onClick: () => console.log("Refill Gas clicked"),
    },
    {
      label: "Execute New Intent",
      Icon: <Plus className="w-4 h-4" />,
      onClick: async () => {
        try {
          // Find an active intent to execute
          const intents = await api.get('/agents/intents/');
          const activeIntents = Array.isArray(intents) ? intents : intents.results || [];
          if (activeIntents.length > 0) {
            const intentToExecute = activeIntents.find(i => i.is_active) || activeIntents[0];
            await api.post(`/agents/intents/${intentToExecute.id}/execute/`);
            showModal("Execution Triggered", `Autonomous intent execution initiated for: ${intentToExecute.natural_language.slice(0, 30)}...`, "success");
            // Refresh dashboard data
            // window.location.reload();
          } else {
            showModal("No Active Policies", "Please create a policy in the Policies page first.", "warning");
          }
        } catch (error) {
          console.error("Execution failed:", error);
          showModal("Execution Error", "Failed to trigger execution. Ensure the agent is active.", "error");
        }
      },
    },
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <SidebarProvider defaultOpen={false}>
      <JanusSidebar />
      <SidebarInset>
        <div className="overflow-hidden min-h-screen bg-background text-on-surface">
          <JanusHeader title="Dashboard" />

          {/* Main Content */}
          <div className="pt-8 px-6 pb-12 overflow-y-auto custom-scrollbar">
            <div className="max-w-6xl mx-auto">
              {/* Page Header Area */}
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                <div>
                  <h1 className="text-4xl font-black tracking-tighter text-on-surface">SYSTEM <span className="text-primary">OVERVIEW</span></h1>
                  <p className="text-on-surface-variant font-medium mt-1">Autonomous Liquidity &amp; Privacy Management</p>
                </div>
                <div className="flex items-center gap-4 bg-surface-container-low p-2 rounded-sm border border-outline-variant/10">
                  <div className="flex items-center gap-2 px-3 py-1 border-r border-outline-variant/20">
                    <span className="relative flex h-3 w-3">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                    </span>
                    <span className="font-mono text-xs font-bold uppercase tracking-widest text-primary">Agent Online</span>
                  </div>
                  <div className="px-3 py-1">
                    <span className="font-mono text-xs text-on-surface-variant uppercase tracking-widest">{stats?.active_intents || 0} Policies Active</span>
                  </div>
                  <div className="flex items-center pl-2">
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        className="sr-only peer"
                        checked={agentEnabled}
                        onChange={() => setAgentEnabled(!agentEnabled)}
                      />
                      <div className="w-11 h-6 bg-surface-container-highest rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 xl:grid-cols-10 gap-6">
                {/* Left Column (60%) */}
                <div className="xl:col-span-6 flex flex-col gap-6">
                  {/* Portfolio Overview Card */}
                  <section className="glass-panel p-6 rounded-sm relative overflow-hidden group hover:shadow-[0_0_20px_rgba(68,237,183,0.05)] transition-shadow">
                    <div className="flex flex-col md:flex-row items-center gap-8">
                      <div className="flex-1">
                        <h3 className="font-['JetBrains_Mono'] text-xs font-bold uppercase tracking-[0.2em] text-on-surface-variant mb-2">Total Managed Portfolio</h3>
                        <div className="flex items-baseline gap-3">
                          <span className="text-5xl font-mono font-black tracking-tighter">${parseFloat(stats?.total_value_managed || 0).toLocaleString()}</span>
                          <span className="text-primary font-mono text-lg font-bold">+5.2%</span>
                        </div>
                        <div className="mt-8 grid grid-cols-2 gap-4">
                          <div className="bg-surface-container-lowest p-3 border-l-2 border-primary">
                            <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest">Successful Tx</p>
                            <p className="font-mono text-lg font-bold">{stats?.successful_transactions || 0}</p>
                          </div>
                          <div className="bg-surface-container-lowest p-3 border-l-2 border-tertiary">
                            <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest">Compliance Rate</p>
                            <p className="font-mono text-lg font-bold">{stats?.compliance_rate || 0}%</p>
                          </div>
                        </div>
                      </div>
                      {/* Donut Chart Representation */}
                      <div className="relative w-48 h-48 flex items-center justify-center">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={portfolioData}
                              cx="50%"
                              cy="50%"
                              innerRadius={60}
                              outerRadius={80}
                              paddingAngle={5}
                              dataKey="value"
                              stroke="none"
                            >
                              {portfolioData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                          </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                          <span className="font-mono text-[10px] text-on-surface-variant uppercase tracking-widest">Diversified</span>
                          <span className="font-mono text-sm font-bold">{portfolioData.length} Assets</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-6 flex flex-wrap gap-4 pt-6 border-t border-outline-variant/10">
                      {portfolioData.map((asset) => (
                        <div key={asset.name} className="flex items-center gap-2">
                          <span className="w-2 h-2" style={{ backgroundColor: asset.color }}></span>
                          <span className="font-mono text-[10px] uppercase">{asset.name} {asset.value}%</span>
                        </div>
                      ))}
                    </div>
                  </section>

                  {/* Recent Intents Timeline */}
                  <section className="glass-panel rounded-sm flex flex-col flex-1">
                    <div className="p-6 border-b border-outline-variant/10 flex justify-between items-center">
                      <h3 className="font-mono text-sm font-bold uppercase tracking-widest text-on-surface">Recent Activity</h3>
                      <button className="text-primary font-mono text-xs hover:underline">View All</button>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead className="bg-surface-container-lowest/50">
                          <tr>
                            <th className="px-6 py-3 font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">Action</th>
                            <th className="px-6 py-3 font-mono text-[10px] uppercase tracking-widest text-on-surface-variant">Timestamp</th>
                            <th className="px-6 py-3 font-mono text-[10px] uppercase tracking-widest text-on-surface-variant text-right">Details</th>
                            <th className="px-6 py-3 font-mono text-[10px] uppercase tracking-widest text-on-surface-variant text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-outline-variant/5">
                          {activities.map((activity, index) => (
                            <tr key={index} className="hover:bg-surface-container-high transition-colors group">
                              <td className="px-6 py-4 font-bold text-sm capitalize">{activity.action.replace('_', ' ')}</td>
                              <td className="px-6 py-4 font-mono text-xs text-on-surface-variant">
                                {new Date(activity.timestamp).toLocaleString()}
                              </td>
                              <td className="px-6 py-4 font-mono text-sm text-primary text-right">
                                {activity.details.amount ? `${activity.details.amount} ${activity.details.token}` : activity.type}
                              </td>
                              <td className="px-6 py-4 text-center">
                                <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border border-primary/20">Success</span>
                              </td>
                            </tr>
                          ))}
                          {activities.length === 0 && (
                            <tr>
                              <td colSpan="4" className="px-6 py-8 text-center text-on-surface-variant italic">No recent activity</td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </section>
                </div>

                {/* Right Column (40%) */}
                <div className="xl:col-span-4 flex flex-col gap-6">
                  {/* Security Health Card */}
                  <section className="glass-panel p-6 rounded-sm border-t-2 border-primary">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="font-mono text-sm font-bold uppercase tracking-widest text-on-surface">Vault Security</h3>
                      <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center p-3 bg-surface-container-lowest rounded-sm">
                        <span className="text-sm font-medium">Shard Health (AI Nodes)</span>
                        <span className="font-mono text-sm font-bold text-primary">
                          {stats?.shard_health?.active || 0}/{stats?.shard_health?.total || 0} Active
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-surface-container-lowest rounded-sm">
                        <span className="text-sm font-medium">Multi-Party Computation</span>
                        <span className="bg-primary/10 text-primary px-2 py-0.5 rounded text-[10px] font-bold">
                          {stats?.mpc_status || 'OFFLINE'}
                        </span>
                      </div>
                      <div className="flex justify-between items-center p-3 bg-surface-container-lowest rounded-sm">
                        <span className="text-sm font-medium">Last Key Rotation</span>
                        <span className="font-mono text-xs text-on-surface-variant uppercase">
                          {stats?.last_key_rotation ? new Date(stats.last_key_rotation).toLocaleDateString() : 'NEVER'}
                        </span>
                      </div>
                      <button className="w-full py-3 bg-surface-container-highest border border-outline-variant/30 text-xs font-mono font-bold uppercase tracking-widest hover:border-primary hover:text-primary transition-all rounded-sm mt-2">
                        Rotate Security Shards
                      </button>
                    </div>
                  </section>

                  {/* Daily Limit Gauge */}
                  <section className="glass-panel p-6 rounded-sm">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-mono text-[10px] font-black uppercase tracking-widest text-on-surface-variant">Daily Withdrawal Limit</h3>
                      <span className="font-mono text-xs text-on-surface font-bold">
                        ${parseFloat(stats?.daily_limit_used || 0).toFixed(0)} / ${parseFloat(stats?.daily_limit_max || 0).toFixed(0)}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-surface-container-highest rounded-full overflow-hidden mb-2">
                      <div 
                        className="h-full bg-primary shadow-[0_0_10px_#44edb7]" 
                        style={{ width: `${Math.min(100, (parseFloat(stats?.daily_limit_used || 0) / parseFloat(stats?.daily_limit_max || 1)) * 100)}%` }}
                      ></div>
                    </div>
                    <p className="text-[10px] text-on-surface-variant italic">
                      {Math.round((parseFloat(stats?.daily_limit_used || 0) / parseFloat(stats?.daily_limit_max || 1)) * 100)}% of daily automated threshold reached
                    </p>
                  </section>

                  {/* Recent Alerts (Security Intelligence) */}
                  <section className="glass-panel p-6 rounded-sm">
                    <h3 className="font-mono text-sm font-bold uppercase tracking-widest text-on-surface mb-6">Security Intelligence</h3>
                    <div className="space-y-4">
                      {activities.filter(a => a.type === 'intent' || a.action.includes('failed')).slice(0, 3).map((alert, i) => (
                        <div key={i} className="flex gap-4 items-start p-3 hover:bg-surface-container-high transition-colors rounded-sm cursor-default group">
                          <span className={`mt-1 w-2 h-2 rounded-full flex-shrink-0 ${alert.action.includes('failed') ? 'bg-error animate-pulse' : 'bg-primary'}`}></span>
                          <div>
                            <p className="text-sm font-bold leading-tight capitalize">{alert.action.replace('_', ' ')}</p>
                            <p className="text-xs text-on-surface-variant mt-1">{alert.details.description || 'System event recorded.'}</p>
                          </div>
                        </div>
                      ))}
                      {activities.filter(a => a.type === 'intent' || a.action.includes('failed')).length === 0 && (
                        <div className="flex gap-4 items-start p-3 rounded-sm cursor-default">
                          <span className="mt-1 w-2 h-2 rounded-full bg-primary flex-shrink-0"></span>
                          <div>
                            <p className="text-sm font-bold leading-tight">System Optimal</p>
                            <p className="text-xs text-on-surface-variant mt-1">No security threats detected in last 24h.</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </section>
                </div>
              </div>
            </div>
          </div>

          <FloatingActionMenu options={menuOptions} />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default Dashboard;
