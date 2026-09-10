"use client";

import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import { Extension } from "@tiptap/core";
import StarterKit from "@tiptap/starter-kit";
import TextAlign from "@tiptap/extension-text-align";
import TextStyle from "@tiptap/extension-text-style";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { useEffect, useRef } from "react";
import { uploadFile } from "@/lib/storage-upload";

type Props = {
  value: string;
  onChange: (html: string) => void;
  /** Sous-dossier Storage où ranger les images collées dans le texte. */
  imageFolder: string;
};

const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

/** Ajoute une propriété `font-size` portée par la marque textStyle. */
const FontSize = Extension.create({
  name: "fontSize",
  addOptions() {
    return { types: ["textStyle"] };
  },
  addGlobalAttributes() {
    return [
      {
        types: this.options.types,
        attributes: {
          fontSize: {
            default: null,
            parseHTML: (element) => element.style.fontSize || null,
            renderHTML: (attributes) =>
              attributes.fontSize
                ? { style: `font-size: ${attributes.fontSize}` }
                : {},
          },
        },
      },
    ];
  },
});

const FONT_SIZES = [
  { label: "Petit", value: "0.85rem" },
  { label: "Normal", value: "" },
  { label: "Grand", value: "1.35rem" },
  { label: "Très grand", value: "1.75rem" },
];

/**
 * Éditeur de texte riche pour le back-office.
 * Produit du HTML (stocké tel quel, ré-affiché via <RichText>).
 */
export function RichTextEditor({ value, onChange, imageFolder }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2, 3] },
      }),
      TextStyle,
      FontSize,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Link.configure({
        openOnClick: false,
        autolink: true,
        HTMLAttributes: { rel: "noopener noreferrer", target: "_blank" },
      }),
      Image.configure({
        inline: false,
        HTMLAttributes: { class: "rounded-md" },
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

  async function handleImageFile(file: File) {
    if (!editor) return;
    if (!file.type.startsWith("image/")) {
      window.alert("Ce fichier n'est pas une image.");
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      window.alert("Image trop lourde (5 Mo maximum).");
      return;
    }
    const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${imageFolder}/${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}.${ext}`;
    try {
      const url = await uploadFile(path, file);
      editor.chain().focus().setImage({ src: url }).run();
    } catch {
      window.alert("L'envoi de l'image a échoué.");
    }
  }

  if (!editor) {
    return (
      <div className="min-h-[19rem] rounded-md border-2 border-ink/15 bg-paper" />
    );
  }

  return (
    <div>
      <Toolbar
        editor={editor}
        onPickImage={() => fileInputRef.current?.click()}
      />
      <EditorContent editor={editor} />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleImageFile(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}

function Toolbar({
  editor,
  onPickImage,
}: {
  editor: Editor;
  onPickImage: () => void;
}) {
  const currentSize =
    (editor.getAttributes("textStyle").fontSize as string | undefined) ?? "";

  return (
    <div className="flex flex-wrap items-center gap-1 rounded-t-md border-2 border-b-0 border-ink/15 bg-paper-dim p-1.5">
      <Btn
        onClick={() => editor.chain().focus().toggleBold().run()}
        active={editor.isActive("bold")}
        label="Gras"
      >
        <strong>B</strong>
      </Btn>
      <Btn
        onClick={() => editor.chain().focus().toggleItalic().run()}
        active={editor.isActive("italic")}
        label="Italique"
      >
        <em>I</em>
      </Btn>

      <select
        value={currentSize}
        onChange={(e) => {
          const v = e.target.value;
          const chain = editor.chain().focus();
          if (v) chain.setMark("textStyle", { fontSize: v }).run();
          else
            chain
              .setMark("textStyle", { fontSize: null })
              .removeEmptyTextStyle()
              .run();
        }}
        title="Taille du texte sélectionné"
        aria-label="Taille du texte sélectionné"
        className="h-8 rounded border border-ink/15 bg-paper px-1 text-sm text-ink/80"
      >
        {FONT_SIZES.map((s) => (
          <option key={s.label} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>

      <Sep />

      <Btn
        onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        active={editor.isActive("heading", { level: 2 })}
        label="Titre"
      >
        T1
      </Btn>
      <Btn
        onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        active={editor.isActive("heading", { level: 3 })}
        label="Sous-titre"
      >
        T2
      </Btn>
      <Btn
        onClick={() => editor.chain().focus().toggleBulletList().run()}
        active={editor.isActive("bulletList")}
        label="Liste à puces"
      >
        •
      </Btn>
      <Btn
        onClick={() => editor.chain().focus().toggleOrderedList().run()}
        active={editor.isActive("orderedList")}
        label="Liste numérotée"
      >
        1.
      </Btn>

      <Sep />

      <Btn
        onClick={() => editor.chain().focus().setTextAlign("left").run()}
        active={editor.isActive({ textAlign: "left" })}
        label="Aligner à gauche"
      >
        ⯇
      </Btn>
      <Btn
        onClick={() => editor.chain().focus().setTextAlign("center").run()}
        active={editor.isActive({ textAlign: "center" })}
        label="Centrer"
      >
        ⇔
      </Btn>
      <Btn
        onClick={() => editor.chain().focus().setTextAlign("right").run()}
        active={editor.isActive({ textAlign: "right" })}
        label="Aligner à droite"
      >
        ⯈
      </Btn>
      <Btn
        onClick={() => editor.chain().focus().setTextAlign("justify").run()}
        active={editor.isActive({ textAlign: "justify" })}
        label="Justifier"
      >
        ☰
      </Btn>

      <Sep />

      <Btn
        onClick={() => setLink(editor)}
        active={editor.isActive("link")}
        label="Lien"
      >
        🔗
      </Btn>
      <Btn onClick={onPickImage} active={false} label="Insérer une image">
        🖼
      </Btn>
      <Btn
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
  const url = window.prompt(
    "URL du lien (laisser vide pour retirer) :",
    previous ?? ""
  );
  if (url === null) return;
  if (url === "") {
    editor.chain().focus().unsetLink().run();
    return;
  }
  editor.chain().focus().setLink({ href: url }).run();
}

function Sep() {
  return <span className="mx-0.5 h-6 w-px bg-ink/15" />;
}

function Btn({
  onClick,
  active,
  label,
  children,
}: {
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
        active ? "bg-red text-paper" : "text-ink/80 hover:bg-ink/10"
      }`}
    >
      {children}
    </button>
  );
}
