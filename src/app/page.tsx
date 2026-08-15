import SpecExtractionTester from '@/components/SpecExtractionTester';

export default function Home() {
  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-5xl py-8">
        <SpecExtractionTester />
      </div>
    </main>
  );
}
