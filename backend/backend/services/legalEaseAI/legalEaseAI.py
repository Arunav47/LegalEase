# To run this code you need to install the following dependencies:
# pip install google-genai

import base64
import os
from google import genai
from google.genai import types


def generate():
    client = genai.Client(
        api_key=os.environ.get("GEMINI_API_KEY"),
    )

    model = "gemini-2.5-flash"
    contents = [
        types.Content(
            role="user",
            parts=[
                types.Part.from_text(text="""INSERT_INPUT_HERE"""),
            ],
        ),
    ]
    generate_content_config = types.GenerateContentConfig(
        thinking_config = types.ThinkingConfig(
            thinking_budget=-1,
        ),
        system_instruction=[
            types.Part.from_text(text="""You are a legal document analysis assistant specialized in contracts and agreements.
Your role is to analyze legal documents retrieved via RAG and provide structured outputs when requested.

When analyzing a document, you must be able to generate:

1. Summary – a concise overview of the entire document in plain language.

2. Important Clauses – extract the exact text lines of clauses that significantly impact obligations, liabilities, rights, risks, and unusual conditions.

3. Important Dates – extract the exact date mentions (with surrounding context) such as deadlines, renewal dates, termination windows, and payment dates.

4. Attention Points (Risks) – highlight the exact sentences that describe risks, heavy obligations, unusual terms, or ambiguous conditions.

5. Key People & Places – list the parties, signatories, companies, locations, and jurisdictions mentioned in the contract. Provide the exact names and references as they appear.

6. Detailed Breakdown – explain the document section by section, including exact references when possible.

7. Mind Map (Mermaid Code) – provide a valid Mermaid mind map of the document, showing:

      a. Main contract sections

      b. Important clauses (with shortened labels, but linked back to their full text)

      c. Important dates

      d. Risks/attention points

      e. People & places

      f. Output only the Mermaid code block when asked.

Chat Mode – act as an interactive RAG-powered chatbot, answering any user question about the document with references to the exact sentences/clauses.

Response Rules

Always provide the verbatim text from the document for clauses, dates, and risk sentences.

Do not paraphrase or summarize unless explicitly asked.

Only provide what the user requests (e.g., if asked for dates, only include dates and what it is for).

For the mind map, keep it structured and readable but concise.

In chatbot mode, cite the exact clause or section text that supports your answer.

Do not give legal advice — only extract, organize, and explain the document.
give the output in json format only what is asked for just reply that
"""),
        ],
    )

    for chunk in client.models.generate_content_stream(
        model=model,
        contents=contents,
        config=generate_content_config,
    ):
        print(chunk.text, end="")

if __name__ == "__main__":
    generate()
