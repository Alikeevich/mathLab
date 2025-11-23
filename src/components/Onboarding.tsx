export function Onboarding({ onComplete }: { onComplete: () => void }) {
  return <div className="fixed inset-0 bg-black text-white p-10 z-50" onClick={onComplete}>Привет! Нажми сюда.</div>;
}