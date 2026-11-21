import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Upload,
  FileText,
  Image as ImageIcon,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  Trash2,
  Edit2,
  Save,
  Globe,
  Plus,
  RefreshCw,
  ShieldCheck,
  FileCheck,
} from 'lucide-react';
import { aiImportApi, timetablesApi } from '../../services/api';
import { ExtractedTimetableItem } from '../../services/api';
import { useData } from '../../context/DataContext';
import { BusType } from '../../types';

export const AdminAIImportPage: React.FC = () => {
  const navigate = useNavigate();
  const { notifyChange } = useData();

  const [inputMode, setInputMode] = useState<'sample' | 'upload' | 'text'>('sample');
  const [selectedSample, setSelectedSample] = useState<string>('kumta-board');
  const [customText, setCustomText] = useState<string>(
    `Kumta to Karwar | 07:15 AM | Karnataka Sarige | 08:55 AM
Kumta to Sirsi | 09:30 AM | NWKRTC Express | 11:15 AM
Kumta to Gokarna | 11:00 AM | Gramina Sarige | 11:45 AM
Kumta to Hubballi | 01:30 PM | Rajahamsa Executive | 05:00 PM`
  );
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState<boolean>(false);
  const [extractionResult, setExtractionResult] = useState<{
    sourceName: string;
    extractedCount: number;
    items: ExtractedTimetableItem[];
    confidence: number;
  } | null>(null);

  const [editableRows, setEditableRows] = useState<ExtractedTimetableItem[]>([]);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccessMessage, setSaveSuccessMessage] = useState<string | null>(null);

  const busTypesList: BusType[] = [
    'Karnataka Sarige',
    'NWKRTC Express',
    'Gramina Sarige',
    'Rajahamsa Executive',
    'Suvarna Sarige',
    'Kalyana Ratha',
    'Non-AC Sleeper',
    'Other',
  ];

  const sampleOptions = [
    {
      id: 'kumta-board',
      title: 'Kumta Central Bus Stand Notice Board',
      desc: 'Coastal express & inter-district departures (6 schedules)',
    },
    {
      id: 'sirsi-board',
      title: 'Sirsi Division Ghat Corridor Board',
      desc: 'Hubballi, Kumta and Bengaluru route timings (4 schedules)',
    },
    {
      id: 'karwar-board',
      title: 'Karwar Main Bus Station Timetable',
      desc: 'Belagavi, Ankola and Dandeli express timings (4 schedules)',
    },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadedFileName(file.name);
    }
  };

  const handleStartExtraction = async () => {
    try {
      setIsExtracting(true);
      setSaveSuccessMessage(null);

      let payload: any = {};
      if (inputMode === 'sample') {
        payload = { sampleId: selectedSample };
      } else if (inputMode === 'upload') {
        payload = { fileName: uploadedFileName || 'Uploaded_Timetable_Board.png' };
      } else {
        payload = { text: customText };
      }

      const res = await aiImportApi.extractTimetable(payload);
      setExtractionResult(res);
      setEditableRows(res.items);
    } catch (err) {
      console.error('AI extraction error:', err);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleRowChange = (index: number, field: keyof ExtractedTimetableItem, val: string) => {
    const updated = [...editableRows];
    updated[index] = { ...updated[index], [field]: val };
    setEditableRows(updated);
  };

  const handleDeleteRow = (index: number) => {
    setEditableRows(editableRows.filter((_, i) => i !== index));
  };

  const handleAddRow = () => {
    setEditableRows([
      ...editableRows,
      {
        fromStandName: 'Kumta',
        toStandName: 'Karwar',
        busName: 'Karnataka Sarige',
        busType: 'Karnataka Sarige',
        departureTime: '08:00 AM',
        arrivalTime: '09:45 AM',
        frequency: 'Daily',
      },
    ]);
  };

  const handleSaveToDatabase = async (status: 'Published' | 'Draft') => {
    if (editableRows.length === 0) return;

    try {
      setIsSaving(true);
      await timetablesApi.batchCreate(
        editableRows.map((r) => ({
          fromStandName: r.fromStandName,
          toStandName: r.toStandName,
          busName: r.busName || r.busType,
          busType: r.busType,
          departureTime: r.departureTime,
          arrivalTime: r.arrivalTime,
          status: status,
        }))
      );

      notifyChange();
      setSaveSuccessMessage(
        status === 'Published'
          ? `Successfully published ${editableRows.length} timetables directly to the Client App!`
          : `Saved ${editableRows.length} timetables as Drafts in the database.`
      );
      setEditableRows([]);
      setExtractionResult(null);
    } catch (err) {
      console.error('Failed to save batch timetables:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Notice */}
      <div className="bg-gradient-to-r from-amber-600 to-amber-800 rounded-2xl p-6 text-white shadow-md">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 bg-white/20 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full backdrop-blur-xs mb-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-200" />
              <span>AI TIMETABLE EXTRACTION (GEMINI 2.5 FLASH)</span>
            </div>
            <h2 className="text-xl font-extrabold tracking-tight">
              Scan & Import Timetables from Boards or Documents
            </h2>
            <p className="text-xs text-amber-100 max-w-2xl mt-1">
              Upload bus stand notice board photos, PDFs or paste schedule text. The backend AI extracts structured timings for Admin review before publishing to the passenger app.
            </p>
          </div>

          <div className="bg-amber-950/40 border border-amber-400/30 rounded-xl p-3 text-xs text-amber-100 max-w-xs shrink-0">
            <div className="flex items-center gap-1.5 font-bold text-white mb-0.5">
              <ShieldCheck className="w-4 h-4 text-emerald-300" />
              <span>Safe Review Workflow</span>
            </div>
            <p className="text-[10px] text-amber-200 leading-tight">
              AI extracted data is NOT made public immediately. You can review, edit departure times, and choose Draft or Publish.
            </p>
          </div>
        </div>
      </div>

      {/* Success Banner */}
      {saveSuccessMessage && (
        <div className="bg-emerald-600 text-white p-4 rounded-2xl shadow-md flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 shrink-0" />
            <span className="text-xs font-bold leading-relaxed">{saveSuccessMessage}</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/admin/timetables')}
              className="px-3 py-1 bg-white text-emerald-800 font-bold rounded-lg text-xs"
            >
              View Timetables
            </button>
            <button
              onClick={() => setSaveSuccessMessage(null)}
              className="text-white/80 hover:text-white text-xs px-2 py-1"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Step 1: Input Source Selector */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-red-600 text-white text-xs font-bold flex items-center justify-center">
              1
            </span>
            <h3 className="text-sm font-extrabold text-slate-900">
              Select Timetable Source
            </h3>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
            <button
              onClick={() => setInputMode('sample')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                inputMode === 'sample'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Preset Samples
            </button>
            <button
              onClick={() => setInputMode('upload')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                inputMode === 'upload'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Upload Image/PDF
            </button>
            <button
              onClick={() => setInputMode('text')}
              className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                inputMode === 'text'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              Paste Text
            </button>
          </div>
        </div>

        {/* Option A: Preset Samples */}
        {inputMode === 'sample' && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {sampleOptions.map((opt) => (
              <div
                key={opt.id}
                onClick={() => setSelectedSample(opt.id)}
                className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
                  selectedSample === opt.id
                    ? 'border-red-600 bg-red-50/40 shadow-xs'
                    : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-bold text-slate-900">{opt.title}</span>
                  {selectedSample === opt.id && (
                    <CheckCircle2 className="w-4 h-4 text-red-600" />
                  )}
                </div>
                <p className="text-[11px] text-slate-500">{opt.desc}</p>
              </div>
            ))}
          </div>
        )}

        {/* Option B: Upload File */}
        {inputMode === 'upload' && (
          <div className="border-2 border-dashed border-slate-300 hover:border-red-500 rounded-2xl p-6 text-center bg-slate-50/50 transition-colors">
            <input
              type="file"
              id="file-upload-input"
              accept="image/*,application/pdf"
              onChange={handleFileUpload}
              className="hidden"
            />
            <label htmlFor="file-upload-input" className="cursor-pointer space-y-2 block">
              <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
                <Upload className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">
                  {uploadedFileName ? uploadedFileName : 'Click to select Timetable Image or PDF'}
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Supports PNG, JPG, WEBP, PDF (Bus stand notice boards, official sheets)
                </p>
              </div>
            </label>
          </div>
        )}

        {/* Option C: Paste Text */}
        {inputMode === 'text' && (
          <div>
            <textarea
              rows={4}
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              placeholder="Paste schedule lines (e.g. Kumta to Karwar 07:30 AM Karnataka Sarige)..."
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-red-500 resize-none"
            />
          </div>
        )}

        {/* Extract Trigger */}
        <div className="pt-2 flex justify-end">
          <button
            onClick={handleStartExtraction}
            disabled={isExtracting}
            className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white rounded-xl text-xs font-bold shadow-md shadow-red-600/20 transition-all flex items-center gap-2 cursor-pointer"
          >
            {isExtracting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
                <span>AI Processing with Gemini...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-amber-300" />
                <span>Run AI Timetable Extraction</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Step 2: Editable Review Table */}
      {editableRows.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden space-y-4 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-100 gap-2">
            <div className="flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">
                2
              </span>
              <div>
                <h3 className="text-sm font-extrabold text-slate-900">
                  Review & Edit Extracted Timetables ({editableRows.length})
                </h3>
                <p className="text-xs text-slate-500">
                  Verify departure times and stations before pushing to backend
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleAddRow}
                className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add Row</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-bold uppercase tracking-wider text-[10px]">
                  <th className="py-2.5 px-3">From Stand</th>
                  <th className="py-2.5 px-3">To Stand</th>
                  <th className="py-2.5 px-3">Departure Time</th>
                  <th className="py-2.5 px-3">Arrival (Est.)</th>
                  <th className="py-2.5 px-3">Bus Type</th>
                  <th className="py-2.5 px-3 text-right">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {editableRows.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-2.5 px-3">
                      <input
                        type="text"
                        value={row.fromStandName}
                        onChange={(e) => handleRowChange(idx, 'fromStandName', e.target.value)}
                        className="w-28 px-2 py-1 bg-white border border-slate-200 rounded font-semibold text-xs text-slate-800"
                      />
                    </td>
                    <td className="py-2.5 px-3">
                      <input
                        type="text"
                        value={row.toStandName}
                        onChange={(e) => handleRowChange(idx, 'toStandName', e.target.value)}
                        className="w-28 px-2 py-1 bg-white border border-slate-200 rounded font-semibold text-xs text-slate-800"
                      />
                    </td>
                    <td className="py-2.5 px-3">
                      <input
                        type="text"
                        value={row.departureTime}
                        onChange={(e) => handleRowChange(idx, 'departureTime', e.target.value)}
                        className="w-24 px-2 py-1 bg-white border border-slate-200 rounded font-mono font-bold text-xs text-slate-900"
                      />
                    </td>
                    <td className="py-2.5 px-3">
                      <input
                        type="text"
                        value={row.arrivalTime || ''}
                        onChange={(e) => handleRowChange(idx, 'arrivalTime', e.target.value)}
                        className="w-24 px-2 py-1 bg-white border border-slate-200 rounded font-mono text-xs text-slate-600"
                      />
                    </td>
                    <td className="py-2.5 px-3">
                      <select
                        value={row.busType}
                        onChange={(e) => handleRowChange(idx, 'busType', e.target.value as any)}
                        className="px-2 py-1 bg-white border border-slate-200 rounded text-xs font-semibold text-slate-800"
                      >
                        {busTypesList.map((t) => (
                          <option key={t} value={t}>
                            {t}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={() => handleDeleteRow(idx)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded hover:bg-rose-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Action Bar */}
          <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-slate-500 font-medium">
              Ready to store in database? Choose Draft (internal) or Publish (live).
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleSaveToDatabase('Draft')}
                disabled={isSaving}
                className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save as Drafts</span>
              </button>

              <button
                type="button"
                onClick={() => handleSaveToDatabase('Published')}
                disabled={isSaving}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <Globe className="w-3.5 h-3.5" />
                <span>Publish All to Passenger App</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
