import React from 'react';
import { Shield, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';

export const Rules: React.FC = () => {
  const rules = [
    {
      title: "Respectful Communication",
      description: "Treat every member with kindness and respect. We do not tolerate harassment, bullying, or hate speech of any kind.",
      icon: <Shield className="text-blue-500" size={24} />
    },
    {
      title: "Safe Content",
      description: "Any content posted must be safe for our community. Avoid sharing inappropriate images, links, or sensitive personal data that could compromise safety.",
      icon: <CheckCircle2 className="text-green-500" size={24} />
    },
    {
      title: "Privacy Matters",
      description: "Respect the privacy of others. Do not share members' private information without their explicit consent.",
      icon: <Shield className="text-purple-500" size={24} />
    },
    {
      title: "Constructive Suggestions",
      description: "When providing feedback or suggestions, keep it constructive. We are all here to grow and improve together.",
      icon: <AlertCircle className="text-orange-500" size={24} />
    }
  ];

  return (
    <div className="space-y-12 py-10 max-w-4xl mx-auto">
      <header className="text-center">
        <div className="flex justify-center mb-4">
          <div className="bg-bento-primary/10 p-4 rounded-3xl animate-pulse">
            <Shield size={48} className="text-bento-primary" />
          </div>
        </div>
        <h1 className="text-5xl font-serif font-bold tracking-tight text-bento-text mb-4">
          Rules and Regulation
        </h1>
        <p className="text-bento-muted max-w-2xl mx-auto text-lg">
          Our community is built on trust, safety, and mutual respect. These rules help us maintain a space where everyone feels welcome.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {rules.map((rule, index) => (
          <motion.div
            key={rule.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bento-card p-8 group hover:border-bento-primary transition-all duration-500"
          >
            <div className="mb-6">{rule.icon}</div>
            <h3 className="text-2xl font-sans font-bold mb-3 text-bento-text group-hover:text-bento-primary transition-colors">
              {rule.title}
            </h3>
            <p className="text-bento-muted leading-relaxed">
              {rule.description}
            </p>
          </motion.div>
        ))}
      </div>

      <footer className="text-center bg-white p-10 rounded-3xl border border-bento-border border-dashed shadow-sm">
        <h4 className="font-sans font-bold text-xl mb-4 text-bento-secondary">Violation Policy</h4>
        <p className="text-bento-muted mb-8 leading-relaxed">
          Members found violating these rules may receive a warning, be temporarily muted, or permanently banned 
          depending on the severity of the action. Moderators monitor the community around the clock.
        </p>
        <div className="flex justify-center gap-4">
          <span className="bento-pill bg-red-100 text-red-600 border-none px-6 py-2">Warnings</span>
          <span className="bento-pill bg-orange-100 text-orange-600 border-none px-6 py-2">Muting</span>
          <span className="bento-pill bg-gray-100 text-gray-600 border-none px-6 py-2">Banning</span>
        </div>
      </footer>
    </div>
  );
};
