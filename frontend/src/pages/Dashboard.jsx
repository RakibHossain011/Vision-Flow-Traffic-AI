import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Upload, Activity, ShieldCheck, Eye, RefreshCcw, 
  LogOut, Search, Mic, Image as ImageIcon, 
  ArrowUpCircle, Share, History as HistoryIcon, Trash2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_BASE_URL = window.location.origin; 

function Dashboard() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);

  const user = JSON.parse(localStorage.getItem('user')) || { first_name: "User", email: "" };

  const fetchHistory = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/history?email=${user.email}`);
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

  const deleteHistoryItem = async (e, id) => {
    e.stopPropagation(); 
    if (!window.confirm("Delete this detection?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/history/${id}`);
      fetchHistory();
      if (result && result.id === id) setResult(null);
    } catch (error) {
      alert("Delete failed.");
    }
  };

  const viewHistoryItem = (item) => {
    // FIX: Extract only the filename and route it through /static_uploads/
    const formatUrl = (path) => {
        const fileName = path.split(/[\\/]/).pop(); 
        return `${API_BASE_URL}/static_uploads/${fileName}`;
    };

    setResult({
      id: item.id,
      detected: item.object_name,
      advice: item.advice,
      original_url: formatUrl(item.image_path),
      heatmap_url: formatUrl(item.heatmap_path)
    });
    setPreview(null);
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('email', user.email); 

    try {
      const response = await axios.post(`${API_BASE_URL}/analyze`, formData);
      setResult(response.data);
      fetchHistory(); 
    } catch (error) {
      alert("Analysis failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      <aside className="w-72 border-r border-gray-200 p-4 flex flex-col bg-[#F9FBFF]">
        <div className="flex items-center gap-3 mb-8 px-2">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold shadow-lg">
            {user.first_name[0]}
          </div>
          <div className="overflow-hidden">
            <p className="font-bold text-gray-800 truncate">{user.first_name}</p>
            <p className="text-xs text-gray-500 truncate">{user.email}</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          <h3 className="text-xs font-bold text-gray-400 uppercase px-2 mb-4 flex items-center gap-2">
            <HistoryIcon size={14} /> MY DETECTIONS
          </h3>
          <div className="space-y-1">
            {history.length > 0 ? history.map((item) => (
              <div key={item.id} className="group flex items-center hover:bg-blue-50 rounded-xl px-3 transition-all cursor-pointer">
                <button 
                  onClick={() => viewHistoryItem(item)}
                  className="flex-1 text-left py-2.5 text-sm text-gray-700 truncate"
                >
                  • {item.object_name}
                </button>
                <button 
                  onClick={(e) => deleteHistoryItem(e, item.id)}
                  className="p-1.5 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            )) : (
              <p className="text-xs text-gray-400 px-3 italic text-center mt-4">No history found</p>
            )}
          </div>
        </div>

        <div className="mt-auto pt-4 border-t border-gray-100 space-y-2">
          <button className="w-full flex items-center gap-3 py-3 px-4 hover:bg-blue-50 text-blue-700 rounded-2xl text-sm font-semibold transition-all">
            <ArrowUpCircle size={18} />
            <span>Upgrade Plan</span>
          </button>
          <button 
            onClick={() => {localStorage.clear(); navigate('/login');}} 
            className="w-full flex items-center gap-3 py-3 px-4 hover:bg-red-50 text-red-600 rounded-2xl text-sm font-semibold transition-all"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col h-full bg-white relative">
        <header className="h-16 flex items-center justify-center border-b border-gray-50">
          <h2 className="text-xl font-bold text-gray-800 italic">Vision Flow AI</h2>
        </header>

        <div className="flex-1 overflow-y-auto p-6 pb-40">
          <div className="max-w-4xl mx-auto">
            {!result && !preview ? (
              <div className="text-center mt-20">
                <div className="bg-blue-50 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <ImageIcon size={40} className="text-blue-600" />
                </div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Private Image Detection</h1>
                <p className="text-gray-500">Detections are only visible to you.</p>
              </div>
            ) : (
              <div className="space-y-8">
                {result && (
                  <div className="bg-white border border-gray-100 shadow-xl rounded-3xl overflow-hidden">
                    <div className="bg-slate-900 p-4 text-white flex justify-between items-center">
                      <h3 className="font-bold">Result: {result.detected}</h3>
                    </div>
                    <div className="p-8">
                      <p className="text-lg text-gray-700 leading-relaxed mb-8 border-l-4 border-blue-500 pl-4">{result.advice}</p>
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="flex flex-col gap-2">
                           <span className="text-xs font-bold text-gray-400">ORIGINAL IMAGE</span>
                           <img src={result.original_url} className="w-full rounded-2xl border shadow-sm" alt="Original" />
                        </div>
                        <div className="flex flex-col gap-2">
                           <span className="text-xs font-bold text-gray-400">AI HEATMAP</span>
                           <img src={result.heatmap_url} className="w-full rounded-2xl border shadow-sm" alt="Heatmap" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
                {preview && !result && (
                  <div className="max-w-md mx-auto bg-gray-50 p-6 rounded-3xl border-2 border-dashed border-gray-300">
                    <img src={preview} className="w-full h-64 object-cover rounded-2xl shadow-md mb-4" />
                    <button 
                      onClick={handleUpload}
                      className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2"
                    >
                      {loading ? <RefreshCcw className="animate-spin" /> : <Activity size={20} />}
                      {loading ? "Analyzing..." : "Analyze Image"}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-full max-w-2xl px-4">
          <div className="bg-white border-2 border-gray-100 rounded-3xl shadow-2xl p-3 flex items-center gap-4">
            <label className="p-3 bg-blue-50 text-blue-600 rounded-2xl cursor-pointer">
              <Upload size={24} />
              <input type="file" className="hidden" onChange={handleFileChange} />
            </label>
            <div className="flex-1">
              <p className="text-sm font-bold text-gray-700">{file ? file.name : "Select an image"}</p>
            </div>
            <button 
              onClick={handleUpload}
              disabled={!file || loading}
              className={`h-12 px-6 rounded-2xl font-bold ${file ? 'bg-blue-600 text-white' : 'bg-gray-100 text-gray-300'}`}
            >
              {loading ? "..." : "Detect"}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

export default Dashboard;