import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Plus, Edit2, Save, Loader2, GitBranch } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import ReusableDataTable from "../../../components/common/ReusableDataTable";
import { StatusActionButton, StatusBadge } from "../../../components/common/StatusControls";
import {
  getProcessSection, updateProcessSection, updateProcessStep,
} from "../../../services/homepage";
import { usePermissionContext } from "../../../context/PermissionContext";

export default function ProcessPage() {
  const { hasPermission } = usePermissionContext();
  const navigate = useNavigate();

  const [sectionLoading, setSectionLoading] = useState(true);
  const [sectionSaving, setSectionSaving] = useState(false);
  const [section, setSection] = useState({ section_title: "", section_description: "" });
  const [isEditingSection, setIsEditingSection] = useState(false);

  const [stepsLoading, setStepsLoading] = useState(true);
  const [steps, setSteps] = useState([]);

  const loadAll = async () => {
    try {
      setSectionLoading(true);
      setStepsLoading(true);
      const res = await getProcessSection();
      if (res.success && res.data) {
        const hasSectionData = !!(res.data.section?.section_title || res.data.section?.section_description);
        setSection({
          section_title: res.data.section?.section_title || "",
          section_description: res.data.section?.section_description || "",
        });
        setIsEditingSection(!hasSectionData);
        setSteps(Array.isArray(res.data.steps) ? res.data.steps : []);
      } else {
        setIsEditingSection(true);
      }
    } catch {
      toast.error("Failed to load process section");
      setIsEditingSection(true);
    } finally {
      setSectionLoading(false);
      setStepsLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, []);

  const handleSectionSave = async (e) => {
    e.preventDefault();
    try {
      setSectionSaving(true);
      const res = await updateProcessSection(section);
      if (res.success) {
        toast.success("Section details saved");
        setIsEditingSection(false);
      } else toast.error(res.message || "Save failed");
    } catch (err) {
      toast.error(err.response?.data?.message || "Save failed");
    } finally {
      setSectionSaving(false);
    }
  };

  const handleToggleStatus = async (row) => {
    try {
      const res = await updateProcessStep(row.id, {
        ...row,
        status: row.status === "active" ? "inactive" : "active",
      });
      if (res.success) {
        toast.success(res.message || "Status updated successfully");
        loadAll();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update status");
    }
  };

  const columns = [
    {
      field: "file_url",
      headerName: "Image",
      sortable: false,
      renderCell: ({ row }) => {
        if (!row.file_url) return <span className="text-slate-400 text-xs">—</span>;
        const src = row.file_url.startsWith("data:") ? row.file_url : `${process.env.REACT_APP_API_URL || ""}${row.file_url}`;
        return <img src={src} alt={row.alt_text || row.step_title || ""} className="h-10 w-16 object-cover rounded border" />;
      },
    },
    { field: "step_title", headerName: "Step Title", sortable: true },
    {
      field: "step_description",
      headerName: "Description",
      renderCell: ({ row }) => <span className="text-xs text-slate-500 line-clamp-2 max-w-xs">{row.step_description || "—"}</span>,
    },
    { field: "sequence", headerName: "Seq", sortable: true },
    {
      field: "status",
      headerName: "Status",
      sortable: false,
      renderCell: ({ row }) => <StatusBadge status={row.status} />,
    },
    {
      field: "actions",
      headerName: "Actions",
      sortable: false,
      sticky: "right",
      renderCell: ({ row }) => (
        <div className="flex items-center gap-2">
          {hasPermission("homepage", "process.update") && (
            <>
              <Button
                variant="outline"
                size="sm"
                className="h-8 w-8 p-0 border-slate-200 text-slate-700"
                onClick={() => navigate(`/homepage-management/process/steps/edit/${row.id}`)}
              >
                <Edit2 className="h-4 w-4 text-[#C3662D]" />
              </Button>
              <StatusActionButton row={row} entityName="process step" onConfirm={handleToggleStatus} />
            </>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6 pb-12 w-full">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: "#981B1F" }}>
          <GitBranch className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800  tracking-tight">Process Section</h1>
          <p className="text-slate-500 text-sm">Manage the homepage process/workflow section</p>
        </div>
      </div>

      {/* Section Header Form */}
      {sectionLoading ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 min-h-48 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-slate-500" role="status" aria-live="polite">
            <Loader2 className="h-8 w-8 animate-spin text-[#981B1F]" />
            <span className="text-sm font-medium">Loading section header...</span>
          </div>
        </div>
      ) : !isEditingSection && (section.section_title || section.section_description) ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
          <div className="flex items-center justify-between border-b pb-3">
            <h2 className="text-base font-semibold text-slate-700">Section Header</h2>
            {hasPermission("homepage", "process.update") && (
              <Button variant="outline" className="border-[#981B1F] text-[#981B1F] hover:bg-[#981B1F]/5 gap-2" onClick={() => setIsEditingSection(true)}>
                <Edit2 className="w-4 h-4" /> Edit Section
              </Button>
            )}
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider mb-1">Section Title</span>
            <p className="text-sm font-medium text-slate-800">{section.section_title || "-"}</p>
          </div>
          <div>
            <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider mb-1">Section Description</span>
            <p className="text-sm text-slate-600 whitespace-pre-wrap">{section.section_description || "-"}</p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSectionSave}>
          <div className="bg-white  rounded-2xl border border-slate-100  shadow-sm p-6 space-y-4">
            <h2 className="text-base font-semibold text-slate-700  border-b pb-3">Section Header</h2>
            <div>
              <label className="text-sm font-semibold text-slate-600  block mb-1">Section Title</label>
              <Input value={section.section_title} onChange={e => setSection(p => ({ ...p, section_title: e.target.value }))} placeholder="Our Process" />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-600  block mb-1">Section Description</label>
              <Textarea value={section.section_description} onChange={e => setSection(p => ({ ...p, section_description: e.target.value }))} rows={3} placeholder="Brief description of the process..." />
            </div>
            {hasPermission("homepage", "process.update") && (
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

      {/* Steps CRUD */}
      <div className="bg-white  rounded-2xl border border-slate-100  shadow-sm overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b">
          <h2 className="text-base font-semibold text-slate-700 ">Process Steps</h2>
          {hasPermission("homepage", "process.create") && (
            <Button onClick={() => navigate("/homepage-management/process/steps/create")} style={{ backgroundColor: "#981B1F" }} className="text-white hover:opacity-90" size="sm">
              <Plus className="w-4 h-4 mr-2" />Add Step
            </Button>
          )}
        </div>
        <ReusableDataTable columns={columns} rows={steps} loading={stepsLoading} sequenceReorderScope="homepage_process_steps" emptyMessage="No steps added yet. Click 'Add Step' to create one." />
      </div>

    </div>
  );
}
