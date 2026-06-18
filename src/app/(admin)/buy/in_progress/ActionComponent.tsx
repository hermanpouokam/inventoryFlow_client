//@ts-nocheck
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { BlobProvider } from "@react-pdf/renderer";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ArrowDownToLine,
  EllipsisVertical,
  Printer,
  Trash,
  CheckCircle,
  XCircle,
} from "lucide-react";
import {
  CircularProgress,
  DialogTitle as MuiDialogTitle,
  Dialog as MuiDialog,
  DialogContent as MuiDialogContent,
  DialogContentText,
  Button as MuiButton,
  DialogActions,
  Backdrop,
} from "@mui/material";
import ReactDOM from "react-dom/client";
import { toast } from "@/components/ui/app-toast";
import { check_warnings, receiptSupply } from "./functions";
import { cn } from "@/lib/utils";
import SupplyPdf from "@/app/pdf/supplyPdf";
import { instance } from "@/components/fetch";
import { usePermission } from "@/context/PermissionContext";
import { useTranslation } from "react-i18next";
import { formatteCurrency } from "../../stock/functions";

// ─── Types ────────────────────────────────────────────────────────────────────
// IMPORTANT : ces clés doivent correspondre EXACTEMENT aux message_key
// renvoyés par SupplyViewTestSet.check_warnings (views/supply.py) :
//   - "supply.warning.INSUFFICIENT_EMPTY_PACKAGING"
//   - "supply.warning.INSUFFICIENT_FUNDS"
//   - "supply.warning.ALL_OK"
// (namespace "warning" au singulier, et "INSUFFICIENT" sans faute)

type WarningItem = {
  message_key:
  | "supply.warning.INSUFFICIENT_EMPTY_PACKAGING"
  | "supply.warning.INSUFFICIENT_FUNDS";
  params: Record<string, string | number>;
};

type CheckWarningsResponse =
  | { warnings: WarningItem[] }
  | { message_key: "supply.warning.ALL_OK"; total_cost: number };


const hasInsufficientFunds = (res: CheckWarningsResponse | null): boolean => {
  if (!res || !("warnings" in res)) return false;
  return res.warnings.some(
    (w) => w.message_key === "supply.warning.INSUFFICIENT_FUNDS"
  );
};

const isAllOk = (res: CheckWarningsResponse | null): boolean =>
  !!res && "message_key" in res && res.message_key === "supply.warnings.ALL_OK";

const formatParams = (params: Record<string, string | number>) => {
  const moneyKeys = ["total_cost", "available", "packaging_cost", "price_per_casier"];
  return Object.fromEntries(
    Object.entries(params).map(([k, v]) => [
      k,
      moneyKeys.includes(k) ? formatteCurrency(v as number) : v,
    ])
  );
};


