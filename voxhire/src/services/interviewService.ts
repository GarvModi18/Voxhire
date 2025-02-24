import axios from "axios";

export const createInterview = async (data: any) => {
  await axios.post(
    "http://localhost:5000/api/interview/create-interview",
    data
  );
};
