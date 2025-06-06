import { shopify } from "../../shopifyapi/shopify.js";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { DeliveryMethod } from "@shopify/shopify-api";

export const runtime = "edge";

export async function POST(req) {
  try {
    const { env } = getRequestContext();
    const myDb = env.DB;

    // IMPORTANT: Add handlers BEFORE processing the webhook setup webhook
    shopify.webhooks.addHandlers({
      APP_UNINSTALLED: [
        {
          deliveryMethod: DeliveryMethod.Http,
          callbackUrl: "/api/webhooks",
          callback: async (topic, shop, body, webhookId) => {
            console.log(`Processing APP_UNINSTALLED for shop: ${shop}`);

            try {
              // if (topic === "APP_UNINSTALLED") {
                await myDb
                  .prepare("DELETE FROM shops WHERE shop = ?")
                  .bind(shop)
                  .run();
                  console.log(`Successfully deleted shop ${shop} from database`);
              // }
            } catch (dbError) {
              console.error("Database deletion error:", dbError);
              throw dbError;
            }
          },
        },
      ],
      SHOP_UPDATE: [
        {
          deliveryMethod: DeliveryMethod.Http,
          callbackUrl: "/api/webhooks",
          callback: async (topic, shop, body, webhookId) => {
            console.log(`Processing SHOP_UPDATE for shop: ${shop}`);
            // Add your shop update logic here if needed
          },
        },
      ],
    });

    // Get the raw body
    const rawBody = await req.text();

    console.log("Processing webhook with body length:", rawBody.length);

    // Now process the webhook
    const result = await shopify.webhooks.process({
      rawRequest: req,
      rawBody: rawBody,
    });

    console.log("Webhook processing result:", result.status);

    // if (!result.webhookProcessed) {
    //   console.warn("Webhook was not processed successfully");
    //   return new Response("Webhook verification failed", { status: 401 });
    // }

    return new Response(`Webhook processed successfully ${result.status}`)

    // return new Response("Webhook processed successfully", {
    //   status: 200,
    //   // headers: { "Content-Type": "text/plain" }
    // });
  } catch (error) {
    console.error("Webhook processing error:", error);

    // Return 200 to prevent Shopify from retrying invalid webhooks
    // Only return 500 for actual server errors
    if (error.message.includes("No HTTP webhooks registered")) {
      return new Response("Webhook handler not found", { status: 200 });
    }

    return new Response(
      JSON.stringify({
        error: "Webhook processing failed",
        message: error.message,
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
