import api from './api';

// Define a proper interface for Staff profile data
export interface StaffProfile {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'staff' | 'manager' | 'founder';
  branch: number;
  staffId: string;
  profileImage?: string;
  joinedAt: string;
  salary?: {
    fixed: number;
    bonus?: number;
  };
  isActive: boolean;
}

// Define attendance record structure
export interface AttendanceRecord {
  date: string;
  checkInTime?: string;
  checkOutTime?: string;
  photoUrl?: string;
  status: 'present' | 'absent' | 'late';
}

// Define payload for salary update
export interface SalaryUpdate {
  fixed: number;
}

// Export alias for easier imports in other files
export type Staff = StaffProfile;

export const staffAPI = {
  /**
   * Get staff profile by ID
   */
  getProfile: (id: string) => api.get<StaffProfile>(`/staff/profile/${id}`),

  /**
   * Staff check-in with selfie
   */
  checkIn: (formData: FormData) =>
    api.post('/staff/checkin', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  /**
   * Staff check-out
   */
  checkOut: () => api.post('/staff/checkout'),

  /**
   * Get attendance records (optional date filter)
   */
  getAttendance: (id: string, date?: string) => {
    const url = date
      ? `/staff/attendance/${id}?date=${encodeURIComponent(date)}`
      : `/staff/attendance/${id}`;
    return api.get<AttendanceRecord[]>(url);
  },

  /**
   * Update salary (founder only)
   */
  updateSalary: (id: string, fixed: number) =>
    api.put(`/staff/${id}/salary`, { fixed } as SalaryUpdate),
};

export default staffAPI;
