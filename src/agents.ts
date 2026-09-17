import { FiZap, FiCode, FiMonitor, FiFileText, FiSearch, FiImage } from "react-icons/fi";
import { type Agent } from "@/types/chat";

export const agents: Agent[] = [
  { id: "auto", label: "Auto", icon: FiZap },
  { id: "search", label: "Search", icon: FiSearch },
  { id: "coding", label: "Coding", icon: FiCode },
  { id: "ppt", label: "Slides", icon: FiMonitor },
  { id: "pdf", label: "PDF", icon: FiFileText },
  { id: "image", label: "Image Generate", icon: FiImage },
];