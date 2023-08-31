import { OrderForm } from "../utils/types.ts";
import { AppContext } from "../mod.ts";
import { paths } from "../utils/paths.ts";
import { getCookies } from "std/http/mod.ts";
import { fetchAPI } from "deco-sites/std/utils/fetch.ts";
import { fetchCartImagesAPI } from "../utils/utils.ts";

/**
 * @title Salesforce - Get Cart
 */
export default async function loader(
  _props: unknown,
  req: Request,
  ctx: AppContext
): Promise<OrderForm | null> {
  const token = getCookies(req.headers)[`token_${ctx.siteId}`];
  const basketId = getCookies(req.headers)[`cart_${ctx.siteId}`];

  if (!token || !basketId) return null;

  const basket = (await fetchAPI<OrderForm>(
    paths(ctx)
      .checkout.shopper_baskets.v1.organizations._organizationId.baskets()
      .basketId(basketId)._,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )) as OrderForm;

  const finalBasket = basket.productItems
    ? {
        ...basket,
        productItems: await Promise.all(
          basket.productItems.map(async (item) => ({
            ...item,
            image: await fetchCartImagesAPI(ctx, item.productId, token),
          }))
        ),
      }
    : basket;

  return {
    ...finalBasket,
    locale: ctx.locale ?? "",
  };
}
