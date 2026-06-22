import { useRef } from 'react';
import { Navbar } from './components/layout/Navbar';
import { Hero } from './components/layout/Hero';
import { Scrollytelling } from './components/scrollytelling/Scrollytelling';
import { useData } from './hooks/useData';

export default function App() {
  const heroRef = useRef<HTMLElement>(null);
  const { dataset, populationChange, loading, error } = useData();

  if (loading) {
    return (
      <>
        <Navbar />
        <main className="loading">Loading data…</main>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <main className="loading">Failed to load data: {error.message}</main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <Hero ref={heroRef} />
      <Scrollytelling heroRef={heroRef} dataset={dataset} populationChange={populationChange} />
    </>
  );
}
