// server/api/trpc/router/index.ts
import { z } from 'zod';
import { baseProcedure, createTRPCRouter } from '../init';
import { inngest } from '@/inngest/client';
import { randomUUID } from 'crypto';

export const appRouter = createTRPCRouter({
  invoke: baseProcedure
    .input(z.object({ value: z.string() }))
    .mutation(async (opts) => {
      const id = randomUUID();

      await inngest.send({
        name: "test/summarizer",
        data: {
          id,
          text: opts.input.value,
        },
      });

      return { ok: "success", id };
    }),

  hello: baseProcedure
    .input(z.object({ text: z.string() }))
    .query((opts) => ({
      greeting: `hello ${opts.input.text}`,
    })),
});

export type AppRouter = typeof appRouter;
