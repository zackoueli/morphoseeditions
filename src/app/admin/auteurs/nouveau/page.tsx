import { AuthorForm } from "@/components/admin/author-form";

export default function NewAuthorPage() {
  return (
    <div>
      <h1 className="font-display text-3xl tracking-wide">NOUVEL AUTEUR</h1>
      <div className="mt-8">
        <AuthorForm />
      </div>
    </div>
  );
}
