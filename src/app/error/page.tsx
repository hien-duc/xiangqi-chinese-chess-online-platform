"use client";
import { AlertTriangle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import "../../styles/Error.css";

enum ErrorType {
  Configuration = "Configuration",
  AccessDenied = "AccessDenied",
  Verification = "Verification",
  Default = "Default",
}

const errorMessages: Record<ErrorType, string> = {
  [ErrorType.Configuration]:
    "There was a problem with the server configuration. Please contact support if this error persists.",
  [ErrorType.AccessDenied]:
    "You do not have access to this resource. Please check your permissions.",
  [ErrorType.Verification]:
    "The verification process failed. This could be due to an expired token or a reused link.",
  [ErrorType.Default]: "An unknown error occurred. Please try again later.",
};

export default function AuthErrorPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const error = searchParams.get("error") as ErrorType;

  const errorMessage = errorMessages[error] || errorMessages[ErrorType.Default];

  return (
    <div className="error-container">
      <div className="error-card">
        <AlertTriangle className="error-icon" />
        <h1>Oops! Something Went Wrong</h1>
        <p>{errorMessage}</p>
        <button
          className="error-button"
          onClick={() => router.push("/")} // Navigate to the homepage
        >
          Go Back to Home
        </button>
      </div>
    </div>
  );
}
