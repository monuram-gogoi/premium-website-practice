import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI(title="OGhaitong Support Bot API")

# Enable CORS so your React frontend can securely talk to your Python backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Replace with your actual frontend URL in production (e.g., https://premium-website-practice.vercel.app)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ChatRequest(BaseModel):
    message: str

# Dictionary of specific customer support knowledge base rules
SUPPORT_KNOWLEDGE = {
    "shipping": "We offer free standard global shipping on all premium vault items! Delivery usually takes 3-5 business days depending on your region.",
    "delivery": "We offer free standard global shipping on all premium vault items! Delivery usually takes 3-5 business days depending on your region.",
    "return": "Our policy allows returns within 30 days of delivery. Items must be in pristine condition with their original packaging.",
    "refund": "Once your return is inspected, refunds take 5-7 business days to process back to your original payment method.",
    "warranty": "All OGhaitong gear comes with a 1-year limited hardware warranty covering manufacturing defects.",
    "contact": "You can reach our human support squad at support@oghaitong.com or open a priority ticket in your account console.",
    "esports": "Looking for the FAI8 Pro League or AuraHILLS community scrim setups? Check out our Gaming section for tournament-grade tactical mobile triggers and active cryo-cooling accessories!",
    "audio": "Our Aura Unleashed Pro series headphones feature dynamic hybrid ANC, 40-hour battery life, and Bluetooth 5.4 zero-latency connection.",
}

@app.get("/")
def home():
    return {"status": "online", "message": "OGhaitong Support Bot API is running."}

@app.post("/api/chat")
async def chat_endpoint(request: ChatRequest):
    user_message = request.message.lower().strip()
    
    # Check for matched specific support keywords
    bot_reply = None
    for keyword, response in SUPPORT_KNOWLEDGE.items():
        if keyword in user_message:
            bot_reply = response
            break
            
    # Default fallback answer if no custom keywords match
    if not bot_reply:
        bot_reply = "Thanks for reaching out! I couldn't find an exact match for that question. For orders, specific shipping trackings, or custom inquiries, please contact our human team directly at support@oghaitong.com."

    return {"reply": bot_reply}

if __name__ == "__main__":
    import uvicorn
    # Read port from environment variable for hosting deployment platforms
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
