import ChatComponent from "@/components/ChatComponent";
import ChatSideBar from "@/components/ChatSideBar";
import PDFViewer from "@/components/PDFViewer";
import { db } from "@/lib/db";
import { chats } from "@/lib/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import React from "react";

type Props = {
  params: {
    chatId: string;
  };
};

const ChatPage = async ({ params }: Props) => {
  const { chatId } = await params;
  const { userId } = await auth();
  if (!userId) {
    return redirect("/sign-in");
  }
  const _chats = await db.select().from(chats).where(eq(chats.userId, userId));
  if (!_chats) {
    console.log("no chats found");
    redirect("/");
  }
  const currentChat = _chats.find((chat) => chat.id === parseInt(chatId));
  console.log(currentChat);
  if (!currentChat) {
    console.log("no current chat");
    return redirect("/");
  }

  return (
    <div className="flex max-h-screen overflow-auto">
      <div className="flex w-full max-h-screen overflow-auto">
        <div className="flex-[1] max-w-xs">
          <ChatSideBar chats={_chats} chatId={parseInt(chatId)} />
        </div>
        <div className="flex-[5] max-h-screen p-2 overflow-auto bg-slate-50">
          <div className="rounded-lg overflow-hidden shadow-md h-full">
            <PDFViewer file_url={currentChat?.fileUrl || ""} />
          </div>
        </div>
        <div className="flex-[3] border-l border-slate-200 bg-slate-50">
          <ChatComponent chatId={parseInt(chatId)} />
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
