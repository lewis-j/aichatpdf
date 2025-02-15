"use client";
import React, { useEffect } from "react";
import { Input } from "./ui/input";
import { Message, useChat } from "ai/react";
import { Button } from "./ui/button";
import { Send } from "lucide-react";
import MessageList from "./MessageList";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";

type Props = {
  chatId: number;
};

const ChatComponent = ({ chatId }: Props) => {
  const { data, isLoading } = useQuery({
    queryKey: ["chat", chatId],
    queryFn: async () => {
      const response = await axios.post<Message[]>("/api/get-messages", {
        chatId,
      });
      return response.data;
    },
  });
  const { messages, input, handleInputChange, handleSubmit } = useChat({
    api: "/api/chat",
    body: {
      chatId,
    },
    initialMessages: data || [],
  });

  useEffect(() => {
    const chatContainer = document.getElementById("chat-container");
    if (chatContainer) {
      chatContainer.scrollTo({
        top: chatContainer.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);
  return (
    <div
      className="relative max-h-screen overflow-auto bg-slate-50"
      id="chat-container"
    >
      <div className="sticky top-0 inset-x-0 p-4 bg-white h-fit border-b border-slate-200 shadow-sm">
        <h3 className="text-xl font-bold text-slate-800">Chat</h3>
      </div>
      <MessageList messages={messages} isLoading={isLoading} />
      <form
        onSubmit={handleSubmit}
        className="sticky bottom-0 inset-x-0 px-4 py-3 bg-white border-t border-slate-200"
      >
        <div className="flex max-w-4xl mx-auto">
          <Input
            value={input}
            onChange={handleInputChange}
            placeholder="Ask a question about your PDF..."
            className="w-full rounded-full border-slate-300 focus:border-indigo-500 focus:ring-indigo-500"
          />
          <Button className="bg-indigo-600 hover:bg-indigo-700 ml-2 rounded-full px-4">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ChatComponent;
