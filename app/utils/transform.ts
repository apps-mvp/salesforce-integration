import { slugfy } from "./utils.ts";
import type {
  ImageGroups,
  ProductBaseSalesforce,
  Variants,
  VariationAttributes,
  ProductSearch,
  Inventory,
} from "./types.ts";
import type {
  PropertyValue,
  ProductGroup,
  ImageObject,
  Product,
  ProductDetailsPage,
  BreadcrumbList,
  Offer,
} from "deco-sites/std/commerce/types.ts";

export const toProductPage = (
  product: ProductBaseSalesforce,
  baseURL: string
): ProductDetailsPage => ({
  "@type": "ProductDetailsPage",
  breadcrumbList: toBreadcrumbList(product, baseURL),
  product: toProduct(product, baseURL),
  seo: {
    title: toSEOTitle(product),
    description: product.pageDescription ?? product.shortDescription,
    canonical: getProductURL(baseURL, product.name, product.id).href,
  },
});

export const toProductList = (
  products: ProductSearch,
  baseURL: string
): Product[] => {
  return products.hits.map(
    ({
      productId,
      productName,
      variationAttributes,
      image,
      currency,
      price,
      orderable,
    }) => {
      const offers = toOffer(price, orderable, orderable ? 10 : 0);
      return {
        "@type": "Product",
        id: productId,
        url: getProductURL(baseURL, productName, productId).href,
        name: productName,
        additionalProperty: toAdditionalProperties(variationAttributes),
        image: [
          {
            "@type": "ImageObject",
            alternateName: image.alt,
            url: image.link,
          },
        ],
        offers: {
          "@type": "AggregateOffer",
          priceCurrency: currency,
          highPrice: price,
          lowPrice: price,
          offerCount: offers.length,
          offers,
        },
      };
    }
  );
};

const toSEOTitle = ({ name, pageTitle, brand }: ProductBaseSalesforce) => {
  const SEOTitle = pageTitle ?? name;
  return brand ? `${SEOTitle}, ${brand}` : SEOTitle;
};

const toBreadcrumbList = (
  { primaryCategoryId, name, id }: ProductBaseSalesforce,
  baseURL: string
): BreadcrumbList => {
  const categories = toCategory(primaryCategoryId).split(/[>]/);

  return {
    "@type": "BreadcrumbList",
    itemListElement: [
      ...categories.map((name, index) => ({
        "@type": "ListItem" as const,
        name,
        item: new URL(
          `/${categories
            .slice(0, index + 1)
            .join("/")
            .toLowerCase()}`,
          baseURL
        ).href,
        position: index + 1,
      })),
      {
        "@type": "ListItem",
        name: name,
        item: getProductURL(baseURL, name, id).href,
        position: categories.length + 1,
      },
    ],
    numberOfItems: categories.length + 1,
  };
};

const toProduct = (
  product: ProductBaseSalesforce,
  baseURL: string
): Product => {
  const {
    primaryCategoryId,
    id,
    name,
    pageDescription,
    brand,
    imageGroups,
    price,
    inventory,
  } = product;

  const isVariantOf = product.variants
    ? toVariantProduct(product, product.variants, baseURL)
    : undefined;

  const offers = toOffer(price, inventory.orderable, inventory.stockLevel);
  return {
    "@type": "Product",
    category: toCategory(primaryCategoryId),
    productID: id,
    url: getProductURL(baseURL, name, id).href,
    name: name,
    description: pageDescription,
    brand,
    gtin: id,
    additionalProperty: toAdditionalProperties(
      product.variationAttributes,
      product
    ),
    isVariantOf,
    image: imageGroups
      .filter((obj) => !obj.variationAttributes && obj.viewType === "large")
      .flatMap((obj) =>
        obj.images.map((image) => ({
          "@type": "ImageObject",
          alternateName: image.alt,
          url: image.link,
        }))
      ),
    offers: {
      "@type": "AggregateOffer",
      priceCurrency: product.currency,
      highPrice: product.priceMax ?? product.price,
      lowPrice: product.price,
      offerCount: offers.length,
      offers,
    },
  };
};

const toCategory = (category: string) =>
  category
    .replace(/[-_/]/g, ">")
    .split(">")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(">");

