import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ContractDetail from '../dashboard/components/ContractDetail';
import type { ContractDetailProps } from '../dashboard/components/ContractDetail';

const mockContracts: Record<string, ContractDetailProps['contract']> = {
  '1': {
    id: '1',
    product_name: 'iPhone 15',
    total_price: 35000,
    total_with_interest: 37800,
    installment_months: 12,
    monthly_payment: 2500,
    status: 'active',
    start_date: '2024-01-01',
    end_date: '2024-12-31',
    last_payment_date: '2024-07-10',
    pdpa_consent_file_url: '',
    created_at: '2024-01-01T10:00:00Z',
  },
  '2': {
    id: '2',
    product_name: 'Samsung S24',
    total_price: 30000,
    total_with_interest: 32000,
    installment_months: 12,
    monthly_payment: 2200,
    status: 'closed',
    start_date: '2024-01-01',
    end_date: '2024-12-31',
    last_payment_date: '2024-06-01',
    pdpa_consent_file_url: '',
    created_at: '2024-01-01T10:00:00Z',
  },
};

const ContractDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // ในอนาคตให้ fetch จาก API จริง
  const contract = id ? mockContracts[id] : undefined;

  if (!contract) {
    return <div style={{ padding: 32, textAlign: 'center', color: '#ef4444' }}>ไม่พบข้อมูลสัญญา</div>;
  }

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #e0f2fe 0%, #f8fafc 100%)', padding: '2rem 0' }}>
      <ContractDetail contract={contract} onBack={() => navigate(-1)} />
    </div>
  );
};

export default ContractDetailPage; 