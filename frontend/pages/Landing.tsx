
import React from 'react';
import { Link } from 'react-router-dom';

const Landing: React.FC = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4 flex items-center justify-between">
        <div className="text-2xl font-black text-indigo-600 tracking-tight">Shortenly</div>
        <div className="flex gap-6 items-center">
          <Link to="/login" className="text-slate-600 font-semibold hover:text-indigo-600 transition-colors">Log in</Link>
          <Link to="/signup" className="bg-indigo-600 text-white px-5 py-2 rounded-full font-bold shadow-md hover:bg-indigo-700 transition-all active:scale-95">Sign Up Free</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-6 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-400 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-400 rounded-full blur-3xl animate-pulse delay-700"></div>
        </div>
        
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl lg:text-7xl font-black text-slate-900 mb-6 leading-tight">
            Short links, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">big results.</span>
          </h1>
          <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Shortenly helps you build your brand and increase engagement with every link you share. Powerful analytics included out of the box.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/signup" 
              className="bg-indigo-600 text-white px-10 py-4 rounded-2xl font-bold text-lg shadow-xl hover:bg-indigo-700 transition-all hover:-translate-y-1 active:scale-95"
            >
              Get Started for Free
            </Link>
            <Link 
              to="/login" 
              className="bg-white text-slate-900 border-2 border-slate-200 px-10 py-4 rounded-2xl font-bold text-lg hover:bg-slate-50 transition-all active:scale-95"
            >
              Live Demo
            </Link>
          </div>
          
          <div className="mt-20 border border-slate-200 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in slide-in-from-bottom-10 duration-1000">
             <img 
               src="https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&q=80&w=1200&h=600" 
               alt="Dashboard Preview" 
               className="w-full object-cover"
             />
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 bg-slate-50 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-bold text-slate-900 mb-4">Everything you need to grow</h2>
            <p className="text-lg text-slate-600">Built for individuals, designed for scale.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: 'Smart Shortening',
                desc: 'Generate clean, memorable links that fit anywhere. Perfect for social media and SMS.',
                icon: <path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}/>
              },
              {
                title: 'Atomic Tracking',
                desc: 'Every click is tracked in real-time. Know exactly who is visiting and from where.',
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              },
              {
                title: 'Secure & Reliable',
                desc: 'Session-based authentication and OTP verification keep your link data safe.',
                icon: <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              }
            ].map((f, i) => (
              <div key={i} className="bg-white p-10 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all group hover:-translate-y-2">
                <div className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center text-indigo-600 mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">{f.icon}</svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{f.title}</h3>
                <p className="text-slate-600 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-24 px-6 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2">
              <h2 className="text-3xl lg:text-5xl font-bold text-slate-900 mb-8">Shorten your links in three easy steps</h2>
              <div className="space-y-8">
                {[
                  { step: '01', title: 'Create an Account', desc: 'Sign up in seconds and verify your email via OTP to secure your dashboard.' },
                  { step: '02', title: 'Paste Your URL', desc: 'Enter any long web address into our optimizer and click "Generate".' },
                  { step: '03', title: 'Share & Track', desc: 'Copy your new short link and watch the engagement roll in with live analytics.' }
                ].map((s, i) => (
                  <div key={i} className="flex gap-6">
                    <div className="text-4xl font-black text-slate-100">{s.step}</div>
                    <div>
                      <h4 className="text-xl font-bold text-slate-900 mb-2">{s.title}</h4>
                      <p className="text-slate-600">{s.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:w-1/2 relative">
               <div className="bg-gradient-to-tr from-indigo-600 to-purple-600 w-full h-96 rounded-3xl shadow-2xl relative z-10 p-8 text-white flex flex-col justify-end">
                  <div className="absolute top-8 right-8 text-white/20">
                    <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24"><path d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
                  </div>
                  <div className="text-sm font-bold uppercase tracking-widest mb-2 opacity-60">Analytics Insight</div>
                  <h3 className="text-3xl font-bold">+142% Link CTR</h3>
                  <p className="opacity-80">Average improvement after using branded short links.</p>
               </div>
               <div className="absolute -bottom-6 -right-6 w-full h-full bg-slate-100 -z-0 rounded-3xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto bg-slate-900 rounded-[3rem] p-12 lg:p-20 text-center text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/20 rounded-full blur-3xl -mr-32 -mt-32"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl -ml-32 -mb-32"></div>
          
          <h2 className="text-4xl lg:text-6xl font-bold mb-8 relative z-10">Ready to take control <br/>of your links?</h2>
          <p className="text-xl text-slate-400 mb-12 max-w-xl mx-auto relative z-10">
            Join thousands of users who trust Shortenly for their link management needs. No credit card required.
          </p>
          <Link 
            to="/signup" 
            className="bg-white text-slate-900 px-12 py-5 rounded-2xl font-black text-xl hover:bg-slate-100 transition-all hover:scale-105 inline-block relative z-10 shadow-2xl"
          >
            Join Shortenly Today
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-slate-100 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex flex-col items-center md:items-start">
            <div className="text-2xl font-black text-indigo-600 mb-2">Shortenly</div>
            <p className="text-slate-400 text-sm">© 2024 Shortenly Inc. All rights reserved.</p>
          </div>
          <div className="flex gap-8 text-sm font-bold text-slate-600">
            <Link to="/login" className="hover:text-indigo-600 transition-colors">Privacy Policy</Link>
            <Link to="/login" className="hover:text-indigo-600 transition-colors">Terms of Service</Link>
            <Link to="/login" className="hover:text-indigo-600 transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
