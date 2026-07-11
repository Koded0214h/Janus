import React, { useState, useEffect } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/Sidebar";
import { JanusSidebar } from "@/components/JanusSidebar";
import { JanusHeader } from "@/components/JanusHeader";
import api from "@/lib/api";
import { Loader2, Check, Bot } from "lucide-react";
import { useModal } from "@/context/ModalContext";

const AIAgents = () => {
  const { showModal } = useModal();
  const [agents, setAgents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // New agent form state
  const [agentName, setAgentName] = useState("");
  const [agentType, setAgentType] = useState("YIELD_FARMER");
  const [agentDescription, setAgentDescription] = useState("");
  const [isDeploying, setIsDeploying] = useState(false);

  const fetchAgents = async () => {
    try {
      setIsLoading(true);
      const data = await api.get('/agents/agents/');
      setAgents(Array.isArray(data) ? data : data.results || []);
    } catch (error) {
      console.error("Failed to fetch agents:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
    const interval = setInterval(fetchAgents, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleDeployAgent = async () => {
    if (!agentName) {
      showModal("Validation Error", "Agent name is required.", "warning");
      return;
    }

    try {
      setIsDeploying(true);
      await api.post('/agents/agents/', {
        name: agentName,
        agent_type: agentType,
        description: agentDescription,
        config: {
          ai_model: 'gemini-2.5-flash'
        }
      });
      // Reset form
      setAgentName("");
      setAgentDescription("");
      showModal("Success", "Agent node deployed and dWallet provisioned.", "success");
      fetchAgents();
    } catch (error) {
      console.error("Failed to deploy agent:", error);
      showModal("Deployment Failed", "Failed to deploy agent. DKG flow may have failed.", "error");
    } finally {
      setIsDeploying(false);
    }
  };

  const toggleAgentActive = async (agent) => {
    try {
      const endpoint = `/agents/agents/${agent.id}/${agent.is_active ? 'deactivate' : 'activate'}/`;
      await api.post(endpoint);
      fetchAgents();
    } catch (error) {
      showModal("Status Error", "Failed to toggle agent status.", "error");
    }
  };

  return (
    <SidebarProvider defaultOpen={false}>
      <JanusSidebar />
      <SidebarInset>
        <div className="bg-background text-on-surface font-body min-h-screen">
          <JanusHeader title="AI Agents" />

          <main className="pt-8 px-6 pb-12 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
              <div className="max-w-2xl">
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-2 py-0.5 bg-secondary/10 text-secondary text-[10px] font-mono rounded border border-secondary/20 uppercase">
                    MPC Sharding Active
                  </span>
                </div>
                <h1 className="text-5xl font-black font-headline tracking-tighter text-on-surface mb-4">
                  AI Agents
                </h1>
                <p className="text-on-surface-variant text-lg leading-relaxed">
                  Manage your autonomous agent instances. Each agent owns a unique dWallet secured by Ika Network's multi-party computation.
                </p>
              </div>
            </div>

            {/* Agent Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
              {isLoading ? (
                <div className="col-span-full py-20 flex justify-center"><Loader2 className="w-12 h-12 text-primary animate-spin" /></div>
              ) : agents.map((agent) => (
                <div
                  key={agent.id}
                  className="bg-surface-container p-6 rounded-lg relative overflow-hidden group border border-outline-variant/5 hover:border-primary/20 transition-all duration-300"
                >
                  <div className="absolute top-0 right-0 p-4">
                    {agent.is_active ? (
                      <span className="flex h-3 w-3 relative">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
                      </span>
                    ) : (
                      <span className="relative inline-flex rounded-full h-3 w-3 bg-on-surface-variant/30"></span>
                    )}
                  </div>
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-16 h-16 rounded-sm bg-surface-container-low overflow-hidden border border-outline-variant/20 flex items-center justify-center">
                      <span className="material-symbols-outlined text-4xl text-primary">smart_toy</span>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-on-surface tracking-tight truncate max-w-[150px]">{agent.name}</h3>
                      <p className="text-primary font-mono text-xs uppercase tracking-widest">
                        {agent.agent_type.replace('_', ' ')}
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4 mb-8">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-on-surface-variant">dWallet ID</span>
                      <span className="font-mono text-on-surface text-[10px]">{agent.dwallet_id ? `${agent.dwallet_id.slice(0,6)}...${agent.dwallet_id.slice(-4)}` : 'PROVISIONING...'}</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-on-surface-variant">Success Rate</span>
                      <span className="font-mono text-on-surface">{agent.performance_rate?.toFixed(1) || 0}%</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between border-t border-outline-variant/10 pt-6">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-mono ${agent.is_active ? "text-primary" : "text-on-surface-variant"}`}>
                        {agent.is_active ? "ACTIVE" : "PAUSED"}
                      </span>
                      <div
                        className={`w-10 h-5 rounded-full relative p-1 cursor-pointer transition-all ${agent.is_active ? "bg-primary/20" : "bg-surface-container-highest"}`}
                        onClick={() => toggleAgentActive(agent)}
                      >
                        <div className={`w-3 h-3 bg-primary rounded-full absolute top-1 transition-all ${agent.is_active ? "right-1" : "left-1"}`}></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {!isLoading && agents.length === 0 && (
                <div className="col-span-full py-20 text-center text-on-surface-variant bg-surface-container-low border border-dashed border-outline-variant/30">
                  <p>No agents deployed. Start by configuring a new AI Sentinel below.</p>
                </div>
              )}
            </div>

            {/* Creation Section */}
            <div className="bg-surface-container-low p-8 rounded-xl border border-outline-variant/10 shadow-2xl">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-8 h-1 bg-primary rounded-full"></div>
                <h2 className="text-2xl font-bold tracking-tight">Deploy New Agent Node</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-widest text-on-surface-variant mb-2">Agent Name</label>
                    <input
                      className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded px-4 py-3 text-on-surface focus:border-primary outline-none font-mono text-sm"
                      type="text"
                      value={agentName}
                      onChange={(e) => setAgentName(e.target.value)}
                      placeholder="e.g. Yield Guardian"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-widest text-on-surface-variant mb-2">Agent Type</label>
                    <select
                      className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded px-4 py-3 text-on-surface outline-none"
                      value={agentType}
                      onChange={(e) => setAgentType(e.target.value)}
                    >
                      <option value="YIELD_FARMER">Yield Farmer</option>
                      <option value="REBALANCER">Portfolio Rebalancer</option>
                      <option value="SENTRY">Security Sentry</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-widest text-on-surface-variant mb-2">Description</label>
                    <textarea
                      className="w-full bg-surface-container-lowest border border-outline-variant/20 rounded px-4 py-3 text-on-surface outline-none resize-none h-32"
                      value={agentDescription}
                      onChange={(e) => setAgentDescription(e.target.value)}
                      placeholder="Describe the agent's core mission..."
                    ></textarea>
                  </div>
                  <button
                    onClick={handleDeployAgent}
                    disabled={isDeploying}
                    className="w-full bg-gradient-to-br from-primary to-primary-container text-on-primary-container font-black py-4 rounded transition-all hover:shadow-[0_0_30px_rgba(0,208,156,0.2)] uppercase tracking-tighter flex items-center justify-center gap-2"
                  >
                    {isDeploying && <Loader2 className="w-5 h-5 animate-spin" />}
                    {isDeploying ? "PROVISIONING dWALLET..." : "Deploy Agent Node"}
                  </button>
                </div>
              </div>
            </div>
          </main>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default AIAgents;
