"use client";

import { useState } from "react";
import { Bold, Italic, Underline, List, ListOrdered } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function RichTextEditor({
  value = "",
  onChange,
  isRTL = false,
}) {
  const [isPreview, setIsPreview] = useState(false);

  const applyFormat = (command, value = null) => {
    document.execCommand(command, false, value);
  };

  const handleEditorInput = (e) => {
    onChange(e.currentTarget.innerHTML);
  };

  return (
    <div className="border border-input rounded-lg overflow-hidden bg-background">
      {/* Toolbar */}
      <div className="flex gap-1 p-2 border-b border-input bg-muted flex-wrap">
        <Button
          size="sm"
          variant="ghost"
          onClick={() => applyFormat("bold")}
          title="Bold"
        >
          <Bold className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => applyFormat("italic")}
          title="Italic"
        >
          <Italic className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => applyFormat("underline")}
          title="Underline"
        >
          <Underline className="w-4 h-4" />
        </Button>
        <div className="w-px bg-border mx-1" />
        <Button
          size="sm"
          variant="ghost"
          onClick={() => applyFormat("insertUnorderedList")}
          title="Bullet List"
        >
          <List className="w-4 h-4" />
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={() => applyFormat("insertOrderedList")}
          title="Numbered List"
        >
          <ListOrdered className="w-4 h-4" />
        </Button>
        <div className="w-px bg-border mx-1" />
        <Button
          size="sm"
          variant={isPreview ? "default" : "ghost"}
          onClick={() => setIsPreview(!isPreview)}
        >
          {isPreview ? "Edit" : "Preview"}
        </Button>
      </div>

      {/* Editor Area */}
      {isPreview ? (
        <div
          className="p-4 min-h-[200px] prose prose-sm max-w-none text-foreground"
          dangerouslySetInnerHTML={{ __html: value }}
        />
      ) : (
        <div
          contentEditable
          onInput={handleEditorInput}
          dir={isRTL ? "rtl" : "ltr"}
          className="p-4 min-h-[200px] outline-none focus:bg-muted/50 transition-colors text-foreground"
          suppressContentEditableWarning
          dangerouslySetInnerHTML={{ __html: value }}
        />
      )}
    </div>
  );
}
