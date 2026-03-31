import { Link } from 'react-router-dom';
import React from 'react';
import RadialOrbitalTimeline from '@/components/ui/RadialOrbitalTimeline';
import FooterSection from '@/components/ui/Footer';
import { Brain, Shield, BadgeCheck, Cpu, Lock, Zap } from 'lucide-react';

const timelineData = [
  {
    id: 1,
    title: "AI Assistant",
    date: "The Brain",
    content: "Neural execution engine translating intent into atomic transactions with high fidelity.",
    category: "Core",
    icon: Brain,
    relatedIds: [2, 3],
    status: "completed",
    energy: 100,
  },
  {
    id: 2,
    title: "Sharded Sentry",
    date: "The Bodyguard",
    content: "Distributed multi-sig validation protecting every outbound flow across the agentic web.",
    category: "Security",
    icon: Shield,
    relatedIds: [1, 3],
    status: "completed",
    energy: 95,
  },
  {
    id: 3,
    title: "ZK-Passport",
    date: "The ID",
    content: "Privacy-preserving compliance through zero-knowledge proofs, securing institutional footprints.",
    category: "Identity",
    icon: BadgeCheck,
    relatedIds: [1, 2],
    status: "completed",
    energy: 90,
  },
  {
    id: 4,
    title: "Atomic Multi-Sig",
    date: "The Protocol",
    content: "Cryptographically sharded approval mechanism for high-stakes autonomous finance.",
    category: "Protocol",
    icon: Lock,
    relatedIds: [2],
    status: "in-progress",
    energy: 85,
  },
  {
    id: 5,
    title: "Inference Engine",
    date: "The Edge",
    content: "Ultra-low latency inference for real-time transaction validation and execution.",
    category: "Execution",
    icon: Cpu,
    relatedIds: [1, 4],
    status: "in-progress",
    energy: 80,
  },
];

