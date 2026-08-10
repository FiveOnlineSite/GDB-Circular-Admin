import React, { useState } from "react";
import { ToggleLeft, ToggleRight } from "lucide-react";
import { Button } from "../ui/button";
import ConfirmationModal from "./ConfirmationModal";

export const StatusBadge = ({ status }) => {
  const isActive = status === "active";

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
        isActive
          ? "border-green-100 bg-green-50 text-green-700"
          : "border-red-100 bg-red-50 text-red-700"
      }`}
    >
      {isActive ? "Active" : "Inactive"}
    </span>
  );
};

const getItemLabel = (row, fallback) =>
  row?.card_title ||
  row?.product_name ||
  row?.material_name ||
  row?.facility_name ||
  row?.name ||
  row?.section_title ||
  row?.category_title ||
  fallback;

export const StatusActionButton = ({
  row,
  entityName = "item",
  onConfirm,
  className = "",
}) => {
  const [open, setOpen] = useState(false);
  const isActive = row?.status === "active";
  const actionLabel = isActive ? "Deactivate" : "Activate";
  const itemLabel = getItemLabel(row, entityName);

  const handleConfirm = async () => {
    await onConfirm?.(row);
    setOpen(false);
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className={`h-8 w-10 rounded-full p-0 ${
          isActive
            ? "border-red-200 text-red-700 hover:bg-red-50"
            : "border-green-200 text-green-700 hover:bg-green-50"
        } ${className}`}
        onClick={() => setOpen(true)}
        title={`${actionLabel} ${entityName}`}
      >
        {isActive ? (
          <ToggleRight className="h-4 w-4" />
        ) : (
          <ToggleLeft className="h-4 w-4" />
        )}
        <span className="sr-only">{actionLabel}</span>
      </Button>

      <ConfirmationModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={handleConfirm}
        title={`${actionLabel} ${entityName}?`}
        message={`Are you sure you want to ${actionLabel.toLowerCase()} "${itemLabel}"?`}
        confirmText={actionLabel}
        confirmButtonClass={
          isActive
            ? "bg-red-600 hover:bg-red-700 shadow-red-600/20"
            : "bg-green-600 hover:bg-green-700 shadow-green-600/20"
        }
      />
    </>
  );
};
