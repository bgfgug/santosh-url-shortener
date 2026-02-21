import { motion } from "framer-motion";
import { Link, Navigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth-store";
import { 
  Link2, 
  Zap, 
  BarChart3, 
  Shield, 
  Globe, 
  Share2,
  ChevronRight,
  CheckCircle2
} from "lucide-react";

export function LandingPage() {
  const { isAuthenticated } = useAuthStore();

  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground selection:bg-primary/20">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-background/80 backdrop-blur-md border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-primary p-2 rounded-lg">
              <Link2 className="text-primary-foreground h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight">MiniURL</span>
          </div>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
            <a href="#features" className="hover:text-foreground transition-colors">Features</a>
            <a href="#pricing" className="hover:text-foreground transition-colors">Pricing</a>
            <a href="#about" className="hover:text-foreground transition-colors">About</a>
          </nav>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link to="/login">Login</Link>
            </Button>
            <Button asChild className="bg-primary hover:bg-primary/90">
              <Link to="/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-grow pt-16">
        {/* Hero Section */}
        <section className="relative overflow-hidden py-24 lg:py-32">
          {/* Background Decorative Elements */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 overflow-hidden pointer-events-none">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px]" />
          </div>

          <div className="container mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-6">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                </span>
                New: Real-time Analytics Dashboard
              </div>
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                Shorten Links. <br className="hidden md:block" />
                <span className="text-primary">Expand Reach.</span>
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
                Powerful URL shortening with advanced analytics, QR codes, and custom branding. Built for creators and developers.
              </p>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="max-w-xl mx-auto flex flex-col sm:flex-row gap-3 p-2 rounded-xl bg-muted/30 border backdrop-blur-sm"
            >
              <div className="flex-grow flex items-center px-4">
                <Link2 className="text-muted-foreground mr-3 h-5 w-5" />
                <input 
                  type="text" 
                  placeholder="Paste your long link here..." 
                  className="w-full bg-transparent border-none focus:outline-none text-foreground py-3"
                />
              </div>
              <Button size="lg" className="sm:px-8 group">
                Shorten Now 
                <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </motion.div>

            {/* Social Proof/Trusted By */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 1, delay: 0.5 }}
              className="mt-16 flex flex-wrap justify-center items-center gap-8 grayscale opacity-50"
            >
              <div className="flex items-center gap-2 font-bold text-xl"><Globe className="h-6 w-6" /> OpenSource</div>
              <div className="flex items-center gap-2 font-bold text-xl"><Zap className="h-6 w-6" /> FastRun</div>
              <div className="flex items-center gap-2 font-bold text-xl"><Shield className="h-6 w-6" /> SecureCore</div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 bg-muted/50">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything you need to grow</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Stop using long, ugly URLs. Start using MiniURL for better engagement and tracking.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Zap className="h-6 w-6" />,
                  title: "Lightning Fast",
                  description: "Global edge network ensures your redirects are as fast as possible."
                },
                {
                  icon: <BarChart3 className="h-6 w-6" />,
                  title: "Detailed Analytics",
                  description: "Track clicks, devices, locations, and referrers in real-time."
                },
                {
                  icon: <Share2 className="h-6 w-6" />,
                  title: "QR Codes",
                  description: "Automatically generate high-quality QR codes for every link you create."
                },
                {
                  icon: <Shield className="h-6 w-6" />,
                  title: "Secure & Reliable",
                  description: "Enterprise-grade security and 99.9% uptime for your business links."
                },
                {
                  icon: <Globe className="h-6 w-6" />,
                  title: "Custom Domains",
                  description: "Use your own domain to build trust and brand recognition."
                },
                {
                  icon: <CheckCircle2 className="h-6 w-6" />,
                  title: "Free for Everyone",
                  description: "Get started for free and upgrade as you scale your business."
                }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  whileHover={{ y: -5 }}
                  className="p-8 rounded-2xl bg-background border hover:border-primary/50 transition-colors"
                >
                  <div className="bg-primary/10 text-primary w-12 h-12 rounded-xl flex items-center justify-center mb-6">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-20 border-y">
          <div className="container mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl font-bold text-primary mb-2">10M+</div>
              <div className="text-sm text-muted-foreground uppercase tracking-widest">Links Created</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">500M+</div>
              <div className="text-sm text-muted-foreground uppercase tracking-widest">Total Clicks</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">99.9%</div>
              <div className="text-sm text-muted-foreground uppercase tracking-widest">Uptime</div>
            </div>
            <div>
              <div className="text-4xl font-bold text-primary mb-2">50k+</div>
              <div className="text-sm text-muted-foreground uppercase tracking-widest">Active Users</div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24 container mx-auto px-4">
          <div className="bg-primary rounded-[3rem] p-12 lg:p-24 text-center overflow-hidden relative">
            {/* Background pattern */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
              <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
                <path d="M0 100 C 20 0 50 0 100 100" stroke="white" fill="transparent" />
                <path d="M0 80 C 30 20 60 20 100 80" stroke="white" fill="transparent" />
              </svg>
            </div>
            
            <h2 className="text-3xl md:text-5xl font-bold text-primary-foreground mb-6 relative z-10">
              Ready to shorten your first link?
            </h2>
            <p className="text-primary-foreground/80 text-lg mb-10 max-w-xl mx-auto relative z-10">
              Join thousands of users who are already using MiniURL to optimize their digital presence.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
              <Button size="lg" variant="secondary" asChild className="px-8 h-14 text-lg">
                <Link to="/register">Create Free Account</Link>
              </Button>
              <Button size="lg" variant="outline" asChild className="px-8 h-14 text-lg bg-transparent text-primary-foreground border-primary-foreground/30 hover:bg-primary-foreground/10">
                <Link to="/login">View Pricing</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 border-t">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
            <div className="col-span-2 lg:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <div className="bg-primary p-2 rounded-lg">
                  <Link2 className="text-primary-foreground h-5 w-5" />
                </div>
                <span className="text-xl font-bold tracking-tight">MiniURL</span>
              </div>
              <p className="text-muted-foreground max-w-xs mb-6">
                The world's most powerful link shortening platform for professional content creators and businesses.
              </p>
              <div className="flex gap-4">
                {/* Social icons could go here */}
              </div>
            </div>
            <div>
              <h4 className="font-bold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Analytics</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">API</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">About</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Safety</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-primary transition-colors">Privacy</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>© 2026 MiniURL Inc. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-foreground transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-foreground transition-colors">Terms of Service</a>
              <a href="#" className="hover:text-foreground transition-colors">Cookie Settings</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
