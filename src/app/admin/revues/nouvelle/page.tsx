import { IssueForm } from "@/components/admin/issue-form";

export default function NewIssuePage() {
  return (
    <div>
      <h1 className="font-display text-3xl tracking-wide">NOUVELLE REVUE</h1>
      <div className="mt-8">
        <IssueForm />
      </div>
    </div>
  );
}
