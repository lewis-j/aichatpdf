import { Button } from "@/components/ui/button";
import FileUpload from "@/components/FileUpload";
import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { LogIn } from "lucide-react";
import Link from "next/link";
import { chats } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";

export default async function Home() {
  const { userId } = await auth();
  const isAuth = !!userId;
  let firstChat;
  if (userId) {
    const _chats = await db
      .select()
      .from(chats)
      .where(eq(chats.userId, userId));
    if (_chats) {
      firstChat = _chats[0];
    }
  }
  return (
    <div className="min-h-screen bg-gradient-to-r from-slate-100 from-10% via-indigo-300 via-50% to-slate-100 to-90% animate-gradient-x flex items-center justify-center">
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="flex items-center space-x-3">
          <h1 className="text-5xl font-semibold">Chat with your Files</h1>
          <UserButton afterSwitchSessionUrl="/" />
        </div>
        <div className="flex mt-2">
          {isAuth && firstChat && (
            <Link href={`/chat/${firstChat?.id}`}>
              <Button>Go to Chats</Button>
            </Link>
          )}
        </div>
        <p className="max-w-xl mt-2 text-lg text-slate-600">
          Join millions of students, researchers and professionals to instantly
          answer questions and understand research with AI
        </p>
        <div className="w-full mt-4">
          {isAuth ? (
            <FileUpload />
          ) : (
            <Link href="/sign-in">
              <Button>
                Login to get started <LogIn className="w-4 h-4 ml-2" />
              </Button>
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
