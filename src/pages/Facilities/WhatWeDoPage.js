import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Plus, Edit2, Save, Loader2, BriefcaseBusiness } from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import ReusableDataTable from "../../components/common/ReusableDataTable";
import {
  getFacilitiesWhatWeDo,
  updateFacilitiesWhatWeDoSection,
} from "../../services/facilityService";
import { usePermissionContext } from "../../context/PermissionContext";

export default function WhatWeDoPage() {
  const { hasPermission } = usePermissionContext();
  const navigate = useNavigate();
  const [section, setSection] = useState({ section_title: "", section_description: "" });
  const [cards, setCards] = useState([]);
  const [sectionLoading, setSectionLoading] = useState(false);
  const [cardsLoading, setCardsLoading] = useState(false);
  const [sectionSaving, setSectionSaving] = useState(false);

  const loadAll = async () => {
    try {
      setSectionLoading(true);
      setCardsLoading(true);
      const res = await getFacilitiesWhatWeDo();
      if (res.success && res.data) {
        setSection({
          section_title: res.data.section?.section_title || "",
          section_description: res.data.section?.section_description || "",
        });
        setCards(Array.isArray(res.data.cards) ? res.data.cards : []);
      }
    } catch {
      toast.error("Failed to load facilities what we do section");
    } finally {
      setSectionLoading(false);
      setCardsLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleSectionSave = async (event) => {
    event.preventDefault();
    try {
      setSectionSaving(true);
      const res = await updateFacilitiesWhatWeDoSection(section);
      if (res.success) toast.success("Section details saved");
      else toast.error(res.message || "Save failed");
    } catch (error) {
      toast.error(error.response?.data?.message || "Save failed");
    } finally {
      setSectionSaving(false);
    }
  };

  const columns = [
    {
      field: "icon_url",
      headerName: "Icon",
      sortable: false,
      renderCell: ({ row }) =>
        row.icon_url ? (
          <img
            src={
              row.icon_url.startsWith("data:") ||
              row.icon_url.startsWith("http") ||
              row.icon_url.startsWith("/figma-assets/")
                ? row.icon_url
                : `${process.env.REACT_APP_API_URL || ""}${row.icon_url}`
            }
            alt={row.icon_alt || row.card_title}
            className="h-10 w-10 object-cover rounded border"
          />
        ) : (
          <span className="text-slate-400 text-xs">-</span>
        ),
    },
    { field: "card_title", headerName: "Card Title", sortable: true },
    {
      field: "card_description",
      headerName: "Description",
      sortable: false,
      renderCell: ({ row }) => <span className="text-xs text-slate-500 line-clamp-2 max-w-xs">{row.card_description || "—"}</span>,
    },
    { field: "sequence", headerName: "Seq", sortable: true },
    {
      field: "status",
      headerName: "Status",
      sortable: false,
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
      renderCell: ({ row }) => (
        <div className="flex items-center gap-2">
          {hasPermission("facilities", "whatwedo.update") && (
            <Button variant="outline" size="sm" className="h-8 w-8 p-0 border-slate-200" onClick={() => navigate(`/facilities/what-we-do/cards/edit/${row.id}`)}>
              <Edit2 className="h-4 w-4 text-[#C3662D]" />
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
          <BriefcaseBusiness className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800  tracking-tight">Facilities What We Do</h1>
          <p className="text-slate-500 text-sm">Manage the facilities service cards shown on the website</p>
        </div>
      </div>

      {!sectionLoading && (
        <form onSubmit={handleSectionSave}>
          <div className="bg-white  rounded-2xl border border-slate-100  shadow-sm p-6 space-y-4">
            <h2 className="text-base font-semibold text-slate-700  border-b pb-3">Section Header</h2>
            <div>
              <label className="text-sm font-semibold text-slate-600  block mb-1">Section Title</label>
              <Input value={section.section_title} onChange={(e) => setSection((prev) => ({ ...prev, section_title: e.target.value }))} placeholder="What we do" />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-600  block mb-1">Section Description</label>
              <Textarea value={section.section_description} onChange={(e) => setSection((prev) => ({ ...prev, section_description: e.target.value }))} rows={3} placeholder="Overview text for the facilities support cards" />
            </div>
            {hasPermission("facilities", "whatwedo.update") && (
              <div className="flex justify-end">
                <Button type="submit" disabled={sectionSaving} style={{ backgroundColor: "#981B1F" }} className="text-white hover:opacity-90">
                  {sectionSaving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : <><Save className="w-4 h-4 mr-2" />Save Section</>}
                </Button>
              </div>
            )}
          </div>
        </form>
      )}

      <div className="bg-white  rounded-2xl border border-slate-100  shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="text-base font-semibold text-slate-700 ">What We Do Cards</h2>
          {hasPermission("facilities", "whatwedo.create") && (
            <Button onClick={() => navigate("/facilities/what-we-do/cards/create")} style={{ backgroundColor: "#981B1F" }} className="text-white hover:opacity-90" size="sm">
              <Plus className="w-4 h-4 mr-2" />Add Card
            </Button>
          )}
        </div>
        <ReusableDataTable columns={columns} rows={cards} loading={cardsLoading} sequenceReorderScope="facilities_what_we_do_cards" emptyMessage="No cards added yet." />
      </div>

    </div>
  );
}
