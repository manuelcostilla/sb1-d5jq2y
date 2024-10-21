import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { Upload, Mail, AlertCircle } from 'lucide-react';

interface EmailData {
  to: string;
  name: string;
  subject: string;
  body: string;
}

function App() {
  const [excelData, setExcelData] = useState<EmailData[]>([]);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet) as EmailData[];
        setExcelData(jsonData);
      };
      reader.readAsArrayBuffer(file);
    }
  };

  const sendEmails = async () => {
    setSending(true);
    setError(null);

    try {
      const response = await fetch('/send_emails.php', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(excelData),
      });

      if (!response.ok) {
        throw new Error('Failed to send emails');
      }

      const result = await response.json();
      if (result.success) {
        alert('All emails sent successfully!');
      } else {
        throw new Error(result.message || 'Failed to send emails');
      }
    } catch (error) {
      console.error('Error sending emails:', error);
      setError('An error occurred while sending emails. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold mb-6 text-center">Excel Email Sender</h1>
        
        <div className="mb-6">
          <label htmlFor="file-upload" className="block mb-2 text-sm font-medium text-gray-700">
            Upload Excel File
          </label>
          <div className="flex items-center justify-center w-full">
            <label htmlFor="file-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Upload className="w-8 h-8 mb-3 text-gray-400" />
                <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                <p className="text-xs text-gray-500">XLSX, XLS</p>
              </div>
              <input id="file-upload" type="file" className="hidden" onChange={handleFileUpload} accept=".xlsx, .xls" />
            </label>
          </div>
        </div>

        {excelData.length > 0 && (
          <div className="mb-6">
            <p className="text-sm text-gray-600 mb-2">{excelData.length} email(s) loaded</p>
            <button
              onClick={sendEmails}
              disabled={sending}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline flex items-center justify-center"
            >
              {sending ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="mr-2" />
                  Send Emails
                </>
              )}
            </button>
          </div>
        )}

        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-6" role="alert">
            <div className="flex">
              <AlertCircle className="flex-shrink-0 mr-2" />
              <p>{error}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;