import React, { useState, useEffect } from 'react';
import { AlertCircle, Heart, Phone, Pill, Zap, Lock, CheckCircle, Shield, User, Calendar } from 'lucide-react';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

function App() {
  const [patients, setPatients] = useState([]);
  const [accessedPatient, setAccessedPatient] = useState(null);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [showAISuggestions, setShowAISuggestions] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAllPatients();
  }, []);

  const fetchAllPatients = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/patients`);
      setPatients(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load patients. Make sure backend is running.');
      console.error('Error fetching patients:', err);
    } finally {
      setLoading(false);
    }
  };

  const simulateNFCTap = async (nfcId) => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/patients/nfc/${nfcId}`);
      setAccessedPatient(response.data);
      setShowAISuggestions(false);
      setAiSuggestions([]);
      setError(null);
    } catch (err) {
      setError('Failed to access patient data');
      console.error('Error fetching patient:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAISuggestions = async () => {
    if (!accessedPatient) return;

    try {
      setLoading(true);
      const response = await axios.get(`${API_BASE_URL}/patients/${accessedPatient.nfcId}/ai-suggestions`);
      setAiSuggestions(response.data.suggestions);
      setShowAISuggestions(true);
      setError(null);
    } catch (err) {
      setError('Failed to load AI suggestions');
      console.error('Error fetching AI suggestions:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleAISuggestions = () => {
    if (!showAISuggestions && aiSuggestions.length === 0) {
      fetchAISuggestions();
    } else {
      setShowAISuggestions(!showAISuggestions);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <div className="border-b border-slate-700 bg-slate-800/50 backdrop-blur-sm sticky top-0 z-20">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">Emergency Health Access System</h1>
              <p className="text-slate-400 text-sm">NFC-Based Patient Data Portal for First Responders</p>
            </div>
            <div className="ml-auto flex items-center gap-2 px-4 py-2 bg-slate-700/50 rounded-lg border border-slate-600">
              <Shield className="w-4 h-4 text-emerald-400" />
              <span className="text-slate-300 text-sm font-medium">Encrypted Access</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {error && (
          <div className="mb-6 bg-red-900/20 border border-red-500/50 rounded-lg p-4 text-red-300">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar - NFC Simulation */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-5">
                <h2 className="text-white font-bold text-lg mb-1 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-400" />
                  NFC Reader
                </h2>
                <p className="text-slate-400 text-xs mb-4">Tap card to access patient data</p>
                {loading && patients.length === 0 ? (
                  <div className="text-slate-400 text-sm">Loading patients...</div>
                ) : (
                  <div className="space-y-2">
                    {patients.map((patient) => (
                      <button
                        key={patient.id}
                        onClick={() => simulateNFCTap(patient.nfcId)}
                        disabled={loading}
                        className={`w-full p-3 rounded-lg font-semibold transition-all duration-200 text-left border ${accessedPatient?.id === patient.id
                            ? 'bg-emerald-500 text-white border-emerald-400 shadow-lg shadow-emerald-500/20'
                            : 'bg-slate-700 text-slate-200 border-slate-600 hover:bg-slate-600 hover:border-slate-500'
                          } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <div className="font-bold text-sm">{patient.name}</div>
                        <div className="text-xs opacity-75">{patient.nfcId}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="bg-slate-800 border border-slate-700 rounded-xl p-4">
                <div className="flex items-center gap-2 text-slate-300 text-xs">
                  <Lock className="w-4 h-4 text-emerald-400" />
                  <span>All access logged & encrypted</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {!accessedPatient ? (
              <div className="bg-slate-800 border border-slate-700 rounded-xl p-12 text-center">
                <div className="bg-slate-700/50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                  <AlertCircle className="w-10 h-10 text-slate-500" />
                </div>
                <h3 className="text-xl font-semibold text-slate-200 mb-2">No Patient Data</h3>
                <p className="text-slate-400">Select a patient from the NFC reader to view emergency health information</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Patient Header Card */}
                <div className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-xl p-6 border border-emerald-500/50 shadow-xl">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 bg-white/10 rounded-lg flex items-center justify-center border border-white/20">
                        <User className="w-8 h-8 text-white" />
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold text-white">{accessedPatient.name}</h2>
                        <div className="flex gap-4 mt-2 text-emerald-100">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            Age: {accessedPatient.age}
                          </span>
                          <span>ID: {accessedPatient.nfcId}</span>
                        </div>
                      </div>
                    </div>
                    <div className="bg-white text-emerald-700 px-6 py-3 rounded-lg font-bold text-3xl shadow-lg">
                      {accessedPatient.bloodGroup}
                    </div>
                  </div>
                </div>

                {/* Critical Information Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Allergies */}
                  <div className="bg-slate-800 border border-red-500/30 rounded-xl p-5 hover:border-red-500/50 transition-colors">
                    <h3 className="font-bold text-red-400 mb-4 flex items-center gap-2 text-sm uppercase tracking-wide">
                      <AlertCircle className="w-5 h-5" />
                      Allergies
                    </h3>
                    <div className="space-y-2">
                      {accessedPatient.allergies?.map((allergy, idx) => (
                        <div key={idx} className="bg-red-500/10 border border-red-500/20 px-3 py-2 rounded-lg text-red-300 font-semibold text-sm">
                          {allergy}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Medical Conditions */}
                  <div className="bg-slate-800 border border-blue-500/30 rounded-xl p-5 hover:border-blue-500/50 transition-colors">
                    <h3 className="font-bold text-blue-400 mb-4 flex items-center gap-2 text-sm uppercase tracking-wide">
                      <Heart className="w-5 h-5" />
                      Medical Conditions
                    </h3>
                    <div className="space-y-2">
                      {accessedPatient.medicalConditions?.map((condition, idx) => (
                        <div key={idx} className="bg-blue-500/10 border border-blue-500/20 px-3 py-2 rounded-lg text-blue-300 font-semibold text-sm">
                          {condition}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Medications */}
                <div className="bg-slate-800 border border-purple-500/30 rounded-xl p-5 hover:border-purple-500/50 transition-colors">
                  <h3 className="font-bold text-purple-400 mb-4 flex items-center gap-2 text-sm uppercase tracking-wide">
                    <Pill className="w-5 h-5" />
                    Current Medications
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {accessedPatient.currentMedications?.map((med, idx) => (
                      <div key={idx} className="bg-slate-700 border border-purple-500/20 px-4 py-3 rounded-lg text-purple-200 font-semibold text-sm">
                        {med}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Insurance */}
                {accessedPatient.insurance && (
                  <div className="bg-slate-800 border border-cyan-500/30 rounded-xl p-5 hover:border-cyan-500/50 transition-colors">
                    <h3 className="font-bold text-cyan-400 mb-4 flex items-center gap-2 text-sm uppercase tracking-wide">
                      <Shield className="w-5 h-5" />
                      Insurance Information
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="bg-slate-700/50 border border-slate-600 px-4 py-3 rounded-lg">
                        <div className="text-cyan-400 text-xs font-semibold mb-1">Provider</div>
                        <div className="text-slate-200 font-bold text-sm">{accessedPatient.insurance.provider}</div>
                      </div>
                      <div className="bg-slate-700/50 border border-slate-600 px-4 py-3 rounded-lg">
                        <div className="text-cyan-400 text-xs font-semibold mb-1">Coverage</div>
                        <div className="text-slate-200 font-bold text-sm">{accessedPatient.insurance.coverage}</div>
                      </div>
                      <div className="bg-slate-700/50 border border-slate-600 px-4 py-3 rounded-lg">
                        <div className="text-cyan-400 text-xs font-semibold mb-1">Policy #</div>
                        <div className="text-slate-200 font-mono font-bold text-xs">{accessedPatient.insurance.policyNumber}</div>
                      </div>
                      <div className="bg-slate-700/50 border border-slate-600 px-4 py-3 rounded-lg">
                        <div className="text-cyan-400 text-xs font-semibold mb-1">Group #</div>
                        <div className="text-slate-200 font-mono font-bold text-xs">{accessedPatient.insurance.groupNumber}</div>
                      </div>
                    </div>
                  </div>
                )}

                {/* Emergency Contacts */}
                <div className="bg-slate-800 border border-emerald-500/30 rounded-xl p-5 hover:border-emerald-500/50 transition-colors">
                  <h3 className="font-bold text-emerald-400 mb-4 flex items-center gap-2 text-sm uppercase tracking-wide">
                    <Phone className="w-5 h-5" />
                    Emergency Contacts
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {accessedPatient.emergencyContacts?.map((contact, idx) => (
                      <div key={idx} className="bg-slate-700/50 border border-slate-600 px-4 py-3 rounded-lg">
                        <div className="text-slate-300 font-semibold text-sm">{contact.name}</div>
                        <div className="text-slate-400 text-xs mb-2">{contact.relation}</div>
                        <div className="text-emerald-400 font-mono font-bold text-sm">{contact.phone}</div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Suggestions Button */}
                <button
                  onClick={toggleAISuggestions}
                  disabled={loading}
                  className={`w-full font-bold py-3 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 border ${showAISuggestions
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 border-indigo-500 text-white shadow-lg'
                      : 'bg-slate-800 border-slate-700 text-slate-200 hover:bg-slate-700 hover:border-slate-600'
                    } ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Zap className="w-5 h-5" />
                  {loading ? 'Loading...' : showAISuggestions ? 'Hide' : 'Show'} AI Clinical Suggestions
                </button>

                {/* AI Suggestions */}
                {showAISuggestions && aiSuggestions.length > 0 && (
                  <div className="bg-gradient-to-br from-slate-800 to-slate-800/50 border border-indigo-500/50 rounded-xl p-5 shadow-xl">
                    <h3 className="font-bold text-indigo-400 mb-4 flex items-center gap-2 text-sm uppercase tracking-wide">
                      <Zap className="w-5 h-5" />
                      AI-Powered Clinical Suggestions
                    </h3>
                    <div className="space-y-3">
                      {aiSuggestions.map((suggestion, idx) => (
                        <div key={idx} className="bg-slate-700/50 border border-slate-600 px-4 py-3 rounded-lg flex items-start gap-3">
                          <span className="flex-shrink-0 mt-0.5">
                            {suggestion.includes('✓') ? (
                              <CheckCircle className="w-5 h-5 text-emerald-400" />
                            ) : (
                              <AlertCircle className="w-5 h-5 text-amber-400" />
                            )}
                          </span>
                          <span className="text-slate-200 text-sm">{suggestion.replace('⚠️ ', '').replace('✓ ', '')}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Last Checkup Footer */}
                {accessedPatient.lastCheckup && (
                  <div className="bg-slate-800 border border-slate-700 rounded-xl p-4 flex items-center justify-between">
                    <span className="text-slate-400 text-sm">Last Medical Checkup</span>
                    <span className="text-slate-200 font-bold text-sm">{accessedPatient.lastCheckup}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;