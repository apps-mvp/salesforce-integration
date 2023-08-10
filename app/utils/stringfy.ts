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
    ? "&" + unifiedObject.join("&")
    : unifiedObject.join("&");
  return joinedObject;
};
