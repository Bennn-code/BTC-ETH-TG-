# Crypto OB MSS Volume TG v4

TradingView 加密貨幣圖表輔助指標，透過 Cloudflare Worker 將符合條件的訊號推送到 Telegram。

本專案主要以 BTC、ETH 和 15 分鐘週期為測試基準，也可以使用在 1H、4H 或其他加密貨幣圖表。這是訊號輔助工具，不是自動交易策略，也不會替使用者下單。

## 核心邏輯

新版訊號採用三項條件對齊：

- **OB 訂單塊**：尋找 MSS 前最近的反向 K 棒區域。
- **FVG 缺口**：偵測三根 K 棒形成的方向性價格缺口。
- **Imbalance 不平衡**：偵測具有明顯方向與實體幅度的 K 棒。

只有同一方向的三項條件全部成立，也就是 `3/3`，才會推送 Telegram 訊息。進出場三角形保留作為圖表視覺提示，但不是 Telegram 推送的額外必要條件。

## 訊號流程

```text
TradingView Pine Script
          │  Webhook POST
          ▼
Cloudflare Worker
          │  Telegram Bot API
          ▼
Telegram 群組或指定主題
```

## 專案檔案

- `pine/crypto-ob-mss-volume-tg-v4.pine`
  - TradingView Pine Script v6 指標。
  - 計算 OB、FVG、Imbalance、MSS、止損、止盈、風險與品質。
  - 只有 3/3 setup 成立時觸發多方或空方快訊。

- `cloudflare/worker-v4.js`
  - 接收 TradingView Webhook POST 請求。
  - 驗證 `WEBHOOK_SECRET`。
  - 將訊號整理成 Telegram 訊息。
  - 支援 Telegram 群組主題的 `message_thread_id`。

- `docs/tradingview-alert-v4-examples.md`
  - TradingView 多方與空方快訊 JSON 範例。
  - 說明 `plot_0` 到 `plot_11` 的對應方式。

## Telegram 訊息格式

```text
🟢📈 多方訊號
🪙 幣種：BTCUSDT
⏱ 週期：15m
💰 參考價：65000
🛑 止損：64500
📉 風險：0.77%
🎯 止盈：66000
📏 距離 OB：0.25%
⭐ 品質：A
📊 指標對齊：3/3
🟢 OB 訂單塊
🟢 FVG 缺口
🟢 Imbalance 不平衡
✅ 條件：Bullish OB + FVG + Imbalance (3/3)
```

Funding Rate 尚未列入 3/3 核心條件。若資料來源未提供可靠費率，應顯示 `N/A`，不能使用猜測值影響訊號。

## Cloudflare Worker 設定

1. 開啟 Cloudflare Dashboard。
2. 進入 `Workers & Pages`，開啟你的 Worker。
3. 選擇 `Edit code`。
4. 將 `cloudflare/worker-v4.js` 全部貼入編輯器。
5. 按 `Deploy`。
6. 到 `Settings -> Variables` 設定環境變數。

環境變數名稱如下，請勿把真實值提交到 GitHub：

```text
TELEGRAM_BOT_TOKEN
TELEGRAM_CHAT_ID
WEBHOOK_SECRET
```

建議類型：

```text
TELEGRAM_BOT_TOKEN = Secret
WEBHOOK_SECRET = Secret
TELEGRAM_CHAT_ID = Text
```

部署成功時，Cloudflare 版本選單應顯示類似：

```text
<version> (Active) Latest
```

## Cloudflare 測試

Worker 只接受 `POST`：

- 用瀏覽器直接開 URL，看到 `Method Not Allowed` 是正常的，因為瀏覽器使用 GET。
- POST 空白內容看到 `Invalid JSON`，代表 Worker 已收到請求，但 Body 不是有效 JSON。
- 有效 JSON 應回應 `200 OK` 和 `OK`，Telegram 會收到測試訊息。
- 回應 `401 Unauthorized`，代表 `secret` 與 Cloudflare 的 `WEBHOOK_SECRET` 不一致。

測試時使用 placeholder，不要把真實密鑰寫進 README：

```json
{
  "secret": "YOUR_WEBHOOK_SECRET",
  "signal": "buy",
  "symbol": "TESTUSDT",
  "timeframe": "15",
  "entry": "65000",
  "price": "65000",
  "stop_loss": "64500",
  "take_profit": "66000",
  "risk_pct": "0.77",
  "ob_distance_pct": "0.25",
  "quality": "3",
  "chat_id": "YOUR_TELEGRAM_GROUP_CHAT_ID",
  "message_thread_id": "YOUR_TOPIC_ID"
}
```

## TradingView 設定

1. 開啟 TradingView 的 Pine Editor。
2. 貼上 `pine/crypto-ob-mss-volume-tg-v4.pine`。
3. 儲存並加入圖表。
4. 建立多方快訊，條件選 `Bullish 3/3 Setup`。
5. 建立空方快訊，條件選 `Bearish 3/3 Setup`。
6. 週期建議使用 15m；1H、4H 可作為較高週期背景觀察。
7. 觸發頻率選「每根 K 線收盤時一次」。
8. 勾選 `Webhook URL`，填入 Cloudflare Worker URL。
9. 貼上 `docs/tradingview-alert-v4-examples.md` 中對應的 JSON。
10. 刪除舊版快訊，避免舊快訊繼續發送舊格式。

新版 Pine 將隱藏 plot 固定放在視覺 plot 前面：

- 多方：`plot_0` 到 `plot_5`
- 空方：`plot_6` 到 `plot_11`

這樣可以避免參考價、止損與止盈抓到成交量或其他錯誤 plot。

## Telegram 群組主題

如果 Telegram 群組使用論壇主題，JSON 必須同時提供：

```json
{
  "chat_id": "YOUR_TELEGRAM_GROUP_CHAT_ID",
  "message_thread_id": "YOUR_TOPIC_ID"
}
```

`chat_id` 是 Telegram 群組 ID，`message_thread_id` 是主題 ID。只提供 `chat_id` 時，訊息會發到群組主對話，而不是指定主題。若群組沒有啟用主題，可以省略 `message_thread_id`。

## 常見問題

### 為什麼沒有訊號？

目前必須等待 OB、FVG、Imbalance 同方向達到 3/3，且 setup 必須在 MSS 的有效窗口內。這比單純 MSS + Volume 嚴格，因此訊號不會每根 K 棒出現。

### 為什麼 Telegram 還是舊格式？

通常是舊 TradingView 快訊仍在運作。刪除舊快訊，重新建立 `Bullish 3/3 Setup` 與 `Bearish 3/3 Setup`。

### 為什麼參考價不正確？

確認使用新版 `plot_0` 到 `plot_11` 對應，並重新建立快訊。不要沿用舊版的 plot 編號。

### Cloudflare Deploy 不能按怎麼辦？

Deploy 只有在編輯器偵測到未部署變更時才會啟用。貼上新版程式碼後，在最後新增一個空白行，等待 `No Problems`，再按 Deploy。

## 安全注意事項

以下資料不能提交到公開 GitHub：

- Telegram Bot Token
- `WEBHOOK_SECRET`
- 私人 Chat ID 或不希望公開的群組 ID

真實值只放在 Cloudflare Variables/Secrets 與 TradingView 快訊設定中。公開 repository 只保留 placeholder。

## English Summary

Crypto OB MSS Volume TG v4 is a TradingView indicator that sends Telegram alerts through a Cloudflare Worker. Alerts are sent only when Order Block, Fair Value Gap, and Imbalance conditions align in the same direction (3/3). The project is an analysis and notification tool, not an automated trading system.
