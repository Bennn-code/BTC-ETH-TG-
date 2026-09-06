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
      ? "Bullish OB + FVG + Imbalance (3/3)"
      : "Bearish OB + FVG + Imbalance (3/3)";

    const text =
`${title}
🪙 幣種：${data.symbol || ""}
⏱ 週期：${formatTimeframe(data.timeframe)}
💰 參考價：${formatValue(firstNumber(data.entry, data.price))}
🛑 止損：${formatValue(data.stop_loss)}
📉 風險：${formatPercent(data.risk_pct)}
🎯 止盈：${formatTakeProfit(data.take_profit)}
📏 距離 OB：${formatPercent(data.ob_distance_pct)}
⭐ 品質：${formatQuality(data.quality)}
📊 指標對齊：3/3
🟢 OB 訂單塊
🟢 FVG 缺口
🟢 Imbalance 不平衡
✅ 條件：${condition}`;

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

function parseNumber(value) {
  if (value === undefined || value === null || value === "" || value === "na" || value === "NaN") {
    return null;
  }

  const normalized = String(value).replace(/,/g, "").trim();
  const number = Number(normalized);
  return Number.isFinite(number) ? number : null;
}

function firstNumber(...values) {
  for (const value of values) {
    const number = parseNumber(value);
    if (number !== null) {
      return number;
    }
  }

  return null;
}

function formatValue(value) {
  const number = parseNumber(value);
  if (number === null) {
    return "等待前方 OB";
  }

  return number.toLocaleString("en-US", {
    maximumFractionDigits: 8
  });
}

function formatPercent(value) {
  const number = parseNumber(value);
  if (number === null) {
    return "N/A";
  }

  return `${number.toFixed(2)}%`;
}

function formatTakeProfit(value) {
  const number = parseNumber(value);
  if (number === null) {
    return "等待前方 OB";
  }

  return formatValue(number);
}

function formatQuality(value) {
  const number = parseNumber(value);
  if (number === null) {
    return "N/A";
  }

  if (number >= 2.5) {
    return "A";
  }

  if (number >= 1.5) {
    return "B";
  }

  return "C";
}
