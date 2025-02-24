/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import * as React from "react";
import {
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function DataTableDemo<T extends object>({
  columns,
  data,
  children,
  setTableData,
  searchText, 
  filterAttributes,
}: {
  data: T[];
  columns: any;
  children?: React.ReactNode;
  setTableData: (e: any) => void;
  filterAttributes: (keyof T)[];
  searchText: string;
}) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );
  const [columnVisibility, setColumnVisibility] =
    React.useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = React.useState({});

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
    },
  });

  React.useEffect(() => {
    const filters = filterAttributes?.map((attr) => ({
      id: attr,
      value: searchText?.toLowerCase(),
    }));
    console.log('filtering')
    setColumnFilters(filters);
  }, [searchText, filterAttributes]);

  React.useEffect(() => {
    setTableData(table);
  }, [table]);

  return (
    <div className="w-full">
      {children}
      <div className="rounded-md border">
        <Table>
          <TableHeader className=" text-white">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                className="hover:bg-neutral-900 bg-neutral-900"
                key={headerGroup.id}
              >
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      className="border-x border-x-neutral-300 first:border-0 last:border-0 text-white"
                      key={header.id}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody className="bg-neutral-800">
            {table?.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  className="hover:bg-zinc-700"
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      className="border-x border-x-neutral-300 first:border-0 last:border-0 text-white"
                      key={cell.id}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow className="hover:bg-zinc-800">
                <TableCell
                  colSpan={columns.length}
                  className="text-center text-white text-sm font-medium"
                >
                  Aucun resultat
                </TableCell>
              </TableRow>
            )}
          </TableBody>
          <TableFooter>
            {table.getFooterGroups().map((footerGroup) => (
              <TableRow
                className="bg-neutral-900 hover:bg-neutral-900"
                key={footerGroup.id}
              >
                {footerGroup.headers.map((footer) => {
                  return (
                    <TableCell
                      className="border-x border-x-neutral-300 first:border-0 last:border-0 text-white"
                      key={footer.id}
                    >
                      {footer.isPlaceholder
                        ? null
                        : flexRender(
                            footer.column.columnDef.footer,
                            footer.getContext()
                          )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableFooter>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <div className="flex-1 text-sm text-muted-foreground">
          {table.getFilteredSelectedRowModel().rows.length} sur{" "}
          {table.getFilteredRowModel().rows.length} rangée(s) selectionnée(s).
        </div>
        <div className="space-x-2">
          <Button
            variant="link"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Précédent
          </Button>
          <Button
            variant="link"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Suivant
          </Button>
        </div>
      </div>
    </div>
  );
}
