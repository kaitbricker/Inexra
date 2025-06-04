import React from "react";
import { Message } from "@/app/messages";

export default function MessageCard({ message, onClick, isActive }: {
  message: Message;
  onClick: () => void;
  isActive?: boolean;
}) {
  return (
    <div
      className={`rounded-lg border border-gray-100 bg-white shadow-sm p-4 hover:bg-gray-50 transition cursor-pointer mb-2 ${isActive ? "ring-2 ring-indigo-400" : ""}`}
      onClick={onClick}
    >
      <div className="flex justify-between items-center">
        <div className="flex gap-3 items-center">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-base">
            {message.sender}
          </div>
          <div>
            <span className="text-sm font-medium text-gray-800">{message.sender}</span>
            <p className="text-sm text-gray-500 truncate max-w-xs">{message.preview}</p>
            <span className="text-xs text-gray-400">{message.time}</span>
          </div>
        </div>
        <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${message.tagColor}`}>{message.tag}</span>
      </div>
    </div>
  );
} 