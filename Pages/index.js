import { useState, useCallback } from 'react';
import Head from 'next/head';

// API Configuration - Deine Backend-URL
const API_BASE_URL = 'https://api.archaeofinder.de';

const epochs = [
  "Alle Epochen",
  "Steinzeit (bis 2200 v. Chr.)",
  "Bronzezeit (2200-800 v. Chr.)",
  "Eisenzeit (800 v. Chr. - 0)",
  "Römische Kaiserzeit (0-400 n. Chr.)",
  "Frühmittelalter (400-1000 n. Chr.)",
  "Hochmittelalter (1000-1300 n. Chr.)",
  "Spätmittelalter (1300-1500 n. Chr.)"
];

const objectTypes = [
  "Alle Objekttypen",
  "Fibeln & Gewandnadeln",
  "Münzen",
  "Keramik & Gefäße",
  "Waffen & Werkzeuge",
  "Schmuck & Zierrat",
  "Kultgegenstände",
  "Alltagsgegenstände"
];

const regions = [
  "Alle Regionen",
  "Mitteleuropa",
  "Nordeuropa",
  "Südeuropa",
  "Westeuropa",
  "Osteuropa",
  "Mittelmeerraum",
  "Naher Osten"
];

export default function Home() {
  const [uploadedImage, setUploadedImage] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [results, setResults] = useState([]);
  const [totalResults, setTotalResults] = useState(0);
  const [error, setError] = useState(null);
  const [searchMode, setSearchMode] = useState('hybrid');
  const [searchKeywords, setSearchKeywords] = useState('');
  const [filters, setFilters] = useState({
    epoch: "Alle Epochen",
    objectType: "Alle Objekttypen",
    region: "Alle Regionen"
  });

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleFileInput = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setError(null);
    setResults([]);

    try {
      const params = new URLSearchParams();
      
      if (searchKeywords.trim()) {
        params.append('q', searchKeywords.trim());
      }
      
      if (filters.epoch !== "Alle Epochen") {
        params.append('epoch', filters.epoch);
      }
      if (filters.objectType !== "Alle Objekttypen") {
        params.append('object_type', filters.objectType);
      }
      if (filters.region !== "Alle Regionen") {
        params.append('region', filters.region);
      }
      
      params.append('limit', '20');

      const response = await fetch(`${API_BASE_URL}/api/search?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`Serverfehler: ${response.status}`);
      }

      const data = await response.json();
      
      setResults(data.results || []);
      setTotalResults(data.total_results || 0);
      setShowResults(true);

    } catch (err) {
      console.error('Search error:', err);
      setError(`Fehler bei der Suche: ${err.message}`);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetSearch = () => {
    setUploadedImage(null);
    setShowResults(false);
    setResults([]);
    setError(null);
    setSearchKeywords('');
    setFilters({
      epoch: "Alle Epochen",
      objectType: "Alle Objekttypen",
      region: "Alle Regionen"
    });
  };

  return (
    <>
      <Head>
        <title>ArchaeoFinder - Archäologische Funde identifizieren</title>
        <meta name="description" content="Laden Sie ein Foto Ihres archäologischen Fundobjekts hoch und finden Sie ähnliche Artefakte aus verifizierten Museumssammlungen weltweit." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="relative z-10 min-h-screen">
        {/* Header */}
        <header className="px-8 py-6 flex justify-between items-center border-b border-amber-900/20">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-700 rounded-xl flex items-center justify-center text-2xl">
              🏺
            </div>
            <span className="font-serif text-2xl font-semibold text-amber-500">ArchaeoFinder</span>
          </div>
          <nav className="flex gap-8">
            <a href="#" className="text-amber-100/60 hover:text-amber-500 transition-colors">Suche</a>
            <a href="#" className="text-amber-100/60 hover:text-amber-500 transition-colors">Sammlungen</a>
            <a href="#" className="text-amber-100/60 hover:text-amber-500 transition-colors">Über uns</a>
            <a href={`${API_BASE_URL}/docs`} target="_blank" rel="noopener noreferrer" className="text-amber-100/60 hover:text-amber-500 transition-colors">API</a>
          </nav>
        </header>

        {/* Hero */}
        <section className="text-center py-12 px-8 max-w-4xl mx-auto">
          <h1 className="font-serif text-5xl font-bold mb-6 bg-gradient-to-r from-amber-100 via-amber-400 to-amber-100 bg-clip-text text-transparent">
            Entdecken Sie die Geschichte Ihres Fundes
          </h1>
          <p className="text-xl text-amber-100/60 leading-relaxed max-w-2xl mx-auto">
            Laden Sie ein Foto Ihres archäologischen Fundobjekts hoch und finden Sie 
            ähnliche Artefakte aus verifizierten Museumssammlungen weltweit.
          </p>
        </section>

        {/* Main Content */}
        <main className="px-8 pb-16 max-w-6xl mx-auto">
          {/* Search Mode Selector */}
          <div className="flex justify-center gap-4 mb-8">
            {[
              { id: 'visual', label: '🔍 Nur visuelle Suche' },
              { id: 'hybrid', label: '⚡ Hybrid (empfohlen)' },
              { id: 'manual', label: '📋 Nur Filtersuche' }
            ].map(mode => (
              <button
                key={mode.id}
                onClick={() => setSearchMode(mode.id)}
                className={`px-5 py-3 rounded-lg border transition-all ${
                  searchMode === mode.id
                    ? 'bg-amber-500/20 border-amber-500 text-amber-500'
                    : 'bg-amber-100/5 border-amber-100/20 text-amber-100/60 hover:border-amber-100/40'
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6 text-red-300">
              ⚠️ {error}
            </div>
          )}

          {/* Upload and Filter Section */}
          <div className="grid md:grid-cols-2 gap-8 mb-8">
            {/* Upload Area */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => !uploadedImage && document.getElementById('file-input').click()}
              className={`min-h-[320px] rounded-2xl border-2 border-dashed p-8 flex flex-col items-center justify-center cursor-pointer transition-all ${
                isDragging
                  ? 'border-amber-500 bg-amber-500/10'
                  : uploadedImage
                  ? 'border-amber-500/50 bg-amber-100/5'
                  : 'border-amber-100/20 bg-amber-100/5 hover:border-amber-500/50 hover:bg-amber-500/5'
              }`}
            >
              <input
                type="file"
                id="file-input"
                accept="image/*"
                onChange={handleFileInput}
                className="hidden"
              />
              
              {uploadedImage ? (
                <>
                  <img src={uploadedImage} alt="Hochgeladenes Bild" className="max-h-60 rounded-lg object-contain" />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      document.getElementById('file-input').click();
                    }}
                    className="mt-4 px-4 py-2 border border-amber-100/30 rounded-lg text-amber-100/60 hover:border-amber-500 hover:text-amber-500 transition-all"
                  >
                    Anderes Bild wählen
                  </button>
                </>
              ) : (
                <>
                  <svg className="w-16 h-16 text-amber-100/40 mb-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <h3 className="font-serif text-xl text-amber-100 mb-2">Bild hier ablegen</h3>
                  <p className="text-amber-100/40 text-sm">oder klicken zum Auswählen • JPG, PNG bis 10MB</p>
                </>
              )}
            </div>

            {/* Filter Panel */}
            <div className="bg-amber-100/5 border border-amber-100/10 rounded-2xl p-6">
              <h3 className="font-serif text-xl text-amber-500 mb-5 flex items-center gap-2">
                <span>⚙️</span> Suchoptionen
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-amber-100/60 uppercase tracking-wider mb-2">Suchbegriffe</label>
                  <input
                    type="text"
                    placeholder="z.B. Fibel, Münze, Keramik..."
                    value={searchKeywords}
                    onChange={(e) => setSearchKeywords(e.target.value)}
                    className="w-full px-4 py-3 bg-black/30 border border-amber-100/20 rounded-lg text-amber-100 placeholder-amber-100/30 focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-amber-100/60 uppercase tracking-wider mb-2">Epoche</label>
                  <select
                    value={filters.epoch}
                    onChange={(e) => setFilters({...filters, epoch: e.target.value})}
                    className="w-full px-4 py-3 bg-black/30 border border-amber-100/20 rounded-lg text-amber-100 focus:outline-none focus:border-amber-500 appearance-none cursor-pointer"
                  >
                    {epochs.map(e => <option key={e} value={e} className="bg-amber-900">{e}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-amber-100/60 uppercase tracking-wider mb-2">Objekttyp</label>
                  <select
                    value={filters.objectType}
                    onChange={(e) => setFilters({...filters, objectType: e.target.value})}
                    className="w-full px-4 py-3 bg-black/30 border border-amber-100/20 rounded-lg text-amber-100 focus:outline-none focus:border-amber-500 appearance-none cursor-pointer"
                  >
                    {objectTypes.map(t => <option key={t} value={t} className="bg-amber-900">{t}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-amber-100/60 uppercase tracking-wider mb-2">Region</label>
                  <select
                    value={filters.region}
                    onChange={(e) => setFilters({...filters, region: e.target.value})}
                    className="w-full px-4 py-3 bg-black/30 border border-amber-100/20 rounded-lg text-amber-100 focus:outline-none focus:border-amber-500 appearance-none cursor-pointer"
                  >
                    {regions.map(r => <option key={r} value={r} className="bg-amber-900">{r}</option>)}
                  </select>
                </div>

                <button
                  onClick={handleAnalyze}
                  disabled={isAnalyzing}
                  className="w-full py-4 bg-gradient-to-r from-amber-500 to-amber-600 rounded-xl text-amber-900 font-semibold flex items-center justify-center gap-3 hover:shadow-lg hover:shadow-amber-500/20 hover:-translate-y-0.5 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                >
                  {isAnalyzing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-amber-900/30 border-t-amber-900 rounded-full animate-spin"></div>
                      Suche läuft...
                    </>
                  ) : (
                    <>
                      <span>🔎</span>
                      Vergleichsfunde suchen
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Results Section */}
          {showResults && (
            <section className="animate-fadeIn">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-amber-100/10">
                <div>
                  <h2 className="font-serif text-2xl text-amber-500">Vergleichsfunde</h2>
                  <p className="text-amber-100/60">
                    {results.length} von {totalResults.toLocaleString()} Ergebnissen angezeigt
                  </p>
                </div>
                <button
                  onClick={resetSearch}
                  className="px-4 py-2 border border-amber-100/30 rounded-lg text-amber-100/60 hover:border-amber-500 hover:text-amber-500 transition-all"
                >
                  Neue Suche
                </button>
              </div>

              {results.length === 0 ? (
                <div className="text-center py-12 text-amber-100/40">
                  <p className="text-xl mb-2">Keine Ergebnisse gefunden</p>
                  <p>Versuche es mit anderen Suchbegriffen oder Filtern.</p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                  {results.map((result, index) => (
                    <div
                      key={result.id || index}
                      className="bg-amber-100/5 border border-amber-100/10 rounded-xl overflow-hidden hover:-translate-y-1 hover:border-amber-500/40 hover:shadow-xl hover:shadow-black/30 transition-all"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <div className="relative h-44 bg-black/20 overflow-hidden">
                        {result.image_url ? (
                          <img
                            src={result.image_url}
                            alt={result.title}
                            className="w-full h-full object-cover transition-transform hover:scale-105"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-amber-100/30">
                            Kein Bild
                          </div>
                        )}
                        {result.similarity && (
                          <span className="absolute top-3 right-3 px-2 py-1 bg-black/80 border border-amber-500 rounded-full text-xs font-semibold text-amber-500">
                            {result.similarity}%
                          </span>
                        )}
                        <span className="absolute top-3 left-3 px-2 py-1 bg-black/80 rounded text-xs text-amber-100/60 uppercase tracking-wider">
                          {result.source || 'europeana'}
                        </span>
                      </div>
                      <div className="p-4">
                        <h4 className="font-serif text-lg text-amber-100 mb-1 line-clamp-2">{result.title}</h4>
                        {result.museum && (
                          <p className="text-sm text-amber-100/60 mb-1 flex items-start gap-1">
                            <span>🏛️</span>
                            <span className="line-clamp-1">{result.museum}</span>
                          </p>
                        )}
                        {result.epoch && (
                          <p className="text-sm text-amber-100/40 italic">{result.epoch}</p>
                        )}
                        {result.source_url && (
                          <a
                            href={result.source_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 mt-3 text-amber-500 text-sm hover:gap-2 transition-all"
                          >
                            Zur Quelle <span>→</span>
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          )}
        </main>

        {/* Footer */}
        <footer className="border-t border-amber-100/10 py-6 px-8 text-center text-amber-100/40 text-sm">
          <div className="flex justify-center gap-6 mb-3">
            <a href="#" className="hover:text-amber-500 transition-colors">Impressum</a>
            <a href="#" className="hover:text-amber-500 transition-colors">Datenschutz</a>
            <a href={`${API_BASE_URL}/docs`} target="_blank" rel="noopener noreferrer" className="hover:text-amber-500 transition-colors">API-Dokumentation</a>
            <a href="#" className="hover:text-amber-500 transition-colors">Kontakt</a>
          </div>
          <p>© 2026 ArchaeoFinder • Datenquellen: Europeana, Deutsche Digitale Bibliothek, British Museum</p>
        </footer>
      </div>
    </>
  );
}
