import fetch from "node-fetch";

const token = process.env.BUDGET_BAKER_TOKEN;

const headers = {
  Authorization: `Bearer ${token}`,
  Accept: "application/json",
};

async function walletBalance() {
  try {
    const res = await fetch("https://api.budgetbaker.com/wallet/balance", {
      method: "GET",
      headers,
    });

    if (!res.ok) {
      throw new Error(`HTTP Error: ${res.status}`);
    }

    const data = await res.json();

    return data;
  } catch (err) {
    console.error("Failed to fetch wallet balance:", err.message);
    return null;
  }
}

async function main() {
  const wallet = await walletBalance();

  if (!wallet) return;

  // adjust depending on actual API response shape
  const total = wallet.total ?? wallet.balance ?? 0;

  console.log("💰 Total Wallet Balance:", total);

  const fs = await import("fs");
  fs.writeFileSync(
    "wallet-balance.json",
    JSON.stringify(wallet, null, 2)
  );
}

main();
