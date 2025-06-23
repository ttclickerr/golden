import { Footer } from './Footer';

interface LayoutProps {
  children: React.ReactNode;
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="min-h-screen bg-[#0B0E1F]">
      <main className="pb-20">
        {children}
      </main>
      <Footer />
    </div>
  );
}