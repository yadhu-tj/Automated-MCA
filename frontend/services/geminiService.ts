import { EventCategory, Role } from "../types";
import { api } from "./api";

// This has been refactored to call the backend rather than using the Gemini API directly
// from the client to avoid exposing the API Key in the frontend.
export const generateGreetingSuggestion = async (
  category: EventCategory,
  recipientRole: Role,
  context: string
): Promise<{ title: string; message: string; tone: string } | null> => {
  return await api.generateGreeting(category, recipientRole, context);
};
