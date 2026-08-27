export default {
  async fetch(request, env) {
    if (request.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }

    let data;
    try {
      data = await request.json();
    } catch {
      return new Response("Invalid JSON", { status: 400 });
    }

    if (data.secret !== env.WEBHOOK_SECRET) {
      return new Response("Unauthorized", { status: 401 });
    }

    const isBuy = data.signal === "buy";
    const isSell = data.signal === "sell";

    if (!isBuy && !isSell) {
      return new Response("Unknown signal", { status: 400 });
    }

    const title = isBuy ? "🟢📈 多方訊號" : "🔴📉 空方訊號";
    const condition = isBuy
      ? "Bullish MSS + OB + Volume"
      : "Bearish MSS + OB + Volume";

    const text =
`${title}
🪙 幣種：${data.symbol || ""}
⏱ 週期：${formatTimeframe(data.timeframe)}
💰 價格：${data.price || ""}
✅ 條件：${condition}
🔎 回 TV 檢查結構`;

    const payload = {
      chat_id: data.chat_id || env.TELEGRAM_CHAT_ID,
      text
    };

    if (data.message_thread_id !== undefined && data.message_thread_id !== null && data.message_thread_id !== "") {
      payload.message_thread_id = Number(data.message_thread_id);
    }

    const telegramUrl = `https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/sendMessage`;

    const tgResponse = await fetch(telegramUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    if (!tgResponse.ok) {
      const errorText = await tgResponse.text();
      return new Response(`Telegram error: ${errorText}`, { status: 502 });
    }

    return new Response("OK");
  }
};

function formatTimeframe(timeframe) {
  if (!timeframe) {
    return "";
  }

  const value = String(timeframe);

  if (/^\d+$/.test(value)) {
    return `${value}m`;
  }

  if (value === "D") {
    return "1D";
  }

  if (value === "W") {
    return "1W";
  }

  if (value === "M") {
    return "1M";
  }

  return value;
}
