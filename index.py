from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()

class ChatRequest(BaseModel):
    message: str

# Simple keyword-based support logic
SUPPORT_KNOWLEDGE = {
    "shipping": "We offer free standard global shipping! Delivery takes 3-5 business days.",
    "return": "Our policy allows returns within 30 days of delivery for items in pristine condition.",
    "contact": "You can reach our human support squad at support@oghaitong.com.",
}

@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    user_message = request.message.lower().strip()
    
    bot_reply = None
    for keyword, response in SUPPORT_KNOWLEDGE.items():
        if keyword in user_message:
            bot_reply = response
            break
            
    if not bot_reply:
        bot_reply = "Thanks for reaching out! For custom inquiries, please contact our human team at support@oghaitong.com."

    return {"reply": bot_reply}