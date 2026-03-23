from transformers import AutoTokenizer, AutoModelForSeq2SeqLM
from gtts import gTTS
import os

MODEL_NAME = "facebook/nllb-200-distilled-600M"

print(f"\nLoading tokenizer for {MODEL_NAME}...")
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
print(f"Loading model for {MODEL_NAME}...")
model = AutoModelForSeq2SeqLM.from_pretrained(MODEL_NAME)
print("Model loaded successfully.")

LANG_CODE = {
    "en": "eng_Latn",
    "hi": "hin_Deva",
    "bn": "ben_Beng",
    "ta": "tam_Taml",
    "mr": "mar_Deva",
}

def translate(text, src_lang, tgt_lang):
    """Translates text from source language to target language."""
    if src_lang not in LANG_CODE or tgt_lang not in LANG_CODE:
        print(f"Error: Unsupported language code. Available codes: {list(LANG_CODE.keys())}")
        return None

    src_code = LANG_CODE[src_lang]
    tgt_code = LANG_CODE[tgt_lang]

    tokenizer.src_lang = src_code

    inputs = tokenizer(text, return_tensors="pt")
    outputs = model.generate(
        **inputs,
        forced_bos_token_id=tokenizer.convert_tokens_to_ids(tgt_code),
        max_length=256
    )

    return tokenizer.decode(outputs[0], skip_special_tokens=True)


# --- Text-to-Speech Function ---
def text_to_speech(text, lang="en", output_filename="output.mp3"):
    """
    Converts text to speech and saves it as an MP3 file.
    lang: 'en', 'hi', 'bn', 'ta', 'mr'
    """
    print(f"Generating speech for: '{text}' (lang: {lang})")
    try:
        tts = gTTS(text=text, lang=lang)
        tts.save(output_filename)
        print(f"Audio saved to {output_filename}")
        # For local playback, you might use a library like 'playsound'
        # import playsound
        # playsound.playsound(output_filename)
    except Exception as e:
        print(f"Error generating speech: {e}")

#
# # --- Example Usage ---
# if __name__ == "__main__":
#     print("\n--- Running Translation & TTS Examples ---")
#
#     # Example 1: Hindi to English translation with speech
#     hindi_text = "मैं कल कॉलेज जा रहा हूँ"
#     translated_text_en = translate(hindi_text, "hi", "en")
#     if translated_text_en:
#         print(f"HI -> EN: '{hindi_text}' translated to '{translated_text_en}'")
#         text_to_speech(translated_text_en, lang="en", output_filename="hi_to_en_output.mp3")
#
#     print("\n")
#
#     # Example 2: English to Hindi translation with speech
#     english_text = "I am preparing for my final exams and need some guidance."
#     translated_text_hi = translate(english_text, "en", "hi")
#     if translated_text_hi:
#         print(f"EN -> HI: '{english_text}' translated to '{translated_text_hi}'")
#         text_to_speech(translated_text_hi, lang="hi", output_filename="en_to_hi_output.mp3")
#
#     print("\n")
#
#     # Example 3: Bengali to English translation with speech
#     bengali_text = "আজ আবহাওয়া খুব গরম।"
#     translated_text_en_bn = translate(bengali_text, "bn", "en")
#     if translated_text_en_bn:
#         print(f"BN -> EN: '{bengali_text}' translated to '{translated_text_en_bn}'")
#         text_to_speech(translated_text_en_bn, lang="en", output_filename="bn_to_en_output.mp3")
#
#     print("\n")
#     print("--- End of Examples ---")
#
    # --- Speech-to-Text (Optional, requires local audio file management) ---
    # If you want to integrate STT locally, you would typically load an audio file
    # from your local disk and pass its path to the pipeline.
    # For example:
    # from transformers import pipeline
    # stt_pipeline = pipeline("automatic-speech-recognition", model="openai/whisper-small")
    # audio_file_path = "path/to/your/local/audio.wav" # Replace with your actual audio file
    # if os.path.exists(audio_file_path):
    #     print(f"\nPerforming STT on {audio_file_path}...")
    #     stt_result = stt_pipeline(audio_file_path)
    #     print("STT Result:", stt_result["text"])
    # else:
    #     print(f"\nSkipping STT: Audio file not found at {audio_file_path}")
 
