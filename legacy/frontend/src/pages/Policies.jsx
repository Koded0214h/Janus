import React, { useState, useEffect } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/Sidebar";
import { JanusSidebar } from "@/components/JanusSidebar";
import { JanusHeader } from "@/components/JanusHeader";
import api from "@/lib/api";
import { Loader2 } from "lucide-react";
import { useModal } from "@/context/ModalContext";

const Policies = () => {
  const { showModal } = useModal();
  // State for tabs
  const [activeTab, setActiveTab] = useState("active");
  const [intents, setIntents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [agents, setAgents] = useState([]);

  // State for new policy form
  const [policyIntent, setPolicyIntent] = useState("");
  const [intentType, setIntentType] = useState("PORTFOLIO_REBALANCE");
  const [securityLevel, setSecurityLevel] = useState("Standard Execution");
  const [priority, setPriority] = useState("Medium (12s)");
  const [previewData, setPreviewData] = useState(null);
  const [isParsing, setIsParsing] = useState(false);

  const fetchIntents = async () => {
    try {
      setIsLoading(true);
      const intentsData = await api.get('/agents/intents/');
      // Handle DRF pagination
      setIntents(Array.isArray(intentsData) ? intentsData : intentsData.results || []);
      
      const agentsData = await api.get('/agents/agents/');
      setAgents(Array.isArray(agentsData) ? agentsData : agentsData.results || []);
    } catch (error) {
      console.error("Failed to fetch intents:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchIntents();
    const interval = setInterval(fetchIntents, 10000);
    return () => clearInterval(interval);
  }, []);

  // Debounced preview parsing
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (policyIntent.length > 10) {
        try {
          setIsParsing(true);
          const data = await api.post('/agents/intents/preview_parse/', {
            natural_language: policyIntent,
            intent_type: intentType
          });
          setPreviewData(data);
        } catch (error) {
          console.error("Parsing failed:", error);
        } finally {
          setIsParsing(false);
        }
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [policyIntent, intentType]);

  const togglePolicy = async (intent) => {
    try {
      const endpoint = `/agents/intents/${intent.id}/${intent.is_active ? 'pause' : 'activate'}/`;
      await api.post(endpoint);
      fetchIntents();
    } catch (error) {
      showModal("Update Failed", "Failed to update policy status. Ensure the agent is active.", "error");
    }
  };

  const handleDeployPolicy = async () => {
    if (agents.length === 0) {
      showModal("Missing Agent", "Please create an AI Agent first.", "warning");
      return;
    }

    try {
      setIsLoading(true);
      await api.post('/agents/intents/', {
        agent_id: agents[0].id,
        intent_type: intentType,
        natural_language: policyIntent,
        execution_frequency: priority.includes('Flash') ? 'ON_DEMAND' : 'DAILY'
      });
      setPolicyIntent("");
      setPreviewData(null);
      setActiveTab("active");
      showModal("Policy Deployed", "Your autonomous policy is now active.", "success");
      fetchIntents();
    } catch (error) {
      console.error("Failed to deploy policy:", error);
      showModal("Deployment Failed", "Failed to deploy policy.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SidebarProvider defaultOpen={false}>
      <JanusSidebar />
      <SidebarInset>
        <div className="bg-background text-on-surface font-body overflow-x-hidden selection:bg-primary/30 min-h-screen">
          <JanusHeader title="Policies" />

          <div className="p-8 max-w-6xl mx-auto">
            <div className="mb-10">
              <h2 className="text-4xl font-black tracking-tighter text-on-surface mb-2 uppercase">
                Policies
              </h2>
              <p className="text-on-surface-variant max-w-2xl text-lg leading-relaxed">
                Define the granular rules your AI agent must follow. Policies act as the immutable
                constraints for automated capital movement and protocol interactions.
              </p>
            </div>

            <div className="flex items-center gap-8 mb-8 border-b border-outline-variant/10">
              <button
                onClick={() => setActiveTab("active")}
                className={`pb-4 font-bold uppercase tracking-widest text-sm ${
                  activeTab === "active" ? "text-primary border-b-2 border-primary" : "text-on-surface-variant"
                }`}
              >
                Active Policies
              </button>
              <button
                onClick={() => setActiveTab("templates")}
                className={`pb-4 font-bold uppercase tracking-widest text-sm ${
                  activeTab === "templates" ? "text-primary border-b-2 border-primary" : "text-on-surface-variant"
                }`}
              >
                Policy Templates
              </button>
              <button
                onClick={() => setActiveTab("create")}
                className={`pb-4 font-bold uppercase tracking-widest text-sm flex items-center gap-2 ${
                  activeTab === "create" ? "text-primary border-b-2 border-primary" : "text-on-surface-variant"
                }`}
              >
                <span className="material-symbols-outlined text-lg">add</span>
                Create New
              </button>
            </div>

            {activeTab === "active" && (
              <>
                {isLoading ? (
                  <div className="flex justify-center py-20">
                    <Loader2 className="w-12 h-12 text-primary animate-spin" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
                    {intents.map((intent) => (
                      <div key={intent.id} className="bg-surface-container-low p-6 rounded-sm border border-outline-variant/10 hover:border-primary/30 transition-all group relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-2 opacity-10">
                          <span className="material-symbols-outlined text-6xl">payments</span>
                        </div>
                        <div className="flex justify-between items-start mb-4">
                          <div className="p-2 bg-primary/10 rounded-sm">
                            <span className="material-symbols-outlined text-primary">
                              {intent.intent_type.includes('YIELD') ? 'trending_up' : 'balance'}
                            </span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-10 h-5 rounded-full relative cursor-pointer shadow-[0_0_8px_rgba(68,237,183,0.4)] ${
                                intent.is_active ? "bg-primary" : "bg-surface-container-highest"
                              }`}
                              onClick={() => togglePolicy(intent)}
                            >
                              <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full transition-all ${intent.is_active ? "right-0.5" : "left-0.5"}`}></div>
                            </div>
                          </div>
                        </div>
                        <h3 className="text-lg font-bold text-on-surface mb-2 uppercase tracking-tight truncate">
                          {intent.natural_language.split('.')[0]}
                        </h3>
                        <p className="text-sm text-on-surface-variant mb-6 font-mono bg-surface-container-lowest p-3 rounded-sm leading-relaxed line-clamp-3 h-24">
                          {intent.natural_language}
                        </p>
                        <div className="flex justify-between items-center pt-4 border-t border-outline-variant/10">
                          <div className="flex gap-2">
                            <button 
                              onClick={() => {
                                if (intent.is_active) {
                                  api.post(`/agents/intents/${intent.id}/execute/`).then(() => {
                                    showModal("Execution Success", "Intent execution triggered successfully.", "success");
                                    fetchIntents();
                                  }).catch(e => showModal("Execution Failed", "Failed to trigger intent execution.", "error"));
                                } else {
                                  showModal("Policy Inactive", "Activate the policy first.", "warning");
                                }
                              }}
                              className="px-3 py-1 bg-primary/20 hover:bg-primary/40 text-primary text-[10px] font-bold uppercase tracking-widest rounded-sm border border-primary/30 transition-all"
                            >
                              Execute Now
                            </button>
                          </div>
                          <div className="font-mono text-primary text-sm font-bold uppercase">{intent.status}</div>
                        </div>
                      </div>
                    ))}
                    {intents.length === 0 && (
                      <div className="col-span-full py-20 flex flex-col items-center justify-center text-center text-on-surface-variant bg-surface-container-low border border-dashed border-outline-variant/30 rounded-sm">
                        <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center mb-4">
                          <span className="material-symbols-outlined text-primary/40 text-3xl">policy</span>
                        </div>
                        <p className="text-lg font-medium text-on-surface mb-2">No active policies found</p>
                        <p className="max-w-xs mb-8 text-sm">You haven't defined any automated rules for your AI agent yet.</p>
                        <button 
                          onClick={() => setActiveTab("create")}
                          className="px-8 py-3 bg-primary text-on-primary font-bold uppercase tracking-widest text-xs rounded-sm hover:opacity-90 transition-all active:scale-95 shadow-[0_0_20px_rgba(68,237,183,0.2)]"
                        >
                          Create Your First Policy
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}

            {activeTab === "templates" && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div 
                  className="bg-surface-container flex rounded-sm overflow-hidden border border-outline-variant/10 group cursor-pointer"
                  onClick={() => {
                    setPolicyIntent("Capture the highest yield on my USDC across Ondo Finance and Aave. Minimum threshold 4% APY.");
                    setIntentType("YIELD_FARMING");
                    setActiveTab("create");
                  }}
                >
                  <div className="p-6">
                    <h4 className="text-xl font-bold text-primary mb-2 uppercase">Yield Hunter</h4>
                    <p className="text-on-surface-variant text-sm">Automatically move idle stablecoins across vetted protocols.</p>
                  </div>
                </div>
                <div 
                  className="bg-surface-container flex rounded-sm overflow-hidden border border-outline-variant/10 group cursor-pointer"
                  onClick={() => {
                    setPolicyIntent("Keep 50% of my portfolio in BTC and 50% in ETH. Rebalance whenever the deviation exceeds 5%.");
                    setIntentType("PORTFOLIO_REBALANCE");
                    setActiveTab("create");
                  }}
                >
                  <div className="p-6">
                    <h4 className="text-xl font-bold text-tertiary mb-2 uppercase">Portfolio Rebalancer</h4>
                    <p className="text-on-surface-variant text-sm">Maintain target weightings for your assets automatically.</p>
                  </div>
                </div>
                <div 
                  className="bg-surface-container flex rounded-sm overflow-hidden border border-outline-variant/10 group cursor-pointer"
                  onClick={() => {
                    setPolicyIntent("Open a delta-neutral basis trade on Drift Protocol. Short ETH-PERP to hedge 100% of my spot ETH holdings. Rebalance if hedge ratio deviates by 2%.");
                    setIntentType("BASIS_TRADE");
                    setActiveTab("create");
                  }}
                >
                  <div className="p-6">
                    <h4 className="text-xl font-bold text-primary mb-2 uppercase">Drift Basis Trader</h4>
                    <p className="text-on-surface-variant text-sm">Hedge spot holdings with perps to capture funding rates safely.</p>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "create" && (
              <div className="bg-surface-container-low border border-outline-variant/15 rounded-sm p-8 shadow-2xl relative">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  <div className="space-y-6">
                    <label className="block text-[10px] font-black uppercase text-on-surface-variant mb-3">Define Intent</label>
                    <textarea
                      className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded-sm p-4 text-on-surface font-mono text-sm"
                      rows="6"
                      value={policyIntent}
                      onChange={(e) => setPolicyIntent(e.target.value)}
                      placeholder="Type your intent here..."
                    ></textarea>
                    <div className="grid grid-cols-2 gap-4">
                      <select 
                        className="bg-surface-container-lowest border border-outline-variant/20 p-3 text-xs text-white"
                        value={intentType}
                        onChange={(e) => setIntentType(e.target.value)}
                      >
                        <option value="PORTFOLIO_REBALANCE">Rebalance</option>
                        <option value="YIELD_FARMING">Yield Farming</option>
                        <option value="BASIS_TRADE">Delta-Neutral Basis Trade</option>
                      </select>
                    </div>
                  </div>
                  <div className="bg-surface-container-lowest border border-outline-variant/20 rounded-sm p-6 min-h-[300px]">
                    <div className="text-primary text-[9px] font-black uppercase mb-4">Live Parser {isParsing && "(Parsing...)"}</div>
                    {previewData ? (
                      <pre className="text-xs text-on-surface font-mono whitespace-pre-wrap">
                        {JSON.stringify(previewData, null, 2)}
                      </pre>
                    ) : (
                      <div className="text-on-surface-variant italic text-sm">Waiting for input...</div>
                    )}
                  </div>
                </div>
                <div className="mt-12 flex justify-end gap-4">
                  <button onClick={handleDeployPolicy} disabled={!previewData || isLoading} className="px-12 py-4 bg-primary text-on-primary font-black text-xs uppercase tracking-widest">
                    {isLoading ? "Deploying..." : "Deploy Policy"}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default Policies;
