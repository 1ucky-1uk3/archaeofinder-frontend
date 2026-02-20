import { useState, useCallback, useRef } from ‘react’;
import Head from ‘next/head’;

const API_BASE_URL = ‘https://api.archaeofinder.de’;

const epochs = [
‘Alle Epochen’,
‘Steinzeit’,
‘Bronzezeit’,
‘Eisenzeit’,
‘Roemische Kaiserzeit’,
‘Fruehmittelalter’,
‘Hochmittelalter’,
‘Spaetmittelalter’
];

const objectTypes = [
‘Alle Objekttypen’,
‘Fibeln’,
‘Muenzen’,
‘Keramik’,
‘Waffen’,
‘Schmuck’,
‘Kultgegenstaende’,
‘Alltagsgegenstaende’
];

const regions = [
‘Alle Regionen’,
‘Mitteleuropa’,
‘Nordeuropa’,
‘Suedeuropa’,
‘Westeuropa’,
‘Osteuropa’,
‘Mittelmeerraum’,
‘Naher Osten’
];

const ARCHAEOLOGICAL_LABELS = [
‘arrowhead’, ‘arrow head’, ‘projectile point’, ‘spearhead’, ‘spear point’,
‘flint tool’, ‘stone tool’, ‘lithic’, ‘scraper’, ‘blade’,
‘fibula’, ‘brooch’, ‘pin’, ‘buckle’, ‘clasp’,
‘coin’, ‘roman coin’, ‘greek coin’, ‘medieval coin’, ‘celtic coin’,
‘pottery’, ‘ceramic’, ‘vessel’, ‘amphora’, ‘vase’, ‘urn’, ‘bowl’,
‘sword’, ‘dagger’, ‘knife’, ‘axe’, ‘axehead’, ‘weapon’,
‘ring’, ‘finger ring’, ‘bracelet’, ‘necklace’, ‘pendant’, ‘jewelry’, ‘bead’,
‘bronze object’, ‘iron object’, ‘gold object’, ‘silver object’, ‘copper object’,
‘roman artifact’, ‘greek artifact’, ‘celtic artifact’, ‘medieval artifact’, ‘viking artifact’,
‘statue’, ‘figurine’, ‘sculpture’, ‘idol’,
‘tool’, ‘hammer’, ‘chisel’, ‘needle’, ‘spindle whorl’,
‘religious object’, ‘ritual object’, ‘votive offering’,
‘bone object’, ‘antler’, ‘ivory’, ‘glass bead’, ‘amber’
];

