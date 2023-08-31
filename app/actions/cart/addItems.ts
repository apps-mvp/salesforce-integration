import { OrderForm } from "../../utils/types.ts";
import { AppContext } from "../../mod.ts";
import { paths } from "../../utils/paths.ts";
import { getCookies } from "std/http/mod.ts";
import { fetchAPI } from "deco-sites/std/utils/fetch.ts";
import { fetchCartImagesAPI } from "../../utils/utils.ts";

export interface Item {
  productId: string;
  quantity: number;
}

export interface Props {
  orderItems: Item[];
}

/**
 * @title Salesforce - Add item
 */
export default async function loader(
  props: Props,
  req: Request,
  ctx: AppContext
): Promise<OrderForm | null> {
  const token = getCookies(req.headers)[`token_${ctx.siteId}`];
  const basketId = getCookies(req.headers)[`cart_${ctx.siteId}`];

  if (!token || !basketId) return null;

  const basketWithProduct = (await fetchAPI<OrderForm>(
    paths(ctx)
      .checkout.shopper_baskets.v1.organizations._organizationId.baskets()
      .basketId(basketId).items._,
    {
      method: "POST",
      body: JSON.stringify(props.orderItems),
      headers: {
        Authorization: `Bearer ${token}`,
        accept: "application/json",
        "content-type": "application/json",
      },
    }
  )) as OrderForm;

  const finalBasket = {
    ...basketWithProduct,
    productItems: await Promise.all(
      basketWithProduct.productItems.map(async (item) => ({
        ...item,
        image: await fetchCartImagesAPI(ctx, item.productId, token),
      }))
    ),
  };

  return {
    ...finalBasket,
    locale: ctx.locale ?? "",
  };
}
