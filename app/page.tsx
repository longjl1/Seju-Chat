'use client';

import { useState, useRef, useEffect } from 'react';
import Image from 'next/image'

type ChatMessage = {
  id: number;
  role: 'user' | 'assistant';
  content: string;
};

type Doc = {
  _id: string;
  originalName: string;
  createdAt?: string;
};

export default function Page() {
  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  // Document state
  const [docs, setDocs] = useState<Doc[]>([]);
  const [uploading, setUploading] = useState(false);
  const [docStatus, setDocStatus] = useState(''); // 文档相关提示

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  
  // load docs list
  async function loadDocs() {
    try {
      const res = await fetch('/api/docs');
      const data = await res.json();
      if (data.success) {
        setDocs(data.docs);
      }
    } catch (err) {
      console.error('Load docs error:', err);
    }
  }

  useEffect(() => {
    // load docs 
    void loadDocs();
  }, []);

  // Upload -> trigger file select
  function triggerFileSelect() {
    if (uploading) return;
    fileInputRef.current?.click();
  }

  // Select doc：upload + embedding
  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setDocStatus(`Uploading: ${file.name} …`);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/docs/upload', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();

      if (data.success) {
        setDocStatus(`Added to the DB：${data.originalName || file.name}`);
        await loadDocs(); // Get updated doc list
      } else {
        setDocStatus(`Error: ${data.error ?? ''}`);
      }
    } catch (err) {
      console.error('Upload error:', err);
      setDocStatus('upload failed');
    } finally {
      setUploading(false);
      e.target.value = ''; // allow re-upload the same file
    }
  }

  // Delete Doc（delete the embedding using the /api/docs/delete ）
  async function handleDeleteDoc(id: string) {
    // if (!confirm('Delete it？')) return;

    setDocStatus('Deleting Doc...');
    try {
      const res = await fetch('/api/docs/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const data = await res.json();
      if (data.success) {
        setDocStatus('Deleted!');
        await loadDocs();
      } else {
        setDocStatus(`Error: ${data.error ?? ''}`);
      }
    } catch (err) {
      console.error('Delete doc error:', err);
      setDocStatus('Error deleting doc');
    }
  }

  // chat functions

  async function sendMessage() {
    if (!input.trim() || loading) return;

    const userMsg: ChatMessage = {
      id: Date.now(),
      role: 'user',
      content: input,
    };

    const historyForBackend = [...messages, userMsg];
    const assistantId = userMsg.id + 1;

    setMessages(prev => [
      ...prev,
      userMsg,
      { id: assistantId, role: 'assistant', content: '' },
    ]);

    setInput('');
    setLoading(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: historyForBackend.map(m => ({
            role: m.role,
            content: m.content,
          })),
        }),
      });
      
      if (!res.ok) {
        const text = await res.text();
        console.error('Chat API Error page:', text);
        setMessages(prev => [
          ...prev,
          {
            id: Date.now(),
            role: 'assistant',
            content: 'backend error occurred!',
          },
        ]);
        setLoading(false);
        return;
      }

      // 
      if (!res.body) throw new Error('No response body');

      if (!res.body) {
        throw new Error('No response body');
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder('utf-8');
      let done = false;

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          setMessages(prev =>
            prev.map(msg =>
              msg.id === assistantId
                ? { ...msg, content: msg.content + chunk }
                : msg,
            ),
          );
        }
      }
    } catch (err) {
      console.error('Chat error:', err);
      setMessages(prev => [
        ...prev,
        {
          id: Date.now() + 100,
          role: 'assistant',
          content: '（Error, try again）',
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    await sendMessage();
  }


  return (
    <div className="flex flex-col bg-seju-grey h-screen">
      {/* header */}
      <header className="fixed flex top-0 left-0 right-0 z-20 bg-transparent px-4 py-3">
        <h1 className="text-lg font-semibold text-pink-300">Seju Chat</h1>
        <Image src="/haha.svg" width={24} height={24} alt="doc icon"/>
      </header>

      {/* main session */}
      <div className="flex flex-col flex-1 pt-16">
        <main className="flex-1 overflow-y-auto bg-seju-grey flex flex-col items-center p-4 pb-24">
          <div className="w-full max-w-3xl">
            <div className="rounded-lg">
              {messages.map(message => {
                const isUser = message.role === 'user';

                return (
                  <div
                    key={message.id}
                    className={`w-full py-5 mb-3 flex ${
                      isUser ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`inline-block text-base rounded-2xl  py-3 
                         whitespace-pre-wrap break-words
                      ${
                        isUser
                          ? 'max-w-[62%] px-3 bg-neutral-100 text-neutral-800'
                          : 'bg-white text-neutral-800'
                      }`}
                    >
                      {message.content || (!isUser && loading ? '...' : '')}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      </div>

      {/* footer + upload + doc cardview */}
      <form onSubmit={handleSubmit} className="px-4 py-10">
        <footer className="fixed bottom-0 left-0 right-0 z-20 bg-transparent px-4 py-3">
          <div className="flex flex-col justify-center items-center">
            <div className="flex flex-col px-4 border border-neutral-300 rounded-4xl
                        w-3xl max-w-[1000px] min-w-[300px] bg-white shadow-md">
            
              {/* card docs: docs in a list */}
              {docs.length > 0 && (
                <div className="flex flex-wrap gap-3 pt-3 pb-1 px-1">
                  {docs.map(doc => (
                    <div
                      key={doc._id}
                      className="relative flex items-center max-w-[220px] bg-neutral-100
                                 border border-neutral-200 rounded-xl px-3 py-2 text-xs
                                 text-neutral-700"
                    >
                      <span className="truncate pr-4">
                        <Image src="/files.svg" width={24} height={24} alt="doc icon"/>
                      </span>
                      <span className="truncate pr-4">{doc.originalName}</span>
                      <button
                        type="button"
                        onClick={() => handleDeleteDoc(doc._id)}
                        className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-neutral-300
                                   text-[10px] leading-[20px] text-neutral-700 hover:bg-red-300 flex
                                   items-center justify-center"
                        title="delete document"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* docs state */}
              {/* {docStatus && (
                <p className="mt-1 text-[11px] text-neutral-500">
                  {docStatus}
                </p>
              )} */}

              {/* type in */}
              <textarea
                className="w-full rounded bg-transparent px-2 py-2 text-lg
                          resize-none overflow-y-auto max-h-[220px] focus:outline-hidden justify-center"
                value={input}
                onChange={e => setInput(e.currentTarget.value)}
                disabled={loading}
                placeholder="Send a message..."
                rows={1}
                onInput={e => {
                  const el = e.target as HTMLTextAreaElement;
                  el.style.height = 'auto';
                  const maxHeight = parseInt(getComputedStyle(el).maxHeight);
                  if (el.scrollHeight > maxHeight) {
                    el.style.height = maxHeight + 'px';
                  } else {
                    el.style.height = el.scrollHeight + 'px';
                  }
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    void sendMessage();
                    const el = e.target as HTMLTextAreaElement;
                    el.style.height = 'auto';
                  }
                }}
              />

              {/* upload button and a bar view */}
              <div className="flex items-center justify-between py-2 px-2">
                {/* upload */}
                <button
                  type="button"
                  onClick={triggerFileSelect}
                  disabled={uploading}
                  className=" w-9 h-9 rounded-full bg-neutral-100 flex items-center justify-center text-neutral-500
                            hover:bg-neutral-200 flex-shrink-0 disabled:opacity-60"
                  title="upload"
                >
                  <Image src="/add.svg" width={24} height={24} alt="upload"/>
                </button>

                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleFileChange}
                />

                {/* submit */}
                <button
                  type="submit"
                  disabled={loading || !input.trim()}
                  className="w-9 h-9 rounded-full bg-pink-200 flex items-center justify-center text-white
                             hover:bg-pink-300 flex-shrink-0 disabled:bg-neutral-200 disabled:cursor-not-allowed"
                >
                  <Image src="/send.svg" width={24} height={24} alt="send"/>
                </button>
              </div>
            </div>
            <div className="mt-2 text-neutral-500 flex flex-col items-center">
              <p className="capitalize text-sm">Converse. Connect. Create. 2023 - 2025 </p>
            </div>
          </div>
        </footer>
      </form>
    </div>
  );
}
