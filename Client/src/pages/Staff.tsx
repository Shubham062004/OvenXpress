import React, { useEffect, useState } from 'react';
import staffAPI, { Staff } from '@/services/staffAPI';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

const StaffPage: React.FC = () => {
  const [staffList, setStaffList] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(true);
  const branchId = '1'; // Replace this with dynamic branch/user logic

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const { data } = await staffAPI.getProfile(branchId);
        setStaffList([data]); // Since getProfile returns a single staff, wrap it in an array
      } catch (error) {
        console.error('Error fetching staff profile:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStaff();
  }, [branchId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin mr-2" />
        <span>Loading staff data...</span>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-semibold text-center mb-8">Staff Profiles</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {staffList.map((staff) => (
          <Card key={staff._id} className="shadow-md rounded-2xl">
            <CardHeader>
              <CardTitle className="flex justify-between items-center">
                <span>{staff.name}</span>
                <Badge
                  variant={staff.isActive ? 'secondary' : 'destructive'}
                  className={
                    staff.isActive
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }
                >
                  {staff.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                <strong>Role:</strong> {staff.role}
              </p>
              <p>
                <strong>Email:</strong> {staff.email}
              </p>
              <p>
                <strong>Joined:</strong>{' '}
                {new Date(staff.joinedAt).toLocaleDateString()}
              </p>
              {staff.salary && (
                <div className="mt-2 text-sm text-gray-600">
                  <p>
                    Fixed Salary: ₹{staff.salary.fixed}
                    {staff.salary.bonus && ` + ₹${staff.salary.bonus} Bonus`}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default StaffPage;
