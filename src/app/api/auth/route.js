import { shopify } from "../../shopifyapi/shopify";
import { getRequestContext } from "@cloudflare/next-on-pages";
export const runtime = "edge";


export async function GET(req) {
  try {
    const { env } = getRequestContext();
    const myDb = env.DB;
    const url = new URL(req.url);
    const shop = url.searchParams.get("shop");
    console.log("This is a shop:", shop);
    console.log("shopify data:", shopify);

    if (!shop) {
      return new Response(
        JSON.stringify(
          { message: "Missing shop name" },
          {
            status: 400,
            headers: { "Content-Type": "application/json" },
          }
        )
      );
    }

    const shopExist = await myDb
      .prepare("SELECT * FROM shops WHERE shop = ?")
      .bind(shop)
      .first();

    if (shop === shopExist) {
      return Response.redirect(
        `https://da2b-2409-40c4-1176-86b5-d99e-4843-95eb-73d2.ngrok-free.app/shop${url.search}`,
        302
      );
    }

    // Begin OAuth – returns a Response that includes the redirect
    return await shopify.auth.begin({
      shop: shopify.utils.sanitizeShop(shop, true),
      callbackPath: "/api/token", // Or your defined callback path
      isOnline: false,
      rawRequest: req,
    });
    

  } catch (error) {
    console.error("Auth begin error:", error);
    return new Response(error.message || "An unexpected error occurred", {
      status: 500,
    });
  }

  // return new Response(JSON.stringify({ message: "successfully get the shop name " }))
}
