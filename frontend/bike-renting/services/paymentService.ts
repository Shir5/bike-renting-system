import { toAppError } from "@/api/errors";
import { api } from "../api/client";

/**
 * POST /api/v1/payment
 * body: { amount: number }
 */
export const addBalance = async (amount: number) => {
  try {
    const response = await api.post("/payment", { amount });
    return response.data;
  } catch (e) {
    throw toAppError(e);
  }
};
