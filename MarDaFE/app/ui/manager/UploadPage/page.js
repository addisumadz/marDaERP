"use client";
import { useState } from "react";
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
} from "@tanstack/react-query"; // Assuming you use TanStack/React Query
import { CsvUploadService } from "../../../lib/CsvUploadService .js"; // Adjust path as needed
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Import CSS for toastify

const queryClient = new QueryClient();

function UploadPage() {
  const [file, setFile] = useState(null);

  const csvUploader = new CsvUploadService();

  // useMutation hook to handle the upload logic
  const {
    mutate: uploadFile,
    isPending,
    isError,
    isSuccess,
    error,
    data,
  } = useMutation({
    mutationFn: (selectedFile) => {
      // The mutation function calls our service method
      return csvUploader.uploadMembersCsv(selectedFile);
    },
    onSuccess: (response) => {
      // This function is called if the mutation is successful
      toast.success(response.data.message || "File uploaded successfully!");
    },
    onError: (err) => {
      // This function is called if the mutation fails
      toast.error(
        err.response?.data?.message || err.message || "An error occurred."
      );
    },
  });

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (file) {
      uploadFile(file); // Execute the mutation
    }
  };

  return (
    <div>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      <h1>የማህበሩ አባላት መረጃ ከ CSV ፋይል አስገባ</h1>
      <form onSubmit={handleSubmit}>
        <input type="file" accept=".csv" onChange={handleFileChange} />
        <button type="submit" disabled={!file || isPending}>
          {isPending ? "Uploading..." : "Upload File"}
        </button>
      </form>

      {/* Display feedback to the user */}
      {isPending && <p>Uploading file, please wait...</p>}
    </div>
  );
}

const UploadPageWithProvider = () => (
  <QueryClientProvider client={queryClient}>
    <UploadPage />
  </QueryClientProvider>
);

export default UploadPageWithProvider;
