import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import Upload from "../../../components/common/Upload";
import { getProcessStepById, createProcessStep, updateProcessStep } from "../../../services/homepage";

const selectStyle = "w-full border border-[#E6E6E6] text-[#111111] rounded-lg p-2.5 text-sm focus:border-[#981B1F] focus:outline-none focus:ring-2 focus:ring-[#981B1F]/15 transition bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white";


export default function ProcessStepFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [pageLoading, setPageLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ step_title: "", step_description: "", file_url: "", alt_text: "", sequence: 0, status: "active" });

  useEffect(() => {
    if (!isEdit) return;
    (async () => {
      try {
        setPageLoading(true);
        const res = await getProcessStepById(id);
        if (res.success && res.data) {
          const d = res.data;
          setForm({ step_title: d.step_title || "", step_description: d.step_description || "", file_url: d.file_url || "", alt_text: d.alt_text || "", sequence: d.sequence ?? 0, status: d.status || "active" });
        } else { toast.error("Step not found"); navigate("/homepage-management/process"); }
      } catch { toast.error("Failed to load"); navigate("/homepage-management/process"); }
      finally { setPageLoading(false); }
    })();
  }, [id, isEdit, navigate]);

  const [errors, setErrors] = useState({});

  const handle = e => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    if (errors[name]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const newErrors = {};
    if (!form.step_title.trim()) newErrors.step_title = "Step title is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setSubmitting(true);
      const payload = { ...form, sequence: Number(form.sequence) };
      const res = isEdit ? await updateProcessStep(id, payload) : await createProcessStep(payload);
      if (res.success) { toast.success(isEdit ? "Step updated" : "Step created"); navigate("/homepage-management/process"); }
      else toast.error(res.message || "Operation failed");
    } catch (err) { toast.error(err.response?.data?.message || "Operation failed"); }
    finally { setSubmitting(false); }
  };

  if (pageLoading) return <div className="flex justify-center items-center h-64"><div className="w-10 h-10 border-4 border-[#981B1F] border-t-transparent rounded-full animate-spin" /></div>;

  return (
    <div className="space-y-6 pb-12 w-full">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" type="button" onClick={() => navigate("/homepage-management/process")} className="rounded-xl border-slate-200">
          <ArrowLeft className="h-4 w-4 text-slate-700" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">{isEdit ? "Edit Process Step" : "Add Process Step"}</h1>
          <p className="text-slate-500 text-sm">Manage a step in the process section</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-100 dark:border-gray-700 shadow-sm p-6 space-y-5">
          <h2 className="text-base font-semibold text-slate-700 dark:text-white border-b pb-3">Step Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="text-sm font-semibold text-slate-600 dark:text-gray-300 block mb-1">Step Title <span className="text-red-500">*</span></label>
              <Input
                name="step_title"
                value={form.step_title}
                onChange={handle}
                placeholder="e.g. Discovery & Planning"
                error={!!errors.step_title}
                errorMessage={errors.step_title}
              />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-semibold text-slate-600 dark:text-gray-300 block mb-1">Step Description</label>
              <Textarea name="step_description" value={form.step_description} onChange={handle} rows={4} placeholder="Describe this process step..." />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-600 dark:text-gray-300 block mb-1">Alt Text</label>
              <Input name="alt_text" value={form.alt_text} onChange={handle} placeholder="Image/video description" />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-600 dark:text-gray-300 block mb-1">Sequence</label>
              <Input type="number" min="0" name="sequence" value={form.sequence} onChange={handle} />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-600 dark:text-gray-300 block mb-1">Status</label>
              <select name="status" value={form.status} onChange={handle} className={selectStyle}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          {/* File Upload */}
          <div>
            <label className="text-sm font-semibold text-slate-600 dark:text-gray-300 block mb-2">
              Image / Video Upload
            </label>
            <Upload
              value={form.file_url}
              onChange={(url) => {
                setForm((prev) => ({ ...prev, file_url: url }));
              }}
              mediaType="both"
              accept="image/*,video/mp4,video/webm,video/quicktime"
              maxSizeKB={500}
              maxSizeMB={50}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate("/homepage-management/process")}>Cancel</Button>
          <Button type="submit" disabled={submitting} style={{ backgroundColor: "#981B1F" }} className="text-white hover:opacity-90">
            {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : <><Save className="w-4 h-4 mr-2" />{isEdit ? "Update Step" : "Create Step"}</>}
          </Button>
        </div>
      </form>
    </div>
  );
}
