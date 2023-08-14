export interface ProductBaseSalesforce {
  currency: "USD" | "BRL";
  id: string;
  brand?: string;
  imageGroups: ImageGroups[];
  inventory: Inventory;
  longDescription: string;
  master?: Master;
  minOrderQuantity: number;
  name: string;
  pageDescription?: string;
  pageTitle?: string;
  price: number;
  priceMax?: number;
  pricePerUnit: number;
  primaryCategoryId: string;
  productPromotions?: string;
  shortDescription?: string;
  slugUrl: string;
  stepQuantity: number;
  type: Type;
  validFrom?: ValidFrom;
  variants?: Variants[];
  variationAttributes?: VariationAttributes[];
  c_attributes: DynamicAttributes;
}

type DynamicAttributes = Record<string, any>;

export interface TokenBaseSalesforce {
  access_token: string;
  id_token: string;
  refresh_token: string;
  expires_in: number;
  refresh_token_expires_in: number;
  token_type: "BEARER";
  usid: string;
  customer_id: string;
  enc_user_id: string;
  idp_access_token: string;
  idp_refresh_token: string;
}

export interface Images {
  alt: string;
  disBaseLink: string;
  link: string;
  title: string;
}

export interface ImageGroups {
  images: Images[];
  viewType: "large" | "medium" | "small" | "swatch";
  variationAttributes?: VariationImageGroups[];
}

export interface VariationImageGroups {
  id: string;
  values: [
    {
      value: string;
    }
  ];
}

export interface Inventory {
  ats: number;
  backorderable: boolean;
  id: string;
  orderable: boolean;
  preorderable: boolean;
  stockLevel: number;
}

export interface Master {
  masterId: string;
  orderable: boolean;
  price: number;
}

export interface Type {
  master: boolean;
  bundle?: boolean;
  variant?: boolean;
  item?: boolean;
  option?: boolean;
}

export interface ValidFrom {
  default: string;
}

export interface Variants {
  orderable: boolean;
  price: number;
  productId: string;
  variationValues: Record<string, string>;
}

export interface VariationAttributes {
  id: string;
  name: string;
  values: VariationAttributesValues[];
}

export interface VariationAttributesValues {
  name: string;
  orderable: boolean;
  value: string;
}

export interface PDPParams {
  /**
   * @description inventory list ID
   */
  inventoryIds?: string;

  /**
   * @description If missing, all values will be returned.
   */
  expand?:
    | "availability"
    | "bundled_products"
    | "links"
    | "promotions"
    | "options"
    | "images"
    | "prices"
    | "variations"
    | "set_products"
    | "recommendations";

  /**
   * @description Retrieve the whole image model for the requested product.
   */
  allImages?: boolean;

  /**
   * @description Retrieve the whole pricebook prices and tiered prices (if available) for the requested product.
   */
  perPricebook?: boolean;
}

export interface ProductSearchParams {
  /**
   * @description Refine search Params. The refinements can be a collection of custom defined attributes IDs and the system defined attributes IDs but the search can only accept a total of 9 refinements at a time
   */
  refine?: {
    /**
     * @description Allows refinement per single category ID. Multiple category ids are not supported.
     */
    cgid?: string;

    /**
     * @description Allows refinement per single price range. Multiple price ranges are not supported.
     * @example (100..300)
     */
    price?: string;

    /**
     * @description Allows refinement per promotion ID.
     */
    pmid?: string;

    /**
     * @description Allow refinement by including only the provided hit types. Hit type - ('product', 'master', 'set', 'bundle', 'variation_group'). A | can divide them
     */
    htype?: string;

    /**
     * @description Unavailable products are excluded from the search results if true is set.
     */
    orderable_only?: boolean;

    /**
     * @description Refinement color. Multiple values are supported by a subset of refinement attributes and can be provided by separating them using a pipe (URL encoded = "|") i.e.
     * @example red|green|blue
     */
    c_refinementColor?: string;
  };

  /**
   * @description The ID of the sorting option to sort the search hits.
   */
  sort?: string;

  /**
   * @description The expand parameter. A list with the allowed values (availability, images, prices, represented_products, variations). If the parameter is missing all the values will be returned.
   */
  expand?: string;

  /**
   * @description Used to retrieve the results based on a particular resource offset.
   */
  offset?: number;

  /**
   * @description Maximum records to retrieve per request, not to exceed 200. Defaults to 25.
   */
  limit?: number;
}

export interface Account {
  /**
   **@title Salesforce short code.
   * @description Salesforce account short code. For more info, read here: https://developer.salesforce.com/docs/commerce/commerce-api/guide/authorization-for-shopper-apis.html.
   */
  shortCode: string;

  /**
   * @title Site ID.
   * @description Identification of site in Salesforce.
   */
  siteId: string;

  /**
   * @title Organization ID.
   * @description Identification of the organization in Salesforce.
   */
  organizationId: string;

  /**
   * @title Client ID.
   * @description Identification of the client in Salesforce.
   */
  clientId: string;

  /**
   * @title Client Secret.
   * @description Password of the client.
   */
  clientSecret: string;

  /**
   * @title Public store URL.
   * @description Domain of the site (for proxy config).
   */
  publicStoreUrl: string;

  /**
   * @title Currency
   * @description The currency of the items in Salesforce.
   * @default USD
   */
  currency: string;

  /**
   * @title Locale.
   * @description The locale of the items in Salesforce site.
   * @default en-US
   */
  locale: string;
}

export interface ProductSearch {
  limit: number;
  hits: ProductSeachHits[];
  query: string;
  refinements: ProductSearchRefinments[];
  searchPhraseSuggestions: ProductSearchSuggestions;
  sortingOptions: SortingOptions[];
  offset: number;
  total: number;
}

export interface ProductSeachHits {
  currency: "USD" | "BRL";
  hitType: "product" | "master" | "set" | "bundle";
  image: Images;
  orderable: boolean;
  price: number;
  pricePerUnit: number;
  productId: string;
  productName: string;
  productType: Type;
  representedProduct?: RepresentedProduct;
  representedProducts: RepresentedProduct[];
  variationAttributes: VariationAttributes[];
}

export interface RepresentedProduct {
  id: string;
}

export interface ProductSearchRefinments {
  attributeId: string;
  label: string;
  values?: ProductSearchRefinmentsValues[];
}

export interface ProductSearchRefinmentsValues {
  hitCount: number;
  label: string;
  presentationId?: string;
  value: string;
}

export interface ProductSearchSuggestions {
  suggestedPhrases: SuggestedPhrases[];
  suggestedTerms: SuggestedTerms[];
}

export interface SuggestedPhrases {
  exactMatch: boolean;
  phrase: string;
}

export interface SuggestedTerms {
  originalTerm: string;
  terms: SuggestedTermsValues[];
}

export interface SuggestedTermsValues {
  completed: boolean;
  corrected: boolean;
  exactMatch: boolean;
  value: string;
}

export interface SortingOptions {
  id: string;
  label: string;
}
