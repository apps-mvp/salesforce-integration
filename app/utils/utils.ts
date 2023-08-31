import { RefineParams, PricingRange, Images, ProductBaseSalesforce } from "./types.ts";
import { AppContext } from "../mod.ts";
import { paths } from "../utils/paths.ts";
import { fetchAPI } from "deco-sites/std/utils/fetch.ts";

export function slugfy(url: string) {
  return url
    .toString()
    .toLowerCase()
    .replace(/%20/g, " ")
    .trim()
    .normalize("NFD")
    .replace(/_/g, "-")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[_\s]+/g, "-")
    .replace(/&/g, "-and-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-");
}

export const stringfyParams = (params?: object): string => {
  if (!params || Object.keys(params).length == 0) {
    return "";
  }

  return (
    "&" +
    Object.keys(params)
      .map((prop: string) => {
        const elementValue = params[prop as keyof object];
        if (!elementValue) return null;

        return prop.startsWith("refine_")
          ? "refine=" + prop.replace("refine_", "") + "=" + elementValue
          : prop + "=" + elementValue;
      })
      .filter(Boolean)
      .join("&")
  );
};

export const toRefineParams = (extraParams: RefineParams[]) => {
  const result = {};
  for (const item of extraParams) {
    result[`refine_${item.key}`] = item.value;
  }
  return result;
};

export const toPriceRange = (pricingRange: PricingRange | undefined) => {
  if (
    !pricingRange ||
    typeof pricingRange.minValue == "string" ||
    typeof pricingRange.maxValue == "string" ||
    (typeof pricingRange.minValue == "undefined" &&
      typeof pricingRange.maxValue == "undefined")
  )
    return undefined;

  return `(${pricingRange.minValue ? Math.floor(pricingRange.minValue) : ""}..${
    pricingRange.maxValue ? Math.floor(pricingRange.maxValue) : ""
  })`;
};

export const fetchCartImagesAPI = async (
  ctx: AppContext,
  productId: string,
  token: string
): Promise<Images> => {
  const response = (await fetchAPI<ProductBaseSalesforce>(
    paths(
      ctx
    ).product.shopper_products.v1.organizations._organizationId.products.productId(
      productId,
      { expand: "images", allImages: false }
    ),
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  )) as ProductBaseSalesforce;

  return response.imageGroups[0].images[0];
};
