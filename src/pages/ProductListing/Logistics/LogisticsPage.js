import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, Save, Loader2, Truck } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import ReusableDataTable from "../../../components/common/ReusableDataTable";
import ConfirmationModal from "../../../components/common/ConfirmationModal";
import { getLogisticsSection, updateLogisticsSection, getLogisticsCards, deleteLogisticsCard } from "../../../services/productListing";
import { usePermissionContext } from "../../../context/PermissionContext";

const API_URL = process.env.REACT_APP_API_URL || "";

export default function LogisticsPage() {
  const { hasPermission } = usePermissionContext();
  const navigate = useNavigate();
  const [sectionSaving, setSectionSaving] = useState(false);
  const [section, setSection] = useState({ section_title: "", section_description: "" });
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selected, setSelected] = useState(null);
  const [isEditingSection, setIsEditingSection] = useState(false);

  const load = async () => {
    try {
      setLoading(true);
      const res = await getLogisticsSection();
      if (res.success && res.data) {
        const hasSectionData = !!(res.data.section?.section_title || res.data.section?.section_description);
        setSection({ section_title: res.data.section?.section_title || "", section_description: res.data.section?.section_description || "" });
        setIsEditingSection(!hasSectionData);
        setCards(Array.isArray(res.data.cards) ? res.data.cards : []);
      } else {
        setIsEditingSection(true);
      }
    } catch { 
      toast.error("Failed to load logistics section"); 
      setIsEditingSection(true);
    }
    finally { setLoading(false); }
  };

  const reloadCards = async () => {
    try {
      const res = await getLogisticsCards();
      if (res.success) setCards(Array.isArray(res.data) ? res.data : []);
    } catch { toast.error("Failed to reload cards"); }
  };

  useEffect(() => { load(); }, []);

  const handleSectionSave = async e => {
    e.preventDefault();
    try {
      setSectionSaving(true);
      const res = await updateLogisticsSection(section);
      if (res.success) {
        toast.success("Section saved");
        setIsEditingSection(false);
      }
      else toast.error(res.message || "Save failed");
    } catch (err) { toast.error(err.response?.data?.message || "Save failed"); }
    finally { setSectionSaving(false); }
  };

  const handleDelete = async () => {
    try {
      const res = await deleteLogisticsCard(selected.id);
      if (res.success) { toast.success("Card deleted"); reloadCards(); }
    } catch (err) { toast.error(err.response?.data?.message || "Delete failed"); }
    finally { setDeleteModal(false); setSelected(null); }
  };

  const columns = [
    {
      field: "icon_url", headerName: "Icon/Image", sortable: false,
      renderCell: ({ row }) => row.icon_url
        ? <img src={`${API_URL}${row.icon_url}`} alt={row.icon_alt || ""} className="h-10 w-10 object-contain rounded border p-1" />
        : <div className="h-10 w-10 rounded border bg-slate-100 flex items-center justify-center text-xs text-slate-400">—</div>,
    },
    { field: "card_title", headerName: "Card Title", sortable: true },
    { field: "card_description", headerName: "Description", renderCell: ({ row }) => <span className="text-xs text-slate-500 line-clamp-2 max-w-[200px]">{row.card_description || "—"}</span> },
    { field: "sequence", headerName: "Seq", sortable: true },
    {
      field: "status", headerName: "Status", sortable: false,
      renderCell: ({ row }) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${row.status === "active" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
          {row.status === "active" ? "Active" : "Inactive"}
        </span>
      ),
    },
    {
      field: "actions", headerName: "Actions", sortable: false, sticky: "right",
      renderCell: ({ row }) => (
        <div className="flex items-center gap-2">
          {hasPermission("product", "logistics.update") && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 border-slate-200 text-slate-700"
              onClick={() => navigate(`/product-listing/logistics-support/cards/edit/${row.id}`)}
              title="Edit"
            >
              <Edit2 className="h-4 w-4 text-[#C3662D]" />
            </Button>
          )}
          {hasPermission("product", "logistics.delete") && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 border-slate-200 text-slate-700 hover:bg-red-50"
              onClick={() => { setSelected(row); setDeleteModal(true); }}
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
    <div className="space-y-6 pb-12 w-full">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#981B1F" }}>
          <Truck className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">Logistics Support</h1>
          <p className="text-slate-500 text-sm">Manage logistics support section and cards</p>
        </div>
      </div>

      {/* Section Header */}
      {!isEditingSection && (section.section_title || section.section_description) ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-100 dark:border-gray-700 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h2 className="text-base font-semibold text-slate-700 dark:text-white">Section Header</h2>
            {hasPermission("product", "logistics.update") && (
              <Button
                variant="outline"
                className="border-[#981B1F] text-[#981B1F] hover:bg-[#981B1F]/5 gap-2"
                onClick={() => setIsEditingSection(true)}
              >
                <Edit2 className="w-4 h-4" /> Edit Section
              </Button>
            )}
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
        <form onSubmit={handleSectionSave}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-100 dark:border-gray-700 shadow-sm p-6 space-y-4">
            <h2 className="text-base font-semibold text-slate-700 dark:text-white border-b pb-3">Section Header</h2>
            <div>
              <label className="text-sm font-semibold text-slate-600 dark:text-gray-300 block mb-1">Section Title</label>
              <Input value={section.section_title} onChange={e => setSection(p => ({ ...p, section_title: e.target.value }))} placeholder="Our Logistics Support" />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-600 dark:text-gray-300 block mb-1">Section Description</label>
              <Textarea value={section.section_description} onChange={e => setSection(p => ({ ...p, section_description: e.target.value }))} rows={3} placeholder="Section subtitle or description..." />
            </div>
            {hasPermission("product", "logistics.update") && (
              <div className="flex justify-end gap-3">
                {(section.section_title || section.section_description) && (
                  <Button type="button" variant="outline" onClick={() => setIsEditingSection(false)}>Cancel</Button>
                )}
                <Button type="submit" disabled={sectionSaving} style={{ backgroundColor: "#981B1F" }} className="text-white hover:opacity-90">
                  {sectionSaving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : <><Save className="w-4 h-4 mr-2" />Save Section</>}
                </Button>
              </div>
            )}
          </div>
        </form>
      )}

      {/* Cards */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="text-base font-semibold text-slate-700 dark:text-white">Support Cards</h2>
          {hasPermission("product", "logistics.create") && (
            <Button onClick={() => navigate("/product-listing/logistics-support/cards/create")} style={{ backgroundColor: "#981B1F" }} className="text-white hover:opacity-90" size="sm">
              <Plus className="w-4 h-4 mr-2" />Add Card
            </Button>
          )}
        </div>
        <ReusableDataTable columns={columns} rows={cards} loading={loading} emptyMessage="No cards added yet." />
      </div>

      <ConfirmationModal
        isOpen={deleteModal}
        onClose={() => { setDeleteModal(false); setSelected(null); }}
        onConfirm={handleDelete}
        title="Delete Card"
        message={`Delete "${selected?.card_title}"?`}
        confirmLabel="Delete"
        confirmVariant="destructive"
      />
    </div>
  );
}
