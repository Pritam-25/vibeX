'use client';

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

export default function Home() {

  const [value, setValue] = useState("");

  const trpc = useTRPC();
  const invokeJob = useMutation(trpc.invoke.mutationOptions({
    onSuccess:()=>{
      toast.success("Background job invoked successfully!");
    }
  }))

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <Input placeholder="Enter your prompt" value={value} onChange={(e) => setValue(e.target.value)} />
      <Button disabled={invokeJob.isPending} onClick={() => invokeJob.mutate({ prompt: value })}>
        Invoke Background Job
      </Button>
    </div>
  );
}