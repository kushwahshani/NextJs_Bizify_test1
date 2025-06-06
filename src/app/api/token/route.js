import { DeliveryMethod, Session } from "@shopify/shopify-api";
import { shopify } from "../../shopifyapi/shopify.js";
import { getRequestContext } from "@cloudflare/next-on-pages";

export const runtime = "edge";

export async function GET(req) {
  try {
    const { env } = getRequestContext();
    const myDb = env.DB;

    // Configure webhooks before auth callback
    shopify.webhooks.addHandlers({
      APP_UNINSTALLED: [
        { deliveryMethod: DeliveryMethod.Http, callbackUrl: "/api/webhooks" },
      ],
      SHOP_UPDATE: [
        { deliveryMethod: DeliveryMethod.Http, callbackUrl: "/api/webhooks" },
      ],
    });

    // Handle auth callback
    const callbackResponse = await shopify.auth.callback({ rawRequest: req });
    const session = callbackResponse.session;

    if (!session) {
      throw new Error("No session returned from auth callback");
    }

    const shop = session.shop;
    const token = session.accessToken;
    const isEmbedded = shopify.config.isEmbeddedApp;

    console.log("App installed for:", shop);
    console.log("Access token:", token);
    console.log("Embedded app:", isEmbedded);

    const shopData = {
      query: `
        {
          shop {
            name
            myshopifyDomain
            email
            primaryDomain {
              url
              host
            }
            plan {
              displayName
            }
          }
          products(first: 10) {
            edges {
              node {
                id
                title
                status
                vendor
                tags
                productType
                createdAt
                updatedAt
                variants(first: 5) {
                  edges {
                    node {
                      id
                      title
                      sku
                      price
                      inventoryQuantity
                    }
                  }
                }
                images(first: 2) {
                  edges {
                    node {
                      originalSrc
                      altText
                    }
                  }
                }
              }
            }
          }
          themes(first: 5) {
            edges {
              node {
                id
                name
                role
                themeStoreId
                createdAt
                updatedAt
              }
            }
          }
        }
      `,
    };

    // get the theme ids url
      const response = await fetch(
        `https://${shop}/admin/api/2025-01/graphql.json`,
        {
          method: "POST",
          headers: {
            "X-Shopify-Access-Token": token,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(shopData),
        }
      );
      const result = await response.json();
      console.log("all shop Data:", result);


    // Store shop data in database
    await myDb
      .prepare(
        "INSERT OR REPLACE INTO shops (shop, access_token, is_embedded, shopdetails) VALUES (?, ?, ?, ?)"
      )
      .bind(shop, token, isEmbedded ? 1 : 0, JSON.stringify(result))
      .run();

    // Register webhooks using the session
    const webhookRegistrationResponse = await shopify.webhooks.register({
      session: session,
    });

    console.log("Webhook registration response:", webhookRegistrationResponse);

    // Redirect to your app
    return new Response(null, {
      status: 302,
      headers: {
        Location: `https://da2b-2409-40c4-1176-86b5-d99e-4843-95eb-73d2.ngrok-free.app/shop?shop=${session.shop}`,
      },
    });
  } catch (error) {
    console.error("Auth callback error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Authentication failed" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