export const ActionComponent = ({
  supply,
  onSetLoading,
  onGetData,
  page = "in_progress",
}: {
  supply: Supply;
  loading: boolean;
  onSetLoading: (el: boolean) => void;
  onGetData: () => void;
  page: "in_progress" | "history";
}) => {
  const [openModalDelete, setOpenModalDelete] = React.useState(false);
  const [openWarningDialog, setOpenWarningDialog] = React.useState(false);
  const [warningsRes, setWarningsRes] = React.useState<CheckWarningsResponse | null>(null);
  const [loadingState, setLoadingState] = useState(false);

  const { t: tCommon } = useTranslation("common");
  const { hasPermission } = usePermission();

  const handleCheckWarnings = async ({ supplyId }: { supplyId: number }) => {
    try {
      setLoadingState(true);
      const res: CheckWarningsResponse = await check_warnings({ supplyId });
      setWarningsRes(res);

      console.log(res)

      if (isAllOk(res)) {
        await handleReceiptSupply(supplyId);
        return;
      }

      setOpenWarningDialog(true);
    } catch (error) {
      console.error(error);
      toast({
        title: tCommon("error"),
        description: tCommon("supply.errors.check_warnings"),
        variant: "destructive",
        icon: <XCircle className="size-4" />,
      });
    } finally {
      setLoadingState(false);
    }
  };

  const handleReceiptSupply = async (supplyId: number) => {
    setLoadingState(true);
    try {
      const res = await receiptSupply({ supplyId });
      if (res) {
        toast({
          title: tCommon("success"),
          description: tCommon("supply.success.received"),
          variant: "success",
          icon: <CheckCircle className="size-4" />,
        });
        setOpenWarningDialog(false);
        onGetData();
      }
    } catch (error) {
      toast({
        title: tCommon("error"),
        description: tCommon("supply.errors.receive"),
        variant: "destructive",
        icon: <XCircle className="size-4" />,
      });
    } finally {
      setLoadingState(false);
    }
  };

  const handleDeleteSupply = async (supplyId: number) => {
    setLoadingState(true);
    try {
      const res = await instance.delete(`/supplies/${supplyId}/`, {
        withCredentials: true,
      });
      if (res.status === 204) {
        toast({
          title: tCommon("success"),
          description: tCommon("supply.success.deleted"),
          variant: "success",
          icon: <CheckCircle className="size-4" />,
        });
        onGetData();
        setOpenModalDelete(false);
      }
    } catch (error) {
      toast({
        title: tCommon("error"),
        description: tCommon("supply.errors.delete"),
        variant: "destructive",
        icon: <XCircle className="size-4" />,
      });
    } finally {
      setLoadingState(false);
    }
  };

  const handleOpenPDF = () => {
    const newWindow = window.open("", "_blank");
    if (!newWindow) {
      alert(tCommon("popup_blocked"));
      return;
    }
    newWindow.document.write(`<p>${tCommon("loading_pdf")}</p>`);
    const pdfBlobProvider = (
      <BlobProvider document={<SupplyPdf supply={supply} />}>
        {({ blob }) => {
          if (blob) {
            newWindow.location.href = URL.createObjectURL(blob);
          } else {
            newWindow.document.write(`<p>${tCommon("pdf_error")}</p>`);
          }
        }}
      </BlobProvider>
    );
    const container = document.createElement("div");
    document.body.appendChild(container);
    ReactDOM.createRoot(container).render(pdfBlobProvider);
  };

  return (
    <>
      {/* Backdrop loading (hors dialog warnings) */}
      <Backdrop
        sx={{ color: "#8b5cf6", zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={loadingState && !openWarningDialog}
      >
        <CircularProgress color="inherit" />
      </Backdrop>

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">{tCommon("open_menu")}</span>
            <EllipsisVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>{tCommon("actions.title")}</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleOpenPDF}>
            <Printer className="mr-3" size={14} />
            {tCommon("actions.print_order")}
          </DropdownMenuItem>
          {page === "in_progress" && hasPermission("validate_supply") && (
            <DropdownMenuItem
              onClick={() => handleCheckWarnings({ supplyId: supply.id })}
            >
              <ArrowDownToLine className="mr-3" size={14} />
              {tCommon("actions.receive")}
            </DropdownMenuItem>
          )}
          {page === "in_progress" && hasPermission("delete_supply") && (
            <DropdownMenuItem
              onClick={() => setOpenModalDelete(true)}
              className="text-red-500 hover:text-white hover:bg-red-600"
            >
              <Trash className="mr-3" size={14} />
              {tCommon("delete")}
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      <MuiDialog open={openModalDelete}>
        <MuiDialogTitle>
          {tCommon("dialogs.confirm_delete_supply", {
            number: supply.supply_number,
          })}
        </MuiDialogTitle>
        <MuiDialogContent>
          <DialogContentText>
            {tCommon("dialogs.delete_supply_stock_return")}
          </DialogContentText>
          <h3 className="text-base font-medium text-red-400 mt-2">
            {tCommon("dialogs.irreversible_warning")}
          </h3>
        </MuiDialogContent>
        <DialogActions>
          <MuiButton color="success" onClick={() => setOpenModalDelete(false)}>
            {tCommon("common.no")}
          </MuiButton>
          <MuiButton color="error" onClick={() => handleDeleteSupply(supply.id)}>
            {tCommon("common.yes")}
          </MuiButton>
        </DialogActions>
      </MuiDialog>

      <AlertDialog open={openWarningDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {tCommon("dialogs.confirm_receive_supply")}
            </AlertDialogTitle>

            {warningsRes && "warnings" in warningsRes && (
              <div className="flex flex-col gap-2 mt-1">
                {warningsRes.warnings.map((warning, idx) => {
                  const isBlocker =
                    warning.message_key === "supply.warnings.INSUFFICIENT_FUNDS" || warning.message_key === "supply.warnings.INSUFFICIENT_EMPTY_PACKAGING" || warning.message_key === "supply.warnings.INSUFFICIENT_EMPTY_PACKAGING_PRICE";

                  return (
                    <AlertDialogDescription
                      key={idx}
                      className={cn(
                        isBlocker ? "text-red-500" : "text-amber-600"
                      )}
                    >
                      — {tCommon(warning.message_key, formatParams(warning.params))}
                    </AlertDialogDescription>
                  );
                })}
              </div>
            )}
          </AlertDialogHeader>

          <AlertDialogFooter>
            <Button
              variant="ghost"
              className="border-red-500 border text-red-500 hover:bg-red-500 hover:text-white"
              onClick={() => setOpenWarningDialog(false)}
            >
              {tCommon("cancel")}
            </Button>
            <Button
              variant="default"
              className="bg-green-500 hover:bg-green-700"
              disabled={hasInsufficientFunds(warningsRes) || loadingState}
              onClick={() => handleReceiptSupply(supply.id)}
            >
              {loadingState ? tCommon("please_wait") : tCommon("actions.receive")}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};