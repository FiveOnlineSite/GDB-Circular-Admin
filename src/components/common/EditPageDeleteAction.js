import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { Button } from "../ui/button";
import api from "../../lib/utils/apiConfig";
import { usePermissionContext } from "../../context/PermissionContext";
import ConfirmationModal from "./ConfirmationModal";

export default function EditPageDeleteAction({
  id,
  permission,
  endpoint,
  onDelete,
  onDeleted,
  redirectTo,
  title,
  message,
  successMessage,
  className = "mr-auto",
}) {
  const navigate = useNavigate();
  const { hasPermission } = usePermissionContext();
  const [isOpen, setIsOpen] = useState(false);

  if (!id || !hasPermission(permission)) return null;

  const handleConfirm = async () => {
    try {
      const response = onDelete
        ? await onDelete()
        : (await api.delete(endpoint)).data;

      if (response?.success === false) {
        throw new Error(response.message || "Delete failed");
      }

      toast.success(successMessage);
      setIsOpen(false);

      if (onDeleted) {
        await onDeleted(response);
      } else if (redirectTo) {
        navigate(redirectTo);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message || "Delete failed");
    }
  };

  return (
    <>
      <Button
        type="button"
        variant="outline"
        onClick={() => setIsOpen(true)}
        className={`${className} border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700`}
      >
        <Trash2 className="h-4 w-4 mr-2" />
        Delete
      </Button>
      <ConfirmationModal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onConfirm={handleConfirm}
        title={title}
        message={message}
        confirmLabel="Delete"
        confirmVariant="destructive"
      />
    </>
  );
}
