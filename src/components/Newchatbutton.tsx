import { FiPlus } from "react-icons/fi";
import { Button } from "@/components/ui/button";

interface NewChatButtonProps {
  onClick: () => void;
  disabled?: boolean;
  collapsed?: boolean;
}

const NewChatButton = ({ onClick, disabled, collapsed }: NewChatButtonProps) => {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
      variant="outline"
      title="New chat"
      aria-label="New chat"
      className={
        collapsed
          ? "w-9 h-9 p-0 mx-auto border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 text-gray-800 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-white/10"
          : "w-full justify-start gap-2 border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-3.5 py-2.5 h-auto text-sm font-medium text-gray-800 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-white/10"
      }
    >
      <FiPlus size={16} />
      {!collapsed && "New chat"}
    </Button>
  );
};

export default NewChatButton;