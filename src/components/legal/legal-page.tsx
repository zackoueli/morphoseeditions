import ReactMarkdown from "react-markdown";

export function LegalPage({ markdown }: { markdown: string }) {
  return (
    <div className="bg-paper text-ink">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
        <article className="prose prose-neutral max-w-none prose-headings:font-display prose-headings:tracking-wide prose-a:text-red">
          <ReactMarkdown>{markdown}</ReactMarkdown>
        </article>
      </div>
    </div>
  );
}
