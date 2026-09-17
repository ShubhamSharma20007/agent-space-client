import { useState, useRef, type KeyboardEvent, type Ref, type ChangeEvent } from "react";
import { FiArrowUp, FiPaperclip, FiMic, FiX } from "react-icons/fi";
import { Button } from "@/components/ui/button";
import AgentSelector from "./Agentselector";
import type { AgentId } from "@/types/chat";

interface ChatComposerProps {
  activeAgentId: AgentId;
  onSelectAgent: (id: AgentId) => void;
  onSend: (message: string, file?: File) => void;
  disabled?: boolean;
  chatInputRef: Ref<HTMLTextAreaElement> | null;
}

const ChatComposer = ({ activeAgentId, onSelectAgent, onSend, disabled, chatInputRef }: ChatComposerProps) => {
  const [value, setValue] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [isRecording, setIsRecording] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);

  const handleSend = () => {
    const trimmed = value.trim();
    if ((!trimmed && files.length === 0) || disabled) return;
    onSend(trimmed, files[0]);
    setValue("");
    setFiles([]);
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files;
    if (!selected || selected.length === 0) return;
    setFiles([selected[0]]);
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleRecording = () => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      console.warn("Speech recognition is not supported in this browser.");
      return;
    }

    if (isRecording) {
      recognitionRef.current?.stop();
      setIsRecording(false);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setValue((prev) => (prev ? `${prev} ${transcript}` : transcript));
    };

    recognition.onerror = () => setIsRecording(false);
    recognition.onend = () => setIsRecording(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
  };

  return (
    <div className="border-t border-gray-200 dark:border-white/10 bg-white dark:bg-[#05070d] px-4 pt-3 pb-4 sm:px-6">
      <AgentSelector activeAgentId={activeAgentId} onSelect={onSelectAgent} />

      {files.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {files.map((file, i) => (
            <div
              key={`${file.name}-${i}`}
              className="flex items-center gap-1.5 rounded-full border border-gray-200 dark:border-white/10 bg-gray-100 dark:bg-white/10 px-2.5 py-1 text-xs text-gray-700 dark:text-gray-200"
            >
              <span className="max-w-[140px] truncate">{file.name}</span>
              <button
                type="button"
                onClick={() => removeFile(i)}
                className="text-gray-400 hover:text-gray-700 dark:hover:text-white"
              >
                <FiX size={12} />
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-end gap-2 rounded-2xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 px-3 py-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept=".pdf,image/*"
          onClick={(e) => {
            (e.target as HTMLInputElement).value = "";
          }}
          className="hidden"
        />

        <Button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || files.length > 0}
          size="icon"
          variant="ghost"
          className="shrink-0 w-9 h-9 rounded-full text-gray-500 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10 disabled:opacity-40"
        >
          <FiPaperclip size={16} />
        </Button>

        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          ref={chatInputRef}
          placeholder="Message the agent…"
          className="flex-1 resize-none bg-transparent text-sm text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none max-h-40 py-1.5"
        />

        <Button
          type="button"
          onClick={toggleRecording}
          disabled={disabled}
          size="icon"
          variant="ghost"
          className={`shrink-0 w-9 h-9 rounded-full ${isRecording
              ? "text-red-500 bg-red-50 dark:bg-red-500/10 animate-pulse"
              : "text-gray-500 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/10"
            }`}
        >
          <FiMic size={16} />
        </Button>

        <Button
          type="button"
          onClick={handleSend}
          disabled={disabled || (!value.trim() && files.length === 0)}
          size="icon"
          className="shrink-0 w-9 h-9 rounded-full bg-gray-900 dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-40"
        >
          <FiArrowUp size={16} />
        </Button>
      </div>
    </div>
  );
};

export default ChatComposer;