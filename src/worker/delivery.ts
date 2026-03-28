import axios, { AxiosError } from "axios";
import { JsonPayload, DeliveryResult } from "../shared/types.js";

export const deliverToSubscriber = async (
  subscriberId: string,
  url: string,
  data: JsonPayload,
): Promise<DeliveryResult> => {
  const start = Date.now();
  try {
    const response = await axios.post(url, data, {
      timeout: 5000,
      headers: { "Content-Type": "application/json" },
    });

    return {
      subscriberId,
      url,
      success: true,
      status: response.status,
      durationMs: Date.now() - start,
    };
  } catch (error: unknown) {
    const axiosError = error as AxiosError;

    return {
      subscriberId,
      url,
      success: false,
      status: axiosError.response?.status,
      error: axiosError.message,
      durationMs: Date.now() - start,
    };
  }
};
