import { useState, useRef } from “react”;
import Head from “next/head”;

var APP_VERSION = “1.1.0”;
var API_BASE_URL = “https://api.archaeofinder.de”;

var CLIP_LABELS = [
“a stone pendant with a hole”,
“a stone amulet”,
“a polished stone artifact”,
“a flint arrowhead”,
“a stone axe head”,
“an ancient bronze fibula”,
“an ancient coin”,
“a pottery fragment”,
“a bronze ring”,
“a bone needle”,
“a clay figurine”,
“a metal sword blade”,
“a glass bead”,
“a flint scraper tool”,
“a bronze bracelet”
];

var LABEL_TO_GERMAN = {
“a stone pendant with a hole”: “Steinanhaenger mit Loch”,
“a stone amulet”: “Steinamulett”,
“a polished stone artifact”: “Geschliffenes Steinartefakt”,
“a flint arrowhead”: “Feuersteinpfeilspitze”,
“a stone axe head”: “Steinbeilkopf”,
“an ancient bronze fibula”: “Antike Bronzefibel”,
“an ancient coin”: “Antike Muenze”,
“a pottery fragment”: “Keramikfragment”,
“a bronze ring”: “Bronzering”,
“a bone needle”: “Knochennadel”,
“a clay figurine”: “Tonfigur”,
“a metal sword blade”: “Metallschwertklinge”,
“a glass bead”: “Glasperle”,
“a flint scraper tool”: “Feuersteinschaber”,
“a bronze bracelet”: “Bronzearmreif”
};

var LABEL_TO_SEARCH = {
“a stone pendant with a hole”: “stone pendant perforated amulet neolithic”,
“a stone amulet”: “stone amulet pendant charm neolithic”,
“a polished stone artifact”: “polished stone tool neolithic”,
“a flint arrowhead”: “flint arrowhead projectile point”,
“a stone axe head”: “stone axe polished neolithic”,
“an ancient bronze fibula”: “fibula brooch bronze roman”,
“an ancient coin”: “coin ancient roman medieval”,
“a pottery fragment”: “pottery shard ceramic vessel”,
“a bronze ring”: “ring bronze finger jewelry”,
“a bone needle”: “bone needle pin tool”,
“a clay figurine”: “figurine clay statue idol”,
“a metal sword blade”: “sword blade weapon bronze iron”,
“a glass bead”: “glass bead amber jewelry”,
“a flint scraper tool”: “flint scraper tool lithic”,
“a bronze bracelet”: “bracelet armring bronze jewelry”
};

var epochs = [“Alle Epochen”, “Steinzeit”, “Bronzezeit”, “Eisenzeit”, “Roemische Kaiserzeit”, “Mittelalter”];
var regions = [“Alle Regionen”, “Mitteleuropa”, “Nordeuropa”, “Suedeuropa”, “Westeuropa”, “Osteuropa”];

