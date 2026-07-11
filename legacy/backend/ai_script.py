import os
import google.generativeai as genai

# Configure your API key (replace with your actual key or set environment variable)
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))

print("=== Available Gemini Models ===\n")

# List all available models
for model in genai.list_models():
    # Filter for models that support content generation (the main method you need)
    if 'generateContent' in model.supported_generation_methods:
        print(f"✅ {model.name}")
    else:
        print(f"📦 {model.name}")

print("\n=== Recommended Models ===\n")
print("Use one of these stable model names in your code:")
print("- models/gemini-2.0-flash")
print("- models/gemini-2.5-flash")
print("- models/gemini-1.5-flash")
print("- models/gemini-2.5-pro (more capable but slower)")