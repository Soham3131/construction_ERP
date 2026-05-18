import axios from 'axios';

const API_URL = '/api/intelligence';

export const getRecommendedTenders = async () => {
  const { data } = await axios.get(`${API_URL}/tenders/recommended`);
  return data;
};

export const interactTender = async (tenderId: string, payload: { status?: string; isBookmarked?: boolean }) => {
  const { data } = await axios.post(`${API_URL}/tenders/${tenderId}/interaction`, payload);
  return data;
};

export const getTenderDashboardStats = async () => {
  const { data } = await axios.get(`${API_URL}/tenders/dashboard`);
  return data;
};
