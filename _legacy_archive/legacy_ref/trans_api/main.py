from fastapi import FastAPI
from pydantic import BaseModel
from script import translate

print("Server Started!")

app = FastAPI()

class TranslateRequest(BaseModel):
    text: str
    from_lang: str
    to_lang: str

@app.post("/translate")
async def translate_endpoint(request: TranslateRequest):
    translated = translate(request.text, request.from_lang, request.to_lang)
    return {"translated": translated}

@app.get("/translate")
async def Home():
    return {"WOrkS":"woRKs"}
 
