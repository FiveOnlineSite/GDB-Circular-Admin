import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, Save, Loader2, TrendingUp } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import ReusableDataTable from "../../../components/common/ReusableDataTable";
import ConfirmationModal from "../../../components/common/ConfirmationModal";
import { 
  getWhyIndustryChoosesSection, 
  updateWhyIndustryChoosesSection, 
  getWhyIndustryChoosesItems, 
  deleteWhyIndustryChoosesItem 
} from "../../../services/aboutGDB";
import { usePermissionContext } from "../../../context/PermissionContext";

export default function WhyIndustryChoosesList() {
  const { hasPermission } = usePermissionContext();
  const navigate = useNavigate();
  const [sectionLoading, setSectionLoading] = useState(false);
  const [sectionSaving, setSectionSaving] = useState(false);
  const [section, setSection] = useState({ section_title: "", section_description: "" });
  const [isEditingSection, setIsEditingSection] = useState(false);

  const [itemsLoading, setItemsLoading] = useState(false);
  const [rows, setRows] = useState([]);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  const loadAll = async () => {
    try {
      setSectionLoading(true);
      setItemsLoading(true);
      const [sectionRes, itemsRes] = await Promise.all([
        getWhyIndustryChoosesSection(),
        getWhyIndustryChoosesItems(),
      ]);

      if (sectionRes.success && sectionRes.data) {
        const hasSectionData = !!(sectionRes.data.section_title || sectionRes.data.section_description);
        setSection({
          section_title: sectionRes.data.section_title || "",
          section_description: sectionRes.data.section_description || "",
        });
        setIsEditingSection(!hasSectionData);
      } else {
        setIsEditingSection(true);
      }

      if (itemsRes.success && Array.isArray(itemsRes.data)) {
        const sorted = itemsRes.data.sort((a, b) => a.sequence - b.sequence);
        setRows(sorted);
      }
    } catch (err) {
      toast.error("Failed to load items");
      setIsEditingSection(true);
    } finally {
      setSectionLoading(false);
      setItemsLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleSectionSave = async (e) => {
    e.preventDefault();
    try {
      setSectionSaving(true);
      const res = await updateWhyIndustryChoosesSection(section);
      if (res.success) {
        toast.success("Section details saved");
        setIsEditingSection(false);
      }
      else toast.error(res.message || "Save failed");
    } catch (err) {
      toast.error(err.response?.data?.message || "Save failed");
    } finally {
      setSectionSaving(false);
    }
  };

  const handleDeleteConfirm = async () => {
    try {
      const res = await deleteWhyIndustryChoosesItem(selectedItem.id);
      if (res.success) {
        toast.success("Item deleted");
        loadAll();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Delete failed");
    } finally {
      setDeleteModal(false);
      setSelectedItem(null);
    }
  };

  const columns = [
    { field: "stat_value", headerName: "Stat / Value", sortable: true, width: 120 },
    { field: "title", headerName: "Title", sortable: true, flex: 1 },
    { field: "description", headerName: "Description", sortable: false, flex: 1 },
    { field: "sequence", headerName: "Seq", sortable: true, width: 60 },
    {
      field: "status",
      headerName: "Status",
      sortable: false,
      width: 100,
      renderCell: ({ row }) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
          {row.status === "active" ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      sortable: false,
      sticky: "right",
      width: 120,
      renderCell: ({ row }) => (
        <div className="flex items-center gap-2">
          {hasPermission("about", "update") && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 border-slate-200 text-slate-700"
              onClick={() => navigate(`/about-gdb/why-industry-chooses-gdb-pcr/edit/${row.id}`)}
            >
              <Edit2 className="h-4 w-4 text-[#C3662D]" />
            </Button>
          )}
          {hasPermission("about", "delete") && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 border-slate-200 text-slate-700 hover:bg-red-50"
              onClick={() => { setSelectedItem(row); setDeleteModal(true); }}
            >
              <Trash2 className="h-4 w-4 text-red-500" />
            </Button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-12 w-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">Why Industry Chooses GDB PCR</h1>
          <p className="text-slate-500 text-sm mt-1">Manage the reasons why the industry chooses GDB PCR</p>
        </div>
        {hasPermission("about", "create") && (
          <Button
            onClick={() => navigate("/about-gdb/why-industry-chooses-gdb-pcr/create")}
            className="bg-[#981B1F] hover:bg-[#7a1619] text-white gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Item
          </Button>
        )}
      </div>

      {/* Section Edit Panel */}
      {hasPermission("about", "update") && !sectionLoading && (
        !isEditingSection && (section.section_title || section.section_description) ? (
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-100 dark:border-gray-700 shadow-sm p-6 space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <h2 className="text-base font-semibold text-slate-700 dark:text-white">Section Details</h2>
              <Button
                variant="outline"
                className="border-[#981B1F] text-[#981B1F] hover:bg-[#981B1F]/5 gap-2"
                onClick={() => setIsEditingSection(true)}
              >
                <Edit2 className="w-4 h-4" /> Edit Section
              </Button>
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400 dark:text-gray-500 block uppercase tracking-wider mb-1">Section Title</span>
              <p className="text-sm font-medium text-slate-800 dark:text-gray-200">{section.section_title || "—"}</p>
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400 dark:text-gray-500 block uppercase tracking-wider mb-1">Section Description</span>
              <p className="text-sm text-slate-600 dark:text-gray-300 whitespace-pre-wrap">{section.section_description || "—"}</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSectionSave} className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-100 dark:border-gray-700 shadow-sm p-6 space-y-4">
            <h2 className="text-base font-semibold text-slate-700 dark:text-white border-b pb-3">Section Details</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-semibold text-slate-600 dark:text-gray-300 block mb-1">
                  Section Title
                </label>
                <Input
                  value={section.section_title}
                  onChange={(e) => setSection(p => ({ ...p, section_title: e.target.value }))}
                  placeholder="Enter section title"
                />
              </div>
              <div>
                <label className="text-sm font-semibold text-slate-600 dark:text-gray-300 block mb-1">
                  Section Description
                </label>
                <Textarea
                  value={section.section_description}
                  onChange={(e) => setSection(p => ({ ...p, section_description: e.target.value }))}
                  placeholder="Enter section description"
                  rows={2}
                  className="w-full border border-[#E6E6E6] rounded-lg p-2.5 text-sm focus:border-[#981B1F] focus:outline-none focus:ring-2 focus:ring-[#981B1F]/15 transition dark:bg-gray-800 dark:border-gray-600 dark:text-white"
                />
              </div>
            </div>

            <div className="flex gap-3">
              {(section.section_title || section.section_description) && (
                <Button type="button" variant="outline" onClick={() => setIsEditingSection(false)}>
                  Cancel
                </Button>
              )}
              <Button
                type="submit"
                disabled={sectionSaving}
                className="bg-[#981B1F] hover:bg-[#7a1619] text-white gap-2"
              >
                {sectionSaving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    Save Section
                  </>
                )}
              </Button>
            </div>
          </form>
        )
      )}

      {/* Items Table */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-100 dark:border-gray-700 shadow-sm overflow-hidden">
        {itemsLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="w-10 h-10 border-4 border-[#981B1F] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : rows.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <TrendingUp className="w-12 h-12 text-slate-300 dark:text-gray-600 mb-3" />
            <p className="text-slate-500 dark:text-gray-400 font-medium">No items yet</p>
            <p className="text-slate-400 dark:text-gray-500 text-sm">Add your first reason to get started</p>
          </div>
        ) : (
          <ReusableDataTable columns={columns} rows={rows} pageSize={10} />
        )}
      </div>

      <ConfirmationModal
        isOpen={deleteModal}
        onClose={() => setDeleteModal(false)}
        onConfirm={handleDeleteConfirm}
        title="Delete Item"
        message="Are you sure you want to delete this item? This action cannot be undone."
        confirmText="Delete"
        confirmButtonClass="bg-red-600 hover:bg-red-700"
      />
    </div>
  );
}
