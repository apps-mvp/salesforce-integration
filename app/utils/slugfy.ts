export function slugify(url: string) {
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

export function getSlugFromURL(url: URL) {
  const urlProps = url.pathname.split("/").filter((value: string) => value);

  if (urlProps[urlProps.length - 1] != "p") {
    return undefined;
  }

  return urlProps[urlProps.length - 2];
}
