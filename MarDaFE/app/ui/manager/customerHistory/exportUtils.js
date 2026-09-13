import * as XLSX from 'xlsx';

// Common function to export data to Excel
export const exportToExcel = (data, fileName) => {
  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
  XLSX.writeFile(wb, `${fileName}.xlsx`);
};

// Format bill data for export
export const formatBillDataForExport = (bills) => {
  return bills.map(bill => ({
    'ID': bill.id,
    'Account Number': bill.accountNumber || '',
    'Customer Name': bill.customerName || '',
    'Previous Reading': bill.previousReading || 0,
    'Current Reading': bill.lastReading || 0,
    'Consumption': bill.consumption || 0,
    'Billing Month': bill.kifyaWer || '',
    'Status': bill.status || '',
    'Bill Generated': bill.isBillGenerated ? 'Yes' : 'No',
    'Amount': bill.totalAmount || 0,
    'Payment Status': bill.isMoneyCollected ? 'Paid' : 'Unpaid',
    'Created Date': bill.registeredDate || ''
  }));
};

// Format Wuzif data for export
export const formatWuzifDataForExport = (wuzifBills) => {
  return wuzifBills.map(item => ({
    'ID': item.id || '',
    'Account Number': item.accountNumber || '',
    'Customer Name': item.customerName || '',
    'Billing Month': item.kifyaWer || '',
    'Wuzif Amount': item.wuzifAmount || 0,
    'Wuzif Status': item.wuzifStatus || '',
    'Penalty Status': item.isKitatTenestual ? 'Active' : 'Inactive',
    'Payment Status': item.isMoneyCollected ? 'Paid' : 'Unpaid',
    'Created Date': item.registeredDate || ''
  }));
};

// Generate CSV content
export const generateCSV = (data) => {
  if (!data || data.length === 0) return '';
  
  const headers = Object.keys(data[0]).join(',');
  const rows = data.map(row => 
    Object.values(row).map(field => 
      typeof field === 'string' ? `"${field.replace(/"/g, '""')}"` : field
    ).join(',')
  );
  
  return [headers, ...rows].join('\n');
};

// Download CSV file
export const downloadCSV = (csvContent, fileName) => {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `${fileName}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};
