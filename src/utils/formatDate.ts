export const formatDate = (
  date: string | Date,
  locale: string = "fr-FR",
  showYear: "auto" | "always" = "auto"
) => {
  const d = new Date(date);
  const now = new Date();

  const sameYear = d.getFullYear() === now.getFullYear();

  const options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "long",
    year: showYear === "always" || !sameYear ? "numeric" : undefined,
  };

  return new Intl.DateTimeFormat(locale, options).format(d);
};