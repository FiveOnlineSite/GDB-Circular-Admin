import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Plus, Edit2, Trash2, Save, Loader2, Star } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import ReusableDataTable from "../../../components/common/ReusableDataTable";
import ConfirmationModal from "../../../components/common/ConfirmationModal";
import {
  getWhyChooseSection, updateWhyChooseSection,
  getWhyChooseCards, deleteWhyChooseCard,
} from "../../../services/homepage";
import { usePermissionContext } from "../../../context/PermissionContext";

export default function WhyChoosePage() {
  const { hasPermission } = usePermissionContext();
  const navigate = useNavigate();

  const [sectionLoading, setSectionLoading] = useState(false);
  const [sectionSaving, setSectionSaving] = useState(false);
  const [section, setSection] = useState({ section_title: "", section_description: "" });

  const [cardsLoading, setCardsLoading] = useState(false);
  const [cards, setCards] = useState([]);
  const [deleteModal, setDeleteModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState(null);

  const loadAll = async () => {
    try {
      setSectionLoading(true);
      setCardsLoading(true);
      const res = await getWhyChooseSection();
      if (res.success && res.data) {
        setSection({ section_title: res.data.section?.section_title || "", section_description: res.data.section?.section_description || "" });
        setCards(Array.isArray(res.data.cards) ? res.data.cards : []);
      }
    } catch { toast.error("Failed to load Why Choose section"); }
    finally { setSectionLoading(false); setCardsLoading(false); }
  };

  useEffect(() => { loadAll(); }, []);

  const handleSectionSave = async e => {
    e.preventDefault();
    try {
      setSectionSaving(true);
      const res = await updateWhyChooseSection(section);
      if (res.success) toast.success("Section details saved");
      else toast.error(res.message || "Save failed");
    } catch (err) { toast.error(err.response?.data?.message || "Save failed"); }
    finally { setSectionSaving(false); }
  };

  const reloadCards = async () => {
    try {
      setCardsLoading(true);
      const res = await getWhyChooseCards();
      if (res.success) setCards(Array.isArray(res.data) ? res.data : []);
    } catch { toast.error("Failed to reload cards"); }
    finally { setCardsLoading(false); }
  };

  const handleDeleteConfirm = async () => {
    try {
      const res = await deleteWhyChooseCard(selectedCard.id);
      if (res.success) { toast.success("Card deleted"); reloadCards(); }
    } catch (err) { toast.error(err.response?.data?.message || "Delete failed"); }
    finally { setDeleteModal(false); setSelectedCard(null); }
  };

  const columns = [
    {
      field: "file_url",
      headerName: "Media",
      sortable: false,
      renderCell: ({ row }) => {
        if (!row.file_url) return <span className="text-slate-400 text-xs">—</span>;
        const src = row.file_url.startsWith("data:") ? row.file_url : `${process.env.REACT_APP_API_URL || ""}${row.file_url}`;
        const isVideo = row.file_url.match(/\.(mp4|webm)/);
        return isVideo ? <video src={src} className="h-10 w-16 object-cover rounded border" muted /> : <img src={src} alt={row.alt_text || ""} className="h-10 w-16 object-cover rounded border" />;
      },
    },
    { field: "card_title", headerName: "Card Title", sortable: true },
    { field: "card_description", headerName: "Description", renderCell: ({ row }) => <span className="text-xs text-slate-500 line-clamp-2 max-w-xs">{row.card_description || "—"}</span> },
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
          {hasPermission("homepage", "whychoose.update") && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 border-slate-200 text-slate-700"
              onClick={() => navigate(`/homepage-management/whychoose/cards/edit/${row.id}`)}
              title="Edit"
            >
              <Edit2 className="h-4 w-4 text-[#C3662D]" />
            </Button>
          )}
          {hasPermission("homepage", "whychoose.delete") && (
            <Button
              variant="outline"
              size="sm"
              className="h-8 w-8 p-0 border-slate-200 text-slate-700 hover:bg-red-50"
              onClick={() => { setSelectedCard(row); setDeleteModal(true); }}
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
          <Star className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">Why Choose Section</h1>
          <p className="text-slate-500 text-sm">Manage homepage "Why Choose Us" section</p>
        </div>
      </div>

      {/* Section Header Form */}
      {!sectionLoading && (
        <form onSubmit={handleSectionSave}>
          <div className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-100 dark:border-gray-700 shadow-sm p-6 space-y-4">
            <h2 className="text-base font-semibold text-slate-700 dark:text-white border-b pb-3">Section Header</h2>
            <div>
              <label className="text-sm font-semibold text-slate-600 dark:text-gray-300 block mb-1">Section Title</label>
              <Input value={section.section_title} onChange={e => setSection(p => ({ ...p, section_title: e.target.value }))} placeholder="Why Choose Us?" />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-600 dark:text-gray-300 block mb-1">Section Description</label>
              <Textarea value={section.section_description} onChange={e => setSection(p => ({ ...p, section_description: e.target.value }))} rows={3} placeholder="What makes you the best choice..." />
            </div>
            {hasPermission("homepage", "whychoose.update") && (
              <div className="flex justify-end">
                <Button type="submit" disabled={sectionSaving} style={{ backgroundColor: "#981B1F" }} className="text-white hover:opacity-90">
                  {sectionSaving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : <><Save className="w-4 h-4 mr-2" />Save Section</>}
                </Button>
              </div>
            )}
          </div>
        </form>
      )}

      {/* Cards CRUD */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-100 dark:border-gray-700 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="text-base font-semibold text-slate-700 dark:text-white">Why Choose Cards</h2>
          {hasPermission("homepage", "whychoose.create") && (
            <Button onClick={() => navigate("/homepage-management/whychoose/cards/create")} style={{ backgroundColor: "#981B1F" }} className="text-white hover:opacity-90" size="sm">
              <Plus className="w-4 h-4 mr-2" />Add Card
            </Button>
          )}
        </div>
        <ReusableDataTable columns={columns} rows={cards} loading={cardsLoading} emptyMessage="No cards added yet. Click 'Add Card' to create one." />
      </div>

      <ConfirmationModal
        isOpen={deleteModal}
        onClose={() => { setDeleteModal(false); setSelectedCard(null); }}
        onConfirm={handleDeleteConfirm}
        title="Delete Card"
        message={`Are you sure you want to delete "${selectedCard?.card_title}"?`}
        confirmLabel="Delete"
        confirmVariant="destructive"
      />
    </div>
  );
}
