//frontend/src/app/clients/api.ts

import api from "@/utils/api";
import { Client, Plan, PaymentMethod, EditFormData } from "./types"; // Adicionado EditFormData na importação

export const fetchPlans = async (): Promise<Plan[]> => {
  const response = await api.get("/api/clients/plans");
  return response.data;
};

export const fetchPaymentMethods = async (): Promise<PaymentMethod[]> => {
  const response = await api.get("/api/clients/payment-methods");
  return response.data;
};

export const fetchClients = async (
  page: number,
  limit: number,
  search: string
): Promise<{ data: Client[]; total: number; page: number; limit: number }> => {
  // Nota: O parâmetro 'search' é enviado ao backend. O backend deve incluir o campo 'observations'
  // na lógica de busca para que funcione conforme solicitado. Verifique a implementação do endpoint /api/clients.
  const response = await api.get("/api/clients", {
    params: { page, limit, search },
  });
  return response.data;
};

export const deleteClient = async (id: number): Promise<void> => {
  await api.delete(`/api/clients/${id}`);
};

export const updateClient = async (
  id: number,
  data: EditFormData // Alterado para usar EditFormData
): Promise<Client> => {
  const response = await api.put(`/api/clients/${id}`, data);
  return response.data;
};

export const deletePaymentMethod = async (id: number): Promise<void> => {
  await api.delete(`/api/clients/payment-methods/${id}`);
};

export const deletePlan = async (id: number): Promise<void> => {
  await api.delete(`/api/clients/plans/${id}`);
};

export const renewClient = async (
  id: number,
  dueDate: string
): Promise<Client> => {
  const response = await api.put(`/api/clients/renew/${id}`, { dueDate });
  return response.data;
};

export const updateClientObservations = async (
  id: number,
  observations: string
): Promise<Client> => {
  const response = await api.put(`/api/clients/observations/${id}`, {
    observations,
  });
  return response.data;
};