export default function Home() {
var imageState = useState(null);
var uploadedImage = imageState[0];
var setUploadedImage = imageState[1];

var draggingState = useState(false);
var isDragging = draggingState[0];
var setIsDragging = draggingState[1];

var loadingState = useState(false);
var isLoading = loadingState[0];
var setIsLoading = loadingState[1];

var clipStatusState = useState(“idle”);
var clipStatus = clipStatusState[0];
var setClipStatus = clipStatusState[1];

var detectState = useState([]);
var detectedLabels = detectState[0];
var setDetectedLabels = detectState[1];

var showState = useState(false);
var showResults = showState[0];
var setShowResults = showState[1];

var resultsState = useState([]);
var results = resultsState[0];
var setResults = resultsState[1];

var totalState = useState(0);
var totalResults = totalState[0];
var setTotalResults = totalState[1];

var errorState = useState(null);
var error = errorState[0];
var setError = errorState[1];

var keywordsState = useState(””);
var searchKeywords = keywordsState[0];
var setSearchKeywords = keywordsState[1];

var filterState = useState({ epoch: “Alle Epochen”, region: “Alle Regionen” });
var filters = filterState[0];
var setFilters = filterState[1];

var clipRef = useRef(null);

async function loadClipModel() {
if (clipRef.current) return true;
try {
setClipStatus(“loading”);
var transformers = await import(”@xenova/transformers”);
clipRef.current = await transformers.pipeline(“zero-shot-image-classification”, “Xenova/clip-vit-base-patch32”);
setClipStatus(“ready”);
return true;
} catch (err) {
console.error(“CLIP error:”, err);
setClipStatus(“error”);
return false;
}
}

async function analyzeImage(imageUrl) {
var loaded = await loadClipModel();
if (!loaded) return [];
try {
setClipStatus(“analyzing”);
var results = await clipRef.current(imageUrl, CLIP_LABELS);
var sorted = results.sort(function(a, b) { return b.score - a.score; });
var top = sorted.slice(0, 3).filter(function(r) { return r.score > 0.05; });
setClipStatus(“ready”);
return top.map(function(r) {
return {
label: r.label,
german: LABEL_TO_GERMAN[r.label] || r.label,
search: LABEL_TO_SEARCH[r.label] || “”,
score: Math.round(r.score * 100)
};
});
} catch (err) {
console.error(“Analysis error:”, err);
setClipStatus(“error”);
return [];
}
}

function handleDragOver(e) { e.preventDefault(); setIsDragging(true); }
function handleDragLeave(e) { e.preventDefault(); setIsDragging(false); }

function handleDrop(e) {
e.preventDefault();
setIsDragging(false);
var file = e.dataTransfer.files[0];
if (file && file.type.startsWith(“image/”)) {
var reader = new FileReader();
reader.onload = function(ev) { setUploadedImage(ev.target.result); setDetectedLabels([]); };
reader.readAsDataURL(file);
}
}

function handleFileInput(e) {
var file = e.target.files[0];
if (file) {
var reader = new FileReader();
reader.onload = function(ev) { setUploadedImage(ev.target.result); setDetectedLabels([]); };
reader.readAsDataURL(file);
}
}

function openFileDialog() { document.getElementById(“file-input”).click(); }

async function handleAnalyzeAndSearch() {
setIsLoading(true);
setError(null);
setResults([]);
setDetectedLabels([]);

```
try {
  var searchTerms = searchKeywords.trim();

  if (uploadedImage) {
    var labels = await analyzeImage(uploadedImage);
    setDetectedLabels(labels);
    if (labels.length > 0) {
      var clipTerms = labels.map(function(l) { return l.search; }).join(" ");
      searchTerms = searchTerms ? searchTerms + " " + clipTerms : clipTerms;
    }
  }

  if (!searchTerms) {
    searchTerms = "archaeology artifact";
  }

  var params = new URLSearchParams();
  params.append("q", searchTerms);
  if (filters.epoch !== "Alle Epochen") params.append("epoch", filters.epoch);
  if (filters.region !== "Alle Regionen") params.append("region", filters.region);
  params.append("limit", "20");

  var response = await fetch(API_BASE_URL + "/api/search?" + params.toString());
  if (!response.ok) throw new Error("Server error: " + response.status);

  var data = await response.json();
  setResults(data.results || []);
  setTotalResults(data.total_results || 0);
  setShowResults(true);

} catch (err) {
  setError("Fehler: " + err.message);
} finally {
  setIsLoading(false);
}
```

}

function resetAll() {
setUploadedImage(null);
setShowResults(false);
setResults([]);
setError(null);
setSearchKeywords(””);
setDetectedLabels([]);
setFilters({ epoch: “Alle Epochen”, region: “Alle Regionen” });
}

function getStatusText() {
if (clipStatus === “loading”) return “Lade KI-Modell…”;
if (clipStatus === “analyzing”) return “Analysiere Bild…”;
if (clipStatus === “ready”) return “KI bereit”;
if (clipStatus === “error”) return “KI Fehler”;
return “”;
}

var containerStyle = { minHeight: “100vh”, background: “linear-gradient(165deg, #1a1612 0%, #2d2520 50%, #1a1612 100%)”, color: “#e8e0d5”, fontFamily: “system-ui, sans-serif” };
var headerStyle = { padding: “1rem 2rem”, display: “flex”, justifyContent: “space-between”, alignItems: “center”, borderBottom: “1px solid rgba(180, 140, 80, 0.2)”, flexWrap: “wrap”, gap: “1rem” };
var inputStyle = { width: “100%”, padding: “0.75rem”, background: “rgba(0,0,0,0.3)”, border: “1px solid rgba(232,224,213,0.2)”, borderRadius: “8px”, color: “#e8e0d5”, fontSize: “1rem” };
var labelStyle = { display: “block”, fontSize: “0.75rem”, color: “rgba(232,224,213,0.6)”, textTransform: “uppercase”, marginBottom: “0.5rem” };
var buttonStyle = { width: “100%”, padding: “1rem”, background: isLoading ? “rgba(201,169,98,0.5)” : “linear-gradient(135deg, #c9a962, #a08050)”, borderRadius: “12px”, border: “none”, color: “#1a1612”, fontWeight: “600”, fontSize: “1rem”, cursor: isLoading ? “not-allowed” : “pointer” };
var tagStyle = { display: “inline-block”, padding: “0.3rem 0.7rem”, background: “rgba(201,169,98,0.2)”, border: “1px solid #c9a962”, borderRadius: “999px”, fontSize: “0.8rem”, color: “#c9a962”, marginRight: “0.5rem”, marginBottom: “0.5rem” };

return (
<>
<Head>
<title>ArchaeoFinder v{APP_VERSION}</title>
<meta name="viewport" content="width=device-width, initial-scale=1" />
</Head>

```
  <div style={containerStyle}>
    <header style={headerStyle}>
      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
        <div style={{ width: "40px", height: "40px", background: "linear-gradient(135deg, #c9a962, #a08050)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>🏺</div>
        <span style={{ fontSize: "1.25rem", fontWeight: "600", color: "#c9a962" }}>ArchaeoFinder</span>
      </div>
      <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
        {clipStatus !== "idle" && <span style={{ fontSize: "0.8rem", color: "#c9a962" }}>{getStatusText()}</span>}
        <span style={{ padding: "0.4rem 0.8rem", background: "rgba(201,169,98,0.1)", borderRadius: "6px", fontSize: "0.7rem", color: "#c9a962" }}>v{APP_VERSION}</span>
      </div>
    </header>

    <section style={{ textAlign: "center", padding: "2rem 1rem", maxWidth: "700px", margin: "0 auto" }}>
      <h1 style={{ fontSize: "1.75rem", fontWeight: "bold", marginBottom: "0.5rem", color: "#c9a962" }}>KI-gestuetzte Fundbestimmung</h1>
      <p style={{ fontSize: "0.95rem", color: "rgba(232,224,213,0.6)" }}>Laden Sie ein Foto hoch - die KI erkennt den Objekttyp und findet Vergleichsfunde.</p>
    </section>

    <main style={{ padding: "0 1.5rem 3rem", maxWidth: "1100px", margin: "0 auto" }}>
      {error && <div style={{ background: "rgba(220,50,50,0.1)", border: "1px solid rgba(220,50,50,0.3)", borderRadius: "8px", padding: "1rem", marginBottom: "1rem", color: "#ff6b6b" }}>{error}</div>}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "1.5rem", marginBottom: "1.5rem" }}>
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={function() { if (!uploadedImage) openFileDialog(); }}
          style={{ minHeight: "260px", borderRadius: "14px", padding: "1.5rem", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", border: isDragging ? "2px dashed #c9a962" : uploadedImage ? "2px solid rgba(201,169,98,0.5)" : "2px dashed rgba(232,224,213,0.2)", background: isDragging ? "rgba(201,169,98,0.1)" : "rgba(232,224,213,0.05)" }}
        >
          <input type="file" id="file-input" accept="image/*" onChange={handleFileInput} style={{ display: "none" }} />
          {uploadedImage ? (
            <div style={{ textAlign: "center" }}>
              <img src={uploadedImage} alt="Bild" style={{ maxHeight: "150px", maxWidth: "100%", borderRadius: "8px" }} />
              {detectedLabels.length > 0 && (
                <div style={{ marginTop: "1rem" }}>
                  <p style={{ fontSize: "0.75rem", color: "rgba(232,224,213,0.6)", marginBottom: "0.5rem" }}>KI ERKENNUNG:</p>
                  {detectedLabels.map(function(l, i) {
                    return <span key={i} style={tagStyle}>{l.german} ({l.score}%)</span>;
                  })}
                </div>
              )}
              <button onClick={function(e) { e.stopPropagation(); openFileDialog(); }} style={{ marginTop: "0.75rem", padding: "0.4rem 0.8rem", border: "1px solid rgba(232,224,213,0.3)", borderRadius: "6px", background: "transparent", color: "rgba(232,224,213,0.6)", cursor: "pointer", fontSize: "0.8rem" }}>Anderes Bild</button>
            </div>
          ) : (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem", opacity: "0.4" }}>📷</div>
              <h3 style={{ fontSize: "1rem", color: "#e8e0d5", marginBottom: "0.3rem" }}>Bild hochladen</h3>
              <p style={{ color: "rgba(232,224,213,0.4)", fontSize: "0.8rem" }}>Ziehen oder klicken</p>
            </div>
          )}
        </div>

        <div style={{ background: "rgba(232,224,213,0.05)", border: "1px solid rgba(232,224,213,0.1)", borderRadius: "14px", padding: "1.25rem" }}>
          <h3 style={{ fontSize: "1rem", color: "#c9a962", marginBottom: "1rem" }}>Suchoptionen</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <div>
              <label style={labelStyle}>Zusaetzliche Begriffe</label>
              <input type="text" placeholder="z.B. Bronze, durchbohrt..." value={searchKeywords} onChange={function(e) { setSearchKeywords(e.target.value); }} style={inputStyle} />
            </div>
            <div>
              <label style={labelStyle}>Epoche</label>
              <select value={filters.epoch} onChange={function(e) { setFilters({ epoch: e.target.value, region: filters.region }); }} style={inputStyle}>
                {epochs.map(function(ep) { return <option key={ep} value={ep} style={{ background: "#2d2520" }}>{ep}</option>; })}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Region</label>
              <select value={filters.region} onChange={function(e) { setFilters({ epoch: filters.epoch, region: e.target.value }); }} style={inputStyle}>
                {regions.map(function(rg) { return <option key={rg} value={rg} style={{ background: "#2d2520" }}>{rg}</option>; })}
              </select>
            </div>
            <button onClick={handleAnalyzeAndSearch} disabled={isLoading} style={buttonStyle}>
              {isLoading ? "Analysiere..." : (uploadedImage ? "Bild analysieren und suchen" : "Suchen")}
            </button>
          </div>
        </div>
      </div>

      {showResults && (
        <section>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", paddingBottom: "0.75rem", borderBottom: "1px solid rgba(232,224,213,0.1)", flexWrap: "wrap", gap: "0.75rem" }}>
            <div>
              <h2 style={{ fontSize: "1.25rem", color: "#c9a962" }}>Ergebnisse</h2>
              <p style={{ fontSize: "0.85rem", color: "rgba(232,224,213,0.6)" }}>{results.length} von {totalResults} Funden</p>
            </div>
            <button onClick={resetAll} style={{ padding: "0.4rem 0.8rem", border: "1px solid rgba(232,224,213,0.3)", borderRadius: "6px", background: "transparent", color: "rgba(232,224,213,0.6)", cursor: "pointer", fontSize: "0.8rem" }}>Neue Suche</button>
          </div>

          {results.length === 0 ? (
            <p style={{ textAlign: "center", padding: "2rem", color: "rgba(232,224,213,0.4)" }}>Keine Ergebnisse gefunden.</p>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1rem" }}>
              {results.map(function(r, i) {
                return (
                  <div key={r.id || i} style={{ background: "rgba(232,224,213,0.05)", border: "1px solid rgba(232,224,213,0.1)", borderRadius: "10px", overflow: "hidden" }}>
                    <div style={{ height: "140px", background: "rgba(0,0,0,0.2)", position: "relative" }}>
                      {r.image_url ? <img src={r.image_url} alt={r.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={function(e) { e.target.style.display = "none"; }} /> : <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(232,224,213,0.3)" }}>Kein Bild</div>}
                      {r.similarity && <span style={{ position: "absolute", top: "6px", right: "6px", padding: "0.15rem 0.4rem", background: "rgba(0,0,0,0.8)", border: "1px solid #c9a962", borderRadius: "999px", fontSize: "0.65rem", color: "#c9a962" }}>{r.similarity}%</span>}
                    </div>
                    <div style={{ padding: "0.75rem" }}>
                      <h4 style={{ fontSize: "0.85rem", color: "#e8e0d5", marginBottom: "0.2rem" }}>{r.title}</h4>
                      {r.museum && <p style={{ fontSize: "0.75rem", color: "rgba(232,224,213,0.5)" }}>{r.museum}</p>}
                      {r.source_url && <a href={r.source_url} target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", marginTop: "0.4rem", color: "#c9a962", fontSize: "0.75rem", textDecoration: "none" }}>Zur Quelle</a>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      )}
    </main>

    <footer style={{ borderTop: "1px solid rgba(232,224,213,0.1)", padding: "1rem", textAlign: "center", color: "rgba(232,224,213,0.4)", fontSize: "0.8rem" }}>
      ArchaeoFinder v{APP_VERSION} - KI-Analyse im Browser - Daten: Europeana
    </footer>
  </div>

  <style jsx global>{`* { margin: 0; padding: 0; box-sizing: border-box; }`}</style>
</>
```

);
}
