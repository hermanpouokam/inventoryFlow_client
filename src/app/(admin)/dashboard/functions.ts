type GroupBy = "day" | "month" | "year";

/**
 * @param bills
 * @param groupBy
 * @param startDate
 * @param endDate
 * @returns
 */
function groupBillsBy(
  bills: Bill[],
  groupBy: GroupBy,
  startDate: string | null = null,
  endDate: string | null = null
): { [key: string]: Bill[] } {
  const start = startDate ? new Date(startDate) : null;
  const end = endDate ? new Date(endDate) : null;

  const filteredBills = bills.filter((bill) => {
    const billDate = new Date(bill.created_at);
    return (!start || billDate >= start) && (!end || billDate <= end);
  });

  return filteredBills.reduce((acc: { [key: string]: Bill[] }, bill: Bill) => {
    const date = new Date(bill.created_at);
    let key: string;

    switch (groupBy) {
      case "day":
        key = date.toISOString().split("T")[0];
        break;
      case "month":
        key = `${date.getFullYear()}-${(date.getMonth() + 1)
          .toString()
          .padStart(2, "0")}`;
        break;
      case "year":
        key = date.getFullYear().toString();
        break;
      default:
        throw new Error(
          "Invalid groupBy value. Use 'day', 'month', or 'year'."
        );
    }

    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(bill);

    return acc;
  }, {});
}

const monthsInFrench = [
  "janvier",
  "février",
  "mars",
  "avril",
  "mai",
  "juin",
  "juillet",
  "aout",
  "septembre",
  "octobre",
  "novembre",
  "décembre",
];

const weeksInFrench = [
  "lundi",
  "mardi",
  "mercredi",
  "jeudi",
  "vendredi",
  "samedi",
  "dimanche",
];

const translateRole = {
  "deliverer":"livreur",
  "secretary":"sécrétaire"
}
export { groupBillsBy, monthsInFrench, weeksInFrench,translateRole };
