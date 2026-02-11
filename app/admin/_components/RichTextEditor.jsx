"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import HardBreak from "@tiptap/extension-hard-break";

export default function RichTextEditor({
	value,
	onChange,
	placeholder,
	direction = "ltr",
}) {
const editor = useEditor({
	immediatelyRender: false, // ✅ REQUIRED for Next.js SSR
	content: value || "",
	extensions: [
		StarterKit.configure({
			paragraph: {
				HTMLAttributes: { class: "mb-2" },
			},
		}),
		HardBreak.extend({
			addKeyboardShortcuts() {
				return {
					"Shift-Enter": () => this.editor.commands.setHardBreak(),
				};
			},
		}),
	],
	editorProps: {
		attributes: {
			class:
				"min-h-[160px] p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white",
			style: `direction: ${direction}`,
		},
	},
	onUpdate({ editor }) {
		onChange(editor.getHTML());
	},
});


	return (
		<div className="space-y-2">
			<EditorContent editor={editor} />
<div className="mt-2 text-xs text-gray-500 flex flex-col gap-1">
	<div className="flex items-center gap-1">
		<kbd className="px-1.5 py-0.5 rounded border bg-gray-100 text-gray-700 font-mono">
			Enter
		</kbd>
		<span>New paragraph</span>
	</div>

	<div className="flex items-center gap-1">
		<kbd className="px-1.5 py-0.5 rounded border bg-gray-100 text-gray-700 font-mono">
			Shift
		</kbd>
		<span>+</span>
		<kbd className="px-1.5 py-0.5 rounded border bg-gray-100 text-gray-700 font-mono">
			Enter
		</kbd>
		<span>Line break</span>
	</div>
</div>

	</div>
	);
}
