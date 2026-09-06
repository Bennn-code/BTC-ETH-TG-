# TradingView Alert Message Examples for v4

Use your Cloudflare Worker URL in `Webhook URL`.

Set frequency:

```text
Once Per Bar Close
```

## Buy 3/3 Alert

```json
{
  "secret": "YOUR_WEBHOOK_SECRET",
  "chat_id": "YOUR_TELEGRAM_GROUP_CHAT_ID",
  "message_thread_id": "YOUR_TOPIC_ID",
  "signal": "buy",
  "symbol": "{{ticker}}",
  "timeframe": "{{interval}}",
  "price": "{{plot_0}}",
  "entry": "{{plot_0}}",
  "stop_loss": "{{plot_1}}",
  "take_profit": "{{plot_2}}",
  "risk_pct": "{{plot_3}}",
  "ob_distance_pct": "{{plot_4}}",
  "quality": "{{plot_5}}"
}
```

## Sell 3/3 Alert

```json
{
  "secret": "YOUR_WEBHOOK_SECRET",
  "chat_id": "YOUR_TELEGRAM_GROUP_CHAT_ID",
  "message_thread_id": "YOUR_TOPIC_ID",
  "signal": "sell",
  "symbol": "{{ticker}}",
  "timeframe": "{{interval}}",
  "price": "{{plot_6}}",
  "entry": "{{plot_6}}",
  "stop_loss": "{{plot_7}}",
  "take_profit": "{{plot_8}}",
  "risk_pct": "{{plot_9}}",
  "ob_distance_pct": "{{plot_10}}",
  "quality": "{{plot_11}}"
}
```

## Notes

- v4 sends an alert only when OB + FVG + Imbalance are all aligned (3/3).
- The triangle remains a chart visual; it is not a separate requirement for the Telegram alert.
- The hidden plots are deliberately first in the Pine code, so buy uses plot_0..plot_5 and sell uses plot_6..plot_11.
- v4 is designed mainly for 15m, 1H, and 4H charts.
- Suggested cooldown settings:
  - 15m: 4
  - 1H: 2
  - 4H: 1
- If your Telegram group does not use topics, remove `message_thread_id`.
- Do not put your Telegram bot token inside TradingView.
