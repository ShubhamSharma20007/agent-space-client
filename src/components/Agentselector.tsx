import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { agents } from "@/agents";
import type { AgentId } from "@/types/chat";

interface AgentSelectorProps {
  activeAgentId: AgentId;
  onSelect: (id: AgentId) => void;
}

const AgentSelector = ({
  activeAgentId,
  onSelect,
}: AgentSelectorProps) => {
  return (
    <div
      className="flex flex-wrap gap-1.5 px-1 pb-2"
      role="tablist"
      aria-label="Select agent"
    >
      {agents.map((agent) => {
        const active = agent.id === activeAgentId;
        const Icon = agent.icon;

        return (
          <Button
            key={agent.id}
            type="button"
            role="tab"
            aria-selected={active}
            variant="outline"
            size="sm"
            onClick={() => onSelect(agent.id)}
            className={cn(
              "h-8 rounded-full px-3 text-xs font-medium gap-1.5 cursor-pointer border transition-colors",
              active
                ? "border-transparent bg-gray-900 dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200"
                : cn(
                    "border-gray-200 dark:border-white/10",
                    "bg-white dark:bg-white/5",
                    "text-gray-600 dark:text-gray-300",
                    "hover:bg-gray-50 dark:hover:bg-white/10"
                  )
            )}
          >
            <Icon size={14} />
            {agent.label}
          </Button>
        );
      })}
    </div>
  );
};

export default AgentSelector;