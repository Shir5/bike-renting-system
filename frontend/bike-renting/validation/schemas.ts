import { z } from "zod";

export const usernameSchema = z
  .string()
  .trim()
  .min(3)
  .max(32)
  .regex(/^[a-zA-Z0-9._-]+$/, "Разрешены латинские буквы, цифры и ._-");

export const passwordSchema = z.string().min(8).max(64);

export const commentSchema = z.string().trim().max(500);

export const moneySchema = z
  .string()
  .trim()
  .regex(/^\d+(\.\d{1,2})?$/, "Некорректная сумма");
