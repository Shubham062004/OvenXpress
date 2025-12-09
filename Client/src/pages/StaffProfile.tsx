import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { toast } from "sonner";
import { Camera, Clock, Award, DollarSign, Briefcase, User, Loader2 } from "lucide-react";
import { staffAPI } from "@/services/staffAPI";
import { useAuth } from "@/contexts/AuthContext";

interface AttendanceRecord {
  date: string;
  checkIn: Date;
  checkOut?: Date;
  selfie: string;
  hoursWorked: number;
}

interface StaffProfile {
  _id: string;
  staffId: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  branch: number;
  role: string;
  attendance: AttendanceRecord[];
  currentSession: {
    isCheckedIn: boolean;
    checkInTime: Date | null;
    selfie: string;
  };
  salary: {
    fixed: number;
    pointsBonus: number;
    total: number;
  };
  performance: {
    ordersHandled: number;
    customerRating: number;
    punctuality: number;
    dailyPoints: number;
  };
}

const StaffProfile = () => {
  const { id } = useParams<{ id: string }>();
  const [staffProfile, setStaffProfile] = useState<StaffProfile | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    fetchStaffProfile();
  }, [id]);

  useEffect(() => {
    if (staffProfile?.currentSession?.isCheckedIn && staffProfile.currentSession.checkInTime) {
      const interval = setInterval(() => {
        const checkInDate = new Date(staffProfile.currentSession.checkInTime);
        const now = new Date();
        const diff = Math.floor((now.getTime() - checkInDate.getTime()) / 1000);
        setElapsedTime(diff);
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [staffProfile?.currentSession?.isCheckedIn, staffProfile?.currentSession?.checkInTime]);

  const fetchStaffProfile = async () => {
    if (!id) return;
    
    try {
      setIsLoading(true);
      const response = await staffAPI.getProfile(id);
      setStaffProfile(response.data.data);
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to fetch staff profile:', error);
      toast.error("Failed to load staff profile");
      setIsLoading(false);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      setCameraStream(stream);
      setShowCamera(true);
      const videoElement = document.getElementById('camera-feed') as HTMLVideoElement;
      if (videoElement) {
        videoElement.srcObject = stream;
      }
    } catch (error) {
      toast.error("Could not access camera");
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setShowCamera(false);
  };

  const captureSelfie = async () => {
    const videoElement = document.getElementById('camera-feed') as HTMLVideoElement;
    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;
    canvas.getContext('2d')?.drawImage(videoElement, 0, 0);
    
    // Convert to blob
    try {
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          if (blob) resolve(blob);
          else throw new Error("Failed to create blob");
        }, 'image/jpeg', 0.8);
      });
      
      // Create FormData with selfie blob
      const formData = new FormData();
      formData.append('selfie', blob, 'selfie.jpg');
      
      // Send check-in request to API
      await staffAPI.checkIn(formData);
      
      // Refresh staff profile data
      const profileResponse = await staffAPI.getProfile(id || '');
      setStaffProfile(profileResponse.data.data);
      
      toast.success("Checked in successfully!");
      stopCamera();
    } catch (error) {
      console.error('Check-in failed:', error);
      toast.error("Could not check in. Please try again.");
    }
  };

  const handleCheckOut = async () => {
    try {
      setIsLoading(true);
      
      // Send check-out request to API
      await staffAPI.checkOut();
      
      // Refresh staff profile data
      const profileResponse = await staffAPI.getProfile(id || '');
      setStaffProfile(profileResponse.data.data);
      
      toast.success("Checked out successfully!");
      setElapsedTime(0);
      setIsLoading(false);
    } catch (error) {
      console.error('Check-out failed:', error);
      toast.error("Could not check out. Please try again.");
      setIsLoading(false);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-lg text-muted-foreground">Loading staff profile...</p>
        </div>
      </div>
    );
  }

  if (!staffProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <p className="text-lg text-muted-foreground">Staff profile not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 dark:from-gray-900 dark:to-gray-800 py-4 sm:py-8 px-4">
      <div className="container mx-auto max-w-5xl">
        {/* Profile Header */}
        <Card className="mb-4 sm:mb-6 animate-fade-in">
          <CardContent className="p-4 sm:p-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-center gap-4 sm:gap-6">
              <Avatar className="h-20 w-20 sm:h-24 sm:w-24">
                <AvatarImage src={staffProfile.currentSession?.selfie} />
                <AvatarFallback className="bg-primary text-primary-foreground text-xl sm:text-2xl">
                  <User className="h-10 w-10 sm:h-12 sm:w-12" />
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-center sm:text-left">
                <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-2">
                  {staffProfile.user?.name || 'Staff Member'}
                </h1>
                <div className="flex flex-wrap justify-center sm:justify-start gap-3 sm:gap-4 text-xs sm:text-sm text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Briefcase className="h-3 w-3 sm:h-4 sm:w-4" />
                    {staffProfile.role}
                  </span>
                  <span>Branch {staffProfile.branch}</span>
                  <span>ID: {staffProfile.staffId}</span>
                </div>
              </div>
              <Badge 
                variant={staffProfile.currentSession?.isCheckedIn ? "default" : "secondary"} 
                className="text-lg py-2 px-4"
              >
                {staffProfile.currentSession?.isCheckedIn ? "On Duty" : "Off Duty"}
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Check-in Section */}
        <Card className="mb-6 animate-fade-in">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Attendance
            </CardTitle>
          </CardHeader>
          <CardContent>
            {staffProfile.currentSession?.isCheckedIn ? (
              <div className="space-y-4">
                <div className="text-center py-6">
                  <p className="text-sm text-muted-foreground mb-2">Working Hours</p>
                  <p className="text-5xl font-bold text-primary">{formatTime(elapsedTime)}</p>
                </div>
                <Button 
                  onClick={handleCheckOut} 
                  variant="destructive" 
                  className="w-full" 
                  size="lg"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processing...
                    </>
                  ) : (
                    'Check Out'
                  )}
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {showCamera ? (
                  <div className="space-y-4">
                    <video id="camera-feed" autoPlay className="w-full rounded-lg" />
                    <div className="flex gap-2">
                      <Button 
                        onClick={captureSelfie} 
                        className="flex-1"
                        disabled={isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <Camera className="h-4 w-4 mr-2" />
                            Capture Selfie
                          </>
                        )}
                      </Button>
                      <Button onClick={stopCamera} variant="outline" disabled={isLoading}>
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <Button 
                    onClick={startCamera} 
                    className="w-full" 
                    size="lg"
                    disabled={isLoading}
                  >
                    <Camera className="h-5 w-5 mr-2" />
                    Check In with Selfie
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
          {/* Performance Card */}
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5" />
                Performance Metrics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Daily Points</p>
                  <p className="text-3xl font-bold text-primary">{staffProfile.performance?.dailyPoints || 0}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Orders Handled</p>
                    <p className="text-xl font-bold text-primary">{staffProfile.performance?.ordersHandled || 0}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Customer Rating</p>
                    <p className="text-xl font-bold text-primary">{staffProfile.performance?.customerRating || 0}/5</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Salary Card */}
          <Card className="animate-fade-in">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5" />
                Salary Summary
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <p className="text-4xl font-bold text-primary mb-2">
                  ₹{staffProfile.salary?.total.toLocaleString() || 0}
                </p>
                <p className="text-sm text-muted-foreground">
                  (₹{staffProfile.salary?.fixed.toLocaleString() || 0} + ₹{staffProfile.salary?.pointsBonus.toLocaleString() || 0})
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Fixed Salary + Points Bonus
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Attendance */}
        <Card className="animate-fade-in">
          <CardHeader>
            <CardTitle>Recent Attendance</CardTitle>
          </CardHeader>
          <CardContent>
            {staffProfile.attendance?.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">No attendance records found</p>
            ) : (
              <ul className="space-y-3">
                {staffProfile.attendance?.slice(-5).map((record, index) => (
                  <li key={index} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-3">
                      <img 
                        src={record.selfie} 
                        alt="Check-in selfie" 
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-medium">{new Date(record.date).toLocaleDateString()}</p>
                        <p className="text-xs text-muted-foreground">
                          {new Date(record.checkIn).toLocaleTimeString()} 
                          {record.checkOut && ` - ${new Date(record.checkOut).toLocaleTimeString()}`}
                        </p>
                      </div>
                    </div>
                    <p className="font-bold text-primary">{record.hoursWorked.toFixed(2)} hrs</p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StaffProfile;
