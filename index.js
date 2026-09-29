import { Hono } from "hono";
import { privateKeyToAccount } from "viem/accounts";

const app = new Hono();

const SESSIONKEY = {
  basename: "sessionkey.base.eth",
  agentId: 95962,
  expectedWallet: "0xAB05Ea86008615F8808d18f966109527BbB99981",
  network: "eip155:84532",
  target: "https://projectvegetables-x402-v2.bigwaynesbbq.workers.dev/premium"
};

app.get("/", (c) =>
  c.json({
    service: "Project Sessionkey x402 Client",
    basename: SESSIONKEY.basename,
    erc8004Agent: SESSIONKEY.agentId,
    wallet: SESSIONKEY.expectedWallet,
    network: SESSIONKEY.network,
    target: SESSIONKEY.target,
    status: "online",
    signingKeyConfigured: Boolean(c.env?.SESSIONKEY_PRIVATE_KEY)
  })
);

app.get("/health", (c) =>
  c.json({ ok: true, service: "project-sessionkey-x402-client" })
);

app.get("/signer-check", (c) => {
  try {
    const key = c.env?.SESSIONKEY_PRIVATE_KEY;
    if (!key) {
      return c.json({ ok: false, error: "SESSIONKEY_PRIVATE_KEY secret is not configured" }, 503);
    }

    const normalizedKey = key.startsWith("0x") ? key : `0x${key}`;
    const account = privateKeyToAccount(normalizedKey);
    const matches =
      account.address.toLowerCase() === SESSIONKEY.expectedWallet.toLowerCase();

    return c.json({
      ok: matches,
      derivedAddress: account.address,
      expectedAddress: SESSIONKEY.expectedWallet,
      matchesExpectedSessionkeyWallet: matches
    });
  } catch (error) {
    return c.json({ ok: false, error: error?.message ?? String(error) }, 500);
  }
});

app.notFound((c) =>
  c.json({ error: "Not found", endpoints: ["/", "/health", "/signer-check"] }, 404)
);

export default app;
