import { useState } from "react";
import { motion } from "motion/react";
import { CheckCircle2, Verified, Clock, CreditCard } from "lucide-react";

interface PricingProps {
  onGetStarted?: () => void;
}

export default function Pricing({ onGetStarted }: PricingProps) {
  const [isAnnual, setIsAnnual] = useState(false);

  const calculatePrice = (monthlyPrice: number) => {
    return isAnnual ? Math.round(monthlyPrice * 0.8) : monthlyPrice;
  };

  return (
    <div className="bg-surface font-body text-on-surface min-h-screen">
      <main className="max-w-7xl mx-auto px-8 py-24">
        {/* Header Section */}
        <header className="max-w-3xl mx-auto text-center mb-12">
          <h1 className="text-5xl md:text-7xl tracking-tight text-primary mb-8 leading-[1.1] font-medium font-sans">
            Simple pricing that grows with your coaching business
          </h1>
          <p className="text-on-surface-variant text-lg leading-relaxed font-medium">
            Get full access to the platform from day one, and choose the plan that matches the number of active clients you manage.
          </p>
        </header>

        {/* Pricing Toggle */}
        <div className="flex flex-col items-center mb-16">
          <div className="inline-flex items-center bg-surface-container-high p-1 rounded-full relative">
            <button 
              onClick={() => setIsAnnual(false)}
              className={`px-6 py-2 text-sm font-bold rounded-full transition-all cursor-pointer border-none ${!isAnnual ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant'}`}
            >
              Monthly
            </button>
            <button 
              onClick={() => setIsAnnual(true)}
              className={`px-6 py-2 text-sm font-bold rounded-full transition-all cursor-pointer border-none ${isAnnual ? 'bg-primary text-on-primary shadow-sm' : 'text-on-surface-variant'}`}
            >
              Annual
            </button>
          </div>
          {isAnnual && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 text-secondary font-bold text-sm"
            >
              Save 20% with annual billing
            </motion.div>
          )}
        </div>

        {/* Pricing Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch mb-24">
          {/* Professional Plan */}
          <div className="pricing-card-glow bg-surface-container-lowest rounded-3xl p-10 flex flex-col transition-all duration-300 hover:shadow-[0_40px_60px_-15px_rgba(0,0,0,0.04)] border border-outline-variant/15">
            <div className="mb-8">
              <h3 className="text-xl font-bold text-primary mb-2">Professional</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold tracking-tight text-primary">{calculatePrice(39)}€</span>
                <span className="text-on-surface-variant font-medium">/{isAnnual ? 'month' : 'month'}</span>
              </div>
            </div>
            <div className="bg-secondary-container/30 px-4 py-2 rounded-full w-fit mb-8">
              <span className="text-secondary font-bold text-xs uppercase tracking-wider">Up to 20 active clients</span>
            </div>
            <ul className="space-y-6 mb-10 flex-grow">
              <li className="flex items-center gap-3">
                <CheckCircle2 className="text-secondary w-5 h-5 fill-secondary/10" />
                <span className="text-on-surface-variant text-sm font-medium">Full platform access</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="text-secondary w-5 h-5 fill-secondary/10" />
                <span className="text-on-surface-variant text-sm font-medium">Up to 20 active clients</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="text-secondary w-5 h-5 fill-secondary/10" />
                <span className="text-on-surface-variant text-sm font-medium">Up to 2,000 monthly messages</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="text-secondary w-5 h-5 fill-secondary/10" />
                <span className="text-on-surface-variant text-sm font-medium">Up to 10 GB file storage</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="text-secondary w-5 h-5 fill-secondary/10" />
                <span className="text-on-surface-variant text-sm font-medium">Up to 10 active automations</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="text-secondary w-5 h-5 fill-secondary/10" />
                <span className="text-on-surface-variant text-sm font-medium">Up to 25 active alerts</span>
              </li>
            </ul>
            <button 
              onClick={onGetStarted}
              className="w-full py-4 rounded-full border border-primary text-primary font-bold hover:bg-primary hover:text-on-primary transition-all duration-300 cursor-pointer"
            >
              Start Professional
            </button>
          </div>

          {/* Scale Plan (Most Popular) */}
          <div className="pricing-card-glow bg-surface-container-lowest rounded-3xl p-10 flex flex-col relative transition-all duration-300 ring-2 ring-primary shadow-[0_40px_60px_-15px_rgba(0,0,0,0.04)] scale-105 z-10">
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-on-primary px-6 py-1 rounded-full text-[10px] font-black uppercase tracking-[0.2em] whitespace-nowrap shadow-lg">
              Recommended
            </div>
            <div className="mb-8">
              <h3 className="text-xl font-bold text-primary mb-2">Scale</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold tracking-tight text-primary">{calculatePrice(79)}€</span>
                <span className="text-on-surface-variant font-medium">/{isAnnual ? 'month' : 'month'}</span>
              </div>
            </div>
            <div className="bg-secondary-container px-4 py-2 rounded-full w-fit mb-8">
              <span className="text-secondary font-bold text-xs uppercase tracking-wider">Up to 60 active clients</span>
            </div>
            <ul className="space-y-6 mb-10 flex-grow">
              <li className="flex items-center gap-3">
                <CheckCircle2 className="text-secondary w-5 h-5 fill-secondary/10" />
                <span className="text-on-surface-variant text-sm font-medium">Everything in Professional</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="text-secondary w-5 h-5 fill-secondary/10" />
                <span className="text-on-surface-variant text-sm font-medium">Up to 60 active clients</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="text-secondary w-5 h-5 fill-secondary/10" />
                <span className="text-on-surface-variant text-sm font-medium">Up to 10,000 monthly messages</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="text-secondary w-5 h-5 fill-secondary/10" />
                <span className="text-on-surface-variant text-sm font-medium">Up to 50 GB file storage</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="text-secondary w-5 h-5 fill-secondary/10" />
                <span className="text-on-surface-variant text-sm font-medium">Up to 30 active automations</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="text-secondary w-5 h-5 fill-secondary/10" />
                <span className="text-on-surface-variant text-sm font-medium">Up to 100 active alerts</span>
              </li>
            </ul>
            <button 
              onClick={onGetStarted}
              className="w-full py-4 rounded-full bg-primary text-on-primary font-bold transition-all duration-300 active:scale-95 cursor-pointer"
            >
              Start Scale
            </button>
          </div>

          {/* Unlimited Plan */}
          <div className="pricing-card-glow bg-surface-container-lowest rounded-3xl p-10 flex flex-col transition-all duration-300 hover:shadow-[0_40px_60px_-15px_rgba(0,0,0,0.04)] border border-outline-variant/15">
            <div className="mb-8">
              <h3 className="text-xl font-bold text-primary mb-2">Unlimited</h3>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold tracking-tight text-primary">{calculatePrice(99)}€</span>
                <span className="text-on-surface-variant font-medium">/{isAnnual ? 'month' : 'month'}</span>
              </div>
            </div>
            <div className="bg-secondary-container/30 px-4 py-2 rounded-full w-fit mb-8">
              <span className="text-secondary font-bold text-xs uppercase tracking-wider">Unlimited active clients</span>
            </div>
            <ul className="space-y-6 mb-10 flex-grow">
              <li className="flex items-center gap-3">
                <CheckCircle2 className="text-secondary w-5 h-5 fill-secondary/10" />
                <span className="text-on-surface-variant text-sm font-medium">Everything in Scale</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="text-secondary w-5 h-5 fill-secondary/10" />
                <span className="text-on-surface-variant text-sm font-medium">Unlimited active clients</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="text-secondary w-5 h-5 fill-secondary/10" />
                <span className="text-on-surface-variant text-sm font-medium">Unlimited monthly messages</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="text-secondary w-5 h-5 fill-secondary/10" />
                <span className="text-on-surface-variant text-sm font-medium">Unlimited file storage</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="text-secondary w-5 h-5 fill-secondary/10" />
                <span className="text-on-surface-variant text-sm font-medium">Unlimited active automations</span>
              </li>
              <li className="flex items-center gap-3">
                <CheckCircle2 className="text-secondary w-5 h-5 fill-secondary/10" />
                <span className="text-on-surface-variant text-sm font-medium">Unlimited active alerts</span>
              </li>
            </ul>
            <button 
              onClick={onGetStarted}
              className="w-full py-4 rounded-full border border-primary text-primary font-bold hover:bg-primary hover:text-on-primary transition-all duration-300 cursor-pointer"
            >
              Start Unlimited
            </button>
          </div>
        </div>

        {/* Detailed Comparison Section */}
        <section className="mt-32">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="font-sans text-5xl text-primary mb-6 font-medium">Compare platform capabilities</h2>
            <p className="text-on-surface-variant text-lg font-medium">
              A side-by-side look at everything included in our plans to help you make the best choice.
            </p>
          </div>
          <div className="relative overflow-x-auto rounded-xl border border-outline-variant/20 shadow-sm bg-surface-container-lowest">
            <table className="w-full border-collapse text-left min-w-[800px] font-body">
              <thead>
                <tr className="border-b border-outline-variant/30">
                  <th className="py-10 px-8 text-[11px] font-extrabold uppercase tracking-[0.2em] text-on-surface-variant/60 w-1/4">Feature</th>
                  <th className="py-10 px-6 text-xl font-bold text-primary text-center">Professional</th>
                  <th className="py-10 px-6 text-xl font-bold text-primary text-center relative bg-surface-container-low/40">Scale</th>
                  <th className="py-10 px-6 text-xl font-bold text-primary text-center">Unlimited</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/10">
                {[
                  { name: "Nutrition Database", prof: true, scale: true, unlim: true },
                  { name: "Meal Planning Tools", prof: true, scale: true, unlim: true },
                  { name: "Progress Dashboards", prof: true, scale: true, unlim: true },
                  { name: "Mobile Client App", prof: true, scale: true, unlim: true },
                  { name: "Active Client Limit", prof: "20 clients", scale: "60 clients", unlim: "Unlimited" },
                  { name: "Monthly Messages", prof: "2,000", scale: "10,000", unlim: "Unlimited" },
                  { name: "Storage Space", prof: "10GB", scale: "50GB", unlim: "Unlimited" },
                  { name: "Workflow Automations", prof: "10", scale: "30", unlim: "Unlimited" },
                  { name: "Intelligent Alerts", prof: "25 / mo", scale: "100 / mo", unlim: "Unlimited" },
                ].map((row, i) => (
                  <tr key={i} className="table-row-hover transition-colors group">
                    <td className="py-6 px-8 text-sm font-semibold text-on-surface/80 group-hover:text-primary transition-colors">{row.name}</td>
                    <td className="py-6 px-6 text-center">
                      {row.prof === true ? (
                        <CheckCircle2 className="text-secondary/40 w-5 h-5 mx-auto" />
                      ) : (
                        <span className="text-on-surface-variant/70 font-medium tabular-nums">{row.prof}</span>
                      )}
                    </td>
                    <td className="py-6 px-6 text-center bg-surface-container-low/40">
                      {row.scale === true ? (
                        <CheckCircle2 className="text-secondary w-6 h-6 mx-auto" />
                      ) : (
                        <span className="text-black font-medium tabular-nums">{row.scale}</span>
                      )}
                    </td>
                    <td className="py-6 px-6 text-center">
                      {row.unlim === true ? (
                        <CheckCircle2 className="text-secondary/40 w-5 h-5 mx-auto" />
                      ) : (
                        <span className="text-on-surface-variant/70 font-medium tracking-tight">{row.unlim}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-12 text-center">
            <p className="text-on-surface-variant text-[13px] font-medium italic opacity-70">
              * Advanced business and team management features are planned for future enterprise-grade releases.
            </p>
          </div>
        </section>

        {/* Trust & Notes */}
        <div className="flex flex-col items-center gap-12 mt-24">
          <div className="bg-surface-container-low/50 px-8 py-6 rounded-2xl max-w-2xl text-center border border-outline-variant/10">
            <p className="text-on-surface-variant text-sm leading-relaxed font-medium">
              All current plans include full access to the platform's core functionalities. Future premium features will be available via add-ons or plan upgrades.
            </p>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-10 text-on-surface-variant font-bold text-sm">
            <span className="flex items-center gap-2.5"><Verified className="text-secondary w-5 h-5" /> Cancel anytime</span>
            <span className="flex items-center gap-2.5"><Clock className="text-secondary w-5 h-5" /> Free trial available</span>
            <span className="flex items-center gap-2.5"><CreditCard className="text-secondary w-5 h-5" /> No hidden fees</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-surface-container-lowest py-20 border-t border-outline-variant/15">
        <div className="flex flex-col md:flex-row justify-between items-center max-w-7xl mx-auto w-full px-8 gap-10">
          <div className="flex flex-col items-center md:items-start gap-4">
            <span className="text-xl font-headline font-bold text-primary">nutrifit.</span>
            <p className="text-on-surface-variant text-sm font-medium">Elevating the standard of nutrition coaching.</p>
          </div>
          <div className="flex flex-wrap justify-center gap-8">
            <a className="text-on-surface-variant hover:text-primary transition-colors underline-offset-4 hover:underline text-sm font-medium" href="#">Privacy Policy</a>
            <a className="text-on-surface-variant hover:text-primary transition-colors underline-offset-4 hover:underline text-sm font-medium" href="#">Terms of Service</a>
            <a className="text-on-surface-variant hover:text-primary transition-colors underline-offset-4 hover:underline text-sm font-medium" href="#">Cookie Policy</a>
            <a className="text-on-surface-variant hover:text-primary transition-colors underline-offset-4 hover:underline text-sm font-medium" href="#">Contact</a>
          </div>
          <p className="text-on-surface-variant text-xs font-medium">© 2024 nutrifit. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