const LABEL_TRANSLATIONS = {
‘arrowhead’: ‘Pfeilspitze’,
‘arrow head’: ‘Pfeilspitze’,
‘projectile point’: ‘Projektilspitze’,
‘spearhead’: ‘Speerspitze’,
‘spear point’: ‘Speerspitze’,
‘flint tool’: ‘Feuersteinwerkzeug’,
‘stone tool’: ‘Steinwerkzeug’,
‘lithic’: ‘Steingeraet’,
‘scraper’: ‘Schaber’,
‘blade’: ‘Klinge’,
‘fibula’: ‘Fibel’,
‘brooch’: ‘Brosche’,
‘pin’: ‘Nadel’,
‘buckle’: ‘Schnalle’,
‘clasp’: ‘Spange’,
‘coin’: ‘Muenze’,
‘roman coin’: ‘Roemische Muenze’,
‘greek coin’: ‘Griechische Muenze’,
‘medieval coin’: ‘Mittelalterliche Muenze’,
‘celtic coin’: ‘Keltische Muenze’,
‘pottery’: ‘Keramik’,
‘ceramic’: ‘Keramik’,
‘vessel’: ‘Gefaess’,
‘amphora’: ‘Amphore’,
‘vase’: ‘Vase’,
‘urn’: ‘Urne’,
‘bowl’: ‘Schale’,
‘sword’: ‘Schwert’,
‘dagger’: ‘Dolch’,
‘knife’: ‘Messer’,
‘axe’: ‘Axt’,
‘axehead’: ‘Axtkopf’,
‘weapon’: ‘Waffe’,
‘ring’: ‘Ring’,
‘finger ring’: ‘Fingerring’,
‘bracelet’: ‘Armreif’,
‘necklace’: ‘Halskette’,
‘pendant’: ‘Anhaenger’,
‘jewelry’: ‘Schmuck’,
‘bead’: ‘Perle’,
‘bronze object’: ‘Bronzeobjekt’,
‘iron object’: ‘Eisenobjekt’,
‘gold object’: ‘Goldobjekt’,
‘silver object’: ‘Silberobjekt’,
‘copper object’: ‘Kupferobjekt’,
‘roman artifact’: ‘Roemisches Artefakt’,
‘greek artifact’: ‘Griechisches Artefakt’,
‘celtic artifact’: ‘Keltisches Artefakt’,
‘medieval artifact’: ‘Mittelalterliches Artefakt’,
‘viking artifact’: ‘Wikinger Artefakt’,
‘statue’: ‘Statue’,
‘figurine’: ‘Figurine’,
‘sculpture’: ‘Skulptur’,
‘idol’: ‘Idol’,
‘tool’: ‘Werkzeug’,
‘hammer’: ‘Hammer’,
‘chisel’: ‘Meissel’,
‘needle’: ‘Nadel’,
‘spindle whorl’: ‘Spinnwirtel’,
‘religious object’: ‘Kultgegenstand’,
‘ritual object’: ‘Ritualobjekt’,
‘votive offering’: ‘Votivgabe’,
‘bone object’: ‘Knochenobjekt’,
‘antler’: ‘Geweih’,
‘ivory’: ‘Elfenbein’,
‘glass bead’: ‘Glasperle’,
‘amber’: ‘Bernstein’
};

export default function Home() {
const [uploadedImage, setUploadedImage] = useState(null);
const [isDragging, setIsDragging] = useState(false);
const [isAnalyzing, setIsAnalyzing] = useState(false);
const [clipStatus, setClipStatus] = useState(‘idle’);
const [detectedLabels, setDetectedLabels] = useState([]);
const [showResults, setShowResults] = useState(false);
const [results, setResults] = useState([]);
const [totalResults, setTotalResults] = useState(0);
const [error, setError] = useState(null);
const [searchKeywords, setSearchKeywords] = useState(’’);
const [filters, setFilters] = useState({
epoch: ‘Alle Epochen’,
objectType: ‘Alle Objekttypen’,
region: ‘Alle Regionen’
});

const clipPipelineRef = useRef(null);

const loadClipModel = async () => {
if (clipPipelineRef.current) return true;

```
try {
  setClipStatus('loading');
  const { pipeline } = await import('@xenova/transformers');
  
  clipPipelineRef.current = await pipeline(
    'zero-shot-image-classification',
    'Xenova/clip-vit-base-patch32'
  );
  
  setClipStatus('ready');
  return true;
} catch (err) {
  console.error('CLIP load error:', err);
  setClipStatus('error');
  return false;
}
```

};

const analyzeImageWithClip = async (imageUrl) => {
if (!clipPipelineRef.current) {
const loaded = await loadClipModel();
if (!loaded) return [];
}

```
try {
  setClipStatus('analyzing');
  
  const results = await clipPipelineRef.current(imageUrl, ARCHAEOLOGICAL_LABELS);
  
  const topLabels = results
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)
    .filter(r => r.score > 0.02)
    .map(r => ({
      en: r.label,
      de: LABEL_TRANSLATIONS[r.label] || r.label,
      score: r.score
    }));
  
  setClipStatus('ready');
  return topLabels;
} catch (err) {
  console.error('CLIP analysis error:', err);
  setClipStatus('error');
  return [];
}
```

};

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
if (file && file.type.startsWith(‘image/’)) {
const reader = new FileReader();
reader.onload = (event) => {
setUploadedImage(event.target.result);
setDetectedLabels([]);
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
setDetectedLabels([]);
};
reader.readAsDataURL(file);
}
}, []);

