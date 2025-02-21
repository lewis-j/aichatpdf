"use-client";
import { DrizzleChat } from "@/lib/db/schema";
import Link from "next/link";
import React from "react";
import { Button } from "./ui/button";
import { MessageCircle, PlusCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type Props = {
  chats: DrizzleChat[];
  chatId: number;
};

const ChatSideBar = ({ chats, chatId }: Props) => {
  return (
    <div className="w-full h-screen p-4 text-gray-200 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      <Link href="/">
        <Button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white border-none">
          <PlusCircle className="mr-2 w-4 h-4" />
          New Chat
        </Button>
      </Link>

      <div className="flex flex-col gap-2 mt-4">
        {chats.map((chat) => (
          <Link key={chat.id} href={`/chat/${chat.id}`}>
            <div
              className={cn(
                "rounded-lg p-3 text-slate-300 flex items-center transition-all duration-200",
                {
                  "bg-indigo-600/90 text-white shadow-lg": chat.id === chatId,
                  "hover:bg-slate-800/80 hover:text-white": chat.id !== chatId,
                }
              )}
            >
              <MessageCircle className="mr-2" />
              <p className="w-full overflow-hidden text-sm truncate whitespace-nowrap text-ellipsis">
                {chat.fileName}
              </p>
            </div>
          </Link>
        ))}
      </div>
      <div className="absolute bottom-4 left-4">
        <div className="flex items-center gap-2 text-sm text-slate-500 flex-wrap">
          <Link href="/">Home</Link>
          <Link href="/">Source</Link>
          {/*Stripe Button */}
        </div>
      </div>
    </div>
  );
};

export default ChatSideBar;
