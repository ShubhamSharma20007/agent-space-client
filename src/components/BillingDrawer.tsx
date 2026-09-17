import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { FiZap } from "react-icons/fi";
import { cn } from "@/lib/utils";
import { useUser } from "@/redux/hooks/useUser";

interface Plan {
  id: string;
  name: string;
  price: string;
  credits: number;
}

const plans: Plan[] = [
  {
    id: "free",
    name: "Free",
    price: "₹0",
    credits: 100,
  },
  {
    id: "starter",
    name: "Starter Plan",
    price: "₹199",
    credits: 500,
  },
  {
    id: "pro",
    name: "Pro Plan",
    price: "₹499",
    credits: 1000,
  },
];

interface BillingDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onUpgrade?: (planId: string) => void;
  upgrading: boolean;
}

const BillingDrawer = ({ isOpen, onClose, onUpgrade, upgrading }: BillingDrawerProps) => {
  const userRedux = useUser();
  const currentUser = userRedux.user;

  const currentPlanId = currentUser?.planId || "free";
  const totalCredits = currentUser?.totalCredits || 0;
  const remainingCredits = currentUser?.credits ?? 0;
  const usedPct =
    totalCredits > 0 ? Math.min(100, (remainingCredits / totalCredits) * 100) : 0;

    const progressColor =
  usedPct <= 20
    ? "bg-red-500"
    : usedPct <= 50
    ? "bg-yellow-500"
    : "bg-green-500";
  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className={cn(
          "flex h-full w-full flex-col sm:max-w-md border-l p-0",
          "bg-white dark:bg-[#05070d]",
          "border-gray-200 dark:border-white/10",
          "text-gray-900 dark:text-gray-100"
        )}
      >
        <SheetHeader className="border-b border-gray-200 dark:border-white/10 px-4 py-3 text-left">
          <SheetTitle className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Billing
          </SheetTitle>
          <SheetDescription className="text-sm text-gray-500 dark:text-gray-400">
            Plans & Credits
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-4 py-4">
          {plans.map((plan) => {
            const isCurrent = plan.id === currentPlanId;

            return (
              <div
                key={plan.id}
                className={cn(
                  "rounded-xl border p-5",
                  "border-gray-200 dark:border-white/10",
                  "bg-gray-50 dark:bg-white/[0.03]"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {isCurrent ? "Current Plan" : plan.name}
                  </span>
                  {isCurrent && (
                    <span className="text-yellow-500">
                      <FiZap size={16} />
                    </span>
                  )}
                </div>

                {isCurrent ? (
                  <>
                    <p className="mt-1.5 text-lg font-semibold text-gray-900 dark:text-white">
                      {plan.name}
                    </p>
                    <div className="mt-5 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                      <span>Credits</span>
                      <span>
                        {remainingCredits}/{totalCredits}
                      </span>
                    </div>
                    <div className="mt-2 h-1.5 w-full rounded-full bg-gray-200 dark:bg-white/10">
                      <div
                           className={cn("h-1.5 rounded-full transition-colors", progressColor)}
                        style={{ width: `${usedPct}%` }}
                      />
                    </div>
                  </>
                ) : (
                  <>
                    <p className="mt-1.5 text-2xl font-semibold text-gray-900 dark:text-white">
                      {plan.price}
                    </p>
                    <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                      {plan.credits} Credits
                    </p>
                    <Button
                      disabled={upgrading || (currentUser.isFreeEnd === true && plan.id === "free") }
                      onClick={() => {
                        if(currentUser.isFreeEnd === true && plan.id === "free") return
                        if (upgrading) return;
                        onUpgrade?.(plan.id);
                      }}
                      className={cn(
                        "mt-5 w-full rounded-lg font-medium",
                        "bg-gray-900 text-white hover:bg-gray-700",
                        "dark:bg-white dark:text-gray-900 dark:hover:bg-gray-200"
                      )}
                    >
                      Upgrade
                    </Button>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default BillingDrawer;