const Landing = () => {
  return (
    <div className="font-body text-on-surface antialiased bg-background min-h-screen">
      {/* Top Navigation Shell */}
      <header className="fixed top-0 w-full z-50 bg-[#121315]/80 backdrop-blur-xl">
        <nav className="flex justify-between items-center max-w-7xl mx-auto px-6 h-20 relative">
          <div className="text-2xl font-black tracking-tighter text-[#00D09C]">JANUS</div>
          <div className="hidden md:flex items-center gap-8 font-['Inter'] tracking-tight font-medium text-sm">
            <Link to="/dashboard" ><a className="text-[#bacac1] hover:text-[#44edb7] transition-all duration-300" href="#">Dashboard</a></Link>
            <Link to="/policies"><a className="text-[#bacac1] hover:text-[#44edb7] transition-all duration-300" href="#">Policies</a></Link>
            <Link to="/security"><a className="text-[#bacac1] hover:text-[#44edb7] transition-all duration-300" href="#">Security Center</a></Link>
            <a className="text-[#bacac1] hover:text-[#44edb7] transition-all duration-300 border-b-2 border-[#00D09C] pb-1" href="#">Docs</a>
            <Link to="/activity"><a className="text-[#bacac1] hover:text-[#44edb7] transition-all duration-300" href="#">Activity</a></Link>
          </div>
          <div className="flex items-center gap-4">
            <button className="hidden lg:block px-4 py-2 text-xs font-mono uppercase tracking-widest text-[#bacac1] hover:text-[#00D09C] transition-all">View GitHub</button>
            <button className="bg-gradient-to-br from-primary to-primary-container text-on-primary px-6 py-2 rounded-sm text-sm font-bold uppercase tracking-tight scale-95 hover:scale-100 transition-transform duration-200">
              Launch App
            </button>
          </div>
          <div className="bg-gradient-to-b from-[#1b1c1e] to-transparent h-[1px] w-full absolute bottom-0 left-0"></div>
        </nav>
      </header>

      <main>
        {/* Full-width Hero Section */}
        <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden">
          {/* The Infinite Grid Background */}
          <div className="absolute inset-0 z-0">
            <div className="absolute inset-0 infinite-grid"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>
          </div>
          <div className="relative z-10 max-w-7xl mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-high border border-outline-variant/20">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-on-surface-variant">v1.0 Protocol Live</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white leading-[1.1]">
                Janus Protocol – <span className="text-primary-container">The Secure Transaction Layer</span> for the Agentic Web
              </h1>
              <p className="text-lg md:text-xl text-on-surface-variant max-w-2xl leading-relaxed">
                Empower your AI agent to automate complex on-chain transactions without sacrificing custody or privacy. A high-fidelity vault for the next generation of autonomous finance.
              </p>
              <div className="flex flex-wrap gap-4 pt-4">
                <button className="bg-gradient-to-r from-primary to-primary-container text-on-primary px-8 py-4 rounded-sm font-bold text-sm uppercase tracking-widest tech-glow soft-spring hover:scale-105">
                  Launch App
                </button>
                <button className="border border-outline-variant/30 text-on-surface px-8 py-4 rounded-sm font-bold text-sm uppercase tracking-widest hover:bg-surface-container-high transition-colors">
                  View GitHub
                </button>
              </div>
              <div className="flex items-center gap-4 pt-8 border-t border-outline-variant/10">
                <div className="flex -space-x-3">
                  <img className="w-10 h-10 rounded-full border-2 border-background object-cover" alt="close-up portrait of professional software engineer with neutral expression and soft studio lighting" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBC-AEurF_cNUvyQg_rjvQ6txghpuvvQLudzuS-26s3QP-nI7FlV8mP3cbs6l1kvrMeCo7vi06NGQ050XrDBN4GR9rpBBDikM9w62AbWfKLPlwcUTPsSMIDmtlHgNwpmxhrtcQa9IWRyDBuhgyKBzYSPb5YgvjRID0OGW5Dmo_bqCQEZ6GiZ5ms7FPh56nvQSAHMbQQaHaNOCFro0dHHCblKg_HLtqalDK6ckbZ9Wj5Cflm-ykpcCLJNepZqzoXcBzBA1hCInvhAoc" />
                  <img className="w-10 h-10 rounded-full border-2 border-background object-cover" alt="smiling tech researcher with glasses in modern office setting with blurred plants in background" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDyyyzrvTk8z38Bq7K4PWCehCx_ywwibqjhWfkEtjHKy-YPLVSuT4vwcXdXDbYc4nvBLaN3o9o-JkQfOYDDPE4v9DmzL3M73vu-ws0YIhDR1DHhS0jWXYRZJ7pdVEWwWy6ox2jdGAH6PWl8LD8YfOY9JzaQWvBzij2EWpVc22x4KzDO7TsfilIaaYj6zjAZHV1_s0LCKZzRrAAFH2igzDxWmpw3cBdXBpPnOwPZ1JCYn8RDNL1Fk2W90EcMIOQjLenMWpgxZ9ggJlU" />
                  <img className="w-10 h-10 rounded-full border-2 border-background object-cover" alt="confident developer looking at camera with shallow depth of field and warm natural lighting" src="https://lh3.googleusercontent.com/aida-public/AB6AXuADPtgdLKDnOq_W36xr1lzt1638MKaNhPXuMRH_3GaZ9nEZIOW_Af5-v6s4HI21xJjQLZpGSN2fEUhlXIpI2zB1ZsRjI3TBuVmG-1vhPTU0aFCtjg99qGFVnCD_rKKDKtRxhoXfFWYNnuT-mTeik2--GApDE9xUFiXAVJDufzJaR_bcP7wZjKc8QciEqS83CcSKfratzM9cZ432IHuHapGSr9fzLik3pIoOoLC5j06uPwuTEyNVbRmjC7tqbhSNE5nJl8Tcqxy2wek" />
                </div>
                <p className="text-xs font-mono text-on-surface-variant uppercase tracking-widest">Trusted by <span className="text-primary">200+</span> researchers &amp; developers</p>
              </div>
            </div>
            {/* Abstract Visual for Hero */}
            <div className="lg:col-span-5 hidden lg:block relative">
              <div className="relative w-full aspect-square glass-panel rounded-xl border border-outline-variant/15 p-8 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/5 to-transparent"></div>
                <div className="relative w-48 h-48 border-2 border-primary/20 rounded-full flex items-center justify-center animate-[spin_10s_linear_infinite]">
                  <div className="w-32 h-32 border border-primary/40 rounded-full flex items-center justify-center animate-[spin_5s_linear_infinite_reverse]">
                    <div className="w-16 h-16 bg-primary/20 rounded-full blur-xl"></div>
                  </div>
                </div>
                <span className="material-symbols-outlined absolute text-primary text-6xl" style={{ fontVariationSettings: "'FILL' 1" }}>security</span>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section: RadialOrbitalTimeline */}
        <section className="py-24 bg-surface-container-low relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 text-center mb-12 relative z-10">
            <h2 className="text-xs font-mono uppercase tracking-[0.4em] text-primary mb-4">The Core Innovation</h2>
            <h3 className="text-4xl md:text-5xl font-black text-white tracking-tighter">Janus changes the game with three breakthrough layers</h3>
          </div>
          
          <div className="max-w-7xl mx-auto h-[600px] relative">
            <RadialOrbitalTimeline timelineData={timelineData} />
          </div>
        </section>

        {/* Scenarios Section: Gallery4 */}
        <section className="py-32 bg-background overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 mb-16">
            <div className="flex flex-col md:flex-row justify-between items-end gap-6">
              <div className="max-w-2xl">
                <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-4">Real-World Scenarios</h2>
                <p className="text-on-surface-variant text-lg leading-relaxed">See how Janus protects your assets while maximizing yield through autonomous agentic logic.</p>
              </div>
              <div className="flex gap-4">
                <button className="w-12 h-12 rounded-full border border-outline-variant/20 flex items-center justify-center text-white hover:bg-surface-container-high transition-colors">
                  <span className="material-symbols-outlined">arrow_back</span>
                </button>
                <button className="w-12 h-12 rounded-full border border-primary/40 flex items-center justify-center text-primary hover:bg-primary/10 transition-colors">
                  <span className="material-symbols-outlined">arrow_forward</span>
                </button>
              </div>
            </div>
          </div>
          <div className="flex md:justify-center gap-8 px-6 overflow-x-auto no-scrollbar pb-12">
            {/* Card 1 */}
            <div className="flex-none w-[350px] md:w-[450px] group">
              <div className="relative h-[500px] rounded-sm overflow-hidden mb-6 bg-surface-container">
                <img className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt="high-tech digital trading chart with green and red data points glowing against a dark blue background" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDHg4BGkW-hyydcLpzbesp8rHrLeav-6o8xL9pEE8NSmU07tdnLZFrVgGdEG-cjt71_6xl5YU1EunLh6vPMI21BwTAgEX7Rnf73gL1yj7T2OwUnb8BFFvDBVyVfqUdvpUxZfrdmTPgC52df8NJXhjowxOZzQrsB6hTohJ6S8LaIV1f3FmByTbAK73D6zu54MgWUrZMb-3uxh5X4cEYm-qC5uxXVfeIaSDgJGCMCQXXC_fqZhyDOsAOtVm7FkHxhcT1CjwV4s68G_n8" />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent"></div>
                <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute bottom-0 left-0 p-8">
                  <h5 className="text-2xl font-bold text-white mb-2">Set and Forget Yield Hunter</h5>
                  <p className="text-on-surface-variant text-sm line-clamp-2">Automate complex yield farming strategies with dynamic risk parameters and auto-compounding features.</p>
                </div>
              </div>
            </div>
            {/* Card 2 */}
            <div className="flex-none w-[350px] md:w-[450px] group">
              <div className="relative h-[500px] rounded-sm overflow-hidden mb-6 bg-surface-container">
                <img className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt="abstract close-up of high-speed server hardware with green led status lights in a dark data center" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBp13QeGKG0A1VaF6Z4GivzW2Z85OvlbkZu3RQyLXV79LROqEtRQfHWQXcOdLYq5RZNKdPapxxHdQuLm5I2ZNwYq1Ipl6V77ysbzWBP2irdLppwuxlpMSFu8OEZuEieUdNUO1Mtwn4_7wHp-RJpgG_NYcSjTMthaGmTYQw6xd-IBd2laANUR6W7c14WRFTfGS3NXIzPJq6ZDqAwge7IliH0k0RIQ0JzS7Hb_rAXxGQS0DYPCvJQUfTk59jdPHZg68cqdPYYzC76O8s" />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent"></div>
                <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute bottom-0 left-0 p-8">
                  <h5 className="text-2xl font-bold text-white mb-2">Emergency Circuit Breaker</h5>
                  <p className="text-on-surface-variant text-sm line-clamp-2">Automatic withdrawal on protocol exploit detection. Your agent stays vigilant 24/7/365.</p>
                </div>
              </div>
            </div>
            {/* Card 3 */}
            <div className="flex-none w-[350px] md:w-[450px] group">
              <div className="relative h-[500px] rounded-sm overflow-hidden mb-6 bg-surface-container">
                <img className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" alt="futuristic digital identity visualization with geometric mesh patterns and blue neon glows" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCr8j_pU1B9XVuMfWuchbH36YL4d_zWXYS5yRosjBxwPz6m34acq1VeKfUqdxDKKoa9XncWHb1bzdzv6w7X6VgOBDNf-eKSHtf45KMKGCG1fA8xIpvcK-s_mfgeP1BMjvpd3FWSf1FOEllxeR8cXs644xByYL9A3roImkMdZ9LH9B-FHT7lBKD_P7YMZKGCKPphjR_NcoBw9dfIAAWCsOZXBxBjy10N6i0SXOdfgcJWPr4vekhWTjH3HrCn2uwebP3WJ5Rq_hFH9B4" />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent"></div>
                <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <div className="absolute bottom-0 left-0 p-8">
                  <h5 className="text-2xl font-bold text-white mb-2">Institutional Passport</h5>
                  <p className="text-on-surface-variant text-sm line-clamp-2">Private on-chain identity for compliance. Secure your institutional footprint without exposing data.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Technical Specs / Bento Grid Section */}
        <section className="py-24 bg-surface-container-low border-y border-outline-variant/10">
          <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="md:col-span-2 bg-surface-container p-8 rounded-sm relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 text-primary/10 group-hover:text-primary/20 transition-colors">
                <span className="material-symbols-outlined text-9xl">lock</span>
              </div>
              <div className="relative z-10">
                <p className="font-mono text-xs text-primary mb-4 uppercase tracking-[0.2em]">Security Protocol</p>
                <h4 className="text-3xl font-bold text-white mb-4">Atomic Multi-Sig 2.0</h4>
                <p className="text-on-surface-variant max-w-sm">Every agent action requires cryptographically sharded approval from your personal sentry network.</p>
              </div>
            </div>
            <div className="bg-surface-container-highest p-8 rounded-sm flex flex-col justify-between">
              <span className="material-symbols-outlined text-primary text-4xl mb-4">bolt</span>
              <div>
                <h4 className="text-lg font-bold text-white mb-2 font-mono">1.2ms</h4>
                <p className="text-xs text-on-surface-variant uppercase tracking-widest">Inference Latency</p>
              </div>
            </div>
            <div className="bg-surface-container-highest p-8 rounded-sm flex flex-col justify-between">
              <span className="material-symbols-outlined text-primary text-4xl mb-4">verified_user</span>
              <div>
                <h4 className="text-lg font-bold text-white mb-2 font-mono">100%</h4>
                <p className="text-xs text-on-surface-variant uppercase tracking-widest">Privacy Proofs</p>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer Shell */}
      <FooterSection />
    </div>
  );
};

export default Landing;