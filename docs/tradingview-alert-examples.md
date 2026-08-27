# TradingView Alert Message Examples

Use your Cloudflare Worker URL in `Webhook URL`.

Set frequency:

```text
Once Per Bar Close
```

## BTC/ETH Topic Example

Use this when sending alerts to a Telegram topic.

Buy alert:

```json
{
  "secret": "YOUR_WEBHOOK_SECRET",
  "chat_id": "YOUR_TELEGRAM_GROUP_CHAT_ID",
  "message_thread_id": "YOUR_TOPIC_ID",
  "signal": "buy",
  "symbol": "{{ticker}}",
  "timeframe": "{{interval}}",
  "price": "{{close}}"
}
```

Sell alert:

```json
{
  "secret": "YOUR_WEBHOOK_SECRET",
  "chat_id": "YOUR_TELEGRAM_GROUP_CHAT_ID",
  "message_thread_id": "YOUR_TOPIC_ID",
  "signal": "sell",
  "symbol": "{{ticker}}",
  "timeframe": "{{interval}}",
  "price": "{{close}}"
}
```

## Default Chat Example

If you omit `chat_id`, the Worker uses the default `TELEGRAM_CHAT_ID` from Cloudflare variables.

Buy alert:

```json
{
  "secret": "YOUR_WEBHOOK_SECRET",
  "signal": "buy",
  "symbol": "{{ticker}}",
  "timeframe": "{{interval}}",
  "price": "{{close}}"
}
```

Sell alert:

```json
{
  "secret": "YOUR_WEBHOOK_SECRET",
  "signal": "sell",
  "symbol": "{{ticker}}",
  "timeframe": "{{interval}}",
  "price": "{{close}}"
}
```

## Notes

- `chat_id` selects the Telegram group or private chat.
- `message_thread_id` selects the Telegram forum topic.
- If your group does not use topics, remove `message_thread_id`.
- Do not put the Telegram bot token in TradingView.
