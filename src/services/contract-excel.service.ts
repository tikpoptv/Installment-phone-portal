import { apiClient } from './api';

export interface ContractPdfData {
  user_id: string;
  product_id: string;
  total_price: number;
  total_with_interest: number;
  installment_months: number;
  monthly_payment: number;
  start_date: string; // format: YYYY-MM-DD
  end_date: string; // format: YYYY-MM-DD
  down_payment_amount: number;
  rental_cost: number;
  contract_number: string;
  created_date: string; // format: YYYY-MM-DD
  user_signature: string;
  renter_signature: string;
  witness_signature: string;
}

export const generateContractPdf = async (contractData: ContractPdfData): Promise<Blob> => {
  const response = await apiClient.post<Blob>('/api/contracts/template', contractData, {
    responseType: 'blob',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  return response.data;
};

export const displayContractPdf = (blob: Blob, containerId: string) => {
  const url = URL.createObjectURL(blob);
  const container = document.getElementById(containerId);
  if (container) {
    container.innerHTML = `
      <iframe
        src="${url}"
        title="Contract PDF"
        width="100%"
        height="600px"
        style="border: 1px solid #e5e7eb; border-radius: 8px;"
      />
    `;
  }
};
