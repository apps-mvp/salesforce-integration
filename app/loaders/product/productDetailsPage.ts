import { AppContext } from "../../mod.ts";
import { paths } from "../../utils/paths.ts";
import { slugify, getSlugFromURL } from "../../utils/slugfy.ts";
import { ProductBaseSalesforce } from "../../utils/types.ts";
import { getCookies } from "std/http/mod.ts";
import { fetchAPI } from "deco-sites/std/utils/fetch.ts";
import { toProductPage } from "../../utils/transform.ts";
import type { ProductDetailsPage } from "deco-sites/std/commerce/types.ts";
import type { RequestURLParam } from "deco-sites/std/functions/requestToParam.ts";

export interface Props {
  slug: RequestURLParam;
}

/**
 * @type Salesforce Product Details Page
 * @description works on routes /:slug/p?id=optionalProductId
 */
export default async function loader(
  props: Props,
  req: Request,
  ctx: AppContext
): Promise<null | ProductDetailsPage> {
  const url = new URL(req.url);

  /* const token = getCookies(req.headers)[`token_${ctx.siteId}`]; */
  const token = getCookies(req.headers)[`token_${ctx.siteId}`];
  const urlSlug = getSlugFromURL(url);

  if (!urlSlug || !token) return null;

  const id = url.searchParams.get("id");
  if (!id) {
    const result = await productSearch(token, ctx, slugify(urlSlug));
    if (!result) return null;
    return {
      "@type": "ProductDetailsPage",
      ...toProductPage(result, url.origin),
    };
  }

  const result = await fetchProduct(
    paths(
      ctx
    ).product.shopper_products.v1.organizations._organizationId.products.productId(
      id
    ),
    token
  );

  return {
    "@type": "ProductDetailsPage",
    ...toProductPage(result, url.origin),
  };
}

const fetchProduct = (path: string, token: string) => {
  return fetchAPI(path, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

const productSearch = async (
  token: string,
  ctx: AppContext,
  slug: string
): Promise<ProductBaseSalesforce | null> => {
  const productSearchPath = paths(
    ctx
  ).search.shopper_search.v1.organizations._organizationId.product_search.q(
    slug.replace(/-/g, " "),
    {
      limit: 1,
    }
  );
  const productSearch = await fetchProduct(productSearchPath, token);

  if (productSearch.limit == 0) return null;

  const getProduct = (await fetchProduct(
    paths(
      ctx
    ).product.shopper_products.v1.organizations._organizationId.products.productId(
      productSearch.hits[0].productId
    ),
    token
  )) as ProductBaseSalesforce;

  return getProduct;
};
