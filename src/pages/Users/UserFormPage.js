import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { Button } from "../../components/ui/button";
import UserForm from "./UserForm";
import { getUserById, createUser, updateUser } from "../../services/user";

export default function UserFormPage() {
  const navigate = useNavigate();
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [pageLoading, setPageLoading] = useState(false);

  useEffect(() => {
    if (id) {
      const fetchUser = async () => {
        try {
          setPageLoading(true);
          const res = await getUserById(id);
          if (res.success) {
            setUser(res.data);
          }
        } catch (err) {
          toast.error("Failed to load user details");
          navigate("/users");
        } finally {
          setPageLoading(false);
        }
      };
      fetchUser();
    }
  }, [id, navigate]);

  const handleFormSuccess = async (payload) => {
    try {
      if (id) {
        const res = await updateUser(id, payload);
        if (res.success) {
          toast.success("User updated successfully");
          navigate("/users");
        }
      } else {
        const res = await createUser(payload);
        if (res.success) {
          toast.success("User created successfully");
          navigate("/users");
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Operation failed");
    }
  };

  if (pageLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-[#981B1F] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-slate-500 font-medium text-sm">Loading user data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-12 w-full">
      <div className="flex items-center gap-3">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate("/users")}
          className="rounded-xl border-slate-200"
        >
          <ArrowLeft className="h-4 w-4 text-slate-700" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            {id ? "Edit User Details" : "Create New User"}
          </h1>
          <p className="text-slate-500 text-sm">
            {id ? "Modify the credentials and system roles for this user" : "Fill out details to create a new system administrator or builder"}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden p-8">
        <UserForm
          user={user}
          onClose={() => navigate("/users")}
          onSuccess={handleFormSuccess}
        />
      </div>
    </div>
  );
}