const toVariantProduct = (
  master: ProductBaseSalesforce,
  variants: Variants[],
  baseURL: string
): ProductGroup =>
  ({
    "@type": "ProductGroup",
    productGroupID: master.id,
    hasVariant: variants.map((variant) => {
      const offers = toVariantOffer(variant);
      return {
        "@type": "Product",
        category: toCategory(master.primaryCategoryId),
        productID: variant.productId,
        url: getProductURL(baseURL, master.name, master.id).href,
        name: master.name,
        description: master.pageDescription,
        brand: master.brand,
        sku: variant.productId,
        gtin: variant.productId,
        additionalProperty: toVariantAdditionalProperties(
          variant.variationValues,
          master.variationAttributes
        ),
        image: toVariantImages(master.imageGroups, variant.variationValues),
        offers: {
          "@type": "AggregateOffer",
          priceCurrency: master.currency,
          highPrice: variant.price,
          lowPrice: variant.price,
          offerCount: offers.length,
          offers,
        },
      };
    }),
    url: getProductURL(baseURL, master.name, master.id).href,
    name: master.name,
    additionalProperty: toExtraAdditionalProperties(master),
    model: master.id,
  } ?? []);

const getProductURL = (
  origin: string,
  productName: string,
  id: string
): URL => {
  const canonicalUrl = new URL(`/${slugfy(productName)}/p`, origin);
  canonicalUrl.searchParams.set("id", id);
  return canonicalUrl;
};

const toAdditionalProperties = (
  variationAttributes: VariationAttributes[] | undefined,
  product?: ProductBaseSalesforce
): PropertyValue[] => {
  const propietiesFromVariationAttr =
    variationAttributes?.flatMap(({ name, values }) =>
      values.map(
        (value) =>
          ({
            "@type": "PropertyValue",
            name: name,
            value: value.name,
            propertyID: value.value,
          } as const)
      )
    ) ?? [];

  if (product) {
    const proprietiesFromExtraAttr = toExtraAdditionalProperties(product);
    return propietiesFromVariationAttr.concat(proprietiesFromExtraAttr);
  }

  return propietiesFromVariationAttr;
};

const toExtraAdditionalProperties = (
  product: ProductBaseSalesforce
): PropertyValue[] => {
  return Object.entries(product)
    .filter(([key]) => key.startsWith("c_"))
    .map(([key, value]) => ({
      "@type": "PropertyValue",
      name: key.substring(2),
      value,
      valueReference: "PROPERTY",
    }));
};

const toVariantAdditionalProperties = (
  variationValues: Record<string, string>,
  variationAttributes: VariationAttributes[] | undefined
): PropertyValue[] => {
  if (!variationAttributes) return [];

  const result = variationAttributes.reduce((acc, attribute) => {
    const fieldValue = variationValues[attribute.id];
    const matchingValue = attribute.values.find(
      (val) => val.value === fieldValue
    );

    if (matchingValue) {
      acc.push({
        "@type": "PropertyValue",
        name: attribute.name,
        value: matchingValue.name,
        propertyID: matchingValue.value,
      });
    }

    return acc;
  }, [] as PropertyValue[]);

  return result;
};

const toVariantImages = (
  imageGroup: ImageGroups[],
  variationValues: Record<string, string>
): ImageObject[] =>
  imageGroup.flatMap((item) =>
    item.variationAttributes?.some(
      (attr) =>
        variationValues[attr.id] &&
        attr.values.some(
          (subAttr) => subAttr.value === variationValues[attr.id]
        )
    ) && item.viewType == "large"
      ? item.images.map((value) => ({
          "@type": "ImageObject",
          alternateName: value.alt,
          url: value.link,
        }))
      : []
  );

const toOffer = (
  price: number,
  orderable: boolean,
  stockLevel: number
): Offer => [
  {
    "@type": "Offer",
    price: price,
    inventoryLevel: { value: stockLevel },
    seller: "Salesforce",
    priceSpecification: [
      {
        "@type": "UnitPriceSpecification",
        priceType: "https://schema.org/ListPrice",
        price: price,
      },
      {
        "@type": "UnitPriceSpecification",
        priceType: "https://schema.org/SalePrice",
        price: price,
      },
    ],
    availability: orderable
      ? "https://schema.org/InStock"
      : "https://schema.org/OutOfStock",
  },
];

const toVariantOffer = (variant: Variants): Offer => [
  {
    "@type": "Offer",
    price: variant.price,
    inventoryLevel: { value: variant.orderable ? 10 : 0 },
    seller: "Salesforce",
    priceSpecification: [
      {
        "@type": "UnitPriceSpecification",
        priceType: "https://schema.org/ListPrice",
        price: variant.price,
      },
      {
        "@type": "UnitPriceSpecification",
        priceType: "https://schema.org/SalePrice",
        price: variant.price,
      },
    ],
    availability: variant.orderable
      ? "https://schema.org/InStock"
      : "https://schema.org/OutOfStock",
  },
];
