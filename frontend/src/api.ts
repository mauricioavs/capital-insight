import axios from "axios";

const BASE_URL = "http://localhost:3000"; // Cambia a la URL de tu API Gateway si ya lo desplegaste

export const uploadCSV = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  return await axios.post(`${BASE_URL}/upload`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
};

export const fetchSummary = async () => {
  const response = await axios.get(`${BASE_URL}/summary`);
  return response.data;
};


export const getAllSummaries = async () => {
  const res = await fetch('http://localhost:3000/summary'); // tu endpoint para todos
  return res.json();
};

export const getSummaryByUser = async (userId: string) => {
  const res = await fetch(`http://localhost:3000/summary/${userId}`); // o usa query param
  return res.json();
};