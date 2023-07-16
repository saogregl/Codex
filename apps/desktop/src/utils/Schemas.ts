import { z } from "zod";

export const emailSchema = z.object({
  email: z
    .string()
    .min(1, { message: "This field has to be filled." })
    .email("This is not a valid email."),
});

export const passwordSchema = z.object({
  email: z
    .string()
    .min(8, { message: "Sua senha deve ter mais de 8 caracteres" })
});
