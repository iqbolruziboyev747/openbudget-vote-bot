#!/usr/bin/env python3
"""
OpenBudget Telegram Bot - Render.com Version
Polling metodi bilan xabarlarni oladi
"""
import requests
import json
import time
from datetime import datetime
import os

TELEGRAM_TOKEN = "8685209122:AAHIgOnnqztQP3Z5uEZIm5OYnfMobK_ZtZY"
ADMIN_ID = 8490142812
TELEGRAM_API = f"https://api.telegram.org/bot{TELEGRAM_TOKEN}"

DATA_DIR = "data"
USERS_DIR = "users"
LOGS_DIR = "logs"

for d in [DATA_DIR, USERS_DIR, LOGS_DIR]:
    os.makedirs(d, exist_ok=True)

def log(msg):
    with open(f"{LOGS_DIR}/bot.log", "a", encoding="utf-8") as f:
        f.write(f"[{datetime.now().strftime('%Y-%m-%d %H:%M:%S')}] {msg}\n")
    print(msg)

def send_message(chat_id, text, buttons=None):
    data = {
        "chat_id": chat_id,
        "text": text,
        "parse_mode": "HTML"
    }
    if buttons:
        data["reply_markup"] = json.dumps({
            "keyboard": buttons,
            "resize_keyboard": True
        })
    try:
        requests.post(f"{TELEGRAM_API}/sendMessage", data=data, timeout=10)
        log(f"✅ Message sent to {chat_id}")
    except Exception as e:
        log(f"❌ Error: {e}")

def handle_message(chat_id, text, contact=None):
    if text == "/start":
        msg = "Xush kelibsiz!!!\n\nOvoz berish uchun telefon raqamingizni yuboring.\n\nNamuna: 919992543"
        buttons = []
        if chat_id == ADMIN_ID:
            buttons = [["🗣 Ovozlar", "🏦 Murojaatlar"]]
        else:
            buttons = [["📲 Telefon raqamni yuborish"]]
        send_message(chat_id, msg, buttons)
        log(f"👤 New user: {chat_id}")
    elif contact:
        phone = contact.get("phone_number", "")
        send_message(chat_id, f"✅ Telefon qabul: {phone}")
        log(f"📞 Phone: {phone}")
    else:
        send_message(chat_id, "Iltimos /start bosing")

def polling():
    last_update_id = 0
    offset_file = f"{LOGS_DIR}/last_update.txt"
    if os.path.exists(offset_file):
        try:
            last_update_id = int(open(offset_file).read().strip())
        except:
            pass
    log(f"🚀 Polling started. Last ID: {last_update_id}")
    while True:
        try:
            response = requests.get(
                f"{TELEGRAM_API}/getUpdates",
                params={"offset": last_update_id + 1, "timeout": 30},
                timeout=35
            )
            data = response.json()
            if data.get("ok"):
                updates = data.get("result", [])
                for update in updates:
                    update_id = update.get("update_id")
                    message = update.get("message", {})
                    if not message:
                        continue
                    chat_id = message.get("chat", {}).get("id")
                    text = message.get("text", "")
                    contact = message.get("contact")
                    log(f"📥 Chat={chat_id}, Text='{text}'")
                    handle_message(chat_id, text, contact)
                    last_update_id = update_id
                    with open(offset_file, "w") as f:
                        f.write(str(last_update_id))
        except Exception as e:
            log(f"❌ Error: {e}")
            time.sleep(5)

if __name__ == "__main__":
    log("🤖 Bot started!")
    log(f"Admin: {ADMIN_ID}")
    try:
        polling()
    except KeyboardInterrupt:
        log("Bot stopped")