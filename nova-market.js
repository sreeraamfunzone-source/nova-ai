function json(statusCode, body) { return { statusCode, headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=60" }, body: JSON.stringify(body) }; }
async function yahoo(symbol, name, label) {
  try {
    const response = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=1d&interval=5m`);
    const data = await response.json(); const meta = data.chart?.result?.[0]?.meta; if (!meta) throw new Error();
    const price = meta.regularMarketPrice; const previous = meta.chartPreviousClose || meta.previousClose || price; const change = ((price - previous) / previous) * 100;
    return { name, label, price: new Intl.NumberFormat("en-IN", { style: "currency", currency: meta.currency || "USD", maximumFractionDigits: 2 }).format(price), change, changeText: `${change >= 0 ? "+" : ""}${change.toFixed(2)}% today` };
  } catch { return { name, label, price: "Unavailable", change: 0, changeText: "Try refreshing" }; }
}
exports.handler = async (event) => {
  if (event.httpMethod !== "GET") return json(405, { error: "Use GET." });
  const city = String(event.queryStringParameters?.city || "Chennai").slice(0, 60);
  try {
    const [gold, silver, sp500, nifty, reliance, tcs, apple, nvidia, bitcoin, geo] = await Promise.all([
      yahoo("GC=F", "Gold", "Precious metal"), yahoo("SI=F", "Silver", "Precious metal"), yahoo("%5EGSPC", "S&P 500", "US stocks"), yahoo("%5ENSEI", "NIFTY 50", "India stocks"),
      yahoo("RELIANCE.NS", "Reliance Industries", "India stock"), yahoo("TCS.NS", "Tata Consultancy Services", "India stock"), yahoo("AAPL", "Apple", "US stock"), yahoo("NVDA", "NVIDIA", "US stock"), yahoo("BTC-USD", "Bitcoin", "Crypto"),
      fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=en&format=json`).then((r) => r.json()),
    ]);
    const location = geo.results?.[0]; let weather = { label: "Weather", name: city, price: "Unavailable", change: 0, changeText: "Choose a nearby city" };
    if (location) { const data = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${location.latitude}&longitude=${location.longitude}&current=temperature_2m,relative_humidity_2m,weather_code&timezone=auto`).then((r) => r.json()); const current = data.current; weather = { label: "Weather", name: `${location.name}${location.country ? `, ${location.country}` : ""}`, price: `${current.temperature_2m}°C`, change: 0, changeText: `Humidity ${current.relative_humidity_2m}% · code ${current.weather_code}` }; }
    const indiaTime = new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", dateStyle: "full", timeStyle: "short" }).format(new Date());
    return json(200, { markets: [gold, silver, sp500, nifty, reliance, tcs, apple, nvidia, bitcoin], weather, time: { label: "India time", name: "Current", price: indiaTime, change: 0, changeText: "Refreshes with this page" } });
  } catch (error) { return json(503, { error: error.message || "Live information unavailable." }); }
};
