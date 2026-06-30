import moment from "moment";

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

  const filteredBills = [...bills].sort((a, b) => new Date(a.delivery_date) - new Date(b.delivery_date)).filter((bill) => {
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

const dashboardMonthKeys = [
  "dates.months.january",
  "dates.months.february",
  "dates.months.march",
  "dates.months.april",
  "dates.months.may",
  "dates.months.june",
  "dates.months.july",
  "dates.months.august",
  "dates.months.september",
  "dates.months.october",
  "dates.months.november",
  "dates.months.december",
];

const dashboardWeekdayKeys = [
  "dates.weekdays.monday",
  "dates.weekdays.tuesday",
  "dates.weekdays.wednesday",
  "dates.weekdays.thursday",
  "dates.weekdays.friday",
  "dates.weekdays.saturday",
  "dates.weekdays.sunday",
];

const translateRole = {
  "deliverer": "livreur",
  "secretary": "sécrétaire"
}
export { groupBillsBy, dashboardMonthKeys, dashboardWeekdayKeys, translateRole };


export const getPeriods = () => {
  return [
    {
      name: "current-week",
      startDate: moment().startOf("isoWeek").toISOString(),
      endDate: moment().endOf("isoWeek").toISOString(),
      groupBy: "day",
    },
    {
      name: "prev-week",
      startDate: moment()
        .subtract(1, "week")
        .startOf("isoWeek")
        .toISOString(),
      endDate: moment()
        .subtract(1, "week")
        .endOf("isoWeek")
        .toISOString(),
      groupBy: "day",
    },
    {
      name: "current-month",
      startDate: moment().startOf("month").toISOString(),
      endDate: moment().endOf("month").toISOString(),
      groupBy: "day-number",
    },
    {
      name: "prev-month",
      startDate: moment()
        .subtract(1, "month")
        .startOf("month")
        .toISOString(),
      endDate: moment()
        .subtract(1, "month")
        .endOf("month")
        .toISOString(),
      groupBy: "day-number",
    },
    {
      name: "current-year",
      startDate: moment().startOf("year").toISOString(),
      endDate: moment().endOf("year").toISOString(),
      groupBy: "month",
    },
    {
      name: "prev-year",
      startDate: moment()
        .subtract(1, "year")
        .startOf("year")
        .toISOString(),
      endDate: moment()
        .subtract(1, "year")
        .endOf("year")
        .toISOString(),
      groupBy: "month",
    },
  ];
};