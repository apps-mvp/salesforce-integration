import { AppContext } from "../../mod.ts";
import { paths } from "../../utils/paths.ts";
import { ProductBaseSalesforce, ProductSearch } from "../../utils/types.ts";
import { getCookies } from "std/http/mod.ts";
import { fetchAPI } from "deco-sites/std/utils/fetch.ts";
import { toProductPage } from "../../utils/transform.ts";
import type { ProductDetailsPage } from "deco-sites/std/commerce/types.ts";
import type { RequestURLParam } from "deco-sites/std/functions/requestToParam.ts";

export interface Props {
  slug: RequestURLParam;
}

/**
 * @title Salesforce Product Details Page
 * @description works on routes /:slug/p?id=optionalProductId
 */
export default async function loader(
  props: Props,
  req: Request,
  ctx: AppContext
): Promise<null | ProductDetailsPage> {
  const url = new URL(req.url);

  const token = getCookies(req.headers)[`token_${ctx.siteId}`];
  const { slug } = props;

  if (!slug || !token) return null;

  const id = url.searchParams.get("id");

  if (!id) {
    const getProductBySlug = await fetchProduct<ProductSearch>(
      paths(
        ctx
      ).search.shopper_search.v1.organizations._organizationId.product_search.q(
        slug.replace(/-/g, " "),
        {
          limit: 1,
          refine_htype: "master",
        }
      ),
      token
    );

    if (getProductBySlug.limit == 0) return null;

    const getProductById = await fetchProduct<ProductBaseSalesforce>(
      paths(
        ctx
      ).product.shopper_products.v1.organizations._organizationId.products.productId(
        getProductBySlug.hits[0].productId
      ),
      token
    );

    return {
      "@type": "ProductDetailsPage",
      ...toProductPage(getProductById, url.origin),
    };
  }

  const getProductById = await fetchProduct<ProductBaseSalesforce>(
    paths(
      ctx
    ).product.shopper_products.v1.organizations._organizationId.products.productId(
      id
    ),
    token
  );

  return {
    "@type": "ProductDetailsPage",
    ...toProductPage(getProductById, url.origin),
  };
}

const fetchProduct = <T>(path: string, token: string) => {
  return fetchAPI<T>(path, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
