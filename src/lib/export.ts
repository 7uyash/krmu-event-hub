import * as XLSX from 'xlsx';
import Papa from 'papaparse';

export interface AttendanceExportData {
  rollNumber: string;
  name: string;
  email: string;
  department?: string;
  registeredAt: string;
  attendanceStatus: string;
  markedAt?: string;
}

export const exportToExcel = (data: AttendanceExportData[], filename: string = 'attendance') => {
  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance');
  
  // Auto-size columns
  const maxWidth = data.reduce((width, row) => {
    return Math.max(
      width,
      row.rollNumber.length,
      row.name.length,
      row.email.length,
      row.attendanceStatus.length
    );
  }, 10);
  
  worksheet['!cols'] = [
    { wch: maxWidth },
    { wch: maxWidth },
    { wch: maxWidth + 5 },
    { wch: maxWidth },
    { wch: maxWidth + 10 },
    { wch: maxWidth },
    { wch: maxWidth + 10 },
  ];

  XLSX.writeFile(workbook, `${filename}-${new Date().toISOString().split('T')[0]}.xlsx`);
};

export const exportToCSV = (data: AttendanceExportData[], filename: string = 'attendance') => {
  const csv = Papa.unparse(data);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}-${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const formatAttendanceData = (registrations: any[]): AttendanceExportData[] => {
  return registrations.map((reg) => ({
    rollNumber: reg.userId?.rollNumber || reg.user?.rollNumber || 'N/A',
    name: reg.userId?.name || reg.user?.name || 'N/A',
    email: reg.userId?.email || reg.user?.email || 'N/A',
    department: reg.userId?.department || reg.user?.department || '',
    registeredAt: new Date(reg.registeredAt).toLocaleString(),
    attendanceStatus: reg.attendanceStatus || 'pending',
    markedAt: reg.markedAt ? new Date(reg.markedAt).toLocaleString() : '',
  }));
};
