import { useState, ChangeEvent, FormEvent } from "react";
import { uploadCSV } from "../api";

export function UploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<string>("");
  const [uploading, setUploading] = useState<boolean>(false);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files && e.target.files.length > 0 ? e.target.files[0] : null);
    setStatus(""); // Limpia status al cambiar archivo
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    const form = e.currentTarget;
    e.preventDefault();
    if (!file) {
      setStatus("Please select a CSV file to upload.");
      return;
    }

    try {
      setUploading(true);
      setStatus("Uploading...");
      await uploadCSV(file);
      setStatus("Upload successful!");
      setFile(null);

      const input = form.elements.namedItem("csvFile") as HTMLInputElement | null;

      if (input) {
        input.value = "";
      }
    } catch (error) {
      console.error(error);
      setStatus("Error uploading file");
    } finally {
      setUploading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-4 border rounded-xl shadow bg-white max-w-md mx-auto"
    >
      <h2 className="text-xl font-semibold mb-4">Upload CSV</h2>

      <input
        id="csvFile"
        name="csvFile"
        type="file"
        accept=".csv"
        onChange={handleFileChange}
        className="mb-4"
        disabled={uploading}
      />

      <button
        type="submit"
        className={`bg-blue-500 text-white px-4 py-2 rounded disabled:opacity-50`}
        disabled={uploading}
      >
        {uploading ? "Uploading..." : "Upload"}
      </button>

      {status && <p className="mt-4 text-sm text-gray-700">{status}</p>}
    </form>
  );
}