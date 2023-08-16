import { ProductSearch } from "../../utils/types.ts";
import { AppContext } from "../../mod.ts";
import { paths } from "../../utils/paths.ts";
import { getCookies } from "std/http/mod.ts";
import { fetchAPI } from "deco-sites/std/utils/fetch.ts";
import type { Product } from "deco-sites/std/commerce/types.ts";
import { toProductList } from "../../utils/transform.ts";

/**
 * @title ShelfFilters
 *  @description Define what filters you´re gonna applicate in this shelf
 */
export interface Props {
  /**
   * @title Query
   * @description Keyphase of the collection.
   */
  q: string;

  /**
   * @title Category ID.
   * @description Allows refinement per single category ID. Multiple category ids are not supported.
   */
  cgid?: string;

  /**
   * @description Allows refinement per single price range. Multiple price ranges are not supported. Example: (100..300) - Range by 100 to 300.
   * @example (100..300)
   */
  price?: string;

  /**
   * @title Promotion ID.
   * @description Allows refinement per promotion ID.
   */
  pmid?: string;

  /**
   * @title Products color.
   * @description Refinement color. Multiple values are supported by a subset of refinement attributes and can be provided by separating them using a pipe (URL encoded = "|") i.e. Ex: red|green|blue
   * @example
   */
  c_refinementColor?: string;

  /**
   * @title Sort Id.
   * @description The ID of the sorting option to sort the search hits. Ex: price-high-to-low, price-low-to-high.
   */
  sort?: string;

  /**
   * @description Maximum records to retrieve per request, not to exceed 200. Defaults to 25.
   */
  limit?: number;
}

/**
 * @title Salesforce Shelf
 * @description Define several filters to the shelf
 */
export default async function loader(
  props: Props,
  req: Request,
  ctx: AppContext
): Promise<null | Omit<Product[], "isVariantOf">> {
  const url = new URL(req.url);
  const { cgid, price, pmid, c_refinementColor, sort, limit, q } = props;

  const token = getCookies(req.headers)[`token_${ctx.siteId}`];

  if (!token) return null;
  const getProductBySlug = await fetchProducts<ProductSearch>(
    paths(
      ctx
    ).search.shopper_search.v1.organizations._organizationId.product_search.q(
      q,
      {
        sort,
        limit,
        refine: {
          cgid,
          price,
          pmid,
          c_refinementColor,
          htype: "master|product",
        },
      }
    ),
    token
  );

  if (getProductBySlug.total == 0) return null;

  return await toProductList(getProductBySlug, url.origin);
}

const fetchProducts = <T>(path: string, token: string): T => {
  return fetchAPI<T>(path, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
