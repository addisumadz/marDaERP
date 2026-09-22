"use client";
import ConfirmDialog from "@/app/ui/components/ConfirmDialog";

const ConfirmDeleteModal = ({ open, onClose, onConfirm, message = "Are you sure you want to delete this item?" }) => {
  return (
    <ConfirmDialog
      open={open}
      title="Confirm Deletion"
      content={message}
      confirmText="Delete"
      confirmColor="error"
      onClose={onClose}
      onConfirm={onConfirm}
    />
  );
};

export default ConfirmDeleteModal;
