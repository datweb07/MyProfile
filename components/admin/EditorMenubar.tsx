'use client';

import {useRef} from 'react';
import type {Editor} from '@tiptap/react';

function ToolButton({
  label,
  title,
  active,
  disabled,
  onClick
}: {
  label: string;
  title: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className={active ? 'is-active' : ''}
      type="button"
      title={title}
      aria-label={title}
      aria-pressed={active}
      disabled={disabled}
      onClick={onClick}
    >
      {label}
    </button>
  );
}

export default function EditorMenubar({editor, onImage}: {editor: Editor; onImage: (file: File) => void}) {
  const imageInput = useRef<HTMLInputElement>(null);

  function setLink() {
    const previous = editor.getAttributes('link').href as string | undefined;
    const url = window.prompt('Link URL', previous ?? 'https://');
    if (url === null) return;
    if (!url.trim()) editor.chain().focus().extendMarkRange('link').unsetLink().run();
    else editor.chain().focus().extendMarkRange('link').setLink({href: url.trim()}).run();
  }

  function addYouTube() {
    const url = window.prompt('YouTube URL');
    if (url?.trim()) editor.commands.setYoutubeVideo({src: url.trim(), width: 960, height: 540});
  }

  return (
    <div className="editor-menubar">
      <div className="editor-tool-group">
        <ToolButton label="B" title="Bold" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()} />
        <ToolButton label="I" title="Italic" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()} />
        <ToolButton label="U" title="Underline" active={editor.isActive('underline')} onClick={() => editor.chain().focus().toggleUnderline().run()} />
        <ToolButton label="S" title="Strike" active={editor.isActive('strike')} onClick={() => editor.chain().focus().toggleStrike().run()} />
      </div>

      <select
        aria-label="Heading level"
        value={editor.isActive('heading') ? String(editor.getAttributes('heading').level) : '0'}
        onChange={(event) => {
          const level = Number(event.target.value);
          if (!level) editor.chain().focus().setParagraph().run();
          else editor.chain().focus().toggleHeading({level: level as 1 | 2 | 3 | 4}).run();
        }}
      >
        <option value="0">Paragraph</option>
        <option value="1">Heading 1</option>
        <option value="2">Heading 2</option>
        <option value="3">Heading 3</option>
        <option value="4">Heading 4</option>
      </select>

      <div className="editor-tool-group">
        <ToolButton label="L" title="Align left" active={editor.isActive({textAlign: 'left'})} onClick={() => editor.chain().focus().setTextAlign('left').run()} />
        <ToolButton label="C" title="Align center" active={editor.isActive({textAlign: 'center'})} onClick={() => editor.chain().focus().setTextAlign('center').run()} />
        <ToolButton label="R" title="Align right" active={editor.isActive({textAlign: 'right'})} onClick={() => editor.chain().focus().setTextAlign('right').run()} />
        <ToolButton label="J" title="Justify" active={editor.isActive({textAlign: 'justify'})} onClick={() => editor.chain().focus().setTextAlign('justify').run()} />
      </div>

      <div className="editor-tool-group">
        <ToolButton label="• List" title="Bullet list" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()} />
        <ToolButton label="1. List" title="Ordered list" active={editor.isActive('orderedList')} onClick={() => editor.chain().focus().toggleOrderedList().run()} />
        <ToolButton label="Link" title="Add or edit link" active={editor.isActive('link')} onClick={setLink} />
        <ToolButton label="Image" title="Upload image" onClick={() => imageInput.current?.click()} />
        <ToolButton label="YouTube" title="Embed YouTube" onClick={addYouTube} />
      </div>

      <input
        ref={imageInput}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
        hidden
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) onImage(file);
          event.target.value = '';
        }}
      />

      <label className="editor-color-tool" title="Text color">
        <span>Color</span>
        <input type="color" value={editor.getAttributes('textStyle').color || '#222222'} onChange={(event) => editor.chain().focus().setColor(event.target.value).run()} />
      </label>

      <div className="editor-tool-group">
        <ToolButton label="↶" title="Undo" disabled={!editor.can().undo()} onClick={() => editor.chain().focus().undo().run()} />
        <ToolButton label="↷" title="Redo" disabled={!editor.can().redo()} onClick={() => editor.chain().focus().redo().run()} />
        <ToolButton label="Clear" title="Clear formatting" onClick={() => editor.chain().focus().unsetAllMarks().clearNodes().run()} />
      </div>
    </div>
  );
}
