import { Outlet } from 'react-router-dom';
import { Header } from './header';
import { Toaster } from 'sonner';

export function AppLayout() {
  return (
    <div className="min-h-screen bg-background font-sans antialiased text-foreground">
      <Header />
      <main className="container mx-auto py-6 px-4 md:px-8">
        <Outlet />
      </main>
      <Toaster />
    </div>
  );
}
