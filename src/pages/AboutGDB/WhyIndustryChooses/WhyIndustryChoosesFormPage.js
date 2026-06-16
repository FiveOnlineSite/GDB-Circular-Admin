import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import {
  getWhyIndustryChoosesItemById,
  createWhyIndustryChoosesItem,
  updateWhyIndustryChoosesItem,
  getWhyIndustryChoosesItems,
} from "../../../services/aboutGDB";

export default function WhyIndustryChoosesFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [pageLoading, setPageLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [maxSequence, setMaxSequence] = useState(0);
  const [form, setForm] = useState({
    stat_value: "",
    title: "",
    description: "",
    sequence: 0,
    status: "active",
  });

  useEffect(() => {
    const getMaxSequence = async () => {
      try {
        const res = await getWhyIndustryChoosesItems();
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
        const res = await getWhyIndustryChoosesItemById(id);
        if (res.success && res.data) {
          const d = res.data;
          setForm({
            stat_value: d.stat_value || "",
            title: d.title || "",
            description: d.description || "",
            sequence: d.sequence ?? 0,
            status: d.status || "active",
          });
        } else {
          toast.error("Item not found");
          navigate("/about-gdb/why-industry-chooses-gdb-pcr");
        }
      } catch (err) {
        toast.error("Failed to load item");
        navigate("/about-gdb/why-industry-chooses-gdb-pcr");
      } finally {
        setPageLoading(false);
      }
    })();
  }, [id, isEdit, navigate, maxSequence]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(p => ({
      ...p,
      [name]: name === "sequence" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.stat_value.trim()) return toast.error("Stat / Value is required");
    if (!form.title.trim()) return toast.error("Title is required");
    if (!form.description.trim()) return toast.error("Description is required");

    try {
      setSubmitting(true);
      const payload = {
        stat_value: form.stat_value.trim(),
        title: form.title.trim(),
        description: form.description.trim(),
        sequence: form.sequence,
        status: form.status,
      };

      const res = isEdit
        ? await updateWhyIndustryChoosesItem(id, payload)
        : await createWhyIndustryChoosesItem(payload);

      if (res.success) {
        toast.success(isEdit ? "Item updated" : "Item created");
        navigate("/about-gdb/why-industry-chooses-gdb-pcr");
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
          onClick={() => navigate("/about-gdb/why-industry-chooses-gdb-pcr")}
          className="rounded-xl border-slate-200"
        >
          <ArrowLeft className="h-4 w-4 text-slate-700" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
            {isEdit ? "Edit Item" : "Add Item"}
          </h1>
          <p className="text-slate-500 text-sm">
            {isEdit ? "Update the reason" : "Add a new reason why industry chooses GDB PCR"}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Details Section */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-100 dark:border-gray-700 shadow-sm p-6 space-y-5">
          <h2 className="text-base font-semibold text-slate-700 dark:text-white border-b pb-3">Item Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-semibold text-slate-600 dark:text-gray-300 block mb-1">
                Stat / Value <span className="text-red-500">*</span>
              </label>
              <Input
                name="stat_value"
                value={form.stat_value}
                onChange={handleChange}
                placeholder="e.g., 25+"
                required
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-600 dark:text-gray-300 block mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <Input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g., Years Experience"
                required
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
              />
              <p className="text-xs text-slate-500 mt-1">Items are ordered by this value (0=first)</p>
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

          <div>
            <label className="text-sm font-semibold text-slate-600 dark:text-gray-300 block mb-1">
              Description <span className="text-red-500">*</span>
            </label>
            <Textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Enter short description about this reason"
              rows={4}
              className="w-full border border-[#E6E6E6] rounded-lg p-3 text-sm focus:border-[#981B1F] focus:outline-none focus:ring-2 focus:ring-[#981B1F]/15 transition dark:bg-gray-800 dark:border-gray-600 dark:text-white"
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
            onClick={() => navigate("/about-gdb/why-industry-chooses-gdb-pcr")}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
