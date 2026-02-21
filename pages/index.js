import { useState, useRef } from "react";
import Head from "next/head";

var APP_VERSION = "1.3.0";
var API_BASE_URL = "https://api.archaeofinder.de";

var CLIP_LABELS = [
  "a stone pendant with a hole",
  "a stone amulet",
  "a polished stone artifact",
  "a flint arrowhead",
  "a stone axe head",
  "an ancient bronze fibula",
  "an ancient coin",
  "a pottery fragment",
  "a bronze ring",
  "a bone needle",
  "a clay figurine",
  "a metal sword blade",
  "a glass bead",
  "a flint scraper tool",
  "a bronze bracelet"
];

var LABEL_TO_GERMAN = {
  "a stone pendant with a hole": "Steinanhaenger",
  "a stone amulet": "Steinamulett",
  "a polished stone artifact": "Geschliffener Stein",
  "a flint arrowhead": "Pfeilspitze",
  "a stone axe head": "Steinbeil",
  "an ancient bronze fibula": "Fibel",
  "an ancient coin": "Muenze",
  "a pottery fragment": "Keramik",
  "a bronze ring": "Ring",
  "a bone needle": "Knochennadel",
  "a clay figurine": "Tonfigur",
  "a metal sword blade": "Schwert",
  "a glass bead": "Glasperle",
  "a flint scraper tool": "Schaber",
  "a bronze bracelet": "Armreif"
};

var LABEL_TO_SEARCH = {
  "a stone pendant with a hole": "stone pendant amulet",
  "a stone amulet": "stone amulet",
  "a polished stone artifact": "polished stone tool",
  "a flint arrowhead": "flint arrowhead",
  "a stone axe head": "stone axe",
  "an ancient bronze fibula": "fibula brooch",
  "an ancient coin": "ancient coin",
  "a pottery fragment": "pottery ceramic",
  "a bronze ring": "bronze ring",
  "a bone needle": "bone needle",
  "a clay figurine": "figurine clay",
  "a metal sword blade": "sword blade",
  "a glass bead": "glass bead",
  "a flint scraper tool": "flint scraper",
  "a bronze bracelet": "bronze bracelet"
};

var MANUAL_OBJECT_TYPES = [
  { id: "pendant", german: "Anhaenger/Amulett", search: "pendant amulet stone" },
  { id: "axe", german: "Steinbeil/Axt", search: "stone axe neolithic" },
  { id: "arrowhead", german: "Pfeilspitze", search: "arrowhead projectile flint" },
  { id: "scraper", german: "Schaber", search: "scraper flint tool" },
  { id: "blade", german: "Klinge", search: "blade flint lithic" },
  { id: "handaxe", german: "Faustkeil", search: "handaxe paleolithic biface" },
  { id: "fibula", german: "Fibel/Brosche", search: "fibula brooch roman" },
  { id: "coin", german: "Muenze", search: "coin ancient numismatic" },
  { id: "pottery", german: "Keramik", search: "pottery ceramic vessel" },
  { id: "ring", german: "Ring/Schmuck", search: "ring jewelry bronze" },
  { id: "bracelet", german: "Armreif", search: "bracelet armring bronze" },
  { id: "bead", german: "Perle", search: "bead glass amber" },
  { id: "needle", german: "Nadel", search: "needle bone pin" },
  { id: "figurine", german: "Figur/Statue", search: "figurine statue idol" },
  { id: "sword", german: "Schwert/Dolch", search: "sword dagger blade weapon" },
  { id: "spear", german: "Speerspitze", search: "spearhead spear point" }
];

