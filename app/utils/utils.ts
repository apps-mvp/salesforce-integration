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

export const stringfyParams = (
  params?: object,
  firstLevel?: boolean,
  prevAttribute?: string
): string => {
  if (!params || Object.keys(params).length == 0) {
    return "";
  }

  const unifiedObject = Object.keys(params).map((prop: string) => {
    const elementValue = params[prop as keyof object];
    if (!elementValue) return null;

    if (typeof elementValue === "object") {
      const nextLevelObj = stringfyParams(elementValue, false, prop);
      return nextLevelObj;
    }

    const returnObj = prevAttribute
      ? prevAttribute + "=" + prop + "=" + elementValue
      : prop + "=" + elementValue;
    return returnObj;
  });
  const joinedObject = firstLevel
    ? "&" + unifiedObject.filter(Boolean).join("&")
    : unifiedObject.filter(Boolean).join("&");
  return joinedObject;
};
