'use client';

import { Button } from "@/components/ui/button";
import { useTRPC } from "@/trpc/client";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

export default function Home() {

  const trpc = useTRPC();
  const invokeJob = useMutation(trpc.invoke.mutationOptions({
    onSuccess:()=>{
      toast.success("Background job invoked successfully!");
    }
  }))

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <Button disabled={invokeJob.isPending} onClick={() => invokeJob.mutate({ name: "test@example.com" })}>
        Invoke Background Job
      </Button>
    </div>
  );
}