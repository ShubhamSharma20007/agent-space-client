import { useState } from "react";
import { cn } from "@/lib/utils";
import { type ChatMessageData } from "@/types/chat";
import { agents } from "@/agents";
import remarkGfm from 'remark-gfm'
import Markdown from 'react-markdown'
import { ExternalLink } from "lucide-react";
import { FaRegCopy } from "react-icons/fa6";
import { FaCheckDouble } from "react-icons/fa";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
interface ChatMessageProps {
  message: ChatMessageData;
}

const ChatMessage = ({ message }: ChatMessageProps) => {
  const isUser = message.role === "user";
  const agent = message.agentId ? agents.find((a) => a.id === message.agentId) : undefined;
  // track which image srcs (grid) failed to load
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set());
  const visibleImages = (message.images ?? []).filter((src) => !failedImages.has(src));
  const hasImages = visibleImages.length > 0;
  const [copyCode, setCopyCode] = useState('')
  const normalizedContent = (message.content ?? "").replace(/^[ \t]+/gm, "");

  const markFailed = (src: string) => {
    setFailedImages((prev) => {
      const next = new Set(prev);
      next.add(src);
      return next;
    });
  };

  const openImage = (src: string) => {
    window.open(src, '_blank');
  };

  async function copyCodeText(code: string) {
    await navigator.clipboard.writeText(code);
    setCopyCode(code)
    setTimeout(() => {
      setCopyCode('')
    }, 2000)
  }

  return (
    <div className={cn("flex w-full gap-3", isUser ? "justify-end" : "justify-start")}>
      {/* {!isUser && (
        <div className="w-7 h-7 shrink-0 rounded-full bg-gray-900 dark:bg-white flex items-center justify-center text-white dark:text-black text-xs">
          {Icon ? Icon : "sh"}
        </div>
      )} */}



      <div className={cn("max-w-[75%] sm:max-w-[65%]", isUser && "flex flex-col items-end")}>
        {!isUser && agent && (
          <span className="mb-1 block text-xs text-gray-400 dark:text-gray-500">{agent.label}</span>
        )}


        {hasImages && (
          <div className="mb-2 flex flex-wrap gap-2">
            {visibleImages.map((src, idx) => (
              <img
                key={src + idx}
                src={src}
                onClick={() => openImage(src)}
                onError={() => markFailed(src)}
                alt={`attachment-${idx}`}
                className="w-20 h-20 sm:w-24 sm:h-24 cursor-pointer object-cover rounded-lg border border-gray-200 dark:border-white/10 shrink-0"
                loading="lazy"
              />
            ))}
          </div>
        )}

        <div
          className={cn(
            "rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
            isUser && "whitespace-pre-wrap",
            isUser
              ? "bg-gray-900 dark:bg-white text-white dark:text-black rounded-br-sm"
              : "bg-gray-100 dark:bg-white/5 text-gray-800 dark:text-gray-100 rounded-bl-sm"
          )}
        >
          {
            isUser
              ? message.content
              : (
                <Markdown
                  remarkPlugins={[remarkGfm]}
                  components={{
                    h1: ({ children }) => (
                      <h1 className="text-2xl font-bold mt-5 mb-3">{children}</h1>
                    ),
                    h2: ({ children }) => (
                      <h2 className="text-lg font-bold mt-4 mb-2">{children}</h2>
                    ),
                    h3: ({ children }) => (
                      <h3 className="text-base font-bold mt-3 mb-1.5">{children}</h3>
                    ),
                    p: ({ children }) => (
                      <p className="mt-2 mb-4 whitespace-pre-wrap break-words">{children}</p>
                    ),
                    ul: ({ children }) => (
                      <ul className="list-disc pl-5 space-y-1 my-2">{children}</ul>
                    ),
                    ol: ({ children }) => (
                      <ol className="list-decimal pl-5 space-y-1 my-2">{children}</ol>
                    ),
                    table: ({ children }) => (
                      <div className="my-3 overflow-x-auto rounded-lg border border-gray-200 dark:border-white/10">
                        <table className="w-full text-left text-sm border-collapse">
                          {children}
                        </table>
                      </div>
                    ),
                    thead: ({ children }) => (
                      <thead className="bg-gray-100 dark:bg-white/10">
                        {children}
                      </thead>
                    ),
                    tbody: ({ children }) => (
                      <tbody className="divide-y divide-gray-200 dark:divide-white/10">
                        {children}
                      </tbody>
                    ),
                    tr: ({ children }) => (
                      <tr className="even:bg-gray-50 dark:even:bg-white/5">
                        {children}
                      </tr>
                    ),
                    th: ({ children }) => (
                      <th className="px-3 py-2 font-semibold text-gray-700 dark:text-gray-200 whitespace-nowrap">
                        {children}
                      </th>
                    ),
                    td: ({ children }) => (
                      <td className="px-3 py-2 text-gray-600 dark:text-gray-300 align-top">
                        {children}
                      </td>
                    ),
                    img: ({ src, alt }) => {
                      if (!src || failedImages.has(src)) return null;
                      return (
                        <img
                          src={src}
                          alt={alt}
                          onClick={() => openImage(src)}
                          onError={() => markFailed(src)}
                          className="w-full max-w-sm rounded-lg border border-gray-200 dark:border-white/10 my-1 cursor-pointer object-contain"
                          loading="lazy"
                        />
                      );
                    },
                    a: ({ href, children }) => {
                      if (!href || failedImages.has(href)) return null;
                      return (
                        <a
                          href={href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-500 hover:underline inline-flex items-center gap-1 underline"
                        >
                          {children}
                          <ExternalLink size={14} />
                        </a>
                      );
                    },
                    code: ({ className, children }) => {
                      const value = String(children).trim()
                      const isMultiline = value.includes('\n') || value.length > 60;

                      if (!className) {
                        if (isMultiline) {
                          return (
                            <pre className="my-3 px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-pink-300 text-[13px] leading-relaxed whitespace-pre-wrap break-words">
                              <code>{value}</code>
                            </pre>
                          );
                        }
                        return (
                          <code className="px-1.5 py-0.5 rounded bg-white/10 text-pink-400">
                            {value}
                          </code>
                        );
                      }

                      const language = className?.replace("language-", '');

                      return <div className="my-4 overflow-hidden rounded-xl border border-white/10 bg-[#1b1d24]">
                        <div className='flex items-center justify-between bg-[#1b1d24] border-b border-white/10 px-4 py-2'>
                          <span className="uppercase text-xs text-slate-300">
                            {language}
                          </span>
                          <button className="cursor-pointer" onClick={async () => {
                            await copyCodeText(value)
                          }}>
                            {
                              copyCode === value ?
                                <FaCheckDouble size={14} className="text-green-400" />
                                :
                                <FaRegCopy size={14} />
                            }
                          </button>
                        </div>
                        <SyntaxHighlighter language={language.split("-")[0]} style={oneDark}
                          wrapLongLines
                          showLineNumbers
                          customStyle={{
                            backgroundColor: '#1b1d24',
                          }}
                        >
                          {value}
                        </SyntaxHighlighter>
                      </div>
                    }
                  }}
                >
                  {normalizedContent}
                </Markdown>
              )
          }
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;