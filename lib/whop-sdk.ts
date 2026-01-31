import { Whop } from "@whop/sdk";

export function getWhopSDK() {
  return new Whop({
    appID: process.env.NEXT_PUBLIC_WHOP_APP_ID!,
    apiKey: process.env.WHOP_API_KEY!,
    webhookKey: typeof window === 'undefined' ? btoa(process.env.WHOP_WEBHOOK_SECRET || "") : "",
  });
}
