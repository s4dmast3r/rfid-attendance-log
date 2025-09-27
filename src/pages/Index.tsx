import { AttendanceHeader } from "@/components/attendance/AttendanceHeader";
import { AttendanceFilters } from "@/components/attendance/AttendanceFilters";
import { AttendanceTable } from "@/components/attendance/AttendanceTable";
import { PresentUsers } from "@/components/attendance/PresentUsers";
import { UserRegistration } from "@/components/attendance/UserRegistration";
import { AttendanceProvider } from "@/components/attendance/AttendanceProvider";

const Index = () => {
  return (
    <AttendanceProvider>
      <div className="min-h-screen dashboard-bg">
        <AttendanceHeader />
        
        <main className="container mx-auto px-4 py-6">
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Left column - Filters and Attendance Table */}
            <div className="lg:col-span-2 space-y-6">
              <AttendanceFilters />
              <AttendanceTable />
            </div>
            
            {/* Right column - Present Users and Registration */}
            <div className="space-y-6">
              <PresentUsers />
              <UserRegistration />
            </div>
          </div>
        </main>
        
        <footer className="border-t bg-card py-4">
          <div className="container mx-auto px-4">
            <p className="text-center text-sm text-muted-foreground">
              Zona horaria: America/Bogotá • © Control de Asistencias
            </p>
          </div>
        </footer>
      </div>
    </AttendanceProvider>
  );
};

export default Index;