var epochs = ["Alle Epochen", "Steinzeit", "Bronzezeit", "Eisenzeit", "Roemische Kaiserzeit", "Mittelalter"];
var regions = ["Alle Regionen", "Mitteleuropa", "Nordeuropa", "Suedeuropa", "Westeuropa", "Osteuropa"];

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

  var clipStatusState = useState("idle");
  var clipStatus = clipStatusState[0];
  var setClipStatus = clipStatusState[1];

  var detectState = useState([]);
  var detectedLabels = detectState[0];
  var setDetectedLabels = detectState[1];

  var selectedTagsState = useState([]);
  var selectedTags = selectedTagsState[0];
  var setSelectedTags = selectedTagsState[1];

  var showManualState = useState(false);
  var showManualSelect = showManualState[0];
  var setShowManualSelect = showManualState[1];

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

  var keywordsState = useState("");
  var searchKeywords = keywordsState[0];
  var setSearchKeywords = keywordsState[1];

  var usedQueryState = useState("");
  var usedQuery = usedQueryState[0];
  var setUsedQuery = usedQueryState[1];

  var filterState = useState({ epoch: "Alle Epochen", region: "Alle Regionen" });
  var filters = filterState[0];
  var setFilters = filterState[1];

  var clipRef = useRef(null);

  async function loadClipModel() {
    if (clipRef.current) return true;
    try {
      setClipStatus("loading");
      var transformers = await import("@xenova/transformers");
      clipRef.current = await transformers.pipeline("zero-shot-image-classification", "Xenova/clip-vit-base-patch32");
      setClipStatus("ready");
      return true;
    } catch (err) {
      console.error("CLIP error:", err);
      setClipStatus("error");
      return false;
    }
  }

  async function analyzeImage(imageUrl) {
    var loaded = await loadClipModel();
    if (!loaded) return [];
    try {
      setClipStatus("analyzing");
      var clipResults = await clipRef.current(imageUrl, CLIP_LABELS);
      var sorted = clipResults.sort(function(a, b) { return b.score - a.score; });
      var top = sorted.slice(0, 5).filter(function(r) { return r.score > 0.03; });
      setClipStatus("ready");
      return top.map(function(r) {
        return {
          label: r.label,
          german: LABEL_TO_GERMAN[r.label] || r.label,
          search: LABEL_TO_SEARCH[r.label] || "",
          score: Math.round(r.score * 100),
          selected: true
        };
      });
    } catch (err) {
      console.error("Analysis error:", err);
      setClipStatus("error");
      return [];
    }
  }

  function toggleTag(index) {
    var newLabels = detectedLabels.map(function(label, i) {
      if (i === index) {
        return { ...label, selected: !label.selected };
      }
      return label;
    });
    setDetectedLabels(newLabels);
  }

  function addManualTag(objType) {
    var exists = selectedTags.find(function(t) { return t.id === objType.id; });
    if (!exists) {
      setSelectedTags([...selectedTags, objType]);
    }
    setShowManualSelect(false);
  }

  function removeManualTag(id) {
    setSelectedTags(selectedTags.filter(function(t) { return t.id !== id; }));
  }

  function handleDragOver(e) { e.preventDefault(); setIsDragging(true); }
  function handleDragLeave(e) { e.preventDefault(); setIsDragging(false); }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    var file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      var reader = new FileReader();
      reader.onload = function(ev) { 
        setUploadedImage(ev.target.result); 
        setDetectedLabels([]); 
        setSelectedTags([]);
      };
      reader.readAsDataURL(file);
    }
  }

  function handleFileInput(e) {
    var file = e.target.files[0];
    if (file) {
      var reader = new FileReader();
      reader.onload = function(ev) { 
        setUploadedImage(ev.target.result); 
        setDetectedLabels([]); 
        setSelectedTags([]);
      };
      reader.readAsDataURL(file);
    }
  }

  function openFileDialog() { document.getElementById("file-input").click(); }

  async function handleAnalyzeOnly() {
    if (!uploadedImage) return;
    setIsLoading(true);
    var labels = await analyzeImage(uploadedImage);
    setDetectedLabels(labels);
    setIsLoading(false);
  }

  async function handleSearch() {
    setIsLoading(true);
    setError(null);
    setResults([]);
    setUsedQuery("");

    try {
      var searchParts = [];

      // Add user keywords
      if (searchKeywords.trim()) {
        searchParts.push(searchKeywords.trim());
      }

      // Add selected KI tags
      detectedLabels.forEach(function(label) {
        if (label.selected && label.search) {
          searchParts.push(label.search);
        }
      });

      // Add manual tags
      selectedTags.forEach(function(tag) {
        searchParts.push(tag.search);
      });

      var searchTerms = searchParts.join(" ");

      if (!searchTerms) {
        searchTerms = "archaeology artifact";
      }

      setUsedQuery(searchTerms);

      var url = API_BASE_URL + "/api/search?q=" + encodeURIComponent(searchTerms) + "&limit=20";
      
      var response = await fetch(url);
      
      if (!response.ok) {
        throw new Error("Server error: " + response.status);
      }

      var data = await response.json();

      if (data.results && data.results.length > 0) {
        setResults(data.results);
        setTotalResults(data.total_results || data.results.length);
      } else {
        setResults([]);
        setTotalResults(0);
      }
      
      setShowResults(true);

    } catch (err) {
      console.error("Search error:", err);
      setError("Fehler: " + err.message);
    } finally {
      setIsLoading(false);
    }
  }

  function resetAll() {
    setUploadedImage(null);
    setShowResults(false);
    setResults([]);
    setError(null);
    setSearchKeywords("");
    setDetectedLabels([]);
    setSelectedTags([]);
    setUsedQuery("");
    setShowManualSelect(false);
    setFilters({ epoch: "Alle Epochen", region: "Alle Regionen" });
  }

  function getStatusText() {
    if (clipStatus === "loading") return "Lade KI-Modell...";
    if (clipStatus === "analyzing") return "Analysiere Bild...";
    if (clipStatus === "ready") return "KI bereit";
    if (clipStatus === "error") return "KI Fehler";
    return "";
  }

  var containerStyle = { minHeight: "100vh", background: "linear-gradient(165deg, #1a1612 0%, #2d2520 50%, #1a1612 100%)", color: "#e8e0d5", fontFamily: "system-ui, sans-serif" };
  var headerStyle = { padding: "1rem 2rem", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(180, 140, 80, 0.2)", flexWrap: "wrap", gap: "1rem" };
  var inputStyle = { width: "100%", padding: "0.75rem", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(232,224,213,0.2)", borderRadius: "8px", color: "#e8e0d5", fontSize: "1rem" };
  var labelStyle = { display: "block", fontSize: "0.75rem", color: "rgba(232,224,213,0.6)", textTransform: "uppercase", marginBottom: "0.5rem" };
  var buttonStyle = { width: "100%", padding: "1rem", background: isLoading ? "rgba(201,169,98,0.5)" : "linear-gradient(135deg, #c9a962, #a08050)", borderRadius: "12px", border: "none", color: "#1a1612", fontWeight: "600", fontSize: "1rem", cursor: isLoading ? "not-allowed" : "pointer" };
  var tagActiveStyle = { display: "inline-flex", alignItems: "center", gap: "0.3rem", padding: "0.3rem 0.7rem", background: "rgba(201,169,98,0.3)", border: "2px solid #c9a962", borderRadius: "999px", fontSize: "0.8rem", color: "#c9a962", cursor: "pointer", marginRight: "0.5rem", marginBottom: "0.5rem" };
  var tagInactiveStyle = { display: "inline-flex", alignItems: "center", gap: "0.3rem", padding: "0.3rem 0.7rem", background: "transparent", border: "2px solid rgba(232,224,213,0.3)", borderRadius: "999px", fontSize: "0.8rem", color: "rgba(232,224,213,0.5)", cursor: "pointer", marginRight: "0.5rem", marginBottom: "0.5rem", textDecoration: "line-through" };
  var manualTagStyle = { display: "inline-flex", alignItems: "center", gap: "0.3rem", padding: "0.3rem 0.7rem", background: "rgba(100,180,100,0.2)", border: "2px solid #6b6", borderRadius: "999px", fontSize: "0.8rem", color: "#8c8", cursor: "pointer", marginRight: "0.5rem", marginBottom: "0.5rem" };

  return (
    <>
      <Head>
        <title>ArchaeoFinder v{APP_VERSION}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

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

        <section style={{ textAlign: "center", padding: "1.5rem 1rem", maxWidth: "700px", margin: "0 auto" }}>
          <h1 style={{ fontSize: "1.75rem", fontWeight: "bold", marginBottom: "0.5rem", color: "#c9a962" }}>KI-gestuetzte Fundbestimmung</h1>
          <p style={{ fontSize: "0.9rem", color: "rgba(232,224,213,0.6)" }}>Laden Sie ein Foto hoch. Sie koennen die KI-Erkennung anpassen oder manuell Objekttypen hinzufuegen.</p>
        </section>

        <main style={{ padding: "0 1.5rem 3rem", maxWidth: "1100px", margin: "0 auto" }}>
          {error && <div style={{ background: "rgba(220,50,50,0.1)", border: "1px solid rgba(220,50,50,0.3)", borderRadius: "8px", padding: "1rem", marginBottom: "1rem", color: "#ff6b6b" }}>{error}</div>}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem", marginBottom: "1.5rem" }}>
            
            {/* Left Panel - Image Upload */}
            <div style={{ background: "rgba(232,224,213,0.05)", border: "1px solid rgba(232,224,213,0.1)", borderRadius: "14px", padding: "1.25rem" }}>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={function() { if (!uploadedImage) openFileDialog(); }}
                style={{ minHeight: "180px", borderRadius: "10px", padding: "1rem", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", border: isDragging ? "2px dashed #c9a962" : uploadedImage ? "2px solid rgba(201,169,98,0.5)" : "2px dashed rgba(232,224,213,0.2)", background: isDragging ? "rgba(201,169,98,0.1)" : "rgba(0,0,0,0.2)" }}
              >
                <input type="file" id="file-input" accept="image/*" onChange={handleFileInput} style={{ display: "none" }} />
                {uploadedImage ? (
                  <div style={{ textAlign: "center" }}>
                    <img src={uploadedImage} alt="Bild" style={{ maxHeight: "140px", maxWidth: "100%", borderRadius: "8px" }} />
                    <button onClick={function(e) { e.stopPropagation(); openFileDialog(); }} style={{ marginTop: "0.5rem", padding: "0.3rem 0.6rem", border: "1px solid rgba(232,224,213,0.3)", borderRadius: "6px", background: "transparent", color: "rgba(232,224,213,0.6)", cursor: "pointer", fontSize: "0.75rem" }}>Anderes Bild</button>
                  </div>
                ) : (
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "2rem", marginBottom: "0.5rem", opacity: "0.4" }}>📷</div>
                    <p style={{ fontSize: "0.9rem", color: "#e8e0d5" }}>Bild hochladen</p>
                    <p style={{ color: "rgba(232,224,213,0.4)", fontSize: "0.75rem" }}>Ziehen oder klicken</p>
                  </div>
                )}
              </div>

              {uploadedImage && (
                <button onClick={handleAnalyzeOnly} disabled={isLoading || clipStatus === "analyzing"} style={{ marginTop: "1rem", width: "100%", padding: "0.7rem", background: "rgba(201,169,98,0.2)", border: "1px solid #c9a962", borderRadius: "8px", color: "#c9a962", fontSize: "0.9rem", cursor: "pointer" }}>
                  {clipStatus === "analyzing" ? "Analysiere..." : "KI-Erkennung starten"}
                </button>
              )}

              {/* KI Tags */}
              {detectedLabels.length > 0 && (
                <div style={{ marginTop: "1rem" }}>
                  <p style={{ fontSize: "0.7rem", color: "rgba(232,224,213,0.5)", marginBottom: "0.5rem", textTransform: "uppercase" }}>KI-Erkennung (klicken zum an/abwaehlen):</p>
                  {detectedLabels.map(function(l, i) {
                    return (
                      <span key={i} onClick={function() { toggleTag(i); }} style={l.selected ? tagActiveStyle : tagInactiveStyle}>
                        {l.german} ({l.score}%)
                        <span style={{ fontSize: "0.7rem" }}>{l.selected ? "✓" : "✗"}</span>
                      </span>
                    );
                  })}
                </div>
              )}

              {/* Manual Tags */}
              {selectedTags.length > 0 && (
                <div style={{ marginTop: "0.75rem" }}>
                  <p style={{ fontSize: "0.7rem", color: "rgba(232,224,213,0.5)", marginBottom: "0.5rem", textTransform: "uppercase" }}>Manuell hinzugefuegt:</p>
                  {selectedTags.map(function(t) {
                    return (
                      <span key={t.id} onClick={function() { removeManualTag(t.id); }} style={manualTagStyle}>
                        {t.german}
                        <span style={{ fontSize: "0.7rem" }}>✕</span>
                      </span>
                    );
                  })}
                </div>
              )}

              {/* Add Manual Button */}
              <button onClick={function() { setShowManualSelect(!showManualSelect); }} style={{ marginTop: "1rem", width: "100%", padding: "0.6rem", background: "transparent", border: "1px dashed rgba(232,224,213,0.3)", borderRadius: "8px", color: "rgba(232,224,213,0.6)", fontSize: "0.85rem", cursor: "pointer" }}>
                + Objekttyp manuell hinzufuegen
              </button>

              {/* Manual Select Dropdown */}
              {showManualSelect && (
                <div style={{ marginTop: "0.5rem", background: "rgba(0,0,0,0.4)", borderRadius: "8px", padding: "0.5rem", maxHeight: "200px", overflowY: "auto" }}>
                  {MANUAL_OBJECT_TYPES.map(function(obj) {
                    var alreadySelected = selectedTags.find(function(t) { return t.id === obj.id; });
                    return (
                      <div key={obj.id} onClick={function() { if (!alreadySelected) addManualTag(obj); }} style={{ padding: "0.5rem", borderRadius: "4px", cursor: alreadySelected ? "not-allowed" : "pointer", background: alreadySelected ? "rgba(100,100,100,0.2)" : "transparent", color: alreadySelected ? "rgba(232,224,213,0.3)" : "#e8e0d5", fontSize: "0.85rem", marginBottom: "0.25rem" }}>
                        {obj.german} {alreadySelected && "(bereits gewaehlt)"}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right Panel - Search Options */}
            <div style={{ background: "rgba(232,224,213,0.05)", border: "1px solid rgba(232,224,213,0.1)", borderRadius: "14px", padding: "1.25rem" }}>
              <h3 style={{ fontSize: "1rem", color: "#c9a962", marginBottom: "1rem" }}>Suchoptionen</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <div>
                  <label style={labelStyle}>Zusaetzliche Begriffe</label>
                  <input type="text" placeholder="z.B. durchbohrt, poliert, Bronze..." value={searchKeywords} onChange={function(e) { setSearchKeywords(e.target.value); }} style={inputStyle} />
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
                <button onClick={handleSearch} disabled={isLoading} style={buttonStyle}>
                  {isLoading ? "Suche..." : "Vergleichsfunde suchen"}
                </button>
              </div>

              {usedQuery && (
                <div style={{ marginTop: "1rem", padding: "0.75rem", background: "rgba(0,0,0,0.2)", borderRadius: "8px" }}>
                  <p style={{ fontSize: "0.7rem", color: "rgba(232,224,213,0.5)", textTransform: "uppercase", marginBottom: "0.25rem" }}>Suchbegriffe:</p>
                  <p style={{ fontSize: "0.8rem", color: "rgba(232,224,213,0.8)" }}>{usedQuery}</p>
                </div>
              )}
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
                <div style={{ textAlign: "center", padding: "2rem", color: "rgba(232,224,213,0.4)" }}>
                  <p>Keine Ergebnisse gefunden.</p>
                  <p style={{ fontSize: "0.85rem", marginTop: "0.5rem" }}>Versuche andere Suchbegriffe oder Objekttypen.</p>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: "1rem" }}>
                  {results.map(function(r, i) {
                    return (
                      <div key={r.id || i} style={{ background: "rgba(232,224,213,0.05)", border: "1px solid rgba(232,224,213,0.1)", borderRadius: "10px", overflow: "hidden" }}>
                        <div style={{ height: "140px", background: "rgba(0,0,0,0.2)", position: "relative" }}>
                          {r.image_url ? <img src={r.image_url} alt={r.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={function(e) { e.target.style.display = "none"; }} /> : <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(232,224,213,0.3)" }}>Kein Bild</div>}
                          {r.source && <span style={{ position: "absolute", top: "6px", left: "6px", padding: "0.15rem 0.4rem", background: "rgba(0,0,0,0.8)", borderRadius: "4px", fontSize: "0.6rem", color: "#c9a962" }}>{r.source}</span>}
                        </div>
                        <div style={{ padding: "0.75rem" }}>
                          <h4 style={{ fontSize: "0.85rem", color: "#e8e0d5", marginBottom: "0.2rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.title || "Unbekannt"}</h4>
                          {r.museum && <p style={{ fontSize: "0.75rem", color: "rgba(232,224,213,0.5)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.museum}</p>}
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
          ArchaeoFinder v{APP_VERSION} - KI-Analyse im Browser - Daten: Europeana, Met Museum, V&A
        </footer>
      </div>

      <style jsx global>{`* { margin: 0; padding: 0; box-sizing: border-box; }`}</style>
    </>
  );
}
