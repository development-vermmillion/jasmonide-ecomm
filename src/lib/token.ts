import { createHmac } from "crypto";

/** Short signed token so order confirmation links can't be guessed from the sequential order number. */
export const orderToken = (number: string) =>
  createHmac("sha256", process.env.AUTH_SECRET || "dev-secret-change-me-please-32chars!!").update(number).digest("hex").slice(0, 16);
