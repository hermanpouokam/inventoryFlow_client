/* eslint-disable react-hooks/exhaustive-deps */
"use client";

import * as React from "react";
import { useTranslation } from "react-i18next";
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
import { ChevronLeft, ChevronRight, SearchX } from "lucide-react";

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
  filterAttributes?: (keyof T)[];
  searchText?: string;
}) {
  const { t } = useTranslation("common");
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

  const rows = table.getRowModel().rows;
  const selectedRows = table.getFilteredSelectedRowModel().rows.length;
  const totalRows = table.getFilteredRowModel().rows.length;
  const currentPage = table.getState().pagination.pageIndex + 1;
  const pageCount = table.getPageCount() || 1;
  const hasFooter = table.getFooterGroups().some((footerGroup) =>
    footerGroup.headers.some(
      (footer) => !footer.isPlaceholder && footer.column.columnDef.footer
    )
  );

  React.useEffect(() => {
    const filters = filterAttributes?.map((attr) => ({
      id: attr,
      value: searchText?.toLowerCase(),
    })) ?? [];
    setColumnFilters(filters);
  }, [searchText, filterAttributes]);

  React.useEffect(() => {
    setTableData(table);
  }, [table]);

  return (
    <div className="w-full">
      <div className="overflow-hidden rounded-lg bg-card shadow-sm">
        {children && (
          <div className="border-b border-border/70 bg-muted/10">
            {children}
          </div>
        )}
        <Table className="min-w-full">
          <TableHeader className="bg-background">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                className="border-b border-border/70 hover:bg-transparent"
                key={headerGroup.id}
              >
                {headerGroup.headers.map((header, index) => {
                  return (
                    <TableHead
                      className="h-11 whitespace-nowrap px-4 text-xs font-semibold text-foreground capitalize tracking-wide first:pl-5 last:pr-5"
                      key={index}
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

          <TableBody className="bg-card dark:bg-[#212121]">
            {rows?.length ? (
              rows.map((row) => (
                <TableRow
                  className="group border-b border-border transition-colors hover:bg-background/40 hover:dark:bg-primary/15 data-[state=selected]:bg-primary/5 last:border-0"
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell, index) => (
                    <TableCell
                      className="h-12 whitespace-nowrap px-4 align-middle text-sm text-foreground first:pl-5 last:pr-5"
                      key={index}
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
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={columns.length} className="h-28 text-center">
                  <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                    <div className="rounded-full border border-dashed border-border bg-muted/40 p-3">
                      <SearchX className="size-5" />
                    </div>
                    <p className="text-sm font-medium text-foreground">
                      {t("table.empty")}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>

          {hasFooter && (
            <TableFooter className="border-t border-border/70 bg-background">
              {table.getFooterGroups().map((footerGroup) => (
                <TableRow
                  className="border-b-0 hover:bg-transparent"
                  key={footerGroup.id}
                >
                  {footerGroup.headers.map((footer, index) => {
                    return (
                      <TableCell
                        className="px-4 py-3 text-sm font-semibold text-foreground first:pl-5 last:pr-5"
                        key={index}
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
          )}
        </Table>

        <div className="flex flex-col gap-3 border-t border-border/70 bg-muted/20 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs font-medium text-muted-foreground">
            {t("table.selected_rows", {
              selected: selectedRows,
              total: totalRows,
            })}
          </div>

          <div className="flex items-center justify-end gap-2">
            <span className="rounded-md border border-border/70 bg-background px-2.5 py-1 text-xs font-semibold text-muted-foreground">
              {currentPage} / {pageCount}
            </span>
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1 px-2.5"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              <ChevronLeft className="size-4" />
              {t("pagination.previous")}
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="h-8 gap-1 px-2.5"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              {t("pagination.next")}
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}