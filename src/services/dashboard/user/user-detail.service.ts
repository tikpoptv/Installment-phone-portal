import { apiClient } from '../../api';

export interface ReferenceContact {
  id: number;
  user_id: string;
  full_name: string;
  nickname: string;
  phone_number: string;
  relationship: string;
  created_at: string;
}

export interface UserDetail {
  id: string;
  first_name: string;
  last_name: string;
  nickname: string;
  gender: string;
  birth_date: string;
  citizen_id: string;
  citizen_id_image_url: string;
  id_card_issued_date: string;
  id_card_expired_date: string;
  address: string;
  address_province: string;
  address_district: string;
  address_subdistrict: string;
  address_postal_code: string;
  address_pin_location: string;
  phone_number: string;
  email: string;
  facebook_url: string;
  line_id: string;
  occupation: string;
  work_position: string;
  workplace_name: string;
  work_phone: string;
  monthly_income: number;
  work_address: string;
  work_province: string;
  work_district: string;
  work_subdistrict: string;
  work_postal_code: string;
  work_pin_location: string;
  created_at: string;
  updated_at: string;
}

export interface UserDetailResponse {
  user: UserDetail;
  reference_contacts: ReferenceContact[];
}

export async function getUserDetail(userId: string): Promise<UserDetailResponse> {
  const res = await apiClient.get<UserDetailResponse>(`/api/admin/users/${userId}/detail`);
  return res.data;
}

export async function getCitizenIdImage(userId: string, filename: string): Promise<Blob> {
  const res = await apiClient.get<Blob>(
    `/api/admin/files/citizen_id_image/${userId}/${filename}`,
    { responseType: 'blob' }
  );
  return res.data;
}

// ยืนยันตัวตนผู้ใช้ (Admin Only)
export async function verifyUser(userId: string, approve: boolean): Promise<string> {
  const res = await apiClient.post<{ status: string }>(
    `/api/admin/users/${userId}/verify`,
    { approve }
  );
  return res.data.status;
} 