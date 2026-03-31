import React, { useState } from "react";

const ZKPassport = () => {
  // State for active proofs (static data from HTML)
  const [activeProofs] = useState([
    {
      type: "Human",
      icon: "person",
      verifier: "BlackRock BUIDL Pool",
      issued: "12 Nov 2023",
      expires: "12 Nov 2024",
      status: "active",
    },
    {
      type: "Accredited Investor",
      icon: "workspace_premium",
      verifier: "Aave Institutional",
      issued: "05 Oct 2023",
      expires: "05 Oct 2024",
      status: "active",
    },
    {
      type: "Residency",
      icon: "location_on",
      verifier: "Uniswap V4",
      issued: "20 Jan 2024",
      expires: "20 Jan 2025",
      status: "active",
    },
  ]);

  // Handlers for buttons (example – replace with actual logic)
  const handleViewFullProof = () => {
    console.log("View full proof clicked");
  };

  const handleGenerateProof = (type) => {
    console.log(`Generate proof for: ${type}`);
  };

  const handleRequestCredential = () => {
    console.log("Request new credential");
  };

  const handleRevokeProof = (type) => {
    console.log(`Revoke proof for: ${type}`);
  };

  return (
    <div className="flex h-screen overflow-hidden bg-background text-on-background font-body selection:bg-primary/30">
      {/* SideNavBar */}
      <aside className="hidden md:flex flex-col h-full py-6 bg-background w-64 border-r border-outline-variant/15 shadow-[0_0_15px_rgba(0,208,156,0.1)] z-50">
        <div className="px-6 mb-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary rounded-sm flex items-center justify-center">
              <span className="material-symbols-outlined text-on-primary text-xl">security</span>
            </div>
            <div>
              <h1 className="text-xl font-black text-primary tracking-tighter leading-none">
                Janus Protocol
              </h1>
              <p className="text-[10px] text-on-surface-variant tracking-widest uppercase mt-1">
                The Digital Vault
              </p>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-4 space-y-1">
          <a
            href="#"
            className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:text-primary hover:bg-surface-container transition-all duration-300 rounded-sm"
          >
            <span className="material-symbols-outlined">dashboard</span>
            <span className="text-sm font-medium">Dashboard</span>
          </a>
          <a
            href="#"
            className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:text-primary hover:bg-surface-container transition-all duration-300 rounded-sm"
          >
            <span className="material-symbols-outlined">smart_toy</span>
            <span className="text-sm font-medium">AI Agent</span>
          </a>
          <a
            href="#"
            className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:text-primary hover:bg-surface-container transition-all duration-300 rounded-sm"
          >
            <span className="material-symbols-outlined">policy</span>
            <span className="text-sm font-medium">Policies</span>
          </a>
          <a
            href="#"
            className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:text-primary hover:bg-surface-container transition-all duration-300 rounded-sm"
          >
            <span className="material-symbols-outlined">history</span>
            <span className="text-sm font-medium">Activity</span>
          </a>
          <a
            href="#"
            className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:text-primary hover:bg-surface-container transition-all duration-300 rounded-sm"
          >
            <span className="material-symbols-outlined">security</span>
            <span className="text-sm font-medium">Security Center</span>
          </a>
          {/* Active Tab: ZK Passport */}
          <a
            href="#"
            className="flex items-center gap-3 px-4 py-3 text-primary border-r-2 border-primary bg-surface-container font-bold rounded-sm"
          >
            <span className="material-symbols-outlined">vpn_key</span>
            <span className="text-sm">ZK Passport</span>
          </a>
          <a
            href="#"
            className="flex items-center gap-3 px-4 py-3 text-on-surface-variant hover:text-primary hover:bg-surface-container transition-all duration-300 rounded-sm"
          >
            <span className="material-symbols-outlined">settings</span>
            <span className="text-sm font-medium">Settings</span>
          </a>
        </nav>
        <div className="px-6 mt-auto">
          <div className="p-4 bg-surface-container-low rounded-xl border border-outline-variant/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-primary to-zk-purple p-0.5">
                <img
                  alt="Profile"
                  className="rounded-full bg-surface"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuBL4ngjqplzU2lQEQMnzs2Hb3Z9yAwoSGisVsvBYOdKsCakx3A4hZ5TlRiHvZAbdsE3iHiUq7Sb8pX1C_8FDMyiE-SKzW_SHKFfvAPWJ6GIo0TiIVBqveclAZx_4OIkWybSUlIeIaINylL18xT6zhhF2fhNjyvjnDlZG-2CQjnCkBbI1qOXe4EeLqdU8LHRu8woBlbt5szoJVX3xug211k5ALVvoYM_iilkflRT3icE80dX7CeohHh2XAA_QatB_kIm758IPI1FVxI"
                />
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-on-surface">Vault_0x1...f2</span>
                <span className="text-[10px] text-primary">Secure Connection</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-surface overflow-x-hidden">
        {/* TopNavBar */}
        <header className="w-full h-16 sticky top-0 z-50 bg-background/80 backdrop-blur-xl flex justify-between items-center px-8">
          <div className="flex items-center gap-6 flex-1">
            <div className="relative w-full max-w-md group">
              <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-lg">
                search
              </span>
              <input
                className="w-full bg-surface-container-lowest border-none focus:ring-1 focus:ring-primary/40 rounded-lg pl-10 pr-4 py-2 text-sm font-mono transition-all"
                placeholder="Search protocol data..."
                type="text"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-on-surface-variant hover:text-primary transition-colors">
              <span className="material-symbols-outlined">notifications</span>
            </button>
            <button className="p-2 text-on-surface-variant hover:text-primary transition-colors">
              <span className="material-symbols-outlined">account_balance_wallet</span>
            </button>
            <button className="ml-2 px-6 py-2 bg-gradient-to-r from-primary to-primary-container text-on-primary font-headline font-bold text-xs uppercase tracking-wider rounded-sm active:scale-95 transition-all shadow-[0_0_15px_rgba(0,208,156,0.2)]">
              Connect Wallet
            </button>
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="p-8 max-w-7xl mx-auto w-full space-y-12">
          {/* 1. Header Section */}
          <section className="space-y-2">
            <h2 className="text-4xl md:text-5xl font-black font-headline tracking-tighter text-on-surface">
              ZK Passport
            </h2>
            <p className="max-w-2xl text-on-surface-variant body-md leading-relaxed">
              Prove your credentials without revealing your identity. Generate zero-knowledge proofs
              to access institutional DeFi pools and exclusive protocols.
            </p>
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* 2. Credential Card */}
            <div className="lg:col-span-1">
              <div className="holographic-glow rounded-xl overflow-hidden shadow-2xl spring-hover group">
                <div className="bg-surface-container p-6 h-full relative overflow-hidden">
                  {/* Decoration */}
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-zk-purple/10 blur-3xl rounded-full"></div>
                  <div className="absolute -left-10 -bottom-10 w-32 h-32 bg-primary/10 blur-3xl rounded-full"></div>
                  <div className="relative z-10">
                    <div className="flex items-center justify-between mb-8">
                      <div className="w-12 h-12 bg-surface-container-highest rounded-lg flex items-center justify-center border border-outline-variant/20">
                        <span className="material-symbols-outlined text-primary text-3xl">
                          fingerprint
                        </span>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-bold">
                          Proof ID
                        </p>
                        <p className="font-mono text-xs text-primary">0x71a3...e9f2</p>
                      </div>
                    </div>
                    <h3 className="text-xl font-bold mb-4">Your ZK Passport Status</h3>
                    <div className="flex flex-wrap gap-2 mb-8">
                      <span className="px-2 py-1 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-tighter rounded-sm border border-primary/20">
                        Human
                      </span>
                      <span className="px-2 py-1 bg-primary/10 text-primary text-[10px] font-bold uppercase tracking-tighter rounded-sm border border-primary/20">
                        Accredited Investor
                      </span>
                      <span className="px-2 py-1 bg-zk-purple/10 text-zk-purple text-[10px] font-bold uppercase tracking-tighter rounded-sm border border-zk-purple/20">
                        KYC Verified
                      </span>
                    </div>
                    <div className="space-y-4 pt-4 border-t border-outline-variant/10">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-on-surface-variant">Valid Until</span>
                        <span className="text-sm font-mono font-bold">31 Dec 2024</span>
                      </div>
                      <button
                        onClick={handleViewFullProof}
                        className="w-full py-3 bg-surface-container-highest border border-outline-variant/30 text-on-surface font-headline text-xs font-bold uppercase tracking-widest hover:bg-surface-bright transition-colors rounded-sm group-hover:border-primary/50"
                      >
                        View Full Proof
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Generate New Proof Section */}
            <div className="lg:col-span-2">
              <div className="bg-surface-container-low p-8 rounded-xl border border-outline-variant/5 h-full">
                <div className="mb-8">
                  <h3 className="text-2xl font-bold mb-2">Generate a New Proof</h3>
                  <p className="text-on-surface-variant text-sm">
                    Select a credential to prove without revealing your underlying data.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    onClick={() => handleGenerateProof("Prove Human")}
                    className="group relative p-6 bg-surface-container text-left border border-outline-variant/10 hover:border-primary/40 transition-all rounded-xl overflow-hidden"
                  >
                    <div className="flex flex-col h-full justify-between gap-4">
                      <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">
                        verified_user
                      </span>
                      <span className="font-bold text-lg">Prove Human</span>
                    </div>
                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                      <span className="material-symbols-outlined text-8xl">face</span>
                    </div>
                  </button>

                  <button
                    onClick={() => handleGenerateProof("Prove Accredited Investor")}
                    className="group relative p-6 bg-surface-container text-left border border-outline-variant/10 hover:border-primary/40 transition-all rounded-xl overflow-hidden"
                  >
                    <div className="flex flex-col h-full justify-between gap-4">
                      <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">
                        account_balance
                      </span>
                      <span className="font-bold text-lg">Prove Accredited Investor</span>
                    </div>
                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                      <span className="material-symbols-outlined text-8xl">monetization_on</span>
                    </div>
                  </button>

                  <button
                    onClick={() => handleGenerateProof("Prove Net Worth > $100k")}
                    className="group relative p-6 bg-surface-container text-left border border-outline-variant/10 hover:border-primary/40 transition-all rounded-xl overflow-hidden"
                  >
                    <div className="flex flex-col h-full justify-between gap-4">
                      <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">
                        payments
                      </span>
                      <span className="font-bold text-lg">Prove Net Worth &gt; $100k</span>
                    </div>
                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                      <span className="material-symbols-outlined text-8xl">wallet</span>
                    </div>
                  </button>

                  <button
                    onClick={() => handleGenerateProof("Prove Residency (EU)")}
                    className="group relative p-6 bg-surface-container text-left border border-outline-variant/10 hover:border-primary/40 transition-all rounded-xl overflow-hidden"
                  >
                    <div className="flex flex-col h-full justify-between gap-4">
                      <span className="material-symbols-outlined text-primary group-hover:scale-110 transition-transform">
                        public
                      </span>
                      <span className="font-bold text-lg">Prove Residency (EU)</span>
                    </div>
                    <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-10 transition-opacity">
                      <span className="material-symbols-outlined text-8xl">flag</span>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 4. Active Proofs List */}
          <section className="bg-surface-container-low rounded-xl border border-outline-variant/5 overflow-hidden">
            <div className="p-8 border-b border-outline-variant/10 flex justify-between items-center">
              <h3 className="text-xl font-bold">Active ZK Proofs</h3>
              <div className="flex gap-2">
                <span className="px-3 py-1 bg-surface-container-highest rounded-full text-[10px] font-bold uppercase text-on-surface-variant tracking-wider">
                  3 Active
                </span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-lowest/50">
                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
                      Credential Type
                    </th>
                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
                      Protocol/Verifier
                    </th>
                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
                      Issued
                    </th>
                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
                      Expires
                    </th>
                    <th className="px-8 py-4 text-[10px] font-black uppercase tracking-widest text-on-surface-variant">
                      Status
                    </th>
                    <th className="px-8 py-4 text-right"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/5">
                  {activeProofs.map((proof, idx) => (
                    <tr key={idx} className="hover:bg-surface-container-high/40 transition-colors">
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/5 rounded border border-primary/20">
                            <span className="material-symbols-outlined text-primary text-sm">
                              {proof.icon}
                            </span>
                          </div>
                          <span className="text-sm font-bold">{proof.type}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-sm text-on-surface-variant">{proof.verifier}</span>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-sm font-mono text-on-surface-variant">
                          {proof.issued}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <span className="text-sm font-mono text-on-surface-variant">
                          {proof.expires}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></div>
                          <span className="text-xs font-bold text-primary uppercase tracking-tighter">
                            Active
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-right">
                        <button
                          onClick={() => handleRevokeProof(proof.type)}
                          className="p-2 hover:bg-error/10 hover:text-error text-on-surface-variant transition-all rounded-lg"
                        >
                          <span className="material-symbols-outlined text-lg">cancel</span>
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* 5. Request New Credential Section */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gradient-to-br from-surface-container to-surface-container-low p-10 rounded-xl border border-outline-variant/10 relative overflow-hidden flex flex-col justify-center">
              <div className="relative z-10">
                <h3 className="text-3xl font-bold mb-4">Need a new credential?</h3>
                <p className="text-on-surface-variant mb-8 max-w-sm">
                  Request additional credentials from trusted issuers like Quadrata, EAS, or
                  institutional partners.
                </p>
                <button
                  onClick={handleRequestCredential}
                  className="px-8 py-4 bg-zk-purple text-white font-headline font-bold text-xs uppercase tracking-widest rounded-sm hover:brightness-110 active:scale-95 transition-all shadow-lg shadow-zk-purple/20"
                >
                  Request New Credential
                </button>
              </div>
              <div className="absolute -right-20 -bottom-20 opacity-10">
                <span className="material-symbols-outlined text-[240px]">shield_person</span>
              </div>
            </div>

            <div className="bg-surface-container-low p-10 rounded-xl border border-outline-variant/10 flex flex-col items-center text-center justify-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
                <span className="material-symbols-outlined text-primary text-3xl">hub</span>
              </div>
              <h4 className="text-xl font-bold mb-2">Connect Trusted Issuers</h4>
              <p className="text-on-surface-variant text-sm mb-6 max-w-xs">
                Easily link your existing web2 and web3 identities to generate stronger ZK proofs.
              </p>
              <div className="flex -space-x-3">
                <div
                  className="w-10 h-10 rounded-full bg-surface-container-highest border-2 border-surface flex items-center justify-center"
                  title="Issuer A"
                >
                  <span className="material-symbols-outlined text-xs">token</span>
                </div>
                <div
                  className="w-10 h-10 rounded-full bg-surface-container-highest border-2 border-surface flex items-center justify-center"
                  title="Issuer B"
                >
                  <span className="material-symbols-outlined text-xs">fingerprint</span>
                </div>
                <div
                  className="w-10 h-10 rounded-full bg-surface-container-highest border-2 border-surface flex items-center justify-center"
                  title="Issuer C"
                >
                  <span className="material-symbols-outlined text-xs">account_balance</span>
                </div>
                <div className="w-10 h-10 rounded-full bg-primary/20 border-2 border-surface flex items-center justify-center text-primary text-xs font-bold">
                  +8
                </div>
              </div>
            </div>
          </section>

          {/* Footer / Legal */}
          <footer className="pt-12 pb-8 border-t border-outline-variant/5">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 bg-surface-container-highest rounded flex items-center justify-center">
                  <span className="material-symbols-outlined text-[14px] text-primary">
                    security
                  </span>
                </div>
                <span className="text-xs text-on-surface-variant font-mono">
                  Janus Protocol © 2024. Zero-Knowledge Cryptography Enabled.
                </span>
              </div>
              <div className="flex gap-8">
                <a
                  href="#"
                  className="text-[10px] uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors"
                >
                  Documentation
                </a>
                <a
                  href="#"
                  className="text-[10px] uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors"
                >
                  Privacy Policy
                </a>
                <a
                  href="#"
                  className="text-[10px] uppercase tracking-widest text-on-surface-variant hover:text-primary transition-colors"
                >
                  Audit Reports
                </a>
              </div>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
};

export default ZKPassport;