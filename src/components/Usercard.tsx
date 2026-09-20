import { FiLogOut } from "react-icons/fi";
import { FaCoins } from "react-icons/fa6";
import { type ChatUser } from "@/types/chat";
import { useUser } from "@/redux/hooks/useUser";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface UserCardProps {
  user: ChatUser;
  onLogout?: () => void;
  collapsed?: boolean;
  setIsBillingOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const getInitials = (name: string) =>
  name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "U";

const UserAvatar = ({ user }: { user: ChatUser }) => (
  <Avatar title={user.name} className="shrink-0">
    <AvatarImage
      src={user.picture}
      alt={user.name}
      referrerPolicy="no-referrer"
    />
    <AvatarFallback className="bg-gray-900 dark:bg-white text-white dark:text-black font-medium text-xs">
      {getInitials(user.name)}
    </AvatarFallback>
  </Avatar>
);

const UserCard = ({
  user,
  onLogout,
  collapsed,
  setIsBillingOpen,
}: UserCardProps) => {
  const userRedux = useUser();

  if (collapsed) {
    return (
      <div className="flex flex-col items-center gap-2">
        <UserAvatar user={user} />
        {onLogout && (
          <button
            type="button"
            onClick={onLogout}
            aria-label="Log out"
            title="Log out"
            className="shrink-0 cursor-pointer p-1.5 rounded-md text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10"
          >
            <FiLogOut size={14} />
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2.5 rounded-md border border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 px-2.5 py-2">
      <UserAvatar user={user} />

      <div className="min-w-0 flex-1" title="credit's">
        <p className="truncate text-sm font-medium text-gray-900 dark:text-white">
          {user.name}
        </p>

        <div className="flex items-center gap-1 mt-0.5">
          <div
            className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 cursor-pointer"
            onClick={() => {
              setIsBillingOpen(true);
            }}
          >
            <FaCoins size={13} className="text-yellow-500" />
            <span>{Math.max(userRedux.user.credits, 0)} credits</span>/
          </div>

          <span
            className={
              "shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide " +
              (userRedux.user.planId === "pro"
                ? "bg-violet-100 text-violet-700 dark:bg-violet-500/15 dark:text-violet-300"
                : userRedux.user.planId === "starter"
                ? "bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300"
                : "bg-gray-100 text-gray-600 dark:bg-white/10 dark:text-gray-300")
            }
          >
            {userRedux.user.planId || "free"}
          </span>
        </div>
      </div>

      {onLogout && (
        <button
          type="button"
          onClick={onLogout}
          aria-label="Log out"
          title="Log out"
          className="shrink-0 cursor-pointer p-1.5 rounded-md text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10"
        >
          <FiLogOut size={14} />
        </button>
      )}
    </div>
  );
};

export default UserCard;