const handleAnalyze = async () => {
setIsAnalyzing(true);
setError(null);
setResults([]);

```
try {
  let searchTerms = searchKeywords.trim();
  let labels = [];
  
  if (uploadedImage) {
    labels = await analyzeImageWithClip(uploadedImage);
    setDetectedLabels(labels);
    
    if (labels.length > 0) {
      const englishTerms = labels.map(l => l.en).join(' ');
      searchTerms = searchTerms ? searchTerms + ' ' + englishTerms : englishTerms;
    }
  }

  const params = new URLSearchParams();
  if (searchTerms) params.append('q', searchTerms);
  if (filters.epoch !== 'Alle Epochen') params.append('epoch', filters.epoch);
  if (filters.objectType !== 'Alle Objekttypen') params.append('object_type', filters.objectType);
  if (filters.region !== 'Alle Regionen') params.append('region', filters.region);
  params.append('limit', '20');

  const response = await fetch(API_BASE_URL + '/api/search?' + params.toString());
  
  if (!response.ok) throw new Error('Serverfehler: ' + response.status);

  const data = await response.json();
  setResults(data.results || []);
  setTotalResults(data.total_results || 0);
  setShowResults(true);

} catch (err) {
  setError('Fehler bei der Suche: ' + err.message);
} finally {
  setIsAnalyzing(false);
}
```

};

const resetSearch = () => {
setUploadedImage(null);
setShowResults(false);
setResults([]);
setError(null);
setSearchKeywords(’’);
setDetectedLabels([]);
setFilters({ epoch: ‘Alle Epochen’, objectType: ‘Alle Objekttypen’, region: ‘Alle Regionen’ });
};

const getStatusText = () => {
switch (clipStatus) {
case ‘loading’: return ‘⏳ Lade KI-Modell (einmalig ~50MB)…’;
case ‘analyzing’: return ‘🔍 Analysiere Bild…’;
case ‘ready’: return ‘✅ KI bereit’;
case ‘error’: return ‘❌ KI nicht verfuegbar’;
default: return ‘🤖 KI-Analyse verfuegbar’;
}
};

