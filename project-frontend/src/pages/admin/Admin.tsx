import { useState } from "react";

import Header from "../../components/Header";
import { auth } from "../../firebase/firebase";
import api from "../../services/api";

function Admin() {
  const [file, setFile] = useState<File | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target.files ? e.target.files[0] : null);
  };

  const handleUpload = async () => {
    if (!file) return alert("Please select a file");

    const formData = new FormData();
    formData.append("file", file); // 'file' is the key expected by your API

    const idToken = auth.currentUser?.getIdToken();

    if (!idToken) return;

    try {
      const response = await api.post("admin/goods", formData);
      console.log("Upload success:", response.data);
    } catch (error) {
      console.error("Upload failed:", error);
    }
  };

  return (
    <div className="animate-fade-in min-h-screen">
      <title>Admin</title>
      <Header />
      admin
      <div id="upload-section">
        <input type="file" onChange={handleFileChange} />
        <button onClick={handleUpload}>Upload</button>
      </div>
    </div>
  );
}

export default Admin;
