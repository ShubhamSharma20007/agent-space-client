import {
  Code2,
  Copy,
  Check,
  PanelRightClose,
  PanelRightOpen,
  Eye,
} from "lucide-react";
import { useState } from "react";
import Editor from "@monaco-editor/react";
import { loader } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
loader.config({ monaco });
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useMessage } from "@/redux/hooks/useMessages";
import type { CodeBlock } from "@/types/chat";
import { detectExtension } from "@/utils/detectExtenstion";

interface ArtifactsProps {
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
  /** true while the user is dragging the resize handle */
  isResizing?: boolean;
}

function Artifacts({ isOpen, onClose, onOpen, isResizing = false }: ArtifactsProps) {
  const { latestArtifact } = useMessage();

  const artifact = latestArtifact?.[0] as CodeBlock | undefined;
  const [activeTab, setActiveTab] = useState<"code" | "preview">("code");
  const [copied, setCopied] = useState(false);
  const [activeFile, setActiveFile] = useState
    <"index.html" | "style.css" | "script.js"
  >("index.html");

  if (
    !latestArtifact ||
    latestArtifact.length === 0 ||
    latestArtifact[0].files.length === 0
  )
    return null;

  const activeFileContent = artifact?.files.find((f) => f.name === activeFile);
  const htmlContent = artifact?.files.find((f) => f.name === "index.html");
  const cssContent = artifact?.files.find((f) => f.name === "style.css");
  const jsContent = artifact?.files.find((f) => f.name === "script.js");
  const canBePreview = Boolean(htmlContent && cssContent && jsContent);

  const prevDoc = `
  <!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${artifact?.title ?? ""}</title>
    <style>
    ${cssContent?.content || ""}
    </style>
  </head>
  <body>
    ${htmlContent?.content || ""}
    <script>
  ${jsContent?.content || ""}
    </script>
  </body>
</html>
  `;

  const code = activeFileContent?.content;

  const handleCopy = async () => {
    if (!code) return;
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
    }, 1500);
  };

  const fileTab = (name: "index.html" | "style.css" | "script.js") => (
    <button
      key={name}
      onClick={() => setActiveFile(name)}
      className={cn(
        "h-11 px-3 text-xs transition-colors cursor-pointer border-b-2",
        activeFile === name
          ? "text-foreground border-foreground"
          : "text-muted-foreground border-transparent hover:text-foreground"
      )}
    >
      {name}
    </button>
  );

  return (
    // width is controlled by the ResizablePanel, so just fill it
    <div className="h-full w-full flex flex-col overflow-hidden bg-background text-foreground">
      {isOpen ? (
        <div className="flex flex-col h-full w-full bg-background">
          {/* Header */}
          <div className="h-14 px-3 border-b border-border flex items-center gap-3 shrink-0">
            {/* Close */}
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="size-7 shrink-0 text-muted-foreground hover:text-foreground"
              aria-label="Close artifacts"
            >
              <PanelRightClose size={17} />
            </Button>

            {/* Title */}
            <div className="flex items-center gap-2 min-w-0">
              <Code2 size={14} className="shrink-0 text-muted-foreground" />
              <div className="text-sm font-medium truncate">
                {artifact?.title ?? "Artifact"}
              </div>
            </div>

            {/* Code / Preview */}
            <div className="ml-auto flex items-center gap-1 bg-muted rounded-lg p-1 shrink-0">
              <Button
                variant={activeTab === "code" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("code")}
                className={cn(
                  "h-7 px-2.5 gap-1.5 text-xs",
                  activeTab !== "code" && "text-muted-foreground"
                )}
              >
                <Code2 size={13} />
                Code
              </Button>

              <Button
                variant={activeTab === "preview" ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("preview")}
                className={cn(
                  "h-7 px-2.5 gap-1.5 text-xs",
                  activeTab !== "preview" && "text-muted-foreground"
                )}
              >
                <Eye size={13} />
                Preview
              </Button>
            </div>

            {/* Copy */}
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCopy}
              disabled={!code}
              className="size-7 shrink-0 text-muted-foreground hover:text-foreground cursor-pointer"
              aria-label="Copy code"
              title="Copy code"
            >
              {copied ? <Check size={15} /> : <Copy size={15} />}
            </Button>
          </div>

          {/* Files */}
          {canBePreview && (
            <div className="h-11 px-3 border-b border-border flex items-center gap-1 overflow-x-auto overflow-y-hidden shrink-0">
              {fileTab("index.html")}
              {fileTab("style.css")}
              {fileTab("script.js")}
            </div>
          )}

          {/* Content: relative + absolute child = always exact remaining height */}
          <div className="flex-1 min-h-0 relative">
            {activeTab === "code" ? (
              <div className="absolute inset-0 overflow-hidden bg-[#1e1e1e]">
                {code ? (
                  <Editor
                    height="100%"
                    theme="vs-dark"
                    language={detectExtension(
                      activeFileContent?.name ?? activeFile
                    )}
                    // Give each file its own model so undo history, scroll
                    // position, etc. don't bleed between tabs.
                    path={activeFile}
                    value={code}
                    loading={
                      <div className="w-full h-full flex items-center justify-center bg-[#1e1e1e] text-neutral-400 text-xs">
                        Loading editor…
                      </div>
                    }
                    options={{
                      minimap: { enabled: false },
                      lineNumbers: "on",
                      automaticLayout: true, // re-fits when the panel is resized
                      scrollBeyondLastColumn: 10,
                      readOnly: true,
                      padding: { top: 10 },
                      fontSize: 13,
                      wordWrap: "on",
                      scrollbar: {
                        vertical: "auto",
                        horizontal: "auto",
                      },
                      folding: true,
                      renderWhitespace: "all",
                      renderControlCharacters: true,
                    }}
                  />
                ) : (
                  <div className="p-4 text-xs leading-5 text-neutral-400 font-mono">
                    // No code available
                  </div>
                )}
              </div>
            ) : (
              <div className="absolute inset-0 bg-white">
                <iframe
                  title="Artifact Preview"
                  // while dragging the handle, let mouse events pass through
                  className={cn(
                    "w-full h-full border-0",
                    isResizing && "pointer-events-none"
                  )}
                  sandbox="allow-scripts"
                  srcDoc={prevDoc}
                />
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Collapsed State (44px strip) */
        <div className="h-full w-full flex flex-col items-center bg-background border-l border-border">
          <Button
            variant="ghost"
            size="icon"
            onClick={onOpen}
            className="size-8 mt-3 text-muted-foreground hover:text-foreground"
            aria-label="Open artifacts"
          >
            <PanelRightOpen size={17} />
          </Button>

          {/* Vertical title */}
          <div className="flex-1 flex items-center justify-center min-h-0">
            <div
              className="text-xs font-medium text-muted-foreground whitespace-nowrap tracking-wider"
              style={{
                writingMode: "vertical-lr",
                transform: "rotate(180deg)",
              }}
            >
              {artifact?.title ?? "Artifact"}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Artifacts;