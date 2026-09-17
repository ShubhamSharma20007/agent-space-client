import { type IconType } from "react-icons";

export type AgentId = "auto" | "coding" | "ppt" | "pdf" | "search" | "image";

export interface Agent {
  id: AgentId;
  label: string;
  icon: IconType;
}

export interface ChatMessageData {
  _id?: string;
  role: "user" | "assistant";
  content: string;
  agentId?: AgentId;
  createdAt: string;
  images?: string[];
  artifacts?: any[];
}

export interface ChatSession {
  _id: string |null;
  title: string;
  userId:string
}

export interface ChatUser {
  name: string;
  email?: string;
  picture?: string;
}


interface CodeFile {
  name: string;
  content: string;
}

export interface CodeBlock {
  type: "CODE";
  title:string
  files: CodeFile[];
}


export interface VerifyPayment {
  razorpay_payment_id:string
  razorpay_order_id:string
  razorpay_signature:string
}

export interface CreateOrder{
  planId:String
}

interface Plan{
   userId:String
    orderId:String
    paymentId:String
    amount:Number
    currency:String
    credits:Number
    plan:String,
    status:String
}

export interface PaymentState {
  currentPlan: Plan|null,
  loading: Boolean,
  error: null|String,
}

export interface RazorpayOptions {
  key: string;
  amount: number;
  currency: string;
  name?: string;
  description?: string;
  order_id: string;
  handler: (response: {
    razorpay_payment_id: string;
    razorpay_order_id: string;
    razorpay_signature: string;
  }) => void;
  prefill?: { name?: string; email?: string; contact?: string };
  theme?: { color?: string };
}