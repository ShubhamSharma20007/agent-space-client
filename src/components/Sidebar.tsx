import { useState } from "react";
import { FiChevronLeft, FiChevronRight } from "react-icons/fi";
import NewChatButton from "./Newchatbutton";
import ChatHistoryItem from "./Chathistoryitem";
import UserCard from "./Usercard";
import { Badge } from "@/components/ui/badge"
import { type ChatSession, type ChatUser, type RazorpayOptions } from "@/types/chat";
import { RiRobot2Line } from "react-icons/ri";
import BillingDrawer from "./BillingDrawer";
import planService from "@/services/plan.service";
import { toast } from "@/components/ui/toast"
import { useUser } from "@/redux/hooks/useUser";
import authService from "@/services/auth.service";
declare global {
  interface Window {
    Razorpay: new (options: RazorpayOptions) => { open: () => void };
  }
}

interface SidebarProps {
  sessions: ChatSession[];
  activeSessionId: string | null;
  onNewChat: () => void;
  onSelectSession: (id: string) => void;
  user: ChatUser;
  onLogout?: () => void;
}

const Sidebar = ({
  sessions,
  activeSessionId,
  onNewChat,
  onSelectSession,
  user,
  onLogout,
}: SidebarProps) => {
  const [collapsed, setCollapsed] = useState(false);
  const [isBillingOpen, setIsBillingOpen] = useState(false);
  const [upgrading, setUpgrading] = useState(false);
  const userRedux = useUser();
  const upgradePlan = async (planId: string) => {
    if (typeof window.Razorpay === "undefined") {
      console.error("Razorpay SDK not loaded. Add the checkout.js script tag to index.html.");
      return;
    }
    setUpgrading(true);
    try {
      const order = await planService.createPlan({ planId });
      // Expecting something like { id, amount, currency } back from your backend.
      if (!order?.orderId) {
        console.error("Failed to create order");
        return;
      }

      const options: RazorpayOptions = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency ?? "INR",
        name: "Agent Space",
        description: "Plan upgrade",
        order_id: order.orderId,
        prefill: {
          name: user?.name,
          email: user?.email,
        },
        handler:async(response)=>{
          console.log(response,2332)
           try {
          await planService.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            toast.add({
              title: "Payment verified",
              description: "Your payment has been verified",
            })
              const fetchUser = await authService.getUser();
              if (fetchUser) {
                  userRedux.setUser(fetchUser);
              }
            setIsBillingOpen(false);
          } catch (err) {
            console.error("Payment verification failed", err);
          }
        },
        theme: { color: "#111111" },
      }
       const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("Failed to start upgrade flow", err);

    }
    finally{
      setUpgrading(false)
    }
  }

  return (
    <aside
      className={`hidden md:flex shrink-0 flex-col border-r border-gray-200 dark:border-white/10 bg-white dark:bg-[#05070d] p-3 transition-[width] duration-200 ${collapsed ? "md:w-16" : "md:w-64 lg:w-72"
        }`}
    >
      {/* Brand mark + collapse toggle */}
      <div className={`flex items-center pb-3 ${collapsed ? "flex-col gap-2" : "justify-between px-1"}`}>
        <div className={`flex items-center gap-2 ${collapsed ? "" : ""}`}>
          <div className="w-7 h-7 shrink-0 rounded-full bg-gray-900 dark:bg-white flex items-center justify-center text-white dark:text-black font-semibold text-xs">
            <RiRobot2Line size={18} />
          </div>
          {!collapsed && (
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-gray-900 dark:text-white">Agent Space</span>
              {/* <Badge className="text-[10px]">Free</Badge> */}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => setCollapsed((prev) => !prev)}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="shrink-0 cursor-pointer p-1.5 rounded-md text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-white/10"
        >
          {collapsed ? <FiChevronRight size={14} /> : <FiChevronLeft size={14} />}
        </button>
      </div>

      <NewChatButton onClick={onNewChat} collapsed={collapsed} />

      <nav className="mt-4 flex-1 space-y-0.5 overflow-y-auto overflow-x-hidden sidebar">
        {sessions?.length === 0 ? (
          !collapsed && (
            <p className="px-3 py-2 text-xs text-gray-400 dark:text-gray-500">
              Your conversations will show up here.
            </p>
          )
        ) : (
          sessions.map((session) => (
            <ChatHistoryItem
              key={session._id}
              session={session}
              active={session._id === activeSessionId}
              onSelect={onSelectSession}
              collapsed={collapsed}
            />
          ))
        )}
      </nav>

      <div className="mt-3 pt-3 border-t border-gray-200 dark:border-white/10">
        <UserCard user={user} onLogout={onLogout} collapsed={collapsed} setIsBillingOpen={setIsBillingOpen} />
      </div>
      {/*  Billing Plans */}

      <BillingDrawer
        isOpen={isBillingOpen}
        onClose={() => setIsBillingOpen(false)}
        onUpgrade={upgradePlan}
        upgrading={upgrading}
      />
    </aside>
  );
};

export default Sidebar;