import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Button } from "../../../components/ui/button";
import { Input } from "../../../components/ui/input";
import { Textarea } from "../../../components/ui/textarea";
import { getFaqById, createFaq, updateFaq } from "../../../services/globalContent/faqs";

const fieldStyle =
  "w-full border border-[#E6E6E6] text-[#111111] rounded-lg p-2.5 text-sm focus:border-[#981B1F] focus:outline-none focus:ring-2 focus:ring-[#981B1F]/15 transition bg-white dark:bg-gray-800 dark:border-gray-600 dark:text-white";

const PAGES = ["home", "product-listing", "sellers", "about", "contact", "services", "faq"];

export default function FaqFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  const [pageLoading, setPageLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    page: "",
    question: "",
    answer: "",
    sequence: 0,
    faq_schema: "",
    status: "active",
  });

  useEffect(() => {
    if (!isEdit) return;
    const fetch = async () => {
      try {
        setPageLoading(true);
        const res = await getFaqById(id);
        if (res.success && res.data) {
          const d = res.data;
          setForm({
            page: d.page || "",
            question: d.question || "",
            answer: d.answer || "",
            sequence: d.sequence ?? 0,
            faq_schema: d.faq_schema || "",
            status: d.status || "active",
          });
        } else {
          toast.error("FAQ not found");
          navigate("/global-content/faqs");
        }
      } catch {
        toast.error("Failed to load FAQ");
        navigate("/global-content/faqs");
      } finally {
        setPageLoading(false);
      }
    };
    fetch();
  }, [id, isEdit, navigate]);

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!form.page) newErrors.page = "Page is required";
    if (!form.question.trim()) newErrors.question = "Question is required";
    if (!form.answer.trim()) newErrors.answer = "Answer is required";
    if (String(form.sequence).trim() !== "" && Number(form.sequence) < 0) {
      newErrors.sequence = "Sequence must be 0 or greater";
    }
    if (form.faq_schema.trim()) {
      try {
        JSON.parse(form.faq_schema);
      } catch (_) {
        newErrors.faq_schema = "FAQ schema must be valid JSON";
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    try {
      setSubmitting(true);
      const payload = { ...form, sequence: Number(form.sequence) };
      const res = isEdit ? await updateFaq(id, payload) : await createFaq(payload);
      if (res.success) {
        toast.success(isEdit ? "FAQ updated" : "FAQ created");
        navigate("/global-content/faqs");
      } else {
        toast.error(res.message || "Operation failed");
      }
    } catch (err) {
      const apiErrors = err.response?.data?.error;
      if (apiErrors && typeof apiErrors === "object") {
        setErrors((prev) => ({ ...prev, ...apiErrors }));
      }
      toast.error(err.response?.data?.message || "Operation failed");
    } finally {
      setSubmitting(false);
    }
  };

  if (pageLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-[#981B1F] border-t-transparent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 w-full">
      <div className="flex items-center gap-3">
        <Button variant="outline" size="icon" type="button" onClick={() => navigate("/global-content/faqs")} className="rounded-xl border-slate-200">
          <ArrowLeft className="h-4 w-4 text-slate-700" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-white tracking-tight">
            {isEdit ? "Edit FAQ" : "Add FAQ"}
          </h1>
          <p className="text-slate-500 text-sm">{isEdit ? "Update FAQ content and schema" : "Add a new frequently asked question"}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6" noValidate>
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-slate-100 dark:border-gray-700 shadow-sm p-6 space-y-5">
          <h2 className="text-base font-semibold text-slate-700 dark:text-white border-b pb-3">FAQ Details</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-semibold text-slate-600 dark:text-gray-300 block mb-1">
                Page <span className="text-red-500">*</span>
              </label>
              <select
                name="page"
                value={form.page}
                onChange={handleChange}
                aria-invalid={errors.page ? "true" : "false"}
                className={`${fieldStyle} ${errors.page ? 'border-red-500 focus:border-red-500 focus:ring-red-500/15' : ''}`}
              >
                <option value="">Select Page</option>
                {PAGES.map((p) => (
                  <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1).replace(/-/g, " ")}</option>
                ))}
              </select>
              {errors.page && (
                <span className="text-red-500 text-xs font-semibold mt-1.5 block text-left">
                  {errors.page}
                </span>
              )}
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-600 dark:text-gray-300 block mb-1">Sequence</label>
              <Input
                type="number"
                min="0"
                name="sequence"
                value={form.sequence}
                onChange={handleChange}
                error={!!errors.sequence}
                errorMessage={errors.sequence}
              />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-600 dark:text-gray-300 block mb-1">Status</label>
              <select
                name="status"
                value={form.status}
                onChange={handleChange}
                className={`${fieldStyle} cursor-pointer`}
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-600 dark:text-gray-300 block mb-1">
              Question <span className="text-red-500">*</span>
            </label>
            <Input
              name="question"
              value={form.question}
              onChange={handleChange}
              placeholder="What is your return policy?"
              error={!!errors.question}
              errorMessage={errors.question}
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-600 dark:text-gray-300 block mb-1">
              Answer <span className="text-red-500">*</span>
            </label>
            <Textarea
              name="answer"
              value={form.answer}
              onChange={handleChange}
              placeholder="Write the answer here..."
              rows={6}
              error={!!errors.answer}
              errorMessage={errors.answer}
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-slate-600 dark:text-gray-300 block mb-1">
              FAQ Schema (JSON-LD)
              <span className="text-slate-400 font-normal text-xs ml-1">Optional — auto-generated if left blank</span>
            </label>
            <Textarea
              name="faq_schema"
              value={form.faq_schema}
              onChange={handleChange}
              placeholder={'{\n  "@context": "https://schema.org",\n  "@type": "FAQPage"\n}'}
              rows={6}
              className="font-mono text-xs"
              error={!!errors.faq_schema}
              errorMessage={errors.faq_schema}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={() => navigate("/global-content/faqs")}>Cancel</Button>
          <Button type="submit" disabled={submitting} style={{ backgroundColor: "#981B1F" }} className="text-white hover:opacity-90">
            {submitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</> : <><Save className="w-4 h-4 mr-2" />{isEdit ? "Update FAQ" : "Create FAQ"}</>}
          </Button>
        </div>
      </form>
    </div>
  );
}
