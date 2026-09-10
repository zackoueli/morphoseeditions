"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import Link from "@tiptap/extension-link";
import { useEffect } from "react";

type Props = {
  value: string;
  onChange: (html: string) => void;
};

/**
 * Éditeur de texte riche pour le back-office.
 * Produit du HTML (stocké tel quel, ré-affiché via <RichText>).
 */
export function RichTextEditor({ value, onChange }: Props) {
  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
      }),
    ],
    content: value || "",
    editorProps: {
      attributes: {
        class:
          "prose prose-neutral max-w-none min-h-[16rem] rounded-b-md border-2 border-t-0 border-ink/15 bg-paper px-3 py-2 outline-none focus:border-red",
      },
    },
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
  });

  // Si la valeur change depuis l'extérieur (chargement initial async), on resynchronise.
  useEffect(() => {
    if (!editor) return;
    if (value && value !== editor.getHTML()) {
      editor.commands.setContent(value, false);
    }
  }, [value, editor]);

  if (!editor) {
    return (
      <div className="min-h-[19rem] rounded-md border-2 border-ink/15 bg-paper" />
    );
  }

  return (
    <div>
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  return (
    <div className="flex flex-wrap gap-1 rounded-t-md border-2 border-b-0 border-ink/15 bg-paper-dim p-1.5">
      <Btn
        editor={editor}
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive("bold")}
        label="Gras"
      >
        <strong>B</strong>
      </Btn>
      <Btn
        editor={editor}
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive("italic")}
        label="Italique"
      >
        <em>I</em>
      </Btn>

      <Sep />

      <Btn
        editor={editor}
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 2 }).run()
        }
        active={editor.isActive("heading", { level: 2 })}
        label="Titre"
      >
        T1
      </Btn>
      <Btn
        editor={editor}
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 3 }).run()
        }
        active={editor.isActive("heading", { level: 3 })}
        label="Sous-titre"
      >
        T2
      </Btn>
      <Btn
        editor={editor}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive("bulletList")}
        label="Liste à puces"
      >
        •
      </Btn>
      <Btn
        editor={editor}
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        active={editor.isActive("orderedList")}
        label="Liste numérotée"
      >
        1.
      </Btn>

      <Sep />

      <Btn
        editor={editor}
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
        active={editor.isActive({ textAlign: "left" })}
        label="Aligner à gauche"
      >
        ⯇
      </Btn>
      <Btn
        editor={editor}
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
        active={editor.isActive({ textAlign: "center" })}
        label="Centrer"
      >
        ⇔
      </Btn>
      <Btn
        editor={editor}
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
        active={editor.isActive({ textAlign: "right" })}
        label="Aligner à droite"
      >
        ⯈
      </Btn>
      <Btn
        editor={editor}
        onClick={() => editor.chain().focus().setTextAlign("justify").run()}
        active={editor.isActive({ textAlign: "justify" })}
        label="Justifier"
      >
        ☰
      </Btn>

      <Sep />

      <Btn
        editor={editor}
        onClick={() => setLink(editor)}
        active={editor.isActive("link")}
        label="Lien"
      >
        🔗
      </Btn>
      <Btn
        editor={editor}
        onClick={() =>
          editor.chain().focus().unsetLink().clearNodes().unsetAllMarks().run()
        }
        active={false}
        label="Effacer la mise en forme"
      >
        ✕
      </Btn>
    </div>
  );
}

function setLink(editor: Editor) {
  const previous = editor.getAttributes("link").href as string | undefined;
  const url = window.prompt("URL du lien (laisser vide pour retirer) :", previous ?? "");
  if (url === null) return;
  if (url === "") {
    editor.chain().focus().unsetLink().run();
    return;
  }
  editor.chain().focus().setLink({ href: url }).run();
}

function Sep() {
  return <span className="mx-0.5 w-px self-stretch bg-ink/15" />;
}

function Btn({
  onClick,
  active,
  label,
  children,
}: {
  editor: Editor;
  onClick: () => void;
  active: boolean;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      aria-pressed={active}
      className={`flex h-8 min-w-8 items-center justify-center rounded px-2 text-sm leading-none transition-colors ${
        active
          ? "bg-red text-paper"
          : "text-ink/80 hover:bg-ink/10"
      }`}
    >
      {children}
    </button>
  );
}
