# BTC-ETH-TG-

TradingView crypto chart assistant using:

- Order Block
- MSS, Market Structure Shift
- Volume spike
- Volume imbalance
- Telegram webhook notification through Cloudflare Worker

This project is for chart assistance and alerting. It is not an auto trading strategy.

## Files

- `pine/crypto-ob-mss-volume-assistant.pine`
  - TradingView Pine Script v6 indicator.
  - Draws bullish/bearish OB zones, MSS labels, buy/sell triangles, and volume columns.
  - Sends alert payloads when buy/sell triangles appear.

- `cloudflare/worker.js`
  - Cloudflare Worker webhook receiver.
  - Receives TradingView alert JSON.
  - Sends formatted messages to Telegram.
  - Supports Telegram group topics through `message_thread_id`.

- `docs/tradingview-alert-examples.md`
  - Message JSON examples for TradingView alerts.

## Telegram Message Preview

Buy signal:

```text
🟢📈 多方訊號
🪙 幣種：BTCUSDT
⏱ 週期：1m
💰 價格：65000
✅ 條件：Bullish MSS + OB + Volume
🔎 回 TV 檢查結構
```

Sell signal:

```text
🔴📉 空方訊號
🪙 幣種：BTCUSDT
⏱ 週期：1m
💰 價格：65000
✅ 條件：Bearish MSS + OB + Volume
🔎 回 TV 檢查結構
```

## Cloudflare Worker Setup

1. Open Cloudflare dashboard.
2. Go to `Workers & Pages`.
3. Create a Worker with `Start with Hello World`.
4. Click `Edit code`.
5. Replace the default code with `cloudflare/worker.js`.
6. Deploy the Worker.
7. Go to `Settings -> Variables`.
8. Add these variables:

```text
TELEGRAM_BOT_TOKEN = your Telegram bot token
TELEGRAM_CHAT_ID = your default Telegram chat id
WEBHOOK_SECRET = your custom webhook secret
```

Recommended variable types:

```text
TELEGRAM_BOT_TOKEN = Secret
WEBHOOK_SECRET = Secret
TELEGRAM_CHAT_ID = Text
```

## Telegram Topic Support

For Telegram forum groups, use:

```json
{
  "chat_id": "YOUR_TELEGRAM_GROUP_CHAT_ID",
  "message_thread_id": "YOUR_TOPIC_ID"
}
```

`chat_id` is the Telegram group ID. `message_thread_id` is the topic ID.

If `message_thread_id` is omitted, the message goes to the main group chat.

## TradingView Setup

1. Open TradingView.
2. Open Pine Editor.
3. Paste `pine/crypto-ob-mss-volume-assistant.pine`.
4. Save and add the indicator to your chart.
5. Create one alert for long signals.
6. Create one alert for short signals.
7. Enable `Webhook URL`.
8. Use your Cloudflare Worker URL as the webhook URL.
9. Set alert frequency to `Once Per Bar Close`.

## Important

Do not commit real secrets to GitHub:

- Telegram bot token
- Webhook secret
- Private chat IDs if you do not want them public

Use placeholders in code and put real values only in Cloudflare variables or TradingView alert messages.
