import React from 'react';
import { Globe, Users, ExternalLink } from 'lucide-react';

export function Footer() {
  const team = [
    { name: 'Architecture', icon: Globe },
    { name: 'Core Engineering', icon: Users },
    { name: 'AI Research', icon: Globe }
  ];

  return (
    <footer className="border-t border-white/10 bg-black py-20">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-12">
          <div className="col-span-2">
            <h3 className="text-2xl font-black mb-6">CivicConnect</h3>
            <p className="text-gray-500 max-w-sm mb-8">
              A production-grade Smart City Operating System designed for high-availability, real-time civic engagement, and AI-driven resolution.
            </p>
            <div className="flex gap-4">
              <a href="#" className="p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                <Globe size={20} />
              </a>
              <a href="#" className="p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-colors">
                <Users size={20} />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-bold mb-6">Engineering Team</h4>
            <ul className="space-y-4">
              {team.map((t, i) => (
                <li key={i} className="flex items-center gap-3 text-sm text-gray-400">
                  <t.icon size={16} className="text-primary" />
                  {t.name}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-bold mb-6">Platform</h4>
            <ul className="space-y-4">
              <li><a href="#" className="text-sm text-gray-400 hover:text-white flex items-center gap-2">API Documentation <ExternalLink size={14} /></a></li>
              <li><a href="#" className="text-sm text-gray-400 hover:text-white">System Status</a></li>
              <li><a href="#" className="text-sm text-gray-400 hover:text-white">Security Policy</a></li>
            </ul>
          </div>
        </div>

        <div className="mt-20 pt-8 border-t border-white/5 flex flex-col md:row-row justify-between items-center gap-4 text-xs text-gray-500 uppercase tracking-widest font-bold">
          <p>© 2026 CivicConnect OS. All Rights Reserved.</p>
          <p>Built for Enterprise Scale</p>
        </div>
      </div>
    </footer>
  );
}
