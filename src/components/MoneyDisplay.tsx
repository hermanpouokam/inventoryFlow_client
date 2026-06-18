export const formatFcfa = (amount: number): string => {
  return (
    new Intl.NumberFormat("fr-FR")
      .format(amount)
      .replace(/\u202F/g, " ") // Remplace les espaces insécables par des espaces normaux
      .trim() + " FCFA"
  );
};
