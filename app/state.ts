export interface State {
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