const styles = {
container: { minHeight: ‘100vh’, background: ‘linear-gradient(165deg, #1a1612 0%, #2d2520 50%, #1a1612 100%)’, color: ‘#e8e0d5’, fontFamily: ‘system-ui, sans-serif’ },
header: { padding: ‘1.5rem 2rem’, display: ‘flex’, justifyContent: ‘space-between’, alignItems: ‘center’, borderBottom: ‘1px solid rgba(180, 140, 80, 0.2)’, flexWrap: ‘wrap’, gap: ‘1rem’ },
logo: { display: ‘flex’, alignItems: ‘center’, gap: ‘1rem’ },
logoIcon: { width: ‘48px’, height: ‘48px’, background: ‘linear-gradient(135deg, #c9a962, #a08050)’, borderRadius: ‘12px’, display: ‘flex’, alignItems: ‘center’, justifyContent: ‘center’, fontSize: ‘24px’ },
logoText: { fontSize: ‘1.5rem’, fontWeight: ‘600’, color: ‘#c9a962’ },
status: { padding: ‘0.5rem 1rem’, background: ‘rgba(201, 169, 98, 0.1)’, borderRadius: ‘8px’, fontSize: ‘0.875rem’, color: ‘#c9a962’ },
hero: { textAlign: ‘center’, padding: ‘3rem 2rem’, maxWidth: ‘800px’, margin: ‘0 auto’ },
title: { fontSize: ‘2.5rem’, fontWeight: ‘bold’, marginBottom: ‘1rem’, background: ‘linear-gradient(90deg, #e8e0d5, #c9a962)’, WebkitBackgroundClip: ‘text’, WebkitTextFillColor: ‘transparent’ },
subtitle: { fontSize: ‘1.125rem’, color: ‘rgba(232, 224, 213, 0.6)’, lineHeight: ‘1.6’ },
main: { padding: ‘0 2rem 4rem’, maxWidth: ‘1200px’, margin: ‘0 auto’ },
error: { background: ‘rgba(220, 50, 50, 0.1)’, border: ‘1px solid rgba(220, 50, 50, 0.3)’, borderRadius: ‘8px’, padding: ‘1rem’, marginBottom: ‘1.5rem’, color: ‘#ff6b6b’ },
grid: { display: ‘grid’, gridTemplateColumns: ‘repeat(auto-fit, minmax(300px, 1fr))’, gap: ‘2rem’, marginBottom: ‘2rem’ },
dropzone: { minHeight: ‘320px’, borderRadius: ‘16px’, padding: ‘2rem’, display: ‘flex’, flexDirection: ‘column’, alignItems: ‘center’, justifyContent: ‘center’, cursor: ‘pointer’, transition: ‘all 0.3s’ },
panel: { background: ‘rgba(232, 224, 213, 0.05)’, border: ‘1px solid rgba(232, 224, 213, 0.1)’, borderRadius: ‘16px’, padding: ‘1.5rem’ },
panelTitle: { fontSize: ‘1.25rem’, color: ‘#c9a962’, marginBottom: ‘1.25rem’, display: ‘flex’, alignItems: ‘center’, gap: ‘0.5rem’ },
input: { width: ‘100%’, padding: ‘0.75rem 1rem’, background: ‘rgba(0, 0, 0, 0.3)’, border: ‘1px solid rgba(232, 224, 213, 0.2)’, borderRadius: ‘8px’, color: ‘#e8e0d5’, fontSize: ‘1rem’ },
label: { display: ‘block’, fontSize: ‘0.75rem’, color: ‘rgba(232, 224, 213, 0.6)’, textTransform: ‘uppercase’, letterSpacing: ‘0.05em’, marginBottom: ‘0.5rem’ },
button: { width: ‘100%’, padding: ‘1rem’, background: ‘linear-gradient(135deg, #c9a962, #a08050)’, borderRadius: ‘12px’, border: ‘none’, color: ‘#1a1612’, fontWeight: ‘600’, fontSize: ‘1rem’, cursor: ‘pointer’, display: ‘flex’, alignItems: ‘center’, justifyContent: ‘center’, gap: ‘0.75rem’ },
tag: { padding: ‘0.25rem 0.75rem’, background: ‘rgba(201, 169, 98, 0.2)’, border: ‘1px solid #c9a962’, borderRadius: ‘999px’, fontSize: ‘0.875rem’, color: ‘#c9a962’, display: ‘flex’, flexDirection: ‘column’, alignItems: ‘center’ },
tagScore: { fontSize: ‘0.7rem’, opacity: 0.7 },
card: { background: ‘rgba(232, 224, 213, 0.05)’, border: ‘1px solid rgba(232, 224, 213, 0.1)’, borderRadius: ‘12px’, overflow: ‘hidden’ },
cardImage: { position: ‘relative’, height: ‘176px’, background: ‘rgba(0, 0, 0, 0.2)’, overflow: ‘hidden’ },
cardContent: { padding: ‘1rem’ },
badge: { position: ‘absolute’, top: ‘12px’, right: ‘12px’, padding: ‘0.25rem 0.5rem’, background: ‘rgba(0, 0, 0, 0.8)’, border: ‘1px solid #c9a962’, borderRadius: ‘999px’, fontSize: ‘0.75rem’, fontWeight: ‘600’, color: ‘#c9a962’ },
footer: { borderTop: ‘1px solid rgba(232, 224, 213, 0.1)’, padding: ‘1.5rem 2rem’, textAlign: ‘center’, color: ‘rgba(232, 224, 213, 0.4)’, fontSize: ‘0.875rem’ }
};

return (
<>
<Head>
<title>ArchaeoFinder - Archaeologische Funde identifizieren</title>
<meta name="description" content="Laden Sie ein Foto Ihres archaeologischen Fundes hoch und finden Sie aehnliche Artefakte." />
<meta name="viewport" content="width=device-width, initial-scale=1" />
</Head>

```
  <div style={styles.container}>
    <header style={styles.header}>
      <div style={styles.logo}>
        <div style={styles.logoIcon}>🏺</div>
        <span style={styles.logoText}>ArchaeoFinder</span>
      </div>
      <div style={styles.status}>{getStatusText()}</div>
    </header>

    <section style={styles.hero}>
      <h1 style={styles.title}>Entdecken Sie die Geschichte Ihres Fundes</h1>
      <p style={styles.subtitle}>Laden Sie ein Foto hoch - die KI erkennt automatisch, was auf dem Bild ist und findet aehnliche Artefakte in Museumssammlungen.</p>
    </section>

    <main style={styles.main}>
      {error && <div style={styles.error}>⚠️ {error}</div>}

      <div style={styles.grid}>
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => !uploadedImage && document.getElementById('file-input').click()}
          style={{
            ...styles.dropzone,
            border: isDragging ? '2px dashed #c9a962' : uploadedImage ? '2px solid rgba(201, 169, 98, 0.5)' : '2px dashed rgba(232, 224, 213, 0.2)',
            background: isDragging ? 'rgba(201, 169, 98, 0.1)' : 'rgba(232, 224, 213, 0.05)'
          }}
        >
          <input type="file" id="file-input" accept="image/*" onChange={handleFileInput} style={{display: 'none'}} />
          
          {uploadedImage ? (
            <>
              <img src={uploadedImage} alt="Upload" style={{maxHeight: '200px', borderRadius: '8px', objectFit: 'contain'}} />
              {detectedLabels.length > 0 && (
                <div style={{marginTop: '1rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center'}}>
                  {detectedLabels.map((label, i) => (
                    <span key={i} style={styles.tag}>
                      <span>{label.de}</span>
                      <span style={styles.tagScore}>{Math.round(label.score * 100)}%</span>
                    </span>
                  ))}
                </div>
              )}
              <button onClick={(e) => { e.stopPropagation(); document.getElementById('file-input').click(); }} style={{marginTop: '1rem', padding: '0.5rem 1rem', border: '1px solid rgba(232, 224, 213, 0.3)', borderRadius: '8px', background: 'transparent', color: 'rgba(232, 224, 213, 0.6)', cursor: 'pointer'}}>
                Anderes Bild
              </button>
            </>
          ) : (
            <>
              <div style={{fontSize: '3rem', marginBottom: '1rem', opacity: '0.4'}}>📷</div>
              <h3 style={{fontSize: '1.25rem', color: '#e8e0d5', marginBottom: '0.5rem'}}>Bild hier ablegen</h3>
              <p style={{color: 'rgba(232, 224, 213, 0.4)', fontSize: '0.875rem'}}>oder klicken zum Auswaehlen</p>
            </>
          )}
        </div>

        <div style={styles.panel}>
          <h3 style={styles.panelTitle}>⚙️ Suchoptionen</h3>
          <div style={{display: 'flex', flexDirection: 'column', gap: '1rem'}}>
            <div>
              <label style={styles.label}>Suchbegriffe (optional)</label>
              <input type="text" placeholder="z.B. Fibel, Muenze, Pfeilspitze..." value={searchKeywords} onChange={(e) => setSearchKeywords(e.target.value)} style={styles.input} />
            </div>
            <div>
              <label style={styles.label}>Epoche</label>
              <select value={filters.epoch} onChange={(e) => setFilters({...filters, epoch: e.target.value})} style={styles.input}>
                {epochs.map(e => <option key={e} value={e} style={{background: '#2d2520'}}>{e}</option>)}
              </select>
            </div>
            <div>
              <label style={styles.label}>Objekttyp</label>
              <select value={filters.objectType} onChange={(e) => setFilters({...filters, objectType: e.target.value})} style={styles.input}>
                {objectTypes.map(t => <option key={t} value={t} style={{background: '#2d2520'}}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={styles.label}>Region</label>
              <select value={filters.region} onChange={(e) => setFilters({...filters, region: e.target.value})} style={styles.input}>
                {regions.map(r => <option key={r} value={r} style={{background: '#2d2520'}}>{r}</option>)}
              </select>
            </div>
            <button onClick={handleAnalyze} disabled={isAnalyzing} style={{...styles.button, opacity: isAnalyzing ? 0.7 : 1, cursor: isAnalyzing ? 'not-allowed' : 'pointer'}}>
              {isAnalyzing ? '⏳ Suche...' : '🔎 ' + (uploadedImage ? 'Bild analysieren & suchen' : 'Vergleichsfunde suchen')}
            </button>
          </div>
        </div>
      </div>

      {showResults && (
        <section>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', paddingBottom: '1rem', borderBottom: '1px solid rgba(232, 224, 213, 0.1)', flexWrap: 'wrap', gap: '1rem'}}>
            <div>
              <h2 style={{fontSize: '1.5rem', color: '#c9a962', marginBottom: '0.25rem'}}>Vergleichsfunde</h2>
              <p style={{color: 'rgba(232, 224, 213, 0.6)'}}>
                {results.length} von {totalResults.toLocaleString()} Ergebnissen
                {detectedLabels.length > 0 && <span> • KI erkannte: {detectedLabels.map(l => l.de).join(', ')}</span>}
              </p>
            </div>
            <button onClick={resetSearch} style={{padding: '0.5rem 1rem', border: '1px solid rgba(232, 224, 213, 0.3)', borderRadius: '8px', background: 'transparent', color: 'rgba(232, 224, 213, 0.6)', cursor: 'pointer'}}>
              Neue Suche
            </button>
          </div>

          {results.length === 0 ? (
            <div style={{textAlign: 'center', padding: '3rem', color: 'rgba(232, 224, 213, 0.4)'}}>
              <p>Keine Ergebnisse gefunden. Versuchen Sie andere Suchbegriffe.</p>
            </div>
          ) : (
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '1.25rem'}}>
              {results.map((result, index) => (
                <div key={result.id || index} style={styles.card}>
                  <div style={styles.cardImage}>
                    {result.image_url ? (
                      <img src={result.image_url} alt={result.title} style={{width: '100%', height: '100%', objectFit: 'cover'}} onError={(e) => e.target.style.display = 'none'} />
                    ) : (
                      <div style={{width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(232, 224, 213, 0.3)'}}>Kein Bild</div>
                    )}
                    {result.similarity && <span style={styles.badge}>{result.similarity}%</span>}
                  </div>
                  <div style={styles.cardContent}>
                    <h4 style={{fontSize: '1rem', color: '#e8e0d5', marginBottom: '0.25rem', overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical'}}>{result.title}</h4>
                    {result.museum && <p style={{fontSize: '0.875rem', color: 'rgba(232, 224, 213, 0.6)', marginBottom: '0.25rem'}}>🏛️ {result.museum}</p>}
                    {result.epoch && <p style={{fontSize: '0.875rem', color: 'rgba(232, 224, 213, 0.4)', fontStyle: 'italic'}}>{result.epoch}</p>}
                    {result.source_url && <a href={result.source_url} target="_blank" rel="noopener noreferrer" style={{display: 'inline-block', marginTop: '0.75rem', color: '#c9a962', fontSize: '0.875rem', textDecoration: 'none'}}>Zur Quelle →</a>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </main>

    <footer style={styles.footer}>
      <p>© 2025 ArchaeoFinder • KI-Bildanalyse laeuft lokal in Ihrem Browser • Datenquelle: Europeana</p>
    </footer>
  </div>

  <style jsx global>{`
    * { margin: 0; padding: 0; box-sizing: border-box; }
  `}</style>
</>
```

);
}
