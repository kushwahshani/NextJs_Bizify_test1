import { shopify } from "../../shopifyapi/shopify";
import { getRequestContext } from "@cloudflare/next-on-pages";
export const runtime = "edge";

export async function GET(req) {
  try {
    const { env } = getRequestContext();
    const myDb = env.DB;

    const data = await myDb.prepare("SELECT * FROM shops").all();
    console.log("this is a d1 database data:", data);

    // console.log("this is a d1 database data:", data.acc);

    let themeId = null;
    let shop = null;

    for (const row of data.results) {
      console.log("Shop:", row.shop);
      console.log("Access Token:", row.access_token);

      shop = row.shop;
      const accessToken = row.access_token;

      // GraphQL query to get all themes

      const graphqlQuery = {
        query: `
          {
            themes(first: 10) {
              edges {
                node {
                  id
                  role
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
            "X-Shopify-Access-Token": accessToken,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(graphqlQuery),
        }
      );
      const result = await response.json();
      const themes = result?.data?.themes?.edges || [];
      // find the current theme using this line
      const mainTheme = themes.find((edge) => edge.node.role === "MAIN");
      // const mainTheme = themeData.themes.find((theme) => theme.role === "main");
      console.log("all Themes Data:", result);
      console.log("Current Themes You Select:", mainTheme);
      console.log("Current Theme Id:", mainTheme?.node?.id);
      console.log("Current  Id:", mainTheme.node.id.split("/").pop());

      // save the mainTheme id in to theme id
      if (mainTheme?.node?.id) {
        themeId = mainTheme.node.id.split("/").pop();;
        break; // stop after first found
      }
    }

    return new Response(JSON.stringify({ status: 200, themeId, shop }));
  } catch (error) {
    console.log("Error fetching data:", error);
    return new Response(
      JSON.stringify(error.message, {
        status: 500,
      })
    );
  }
  // const url = new URL(req.url);
  // const shop = url.searchParams.get("shop");

  // const sessionId = shopify.session.getOfflineId(shop);
  // const session = await shopify.sessionStorage.loadSession(sessionId);

  // if (!session) return new Response("No session found", { status: 401 });

  // const client = new shopify.api.clients.Rest({ session });
  // const response = await client.get({ path: "themes" });

  // const activeTheme = response.body.themes.find((t) => t.role === "main");

  // return new Response(JSON.stringify({ themeId: activeTheme.id }));
}
