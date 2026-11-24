import { notFound } from "next/navigation";
import { getSettings } from "@/lib/catalog";
import MoodQuiz from "@/components/MoodQuiz";

export const metadata = { title: "Mood finder" };
export default async function Mood() {
  const s = await getSettings();
  if (s.quiz_enabled !== "1") notFound();
  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="mb-8 text-center"><p className="eyebrow">Mood finder</p><h1 className="h-serif mt-1 text-3xl sm:text-4xl">{s.quiz_title}</h1><p className="mx-auto mt-2 max-w-lg text-neutral-600">{s.quiz_intro}</p></div>
      <MoodQuiz />
    </div>
  );
}
