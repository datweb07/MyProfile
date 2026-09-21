'use client';

import {useEffect, useState} from 'react';
import {EditorContent, useEditor} from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import CharacterCount from '@tiptap/extension-character-count';
import Youtube from '@tiptap/extension-youtube';
import Heading from '@tiptap/extension-heading';
import {Color} from '@tiptap/extension-color';
import {TextStyle} from '@tiptap/extension-text-style';
import FontFamily from '@tiptap/extension-font-family';
import Focus from '@tiptap/extension-focus';
import Dropcursor from '@tiptap/extension-dropcursor';
import EditorMenubar from '@/components/admin/EditorMenubar';
import {uploadImage} from '@/lib/blog-images';

export default function RichTextEditor({
  content = '',
  onChange,
  readOnly = false,
  slug = '',
  onUploadStateChange
}: {
  content?: string;
  onChange: (html: string) => void;
  readOnly?: boolean;
  slug?: string;
  onUploadStateChange?: (uploading: boolean) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  function setUploadState(value: boolean) {
    setUploading(value);
    onUploadStateChange?.(value);
  }

  const editor = useEditor({
    immediatelyRender: false,
    editable: !readOnly,
    content,
    extensions: [
      StarterKit.configure({heading: false, dropcursor: false, link: false, underline: false}),
      Heading.configure({levels: [1, 2, 3, 4]}),
      Image.configure({allowBase64: false, HTMLAttributes: {loading: 'lazy'}}),
      Link.configure({openOnClick: readOnly, autolink: true, defaultProtocol: 'https'}),
      Placeholder.configure({placeholder: 'Start writing your story…'}),
      TextAlign.configure({types: ['heading', 'paragraph']}),
      Underline,
      CharacterCount,
      Youtube.configure({controls: true, nocookie: true, allowFullscreen: true}),
      TextStyle,
      Color,
      FontFamily,
      Focus.configure({className: 'has-focus', mode: 'all'}),
      Dropcursor.configure({color: 'var(--blog-accent)', width: 2})
    ],
    onUpdate: ({editor: currentEditor}) => onChange(currentEditor.getHTML()),
    editorProps: {
      handlePaste(view, event) {
        const fileFromItems = Array.from(event.clipboardData?.items ?? [])
          .find((item) => item.kind === 'file' && item.type.startsWith('image/'))
          ?.getAsFile();
        const file = fileFromItems ?? Array.from(event.clipboardData?.files ?? []).find((item) => item.type.startsWith('image/'));
        if (!file) return false;
        event.preventDefault();
        setUploadState(true);
        setUploadError('');
        void uploadImage(file, slug)
          .then((url) => {
            const node = view.state.schema.nodes.image.create({src: url});
            view.dispatch(view.state.tr.replaceSelectionWith(node));
          })
          .catch((error) => setUploadError(error instanceof Error ? error.message : 'Could not upload image.'))
          .finally(() => setUploadState(false));
        return true;
      },
      handleDrop(view, event, _slice, moved) {
        if (moved) return false;
        const file = Array.from(event.dataTransfer?.files ?? []).find((item) => item.type.startsWith('image/'));
        if (!file) return false;
        event.preventDefault();
        setUploadState(true);
        setUploadError('');
        void uploadImage(file, slug)
          .then((url) => {
            const coordinates = view.posAtCoords({left: event.clientX, top: event.clientY});
            const node = view.state.schema.nodes.image.create({src: url});
            const transaction = view.state.tr.insert(coordinates?.pos ?? view.state.selection.from, node);
            view.dispatch(transaction);
          })
          .catch((error) => setUploadError(error instanceof Error ? error.message : 'Could not upload image.'))
          .finally(() => setUploadState(false));
        return true;
      }
    }
  });

  useEffect(() => {
    editor?.setEditable(!readOnly);
  }, [editor, readOnly]);

  async function insertImage(file: File) {
    if (!editor) return;
    setUploadState(true);
    setUploadError('');
    try {
      const url = await uploadImage(file, slug);
      editor.chain().focus().setImage({src: url}).run();
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Could not upload image.');
    } finally {
      setUploadState(false);
    }
  }

  if (!editor) return <div className="editor-loading">Loading editor…</div>;

  return (
    <section className="rich-editor-shell">
      {!readOnly ? <EditorMenubar editor={editor} onImage={(file) => void insertImage(file)} /> : null}
      <div className="editor-status-row">
        <span>{editor.storage.characterCount.characters()} characters</span>
        {uploading ? <span>Uploading image…</span> : null}
        {uploadError ? <span className="admin-form-error">{uploadError}</span> : null}
      </div>
      <EditorContent editor={editor} className="rich-editor-content" />
    </section>
  );
}
