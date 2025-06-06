// src/app/shopifyapi/shopify.js

import { ApiVersion, DeliveryMethod, shopifyApi } from "@shopify/shopify-api";
import "@shopify/shopify-api/adapters/cf-worker";

import { getRequestContext } from "@cloudflare/next-on-pages";
export const runtime = "edge";


export const shopify = shopifyApi({
  apiKey: process.env.API_KEY,
  apiSecretKey: process.env.API_SECRET_KEY,
  scopes: process.env.SCOPES,
  hostName: process.env.HOST,
  hostScheme: "https",
  apiVersion: ApiVersion.January25,
  isEmbeddedApp: true,
});
// export { shopify };



// this is a first ooption webhook setup 

// Register webhook handlers globally (usually once during app init)
// shopify.webhooks.addHandlers({
//   APP_UNINSTALLED: [
//     {
//       deliveryMethod: DeliveryMethod.Http,
//       callbackUrl: "/api/webhooks",
//       callback: async (topic, shop, body) => {
//         console.log(`App uninstalled from ${shop}`);
//         console.log(`Given Shopname and Topic ${shop} & ${topic}`);
//         const { env } = getRequestContext();
//         if(topic === "APP_UNINSTALLED"){
//           await env.DB.prepare("DELETE FROM shops WHERE shop = ?").bind(shop).run();
//           console.log("Delete data inside the d1 database");
//         }
//       },
//     },
//   ],
//   SHOP_UPDATE: [
//     {
//       deliveryMethod: DeliveryMethod.Http,
//       callbackUrl: "/api/webhooks",
//       callback: async (topic, shop, body) => {
//         console.log(`App uninstalled from ${shop}`);
//       },
//     },
//   ],
// });



