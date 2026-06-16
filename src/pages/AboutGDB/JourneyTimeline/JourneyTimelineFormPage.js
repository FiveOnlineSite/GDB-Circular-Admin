import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import Upload from "../../../components/common/Upload";
import { Textarea } from "../../../components/ui/textarea";
import {
  getJourneyTimelineItemById,
  createJourneyTimelineItem,
  updateJourneyTimelineItem,
  getJourneyTimelineItems,
} from "../../../services/aboutGDB";



export default function JourneyTimelineFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [pageLoading, setPageLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [maxSequence, setMaxSequence] = useState(0);
  const [form, setForm] = useState({
    year: "",
    description: "",
    file_url: "",
    alt_text: "",
    sequence: 0,
    status: "active",
  });

  useEffect(() => {
    const getMaxSequence = async () => {
      try {
        const res = await getJourneyTimelineItems();
        if (Array.isArray(res.data)) {
          const max = res.data.reduce((a, b) => Math.max(a, b.sequence || 0), 0);
          setMaxSequence(max + 1);
        }
      } catch (err) {
        console.error(err);
      }
    };
    getMaxSequence();
  }, []);

  useEffect(() => {
    if (!isEdit) {
      setForm(p => ({ ...p, sequence: maxSequence }));
      return;
    }

    (async () => {
      try {
        setPageLoading(true);
        const res = await getJourneyTimelineItemById(id);
        if (res.success && res.data) {
          const d = res.data;
          setForm({
            year: d.year || "",
            description: d.description || "",
            file_url: d.file_url || "",
            alt_text: d.alt_text || "",
            sequence: d.sequence ?? 0,
            status: d.status || "active",
          });
        } else {
          toast.error("Item not found");
          navigate("/about-gdb/journey-timeline");
        }
      } catch (err) {
        toast.error("Failed to load item");
        navigate("/about-gdb/journey-timeline");
      } finally {
        setPageLoading(false);
      }
    })();
  }, [id, isEdit, navigate, maxSequence]);

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(p => ({
      ...p,
      [name]: name === "sequence" ? Number(value) : value,
    }));
    if (errors[name]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};

    if (!form.year.trim()) newErrors.year = "Year is required";
    if (!form.description.trim()) newErrors.description = "Description is required";
    if (!form.file_url) newErrors.file_url = "Image or video is required";
    if (!form.alt_text.trim()) newErrors.alt_text = "Alt text is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setSubmitting(true);
      const payload = {
        year: form.year.trim(),
        description: form.description.trim(),
        file_url: form.file_url,
        alt_text: form.alt_text.trim(),
        sequence: form.sequence,
        status: form.status,
      };

      const res = isEdit
        ? await updateJourneyTimelineItem(id, payload)
        : await createJourneyTimelineItem(payload);

      if (res.success) {
        toast.success(isEdit ? "Timeline item updated" : "Timeline item created");
        navigate("/about-gdb/journey-timeline");
      } else {
        toast.error(res.message || "Operation failed");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="w-10 h-10 border-4 border-[#981B1F] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 w-full">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          type="button"
          onClick={() => navigate("/about-gdb/journey-timeline")}
          className="rounded-xl border-slate-200"
        >
          <ArrowLeft className="h-4 w-4 text-slate-700" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
            {isEdit ? "Edit Timeline Item" : "Add Timeline Item"}
          </h1>
          <p className="text-slate-500 text-sm">
            {isEdit ? "Update the timeline item" : "Add a new timeline item to the journey"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        {/* Details Section */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-100 dark:border-gray-700 shadow-sm p-6 space-y-5">
          <h2 className="text-base font-semibold text-slate-700 dark:text-white border-b pb-3">Timeline Item Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-slate-600 dark:text-gray-300 block mb-1">
                Year <span className="text-red-500">*</span>
              </label>
              <Input
                name="year"
                value={form.year}
                onChange={handleChange}
                placeholder="e.g., 2020"
                error={!!errors.year}
                errorMessage={errors.year}
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-600 dark:text-gray-300 block mb-1">
                Sequence <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                name="sequence"
                value={form.sequence}
                onChange={handleChange}
                placeholder="0"
                error={!!errors.sequence}
                errorMessage={errors.sequence}
              />
              <p className="text-xs text-slate-500 mt-1">Items are ordered by this value (0=first)</p>
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-600 dark:text-gray-300 block mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <Textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Enter timeline item description"
              rows={4}
              error={!!errors.description}
              errorMessage={errors.description}
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-600 dark:text-gray-300 block mb-1">
              Status
            </label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full border border-[#E6E6E6] text-[#111111] rounded-lg p-2.5 text-sm focus:border-[#981B1F] focus:outline-none focus:ring-2 focus:ring-[#981B1F]/15 transition bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {/* Media Section */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-100 dark:border-gray-700 shadow-sm p-6 space-y-5">
          <h2 className="text-base font-semibold text-slate-700 dark:text-white border-b pb-3">Image / Video Upload</h2>

          <div>
            <label className="text-sm font-semibold text-slate-600 dark:text-gray-300 block mb-2">
              Image or Video <span className="text-red-500">*</span>
            </label>
            <Upload
              value={form.file_url}
              onChange={(url) => {
                setForm((prev) => ({ ...prev, file_url: url }));
                if (errors.file_url) {
                  setErrors((prev) => {
                    const next = { ...prev };
                    delete next.file_url;
                    return next;
                  });
                }
              }}
              mediaType="both"
              accept="image/*,video/mp4,video/webm,video/quicktime"
              maxSizeKB={500}
              maxSizeMB={50}
            />
            {errors.file_url && (
              <span className="text-red-500 text-xs font-semibold mt-1.5 block text-left">
                {errors.file_url}
              </span>
            )}
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-600 dark:text-gray-300 block mb-1">
              Alt Text <span className="text-red-500">*</span>
            </label>
            <Input
              name="alt_text"
              value={form.alt_text}
              onChange={handleChange}
              placeholder="Enter alt text for accessibility"
              error={!!errors.alt_text}
              errorMessage={errors.alt_text}
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex gap-3">
          <Button
            type="submit"
            disabled={submitting}
            className="bg-[#981B1F] hover:bg-[#7a1619] text-white gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                {isEdit ? "Update Item" : "Create Item"}
              </>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate("/about-gdb/journey-timeline")}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
