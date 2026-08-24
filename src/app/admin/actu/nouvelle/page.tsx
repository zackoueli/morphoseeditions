import { NewsForm } from "@/components/admin/news-form";

export default function NewNewsPage() {
  return (
    <div>
      <h1 className="font-display text-3xl tracking-wide">NOUVEL ARTICLE</h1>
      <div className="mt-8">
        <NewsForm />
      </div>
    </div>
  );
}
