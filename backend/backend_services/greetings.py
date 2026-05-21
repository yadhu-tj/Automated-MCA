import json
import os

from fastapi import HTTPException
from google import genai
from google.genai import types


def generate_greeting_content(category: str, recipient_role: str, context: str) -> dict[str, str]:
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        print("Warning: GEMINI_API_KEY environment variable not set. Falling back to mock generator.")
        return {
            "title": f"Happy {category}!",
            "message": f"Wishing you a wonderful {category}, dear {recipient_role}.",
            "tone": "Warm and professional",
        }

    try:
        client = genai.Client(api_key=api_key)
        prompt = f"""
        You are an assistant for a University MCA Department.
        Generate a {category} greeting message for a {recipient_role}.
        Context/Details: {context}.

        The tone should be professional yet warm.
        Return the response in strict JSON format with keys: "suggestedTitle", "suggestedMessage", "tone".
        Do not include markdown code blocks.
        """
        response = client.models.generate_content(
            model="gemini-2.5-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                response_mime_type="application/json",
            ),
        )
        data = json.loads(response.text)
        return {
            "title": data.get("suggestedTitle", ""),
            "message": data.get("suggestedMessage", ""),
            "tone": data.get("tone", ""),
        }
    except Exception as e:
        print(f"Error calling Gemini: {e}")
        raise HTTPException(status_code=500, detail="Failed to generate AI content")

