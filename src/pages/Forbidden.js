import React from "react";
import { Link } from "react-router-dom";
import { ShieldAlert } from "lucide-react";
import { Button } from "../components/ui/button";

export default function Forbidden() {
  return (
    <div className="min-h-[70vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-red-50 p-4 rounded-full text-red-600 mb-6 animate-bounce">
        <ShieldAlert className="h-16 w-16" />
      </div>
      <h1 className="text-4xl font-extrabold text-slate-800 mb-2">403 - Access Denied</h1>
      <p className="text-slate-500 max-w-md mb-8">
        You do not have the required permissions to access this page. Please contact your system administrator if you believe this is an error.
      </p>
      <Link to="/dashboard">
        <Button className="shadow-md">
          Go Back to Dashboard
        </Button>
      </Link>
    </div>
  );
}
