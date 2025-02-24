import { DataTableDemo } from "@/components/TableComponent";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";
import { status } from "@/utils/constants";
import { translateText } from "@/utils/translate";
import { ColumnDef } from "@tanstack/react-table";
import { EyeIcon } from "lucide-react";
import moment from "moment";
import React from "react";

interface BillTabe {
  data: Bill[];
}

const BillTable: React.FC<BillTabe> = ({ data }) => {
  const [table, setTable] = React.useState<any | null>(null);

  const columns: ColumnDef<Bill>[] = [
    {
      accessorKey: "number",
      header: () => <div className="w-[20px]">#</div>,
      cell: ({ row }) => (
        <div className="lowercase">{row.getValue("number")}</div>
      ),
    },
    {
      accessorKey: "bill_number",
      header: () => (
        <div className="text-center w-[140px]">Numero de facture</div>
      ),
      cell: ({ row }) => (
        <div className="capitalize text-center">{row.getValue("bill_number")}</div>
      ),
    },
    {
      accessorKey: "sales_point",
      header: () => <div className="text-center w-[220px]">Point de vente</div>,
      cell: ({ row }) => (
        <div className="text-center capitalize truncate">
          {row.original.sales_point_details.name} -{" "}
          {row.original.sales_point_details.address}
        </div>
      ),
    },
    {
      accessorKey: "customer_name",
      header: ({ column }) => {
        return (
          <div
            className="text-center cursor-pointer w-[220px]"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Nom du cilent
            {/* <ArrowUpDown className="ml-2 h-4 w-4" /> */}
          </div>
        );
      },
      cell: ({ row }) => {
        const customer_name = row.getValue("customer_name") as string;
        return (
          <div className="capitalize text-center text-base font-medium">
            {customer_name}
          </div>
        );
      },
    },
    {
      accessorKey: "product_bills",
      header: () => (
        <div>
          <h6 className="text-center text-base w-[220px]">
            Montant de la facture
          </h6>
        </div>
      ),
      cell: ({ row }) => {
        const product_bills: ProductBill[] = row.getValue("product_bills");
        const total = product_bills.reduce(
          (acc, curr) => (acc = acc + curr.total_amount),
          0
        );
        const formatted = new Intl.NumberFormat("fr-FR", {
          style: "currency",
          currency: "XAF",
        }).format(total);

        return <div className="text-center font-medium">{formatted}</div>;
      },
    },
    {
      accessorKey: "product_bills",
      header: ({ column }) => {
        return (
          <div
            className="flex justify-center w-[110px]"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            <span>Status</span>
            {/* <ArrowUpDown className="ml-2 h-4 w-4" /> */}
          </div>
        );
      },
      cell: ({ row }) => {
        const bill: Bill = row.original;

        return (
          <div
            className={cn(
              "capitalize text-center p-2 rounded-full w-[100px]",
              bill.state == "created" && "bg-red-500",
              bill.state == "pending" && "bg-orange-500",
              bill.state == "success" && "bg-green-500"
            )}
          >
            {status[bill.state]}
          </div>
        );
      },
    },
    {
      accessorKey: "last_update",
      header: () => <div className="text-center w-[240px]">Dernière MAJ</div>,
      cell: ({ row }) => {
        const bill = row.original;
        return (
          <div className="text-center font-medium">
            {moment(bill.last_operation.timestamp).format(
              "DD/MM/YYYY H:mm:ss"
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "delivered_at",
      header: () => <div className="text-center w-[240px]">Action</div>,
      cell: ({ row }) => {
        const bill = row.original;
        return (
          <div className="text-justify font-medium">
            {bill.last_operation.description}
          </div>
        );
      },
    },

    {
      id: "actions",
      enableHiding: false,
      header: () => <div className="text-left w-[50px]">Détails</div>,
      cell: ({ row }) => {
        const bill = row.original;
        return (
          <Button variant={"ghost"}>
            <EyeIcon className="w-3 h-3" />
          </Button>
        );
      },
    },
  ];
  const sortedData = [...data]?.sort((a, b) => {
    const timestampA = moment(a?.last_operation.timestamp).valueOf();
    const timestampB = moment(b?.last_operation.timestamp).valueOf();
    return timestampB - timestampA;
  });
  return (
    <DataTableDemo
      setTableData={setTable}
      columns={columns}
      data={sortedData.map((el, i) => {
        return { number: i + 1, ...el };
      })}
    />
  );
};

export default BillTable;
