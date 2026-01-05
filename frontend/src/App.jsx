import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Upload, Activity, ShieldCheck, Eye, RefreshCcw, Clock, ExternalLink } from 'lucide-react';

// PASTE YOUR NGROK BACKEND LINK HERE
const API_BASE_URL = "/api";

function App() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  // Fetch history from the backend
  const fetchHistory = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/history`);
      setHistory(response.data);
    } catch (error) {
      console.error("Failed to fetch history:", error);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      setResult(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      // Sends data to the Ngrok Tunnel
      const response = await axios.post(`${API_BASE_URL}/analyze`, formData);
      setResult(response.data);
      fetchHistory(); 
    } catch (error) {
      alert("Analysis failed. Check if Terminal 1 (Backend) and Terminal 3 (Ngrok 8000) are running!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-10 font-sans text-slate-900">
      <div className="max-w-6xl mx-auto">
        
        {/* Header */}
        <header className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 p-3 rounded-2xl text-white shadow-lg shadow-blue-200">
              <ShieldCheck size={28} />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight">AI ADVISOR <span className="text-blue-600">PRO</span></h1>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Industry Solution v1.0</p>
            </div>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl border border-slate-200 text-[10px] font-black uppercase text-slate-500">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            System Live: Ngrok Secured
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* UPLOAD SECTION */}
          <div className="lg:col-span-5">
            <div className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4">Input Source</h3>
              <div className="aspect-square bg-slate-50 rounded-[2rem] border-2 border-dashed border-slate-200 flex items-center justify-center overflow-hidden">
                {preview ? (
                  <img src={preview} className="w-full h-full object-cover" alt="Input" />
                ) : (
                  <label className="cursor-pointer text-center">
                    <Upload className="mx-auto text-blue-500 mb-2" size={40} />
                    <p className="text-slate-600 font-bold">Upload Scene Image</p>
                    <input type="file" className="hidden" onChange={handleFileChange} />
                  </label>
                )}
              </div>
              <button 
                onClick={handleUpload}
                disabled={loading || !file}
                className="w-full mt-6 bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-black uppercase tracking-widest transition-all shadow-xl shadow-blue-100"
              >
                {loading ? <RefreshCcw className="animate-spin mx-auto" /> : "Process AI Analysis"}
              </button>
            </div>
          </div>

          {/* RESULTS & XAI SECTION */}
          <div className="lg:col-span-7">
            <div className="bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm min-h-[500px]">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6">AI Interpretation</h3>
              
              {result ? (
                <div className="space-y-6">
                  <div className="flex items-center gap-3">
                    <span className="px-4 py-1 bg-green-100 text-green-700 rounded-lg font-black text-sm uppercase">
                      Detected: {result.detected}
                    </span>
                  </div>

                  <div className="p-6 bg-blue-600 rounded-[1.5rem] text-white shadow-xl shadow-blue-100">
                    <p className="text-lg font-medium leading-relaxed italic">"{result.advice}"</p>
                  </div>

                  <div className="pt-6 border-t border-slate-100">
                    <div className="flex items-center gap-2 mb-4 text-purple-600">
                      <Eye size={20} />
                      <span className="text-xs font-black uppercase tracking-widest">Explainable AI (Grad-CAM)</span>
                    </div>
                    {/* Note: Heatmap URL now comes from Ngrok Backend */}
                    <img src={result.heatmap_url} className="w-full rounded-2xl border border-slate-200" alt="Heatmap" />
                  </div>
                </div>
              ) : (
                <div className="h-80 flex flex-col items-center justify-center text-slate-300">
                  <Activity size={64} className="opacity-10 mb-4 animate-pulse" />
                  <p className="font-bold text-xs uppercase tracking-widest">Ready for Analysis</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* HISTORY SECTION */}
        <div className="mt-10 bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Clock className="text-slate-400" size={20} />
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-400">Database History</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  <th className="pb-4 px-2">ID</th>
                  <th className="pb-4 px-2">Object</th>
                  <th className="pb-4 px-2">Advice Given</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                {history.map((item) => (
                  <tr key={item.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-2 font-mono text-xs text-slate-400">#{item.id}</td>
                    <td className="py-4 px-2 font-bold text-blue-600 capitalize">{item.object_name}</td>
                    <td className="py-4 px-2 text-slate-600 italic">"{item.advice}"</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}

export default App;