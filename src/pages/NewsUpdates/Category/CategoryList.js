import React, { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, Eye, EyeOff, Save, Loader2 } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import ReusableDataTable from "../../../components/common/ReusableDataTable";
import ConfirmationModal from "../../../components/common/DeleteConfirmationModal";
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  toggleCategoryStatus,
} from "../../../services/news/newsCategoryService";
import { usePermissionContext } from "../../../context/PermissionContext";

export default function CategoryList() {
  const { hasPermission } = usePermissionContext();

  const canCreate = hasPermission("news", "category.create");
  const canUpdate = hasPermission("news", "category.update");
  const canDelete = hasPermission("news", "category.delete");

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 10,
    total: 0,
    last_page: 1,
  });

  const [search, setSearch] = useState("");
  const [selectedStatus, setSelectedStatus] = useState("");

  // CRUD Popup Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [form, setForm] = useState({
    category_title: "",
    category_type: "Dynamic Tab",
    visibility: 1,
    sequence: 0,
    status: "active",
  });

  // Delete Confirmation Modal
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState(null);

  const fetchCategoriesList = useCallback(
    async (params = {}) => {
      try {
        setLoading(true);
        const res = await getCategories({
          page: params.page || pagination.current_page,
          limit: params.limit || pagination.per_page,
          category_title: params.search !== undefined ? params.search : search,
          status: params.status !== undefined ? params.status : selectedStatus,
        });

        if (res.success) {
          setRows(res.data || []);
          if (res.pagination) {
            setPagination(res.pagination);
          }
        } else {
          setRows([]);
        }
      } catch (err) {
        toast.error(err.response?.data?.message || "Failed to load categories");
        setRows([]);
      } finally {
        setLoading(false);
      }
    },
    [pagination.current_page, pagination.per_page, search, selectedStatus]
  );

  useEffect(() => {
    fetchCategoriesList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.current_page, pagination.per_page]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPagination((p) => ({ ...p, current_page: 1 }));
    fetchCategoriesList({ page: 1 });
  };

  const handleStatusFilterChange = (e) => {
    const status = e.target.value;
    setSelectedStatus(status);
    setPagination((p) => ({ ...p, current_page: 1 }));
    fetchCategoriesList({ page: 1, status });
  };

  const handleToggleStatus = async (row) => {
    if (!canUpdate) return toast.error("You do not have permission to update status");
    try {
      const res = await toggleCategoryStatus(row.id);
      if (res.success) {
        toast.success(res.message || "Status updated successfully");
        fetchCategoriesList();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to toggle status");
    }
  };

  const handleToggleVisibility = async (row) => {
    if (!canUpdate) return toast.error("You do not have permission to update visibility");
    try {
      const updatedVisibility = row.visibility === 1 ? 0 : 1;
      const res = await updateCategory(row.id, {
        category_title: row.category_title,
        category_type: row.category_type,
        visibility: updatedVisibility,
        sequence: row.sequence,
        status: row.status,
      });
      if (res.success) {
        toast.success(`Category is now ${updatedVisibility === 1 ? "Visible" : "Hidden"}`);
        fetchCategoriesList();
      }
    } catch (err) {
      toast.error("Failed to toggle visibility");
    }
  };

  const handleOpenModal = (item = null) => {
    if (item) {
      setEditingItem(item);
      setForm({
        category_title: item.category_title,
        category_type: item.category_type,
        visibility: item.visibility,
        sequence: item.sequence,
        status: item.status,
      });
    } else {
      setEditingItem(null);
      setForm({
        category_title: "",
        category_type: "Dynamic Tab",
        visibility: 1,
        sequence: 0,
        status: "active",
      });
    }
    setFormErrors({});
    setModalOpen(true);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: name === "sequence" || name === "visibility" ? Number(value) : value,
    }));
    if (formErrors[name]) {
      setFormErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!form.category_title.trim()) newErrors.category_title = "Category Title is required";
    if (Object.keys(newErrors).length > 0) {
      setFormErrors(newErrors);
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        ...form,
        category_title: form.category_title.trim(),
        category_type: form.category_type.trim(),
      };

      const res = editingItem
        ? await updateCategory(editingItem.id, payload)
        : await createCategory(payload);

      if (res.success) {
        toast.success(editingItem ? "Category updated successfully" : "Category created successfully");
        setModalOpen(false);
        fetchCategoriesList();
      } else {
        toast.error(res.message || "Failed to save category");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save category");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (item) => {
    setItemToDelete(item);
    setDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const res = await deleteCategory(itemToDelete.id);
      if (res.success) {
        toast.success("Category tab deleted successfully");
        fetchCategoriesList();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to delete category");
    } finally {
      setDeleteModalOpen(false);
      setItemToDelete(null);
    }
  };

  const columns = [
    { field: "id", headerName: "ID", sortable: true },
    { field: "category_title", headerName: "Category Title", sortable: true },
    { field: "category_type", headerName: "Category Type", sortable: true },
    {
      field: "visibility",
      headerName: "Visibility",
      sortable: true,
      renderCell: ({ row }) => (
        <span className="flex items-center gap-1">
          {row.visibility === 1 ? (
            <span className="inline-flex items-center text-xs font-semibold text-green-700 bg-green-50 border border-green-200 px-2 py-0.5 rounded-full">
              <Eye size={12} className="mr-1" /> Show
            </span>
          ) : (
            <span className="inline-flex items-center text-xs font-semibold text-slate-500 bg-slate-50 border border-slate-200 px-2 py-0.5 rounded-full">
              <EyeOff size={12} className="mr-1" /> Hide
            </span>
          )}
        </span>
      ),
    },
    { field: "sequence", headerName: "Sequence", sortable: true },
    {
      field: "status",
      headerName: "Status",
      sortable: false,
      renderCell: ({ row }) => (
        <span
          className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
            row.status === "active"
              ? "bg-green-50 text-green-700 border border-green-100"
              : "bg-red-50 text-red-700 border border-red-100"
          }`}
        >
          {row.status === "active" ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      sortable: false,
      sticky: "right",
      renderCell: ({ row }) => (
        <div className="flex items-center gap-2">
          {canUpdate && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0 border-slate-200 text-slate-700"
                onClick={() => handleOpenModal(row)}
                title="Edit"
              >
                <Edit2 className="h-4 w-4 text-[#C3662D]" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-xs text-[#C3662D] hover:bg-[#C3662D]/10 h-8"
                onClick={() => handleToggleVisibility(row)}
                title={row.visibility === 1 ? "Hide on website" : "Show on website"}
              >
                {row.visibility === 1 ? "Hide" : "Show"}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-xs text-slate-600 hover:bg-slate-100 h-8"
                onClick={() => handleToggleStatus(row)}
              >
                {row.status === "active" ? "Deactivate" : "Activate"}
              </Button>
            </>
          )}
          {canDelete && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 border-slate-200 text-slate-700 hover:bg-red-50"
              onClick={() => handleDeleteClick(row)}
              title="Delete"
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Category Tabs Management</h1>
          <p className="text-sm text-slate-500 mt-0.5">Manage tabs and categories for news updates and article filtration</p>
        </div>

        {canCreate && (
          <Button
            onClick={() => handleOpenModal()}
            className="bg-[#981B1F] hover:bg-[#C3662D] text-white shadow-sm transition-colors self-start md:self-auto"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Category
          </Button>
        )}
      </div>

      {/* Filters Strip */}
      <div className="bg-white rounded-xl border border-slate-100 p-4 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 w-full md:w-fit">
          <input
            type="text"
            value={search}
            onChange={handleSearchChange}
            placeholder="Search by title..."
            className="border border-[#E6E6E6] rounded-lg px-3 py-2 text-sm placeholder-slate-400 focus:border-[#981B1F] focus:outline-none w-full md:w-64"
          />
          <Button type="submit" variant="secondary" className="shrink-0">
            Search
          </Button>
        </form>

        <div className="flex items-center gap-3">
          <select
            value={selectedStatus}
            onChange={handleStatusFilterChange}
            className="border border-[#E6E6E6] rounded-lg p-2 text-sm focus:border-[#981B1F] focus:outline-none bg-white text-slate-700 min-w-[130px]"
          >
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
        <ReusableDataTable
          columns={columns}
          rows={rows}
          loading={loading}
          pagination={pagination}
          handlePageChange={(p) => setPagination((prev) => ({ ...prev, current_page: p }))}
          handlePerPageChange={(pp) =>
            setPagination((prev) => ({ ...prev, per_page: pp, current_page: 1 }))
          }
          emptyMessage="No category tabs found."
        />
      </div>

      {/* Add / Edit Category Popup Modal */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-sm p-4"
          onClick={() => !submitting && setModalOpen(false)}
        >
          <div
            className="bg-white dark:bg-gray-900 rounded-2xl w-full max-w-md shadow-2xl transform transition-all relative overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <form onSubmit={handleSaveCategory} noValidate>
              {/* Modal Header */}
              <div className="bg-slate-50 dark:bg-gray-800 px-6 py-4 border-b border-slate-100 dark:border-gray-700 flex justify-between items-center">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                  {editingItem ? "Edit Category tab" : "Add Category Tab"}
                </h3>
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  disabled={submitting}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors"
                >
                  &times;
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 space-y-4">
                {/* Category Title */}
                <div>
                  <label className="text-sm font-semibold text-slate-600 dark:text-gray-300 block mb-1">
                    Category Title <span className="text-red-500">*</span>
                  </label>
                  <Input
                    name="category_title"
                    value={form.category_title}
                    onChange={handleFormChange}
                    placeholder="e.g. Press Releases"
                    disabled={submitting}
                    error={!!formErrors.category_title}
                    errorMessage={formErrors.category_title}
                  />
                </div>

                {/* Category Type */}
                <div>
                  <label className="text-sm font-semibold text-slate-600 dark:text-gray-300 block mb-1">
                    Category Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="category_type"
                    value={form.category_type}
                    onChange={handleFormChange}
                    disabled={submitting}
                    className="w-full border border-[#E6E6E6] text-[#111111] rounded-lg p-2.5 text-sm focus:border-[#981B1F] focus:outline-none focus:ring-2 focus:ring-[#981B1F]/15 transition bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                  >
                    <option value="Dynamic Tab">Dynamic Tab</option>
                    <option value="Technical Specs">Technical Specs</option>
                    <option value="Industry News">Industry News</option>
                  </select>
                </div>

                {/* Sequence */}
                <div>
                  <label className="text-sm font-semibold text-slate-600 dark:text-gray-300 block mb-1">
                    Sequence
                  </label>
                  <Input
                    type="number"
                    name="sequence"
                    value={form.sequence}
                    onChange={handleFormChange}
                    placeholder="0"
                    disabled={submitting}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  {/* Visibility */}
                  <div>
                    <label className="text-sm font-semibold text-slate-600 dark:text-gray-300 block mb-1">
                      Visibility
                    </label>
                    <select
                      name="visibility"
                      value={form.visibility}
                      onChange={handleFormChange}
                      disabled={submitting}
                      className="w-full border border-[#E6E6E6] text-[#111111] rounded-lg p-2.5 text-sm focus:border-[#981B1F] focus:outline-none bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    >
                      <option value={1}>Show</option>
                      <option value={0}>Hide</option>
                    </select>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="text-sm font-semibold text-slate-600 dark:text-gray-300 block mb-1">
                      Status
                    </label>
                    <select
                      name="status"
                      value={form.status}
                      onChange={handleFormChange}
                      disabled={submitting}
                      className="w-full border border-[#E6E6E6] text-[#111111] rounded-lg p-2.5 text-sm focus:border-[#981B1F] focus:outline-none bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                    >
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Modal Footer */}
              <div className="bg-slate-50 dark:bg-gray-800 px-6 py-4 border-t border-slate-100 dark:border-gray-700 flex justify-end gap-3">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setModalOpen(false)}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={submitting}
                  className="bg-[#981B1F] hover:bg-[#C3662D] text-white shadow-sm"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      {editingItem ? "Update Tab" : "Save Tab"}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => {
          setDeleteModalOpen(false);
          setItemToDelete(null);
        }}
        onConfirm={handleDeleteConfirm}
        title="Delete Category Tab"
        message={`Are you sure you want to delete "${itemToDelete?.category_title}"? Any news content associated with this category will also be deleted.`}
      />
    </div>
  );
}
