import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  Upload, 
  Mic, 
  Loader2, 
  ChefHat, 
  FileText, 
  BarChart3, 
  Printer, 
  Download, 
  ChevronDown,
  Globe
} from 'lucide-react';
import { analyzeProductProfile, analyzeProductInsights } from './services/geminiService';
import { ProductProfile, AnalysisResult, Language } from './types';
import { TRANSLATIONS } from './constants';
import { RadarChartComponent } from './components/RadarChartComponent';
import { CompetitorComparison } from './components/CompetitorComparison';

const App: React.FC = () => {
  const [input, setInput] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [language, setLanguage] = useState<Language>(Language.VN);
  
  // Split state for progressive loading
  const [profileData, setProfileData] = useState<ProductProfile | null>(null);
  const [insightsData, setInsightsData] = useState<Partial<AnalysisResult> | null>(null);
  const [allSources, setAllSources] = useState<string[]>([]);

  const [isAnalyzingProfile, setIsAnalyzingProfile] = useState(false);
  const [isAnalyzingInsights, setIsAnalyzingInsights] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const t = TRANSLATIONS[language];

  useEffect(() => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/sw.js')
          .then(registration => {
            console.log('SW registered: ', registration);
          })
          .catch(registrationError => {
            console.log('SW registration failed: ', registrationError);
          });
      }
  }, []);

  const handleAnalyze = async () => {
    if (!input && !file) return;
    
    // Reset State
    setIsAnalyzingProfile(true);
    setIsAnalyzingInsights(false);
    setError(null);
    setProfileData(null);
    setInsightsData(null);
    setAllSources([]);

    try {
      // Step 1: Analyze Profile (Fast)
      const { profile, sources: profileSources } = await analyzeProductProfile(input, file, language);
      setProfileData(profile);
      setAllSources(prev => [...prev, ...profileSources]);
      setIsAnalyzingProfile(false);

      // Step 2: Analyze Insights (Slower)
      setIsAnalyzingInsights(true);
      const insights = await analyzeProductInsights(input, file, profile, language);
      setInsightsData(insights);
      if (insights.sources) {
        setAllSources(prev => Array.from(new Set([...prev, ...insights.sources!])));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An unknown error occurred");
    } finally {
      setIsAnalyzingProfile(false);
      setIsAnalyzingInsights(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleReset = () => {
    setProfileData(null);
    setInsightsData(null);
    setInput('');
    setFile(null);
    setAllSources([]);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = () => {
    const element = document.getElementById('printable-report');
    if (!element) return;
    
    setIsGeneratingPdf(true);
    const opt = {
      margin: 10,
      filename: `SweetTech_Report_${new Date().toISOString().slice(0,10)}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // @ts-ignore
    html2pdf().set(opt).from(element).save().then(() => {
      setIsGeneratingPdf(false);
    });
  };

  const handleExportTxt = () => {
    if (!profileData) return;
    const fullData = { profile: profileData, ...insightsData, sources: allSources };
    const text = JSON.stringify(fullData, null, 2);
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'SweetTech_Data.txt';
    a.click();
  };

  // Combined Loading/Input state check
  const isIdle = !profileData && !isAnalyzingProfile;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30 no-print">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-pink-600 p-2 rounded-lg">
              <ChefHat className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">{t.title}</h1>
              <p className="text-xs text-gray-500">{t.subtitle}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <select 
              value={language} 
              onChange={(e) => setLanguage(e.target.value as Language)}
              className="text-sm border border-gray-300 rounded-md px-2 py-1 bg-gray-50 focus:ring-2 focus:ring-pink-500 outline-none"
            >
              <option value={Language.VN}>🇻🇳 VN</option>
              <option value={Language.EN}>🇺🇸 EN</option>
              <option value={Language.KR}>🇰🇷 KR</option>
            </select>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Input Section - Only show if no analysis started */}
        {isIdle && (
          <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-sm border border-gray-100 p-8 transition-all duration-500 ease-in-out">
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Start Your R&D Analysis</h2>
              <p className="text-gray-500">Upload a product image, label, or describe your idea.</p>
            </div>

            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={t.inputPlaceholder}
              className="w-full h-32 p-4 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all resize-none mb-4"
            />

            <div className="grid grid-cols-3 gap-4 mb-6">
              <label className="flex flex-col items-center justify-center p-4 rounded-xl border border-dashed border-gray-300 hover:bg-pink-50 hover:border-pink-300 cursor-pointer transition-all group">
                <Camera className="w-6 h-6 text-gray-400 group-hover:text-pink-500 mb-2" />
                <span className="text-xs font-medium text-gray-500 group-hover:text-pink-600">{t.cameraLabel}</span>
                <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileChange} />
              </label>
              
              <label className="flex flex-col items-center justify-center p-4 rounded-xl border border-dashed border-gray-300 hover:bg-pink-50 hover:border-pink-300 cursor-pointer transition-all group">
                <Upload className="w-6 h-6 text-gray-400 group-hover:text-pink-500 mb-2" />
                <span className="text-xs font-medium text-gray-500 group-hover:text-pink-600">{file && file.name ? file.name.slice(0,10) + '...' : t.uploadLabel}</span>
                <input type="file" accept="image/*,audio/*" className="hidden" onChange={handleFileChange} />
              </label>

              <button className="flex flex-col items-center justify-center p-4 rounded-xl border border-dashed border-gray-300 hover:bg-pink-50 hover:border-pink-300 cursor-pointer transition-all group">
                <Mic className="w-6 h-6 text-gray-400 group-hover:text-pink-500 mb-2" />
                <span className="text-xs font-medium text-gray-500 group-hover:text-pink-600">{t.voiceLabel}</span>
              </button>
            </div>

            <button 
              onClick={handleAnalyze}
              disabled={(!input && !file)}
              className="w-full py-4 bg-pink-600 hover:bg-pink-700 text-white rounded-xl font-bold text-lg shadow-lg shadow-pink-200 transform transition hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
            >
              {t.analyzeBtn}
            </button>
          </div>
        )}

        {/* Initial Loading State */}
        {isAnalyzingProfile && (
          <div className="max-w-2xl mx-auto text-center py-20">
            <div className="relative w-20 h-20 mx-auto mb-8">
              <div className="absolute inset-0 border-4 border-gray-100 rounded-full"></div>
              <div className="absolute inset-0 border-4 border-pink-500 border-t-transparent rounded-full animate-spin"></div>
              <ChefHat className="absolute inset-0 m-auto text-pink-500 w-8 h-8 animate-pulse" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">Scanning Product Profile...</h3>
            <p className="text-gray-500 animate-pulse">Identifying ingredients, origin, and specs...</p>
          </div>
        )}

        {/* Results View */}
        {(profileData) && (
          <div className="animate-fade-in">
            {/* Actions Bar */}
            <div className="flex flex-wrap justify-between items-center mb-6 no-print gap-4">
              <button 
                onClick={handleReset}
                className="text-gray-500 hover:text-gray-700 font-medium flex items-center gap-2"
              >
                ← New Analysis
              </button>
              <div className="flex gap-3">
                <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 shadow-sm">
                  <Printer className="w-4 h-4" /> {t.printBtn}
                </button>
                <button onClick={handleDownloadPdf} disabled={isGeneratingPdf} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 shadow-sm">
                  {isGeneratingPdf ? <Loader2 className="w-4 h-4 animate-spin"/> : <Download className="w-4 h-4" />} 
                  {isGeneratingPdf ? t.generatingPdf : t.exportPdfBtn}
                </button>
                <button onClick={handleExportTxt} className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50 shadow-sm">
                  <FileText className="w-4 h-4" /> {t.exportTxtBtn}
                </button>
              </div>
            </div>

            <div id="printable-report" className="space-y-6 pb-20">
              
              {/* 1. Product Profile Header (Immediate) */}
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 printable-section relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-pink-50 rounded-bl-full -mr-10 -mt-10 opacity-50"></div>
                <div className="flex flex-col md:flex-row gap-8 relative z-10">
                   <div className="flex-1">
                      <span className="inline-block px-3 py-1 bg-pink-100 text-pink-700 text-xs font-bold rounded-full mb-3 uppercase tracking-wide">
                        {profileData.type}
                      </span>
                      <h2 className="text-3xl font-bold text-gray-900 mb-2">{profileData.name}</h2>
                      <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-6">
                        <span className="flex items-center gap-1">🏢 {profileData.brand}</span>
                        <span className="flex items-center gap-1">⚖️ {profileData.netWeight}</span>
                        <span className="flex items-center gap-1">🌍 {profileData.origin}</span>
                        <span className="flex items-center gap-1">💰 {profileData.price}</span>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-gray-50 p-4 rounded-xl">
                          <h4 className="font-semibold text-gray-800 mb-2 text-sm uppercase flex items-center gap-2">
                            <ChefHat className="w-4 h-4 text-pink-500" /> {t.sections.ingredients}
                          </h4>
                          <p className="text-sm text-gray-600 leading-relaxed mb-3">{profileData.labelIngredients}</p>
                          
                          {profileData.additives.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <span className="text-xs font-bold text-gray-700 block mb-1">{t.sections.additives}:</span>
                              <div className="flex flex-wrap gap-2">
                                {profileData.additives.map((add, i) => (
                                  <span key={i} className="px-2 py-1 bg-white border border-gray-200 rounded text-xs text-gray-600" title={add.function}>
                                    {add.code}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>

                        <div className="space-y-4">
                          <div className="bg-pink-50/50 p-4 rounded-xl border border-pink-100">
                             <h4 className="font-semibold text-gray-800 mb-2 text-sm uppercase">{t.sections.specs}</h4>
                             <div className="grid grid-cols-2 gap-y-2 text-sm">
                                <div className="text-gray-500">Moisture:</div>
                                <div className="font-medium">{profileData.specs.moisture || "N/A"}</div>
                                <div className="text-gray-500">Brix:</div>
                                <div className="font-medium">{profileData.specs.brix || "N/A"}</div>
                                <div className="text-gray-500">Texture:</div>
                                <div className="font-medium">{profileData.specs.texture || "N/A"}</div>
                             </div>
                          </div>
                          {profileData.allergens && profileData.allergens.length > 0 && (
                            <div className="p-4 rounded-xl border border-red-100 bg-red-50">
                              <h4 className="font-bold text-red-700 mb-1 text-xs uppercase">{t.sections.allergens}</h4>
                              <p className="text-sm text-red-600">{profileData.allergens.join(', ')}</p>
                            </div>
                          )}
                        </div>
                      </div>
                   </div>
                </div>
              </div>

              {/* Secondary Loading State for Insights */}
              {isAnalyzingInsights && (
                <div className="py-12 flex flex-col items-center justify-center text-center border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
                   <Loader2 className="w-8 h-8 text-pink-500 animate-spin mb-3" />
                   <p className="text-sm font-medium text-gray-600">Generating Market Insights & Competitor Analysis...</p>
                   <p className="text-xs text-gray-400 mt-1">Researching real prices and reviews</p>
                </div>
              )}

              {/* Insights Content (Deferred) */}
              {insightsData && insightsData.competitors && (
                <>
                  {/* 2. Radar Chart & Benchmarking */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 printable-section animate-fade-in">
                    <div className="lg:col-span-1">
                      {insightsData.radarChart && <RadarChartComponent data={insightsData.radarChart} />}
                    </div>
                    <div className="lg:col-span-2">
                      <CompetitorComparison profile={profileData} competitors={insightsData.competitors} language={language} />
                    </div>
                  </div>

                  {/* 3. Insights & SWOT */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 printable-section page-break-before animate-fade-in">
                    {insightsData.swot && (
                      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                          <BarChart3 className="w-5 h-5 text-pink-600" /> SWOT Analysis
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="bg-green-50 p-3 rounded-lg">
                            <span className="block text-xs font-bold text-green-700 uppercase mb-1">Strengths</span>
                            <ul className="text-xs text-green-800 list-disc list-inside">{insightsData.swot.strengths?.map((s,i)=><li key={i}>{s}</li>)}</ul>
                          </div>
                          <div className="bg-red-50 p-3 rounded-lg">
                            <span className="block text-xs font-bold text-red-700 uppercase mb-1">Weaknesses</span>
                            <ul className="text-xs text-red-800 list-disc list-inside">{insightsData.swot.weaknesses?.map((s,i)=><li key={i}>{s}</li>)}</ul>
                          </div>
                          <div className="bg-blue-50 p-3 rounded-lg">
                            <span className="block text-xs font-bold text-blue-700 uppercase mb-1">Opportunities</span>
                            <ul className="text-xs text-blue-800 list-disc list-inside">{insightsData.swot.opportunities?.map((s,i)=><li key={i}>{s}</li>)}</ul>
                          </div>
                          <div className="bg-yellow-50 p-3 rounded-lg">
                            <span className="block text-xs font-bold text-yellow-700 uppercase mb-1">Threats</span>
                            <ul className="text-xs text-yellow-800 list-disc list-inside">{insightsData.swot.threats?.map((s,i)=><li key={i}>{s}</li>)}</ul>
                          </div>
                        </div>
                      </div>
                    )}

                    {insightsData.improvements && (
                      <div className="bg-gradient-to-br from-pink-600 to-purple-700 rounded-xl shadow-lg p-6 text-white">
                        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                          <ChefHat className="w-5 h-5" /> R&D Improvements
                        </h3>
                        <div className="space-y-4">
                          {insightsData.improvements.map((item, idx) => (
                            <div key={idx} className="bg-white/10 backdrop-blur-sm p-3 rounded-lg border border-white/20">
                              <h4 className="font-bold text-sm mb-1 text-pink-100">{item.title}</h4>
                              <p className="text-xs text-pink-50 leading-relaxed opacity-90">{item.description}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 4. Reviews & Persona */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 printable-section animate-fade-in">
                    {insightsData.reviews && (
                      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Customer Voice</h3>
                        <div className="mb-4">
                          <p className="text-sm text-gray-600 italic">"{insightsData.reviews.summary}"</p>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-4">
                          {insightsData.reviews.keyThemes?.map((theme, i) => (
                            <span key={i} className="px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-600">#{theme}</span>
                          ))}
                        </div>
                        <div className="space-y-3">
                          {(insightsData.reviews.items || []).slice(0, 2).map((review, i) => (
                            <div key={i} className="border-l-2 border-pink-300 pl-3">
                              <div className="flex justify-between items-center mb-1">
                                <span className="text-xs font-bold text-gray-700">{review.source}</span>
                                <div className="flex text-yellow-400 text-xs">{"★".repeat(review.rating)}</div>
                              </div>
                              <p className="text-xs text-gray-500 line-clamp-2">{review.content}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {insightsData.persona && (
                      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                        <h3 className="text-lg font-bold text-gray-800 mb-4">Persona & Expansion</h3>
                        <div className="mb-6">
                            <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Current Target</h4>
                            <p className="text-sm text-gray-700">{insightsData.persona.targetAudience}</p>
                        </div>
                        <div>
                            <h4 className="text-xs font-bold text-gray-500 uppercase mb-2">Expansion Opportunities</h4>
                            <ul className="space-y-2">
                              {insightsData.persona.expansionPotential?.map((ex, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-gray-600">
                                  <span className="text-pink-500 mt-1">→</span> {ex}
                                </li>
                              ))}
                            </ul>
                        </div>
                      </div>
                    )}
                  </div>
                </>
              )}
              
              {/* Collapsible Sources Footer */}
              {allSources.length > 0 && (
                 <details className="mt-8 border-t border-gray-100 pt-4 printable-section group bg-white p-4 rounded-lg shadow-sm">
                    <summary className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-gray-500 list-none hover:text-pink-600 transition-colors">
                      <Globe className="w-4 h-4" />
                      Data Sources ({allSources.length})
                      <ChevronDown className="w-4 h-4 transition-transform duration-300 group-open:rotate-180 ml-auto" />
                    </summary>
                    <div className="mt-3 pl-6 transition-all duration-500 ease-in-out">
                      <ul className="list-disc space-y-2 text-xs text-gray-400">
                        {allSources.map((s, i) => (
                          <li key={i} className="truncate">
                            <a href={s} target="_blank" rel="noreferrer" className="hover:underline hover:text-pink-500 transition-colors">{s}</a>
                          </li>
                        ))}
                      </ul>
                    </div>
                 </details>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;