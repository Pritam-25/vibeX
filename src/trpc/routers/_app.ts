import { z } from 'zod';
import { baseProcedure, createTRPCRouter } from '../init';
import { inngest } from '@/inngest/client';
export const appRouter = createTRPCRouter({

  invoke:baseProcedure
    .input(
      z.object({
        prompt: z.string(),
      }),
    )
    .mutation(async (opts) => {
      await inngest.send({
        name: "test/website.builder", // <-- Must match exactly
        data: {
          text: opts.input.prompt,
        },
      });

      return {ok: "success"};
    }),

  hello: baseProcedure
    .input(
      z.object({
        text: z.string(),
      }),
    )
    .query((opts) => {
      return {
        greeting: `hello ${opts.input.text}`,
      };
    }),
});
// export type definition of API
export type AppRouter = typeof appRouter;