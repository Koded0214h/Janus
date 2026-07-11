import React, { useState, useEffect } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/Sidebar";
import { JanusSidebar } from "@/components/JanusSidebar";
import { JanusHeader } from "@/components/JanusHeader";
import api from "@/lib/api";
import { Loader2, ShieldAlert, Key, Network, RefreshCw, AlertTriangle, ShieldCheck, Lock } from "lucide-react";
import { useModal } from "@/context/ModalContext";

const SecurityCenter = () => {
  const { showModal } = useModal();
  const [stats, setStats] = useState(null);
  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      const [statsData, profileData] = await Promise.all([
        api.get('/dashboard/stats/'),
        api.get('/users/profile/')
      ]);
      setStats(statsData);
      setProfile(profileData);
    } catch (error) {
      console.error("Failed to fetch security data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleToggleBreaker = async (protocol) => {
    if (!profile) return;
    
    const isExcluded = profile.excluded_protocols.includes(protocol);
    const newExcluded = isExcluded 
      ? profile.excluded_protocols.filter(p => p !== protocol)
      : [...profile.excluded_protocols, protocol];

    try {
      setIsProcessing(true);
      await api.patch('/users/profile/', { excluded_protocols: newExcluded });
      await fetchData();
    } catch (error) {
      showModal("Update Failed", "Failed to update circuit breaker.", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRotateKey = async () => {
    showModal(
      "Confirm Rotation", 
      "Rotate cryptographic shard keys? This will generate a new user share and update the MPC network.",
      "warning",
      {
        isConfirm: true,
        confirmText: "Rotate Shards",
        onConfirm: async () => {
          try {
            setIsProcessing(true);
            await new Promise(r => setTimeout(r, 2000));
            await fetchData();
            showModal("Rotation Complete", "Shard keys rotated successfully.", "success");
          } finally {
            setIsProcessing(false);
          }
        }
      }
    );
  };

  const handleEmergencyWithdrawal = async () => {
    showModal(
      "Emergency Protocol",
      "⚠️ ENTER THREAT DATA\nPlease provide a reason to trigger global circuit breaker:",
      "error",
      {
        isPrompt: true,
        placeholder: "e.g. Protocol exploit detected on Aave...",
        confirmText: "Trigger Lockdown",
        onConfirm: async (reason) => {
          if (!reason) return;
          try {
            setIsProcessing(true);
            const result = await api.post('/agents/emergency-response/', {
              threat_data: { reason }
            });
            showModal("Lockdown Active", `Emergency response activated: ${result.status}`, "error");
            await fetchData();
          } catch (error) {
            showModal("Protocol Failure", "Failed to trigger emergency response.", "error");
          } finally {
            setIsProcessing(false);
          }
        }
      }
    );
  };

  const handleResetSystem = async () => {
    showModal(
      "System Reset",
      "Are you sure you want to reset emergency state and reactivate all agents?",
      "info",
      {
        isConfirm: true,
        confirmText: "Reset System",
        onConfirm: async () => {
          try {
            setIsProcessing(true);
            await api.delete('/agents/emergency-response/');
            await fetchData();
            showModal("System Restored", "System reset complete. Agents reactivated.", "success");
          } catch (error) {
            showModal("Reset Failed", "Failed to reset system.", "error");
          } finally {
            setIsProcessing(false);
          }
        }
      }
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-primary animate-spin" />
      </div>
    );
  }

  const isSystemPaused = stats?.active_agents === 0 && stats?.total_agents > 0;

  return (
    <SidebarProvider defaultOpen={false}>
      <JanusSidebar />
      <SidebarInset>
        <div className="bg-background text-on-surface font-body selection:bg-primary/30 min-h-screen">
          <JanusHeader title="Security Center" />

          <div className="pt-8 px-6 pb-20 max-w-6xl w-full mx-auto space-y-8">
            
            {/* System Status Banner */}
            <section className={`p-4 rounded-sm border flex items-center justify-between transition-all duration-500 ${isSystemPaused ? 'bg-error/10 border-error/30' : 'bg-primary/5 border-primary/20'}`}>
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${isSystemPaused ? 'bg-error text-on-error animate-pulse' : 'bg-primary text-on-primary'}`}>
                  {isSystemPaused ? <AlertTriangle size={20} /> : <ShieldCheck size={20} />}
                </div>
                <div>
                  <h3 className={`text-sm font-bold uppercase tracking-widest ${isSystemPaused ? 'text-error' : 'text-primary'}`}>
                    {isSystemPaused ? 'EMERGENCY LOCKDOWN ACTIVE' : 'SYSTEM STATUS: SECURE'}
                  </h3>
                  <p className="text-[10px] font-mono text-on-surface-variant uppercase tracking-tight">
                    {isSystemPaused ? 'All automated agents and signing sessions are currently PAUSED.' : 'All cryptographic shards are synced and monitoring protocols.'}
                  </p>
                </div>
              </div>
              {isSystemPaused && (
                <button 
                  onClick={handleResetSystem}
                  className="px-6 py-2 bg-surface-container-highest hover:bg-white/10 text-white text-[10px] font-bold uppercase tracking-widest rounded-sm border border-white/10 transition-all"
                >
                  Reset & Reactivate
                </button>
              )}
            </section>

            <section className="space-y-2 pt-4">
              <h2 className="text-4xl font-extrabold tracking-tighter text-on-surface font-headline uppercase italic">Security Center</h2>
              <p className="text-on-surface-variant max-w-2xl text-lg font-light leading-relaxed">
                Manage your cryptographic shards and protocol-level circuit breakers.
              </p>
            </section>

            <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Shard A */}
              <div className="bg-surface-container-low border border-outline-variant/10 rounded-sm p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Key size={120} />
                </div>
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-primary/10 rounded-sm flex items-center justify-center border border-primary/20 text-primary">
                      <Key size={24} />
                    </div>
                    <div>
                      <h3 className="font-headline font-bold text-xl uppercase tracking-tight">AI Agent Shard</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`w-2 h-2 rounded-full ${isSystemPaused ? 'bg-error' : 'bg-primary animate-pulse'}`}></span>
                        <span className="text-[10px] font-mono uppercase tracking-widest text-on-surface-variant">{isSystemPaused ? 'PAUSED' : 'Active & Encrypted'}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-center py-2 border-b border-outline-variant/5">
                    <span className="text-xs text-on-surface-variant uppercase tracking-wider">Last Rotation</span>
                    <span className="font-mono text-sm">{stats?.last_key_rotation ? new Date(stats.last_key_rotation).toLocaleString() : 'N/A'}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-xs text-on-surface-variant uppercase tracking-wider">Public Shard Hash</span>
                    <span className="font-mono text-xs text-primary/80 truncate ml-4">0x88f2...7c22</span>
                  </div>
                </div>
                <button 
                  onClick={handleRotateKey}
                  disabled={isProcessing}
                  className="w-full bg-surface-container-highest hover:bg-primary hover:text-on-primary transition-all py-3 font-mono text-xs uppercase font-bold tracking-widest flex items-center justify-center gap-2"
                >
                  {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw size={14} />}
                  Rotate Shard Key
                </button>
              </div>

              {/* Shard B */}
              <div className="bg-surface-container-low border border-outline-variant/10 rounded-sm p-6 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                  <Network size={120} />
                </div>
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-secondary/10 rounded-sm flex items-center justify-center border border-secondary/20 text-secondary">
                      <Network size={24} />
                    </div>
                    <div>
                      <h3 className="font-headline font-bold text-xl uppercase tracking-tight">Ika Network Shard</h3>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`w-2 h-2 rounded-full ${isSystemPaused ? 'bg-error' : 'bg-primary animate-pulse'}`}></span>
                        <span className="text-[10px] font-mono text-primary uppercase tracking-widest">{stats?.mpc_status}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4 mb-8">
                  <div className="bg-surface-container-lowest p-4 rounded-sm">
                    <p className="text-[10px] text-on-surface-variant uppercase mb-1">Active Nodes</p>
                    <p className="font-mono text-2xl font-bold text-secondary">{stats?.shard_health?.active}/{stats?.shard_health?.total}</p>
                  </div>
                  <div className="bg-surface-container-lowest p-4 rounded-sm">
                    <p className="text-[10px] text-on-surface-variant uppercase mb-1">Threshold</p>
                    <p className="font-mono text-2xl font-bold text-secondary">2-of-2</p>
                  </div>
                </div>
                <button className="w-full bg-surface-container-highest hover:bg-secondary hover:text-on-secondary transition-all py-3 font-mono text-xs uppercase font-bold tracking-widest">
                  View Network Nodes
                </button>
              </div>
            </section>

            {/* Circuit Breakers */}
            <section className="bg-surface-container rounded-sm border border-outline-variant/5 overflow-hidden">
              <div className="px-8 py-6 border-b border-outline-variant/5 bg-surface-container-high/30">
                <h3 className="text-xl font-headline font-bold uppercase tracking-tight">Circuit Breakers</h3>
                <p className="text-xs text-on-surface-variant uppercase mt-1 tracking-widest">Monitored Liquidity Protocols</p>
              </div>
              <div className="divide-y divide-outline-variant/5">
                {['Aave V3', 'Uniswap V3', 'Ondo Finance'].map((protocol) => {
                  const isBlocked = profile?.excluded_protocols?.includes(protocol);
                  return (
                    <div key={protocol} className="grid grid-cols-12 items-center px-8 py-6 hover:bg-surface-container-high/50 transition-all group">
                      <div className="col-span-4 flex items-center gap-4">
                        <div className={`w-10 h-10 rounded flex items-center justify-center ${isBlocked ? 'bg-error/10 text-error' : 'bg-primary/10 text-primary'}`}>
                          {isBlocked ? <Lock size={20} /> : <ShieldCheck size={20} />}
                        </div>
                        <p className="font-headline font-bold text-lg">{protocol}</p>
                      </div>
                      <div className="col-span-4">
                        <div className="flex items-center gap-2">
                          <div 
                            className={`w-10 h-5 rounded-full relative cursor-pointer transition-all ${isBlocked ? 'bg-surface-container-highest' : 'bg-primary/20'}`}
                            onClick={() => handleToggleBreaker(protocol)}
                          >
                            <div className={`absolute top-1 w-3 h-3 bg-primary rounded-full transition-all ${isBlocked ? 'left-1 grayscale' : 'right-1'}`}></div>
                          </div>
                          <span className={`text-xs font-mono uppercase ${isBlocked ? 'text-on-surface-variant' : 'text-primary'}`}>
                            {isBlocked ? 'BLOCKED' : 'MONITORING'}
                          </span>
                        </div>
                      </div>
                      <div className="col-span-4 text-right text-[10px] font-mono text-on-surface-variant">
                        {isBlocked ? 'VAULT ACCESS RESTRICTED' : 'REAL-TIME SYNC ACTIVE'}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Emergency Area */}
            <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-20">
              <div className="lg:col-span-1 bg-surface-container-low border border-outline-variant/10 rounded-sm p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-5"><RefreshCw size={80} /></div>
                <div className="flex items-center gap-2 mb-6">
                  <RefreshCw className="text-primary" size={18} />
                  <h3 className="font-headline font-bold uppercase tracking-tight text-sm">Sentiment Intel</h3>
                </div>
                <div className="space-y-4">
                  <div className="p-3 bg-surface-container rounded-sm border-l-2 border-primary/50 text-[10px] italic leading-snug">
                    "Low risk detected in Sui Network TVL flow."
                  </div>
                  <div className="p-3 bg-surface-container rounded-sm border-l-2 border-secondary/50 text-[10px] italic leading-snug">
                    "Social sentiment stable for active LP positions."
                  </div>
                </div>
              </div>

              <div className={`lg:col-span-2 p-8 rounded-sm relative overflow-hidden border transition-all duration-500 ${isSystemPaused ? 'bg-error/20 border-error/40' : 'bg-surface-container-low border-error/20'}`}>
                <div className="absolute inset-0 bg-gradient-to-br from-error/5 to-transparent pointer-events-none"></div>
                <div className="flex items-center gap-3 mb-8">
                  <div className="p-3 bg-error/10 border border-error/30 rounded-sm text-error">
                    <ShieldAlert size={32} />
                  </div>
                  <div>
                    <h3 className="font-headline font-black text-2xl uppercase tracking-tighter text-error italic">Emergency Protocol</h3>
                    <p className="text-xs text-on-surface-variant font-mono uppercase tracking-widest">Global Fail-Safe mechanism</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-4">
                  <div className="space-y-4">
                    <label className="text-[10px] text-on-surface-variant uppercase tracking-widest block">Masked Recovery Address</label>
                    <div className="p-3 bg-surface-container-lowest rounded-sm border border-outline-variant/10 font-mono text-xs text-on-surface">
                      {profile?.recovery_address ? `${profile.recovery_address.slice(0,8)}...${profile.recovery_address.slice(-6)}` : 'NOT CONFIGURED'}
                    </div>
                  </div>
                  <div className="flex flex-col justify-center gap-4">
                    {!isSystemPaused ? (
                      <button
                        onClick={handleEmergencyWithdrawal}
                        disabled={isProcessing}
                        className="group w-full bg-error text-on-error font-mono text-sm font-black py-4 px-6 rounded-sm hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(255,77,77,0.3)]"
                      >
                        {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <AlertTriangle size={18} />}
                        TRIGGER LOCKDOWN
                      </button>
                    ) : (
                      <button
                        onClick={handleResetSystem}
                        disabled={isProcessing}
                        className="w-full bg-primary text-on-primary font-mono text-sm font-black py-4 px-6 rounded-sm hover:brightness-110 transition-all flex items-center justify-center gap-2 shadow-[0_4px_15px_rgba(68,237,183,0.3)]"
                      >
                        {isProcessing ? <Loader2 className="w-5 h-5 animate-spin" /> : <RefreshCw size={18} />}
                        REACTIVATE SYSTEM
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default SecurityCenter;
