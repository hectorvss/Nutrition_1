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

  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (planTitle: string) => {
    setLoading(planTitle);
    try {
      // Mock user data - in a real app, get this from auth context
      const userId = "temp-user-id"; 
      const userEmail = "user@example.com";

      // Map plan to real Stripe Price IDs provided by user
      const priceMap: Record<string, { monthly: string; annual: string }> = {
        "Professional": {
          monthly: "price_1TCN9vCR4WvolxlpwC33dk8J",
          annual: "price_1TCf4PCR4Wvolxlp3MoDzi0J"
        },
        "Scale": {
          monthly: "price_1TCNAHCR4WvolxlpwpLRfmwX",
          annual: "price_1TCf52CR4WvolxlpcMMLOVpv"
        },
        "Unlimited": {
          monthly: "price_1TCNAcCR4WvolxlptLzNYdsz",
          annual: "price_1TCf5cCR4WvolxlpWGhpOgnI"
        },
      };

      const selectedPriceId = isAnnual ? priceMap[planTitle].annual : priceMap[planTitle].monthly;

      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          priceId: selectedPriceId,
          userId,
          userEmail
        }),
      });

      const data = await response.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error(data.error || 'Failed to create checkout session');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      alert('Error initiating checkout. Please try again.');
    } finally {
      setLoading(null);
    }
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

        {/* Pricing Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch mb-24">
          {[
            {
              title: "Professional",
              monthlyPrice: 39,
              clients: "Up to 20 active clients",
              features: [
                "Full platform access",
                "Up to 20 active clients",
                "Up to 2,000 monthly messages",
                "Up to 10 GB file storage",
                "Up to 10 active automations",
                "Up to 25 active alerts"
              ],
              buttonLabel: "Start Professional",
              accent: false
            },
            {
              title: "Scale",
              monthlyPrice: 79,
              clients: "Up to 60 active clients",
              features: [
                "Everything in Professional",
                "Up to 60 active clients",
                "Up to 10,000 monthly messages",
                "Up to 50 GB file storage",
                "Up to 30 active automations",
                "Up to 100 active alerts"
              ],
              buttonLabel: "Start Scale",
              accent: false
            },
            {
              title: "Unlimited",
              monthlyPrice: 99,
              clients: "Unlimited active clients",
              features: [
                "Everything in Scale",
                "Unlimited active clients",
                "Unlimited monthly messages",
                "Unlimited file storage",
                "Unlimited active automations",
                "Unlimited active alerts"
              ],
              buttonLabel: "Start Unlimited",
              accent: false
            }
          ].map((plan, idx) => (
            <motion.div 
              key={idx}
              whileHover={{ scale: 1.02, y: -5 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="bg-surface-container-lowest rounded-3xl p-10 flex flex-col border border-outline-variant/30 transition-shadow hover:shadow-2xl hover:shadow-black/5"
            >
              <div className="mb-8">
                <h3 className="text-xl font-bold text-primary mb-2">{plan.title}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold tracking-tight text-primary">{calculatePrice(plan.monthlyPrice)}€</span>
                  <span className="text-on-surface-variant font-medium">/month</span>
                </div>
              </div>
              <div className="bg-secondary-container/20 px-4 py-2 rounded-full w-fit mb-8">
                <span className="text-secondary font-bold text-xs uppercase tracking-wider">{plan.clients}</span>
              </div>
              <ul className="space-y-6 mb-10 flex-grow">
                {plan.features.map((feature, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <CheckCircle2 className="text-secondary w-5 h-5 fill-secondary/10" />
                    <span className="text-on-surface-variant text-sm font-medium">{feature}</span>
                  </li>
                ))}
              </ul>
              <button 
                onClick={() => handleSubscribe(plan.title)}
                disabled={loading !== null}
                className={`w-full py-4 rounded-full font-bold transition-all duration-300 cursor-pointer border flex items-center justify-center gap-2 ${
                  loading === plan.title ? 'opacity-70 cursor-wait' : ''
                } ${
                  idx === 1 
                  ? 'bg-primary text-on-primary border-primary' 
                  : 'bg-transparent text-primary border-primary hover:bg-primary hover:text-on-primary'
                }`}
              >
                {loading === plan.title ? (
                  <Clock className="w-5 h-5 animate-spin" />
                ) : (
                  <CreditCard className="w-5 h-5" />
                )}
                {loading === plan.title ? 'Connecting...' : plan.buttonLabel}
              </button>
            </motion.div>
          ))}
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
        </section>
      </main>
    </div>
  );
}
