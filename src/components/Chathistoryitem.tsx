import { useRef, useState } from "react";
import { createPortal } from "react-dom";
import { FiMessageSquare } from "react-icons/fi";
import { cn } from "@/lib/utils";
import { type ChatSession } from "@/types/chat";

interface ChatHistoryItemProps {
  session: ChatSession;
  active?: boolean;
  onSelect: (id: string) => void;
  collapsed?: boolean;
}

const ChatHistoryItem = ({ session, active, onSelect, collapsed }: ChatHistoryItemProps) => {
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const [tooltipPos, setTooltipPos] = useState<{ top: number; left: number } | null>(null);
  const [mounted, setMounted] = useState(false); // controls whether portal node exists in DOM
  const [visible, setVisible] = useState(false); // controls opacity/scale transition state

  const handleMouseEnter = () => {
    if (!collapsed || !buttonRef.current) return;
    const rect = buttonRef.current.getBoundingClientRect();
    setTooltipPos({
      top: rect.top + rect.height / 2,
      left: rect.right + 8,
    });
    setMounted(true);
    // next tick, so the initial (hidden) styles apply before transitioning in
    requestAnimationFrame(() => setVisible(true));
  };

  const handleMouseLeave = () => {
    setVisible(false); // triggers fade-out transition
  };

  const handleTransitionEnd = () => {
    if (!visible) {
      setMounted(false); // fully remove from DOM only after fade-out completes
    }
  };

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => onSelect(session._id!)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className={cn(
          "w-full flex items-center truncate gap-2 rounded-md cursor-pointer px-3 py-2 text-left text-sm transition-colors",
          collapsed && "justify-center px-0",
          "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10",
          active && "bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white"
        )}
      >
        <FiMessageSquare size={14} className="shrink-0 opacity-70" />
        {!collapsed && <span className="truncate">{session.title}</span>}
      </button>

      {collapsed && mounted && tooltipPos && createPortal(
        <div
          onTransitionEnd={handleTransitionEnd}
          className={cn(
            "fixed z-[100] -translate-y-1/2 whitespace-nowrap rounded-md",
            "bg-gray-900 dark:bg-white px-2.5 py-1.5 text-xs font-medium",
            "text-white dark:text-black shadow-lg pointer-events-none",
            "transition-all duration-150 ease-out",
            visible ? "opacity-100 scale-100" : "opacity-0 scale-95"
          )}
          style={{ top: tooltipPos.top, left: tooltipPos.left }}
        >
          {session.title}
        </div>,
        document.body
      )}
    </>
  );
};

export default ChatHistoryItem;