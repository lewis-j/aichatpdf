"use client";
import { uploadToS3 } from "@/lib/s3";
import { Inbox, Loader2 } from "lucide-react";
import React, { useState } from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";
import { useMutation } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

const FileUpload = () => {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const { mutate, isPending } = useMutation({
    mutationFn: async ({
      file_key,
      file_name,
    }: {
      file_key: string;
      file_name: string;
    }) => {
      console.log("files", file_key, file_name);
      const response = await axios.post("/api/create-chat", {
        file_key,
        file_name,
      });
      return response.data;
    },
  });
  const { getRootProps, getInputProps } = useDropzone({
    accept: { "application/pdf": [".pdf"] },
    maxFiles: 1,
    onDrop: async (acceptedFiles) => {
      console.log(acceptedFiles);
      const file = acceptedFiles[0];
      if (file.size > 10 * 1024 * 1024) {
        toast.error("File too large");
        return;
      }
      try {
        setUploading(true);
        const data = await uploadToS3(file);
        if (!data?.file_key || !data?.file_name) {
          toast.error("Error uploading file");
          return;
        }
        console.log("data", data);
        mutate(data, {
          onSuccess: ({ chat_id }) => {
            console.log("response data", data);
            toast.success("chat had been created");
            router.push(`/chat/${chat_id}`);
          },
          onError: (err) => {
            console.error(err);
            toast.error("error creating chat");
          },
        });
        console.log(data);
      } catch (error) {
        console.error(error);
      } finally {
        setUploading(false);
      }
    },
  });
  return (
    <div className="p-4 bg-gradient-to-r from-slate-100 to-indigo-200 rounded-lg shadow-lg">
      <div
        {...getRootProps({
          className:
            "border-dashed border-4 border-blue-300 rounded-lg cursor-pointer bg-white py-10 flex justify-center items-center flex-col transition-transform transform hover:scale-[1.01]",
        })}
      >
        <input {...getInputProps()} />
        {uploading || isPending ? (
          <>
            <Loader2 className="w-12 h-12 text-purple-500 animate-spin" />
            <p className="mt-3 text-sm text-purple-600">Uploading...</p>
          </>
        ) : (
          <>
            <Inbox className="w-12 h-12 text-blue-500" />
            <p className="mt-3 text-sm text-blue-600">Drop PDF Here</p>
          </>
        )}
      </div>
    </div>
  );
};

export default FileUpload;
