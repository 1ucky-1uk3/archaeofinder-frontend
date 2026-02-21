import { useState } from "react";
import Head from "next/head";

var APP_VERSION = "1.0.0";
var API_BASE_URL = "https://api.archaeofinder.de";

var epochs = [
  "Alle Epochen",
  "Steinzeit",
  "Bronzezeit",
  "Eisenzeit",
  "Roemische Kaiserzeit",
  "Fruehmittelalter",
  "Hochmittelalter",
  "Spaetmittelalter"
];

var objectTypes = [
  "Alle Objekttypen",
  "Steinwerkzeug",
  "Amulett oder Anhaenger",
  "Pfeilspitze",
  "Speerspitze",
  "Steinbeil oder Steinaxt",
  "Faustkeil",
  "Schaber",
  "Klinge",
  "Fibel oder Brosche",
  "Muenze",
  "Keramik oder Gefaess",
  "Schwert oder Dolch",
  "Messer",
  "Axt Metall",
  "Ring oder Armreif",
  "Perle",
  "Figur oder Statue",
  "Nadel",
  "Spinnwirtel"
];

var objectTypeSearchTerms = {
  "Alle Objekttypen": "",
  "Steinwerkzeug": "stone tool neolithic polished",
  "Amulett oder Anhaenger": "amulet pendant perforated stone charm neolithic",
  "Pfeilspitze": "arrowhead projectile point flint arrow",
  "Speerspitze": "spearhead spear point flint",
  "Steinbeil oder Steinaxt": "stone axe polished axe neolithic axehead",
  "Faustkeil": "hand axe handaxe paleolithic biface",
  "Schaber": "scraper flint tool side scraper",
  "Klinge": "blade flint blade lithic",
  "Fibel oder Brosche": "fibula brooch roman bronze clasp",
  "Muenze": "coin numismatic roman medieval",
  "Keramik oder Gefaess": "pottery ceramic vessel shard amphora",
  "Schwert oder Dolch": "sword dagger blade weapon bronze iron",
  "Messer": "knife blade tool iron bronze",
  "Axt Metall": "axe axehead bronze iron socketed",
  "Ring oder Armreif": "ring bracelet armring jewelry bronze gold",
  "Perle": "bead glass bead amber jet",
  "Figur oder Statue": "figurine statue sculpture idol venus",
  "Nadel": "pin needle bone bronze",
  "Spinnwirtel": "spindle whorl loom weight clay"
};

var regions = [
  "Alle Regionen",
  "Mitteleuropa",
  "Nordeuropa",
  "Suedeuropa",
  "Westeuropa",
  "Osteuropa",
  "Mittelmeerraum",
  "Naher Osten"
];

export default function Home() {
  var imageState = useState(null);
  var uploadedImage = imageState[0];
  var setUploadedImage = imageState[1];

  var dragState = useState(false);
  var isDragging = dragState[0];
  var setIsDragging = dragState[1];

  var searchState = useState(false);
  var isSearching = searchState[0];
  var setIsSearching = searchState[1];

  var showState = useState(false);
  var showResults = showState[0];
  var setShowResults = showState[1];

  var resState = useState([]);
  var results = resState[0];
  var setResults = resState[1];

  var totalState = useState(0);
  var totalResults = totalState[0];
  var setTotalResults = totalState[1];

  var errState = useState(null);
  var error = errState[0];
  var setError = errState[1];

  var keyState = useState("");
  var searchKeywords = keyState[0];
  var setSearchKeywords = keyState[1];

  var filterState = useState({
    epoch: "Alle Epochen",
    objectType: "Alle Objekttypen",
    region: "Alle Regionen"
  });
  var filters = filterState[0];
  var setFilters = filterState[1];

  function handleDragOver(e) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave(e) {
    e.preventDefault();
    setIsDragging(false);
  }

  function handleDrop(e) {
    e.preventDefault();
    setIsDragging(false);
    var file = e.dataTransfer.files[0];
    if (file && file.type.startsWith("image/")) {
      var reader = new FileReader();
      reader.onload = function(event) {
        setUploadedImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  }

  function handleFileInput(e) {
    var file = e.target.files[0];
    if (file) {
      var reader = new FileReader();
      reader.onload = function(event) {
        setUploadedImage(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  }

  function openFileDialog() {
    document.getElementById("file-input").click();
  }

  async function handleSearch() {
    setIsSearching(true);
    setError(null);
    setResults([]);

    try {
      var searchTerms = searchKeywords.trim();
      var typeTerms = objectTypeSearchTerms[filters.objectType] || "";
      
      if (typeTerms) {
        searchTerms = searchTerms ? searchTerms + " " + typeTerms : typeTerms;
      }

      if (!searchTerms) {
        searchTerms = "archaeology artifact";
      }

      var params = new URLSearchParams();
      params.append("q", searchTerms);
      if (filters.epoch !== "Alle Epochen") {
        params.append("epoch", filters.epoch);
      }
      if (filters.region !== "Alle Regionen") {
        params.append("region", filters.region);
      }
      params.append("limit", "20");

      var response = await fetch(API_BASE_URL + "/api/search?" + params.toString());
      
      if (!response.ok) {
        throw new Error("Serverfehler: " + response.status);
      }

      var data = await response.json();
      setResults(data.results || []);
      setTotalResults(data.total_results || 0);
      setShowResults(true);

    } catch (err) {
      setError("Fehler bei der Suche: " + err.message);
    } finally {
      setIsSearching(false);
    }
  }

  function resetSearch() {
    setUploadedImage(null);
    setShowResults(false);
    setResults([]);
    setError(null);
    setSearchKeywords("");
    setFilters({
      epoch: "Alle Epochen",
      objectType: "Alle Objekttypen",
      region: "Alle Regionen"
    });
  }

  function updateFilter(key, value) {
    var newFilters = {
      epoch: filters.epoch,
      objectType: filters.objectType,
      region: filters.region
    };
    newFilters[key] = value;
    setFilters(newFilters);
  }

  var containerStyle = {
    minHeight: "100vh",
    background: "linear-gradient(165deg, #1a1612 0%, #2d2520 50%, #1a1612 100%)",
    color: "#e8e0d5",
    fontFamily: "system-ui, sans-serif"
  };

  var headerStyle = {
    padding: "1.5rem 2rem",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottom: "1px solid rgba(180, 140, 80, 0.2)",
    flexWrap: "wrap",
    gap: "1rem"
  };

  var logoIconStyle = {
    width: "48px",
    height: "48px",
    background: "linear-gradient(135deg, #c9a962, #a08050)",
    borderRadius: "12px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "24px"
  };

  var versionStyle = {
    padding: "0.5rem 1rem",
    background: "rgba(201, 169, 98, 0.1)",
    borderRadius: "8px",
    fontSize: "0.75rem",
    color: "#c9a962"
  };

  var inputStyle = {
    width: "100%",
    padding: "0.75rem 1rem",
    background: "rgba(0, 0, 0, 0.3)",
    border: "1px solid rgba(232, 224, 213, 0.2)",
    borderRadius: "8px",
    color: "#e8e0d5",
    fontSize: "1rem"
  };

  var labelStyle = {
    display: "block",
    fontSize: "0.75rem",
    color: "rgba(232, 224, 213, 0.6)",
    textTransform: "uppercase",
    letterSpacing: "0.05em",
    marginBottom: "0.5rem"
  };

  var buttonStyle = {
    width: "100%",
    padding: "1rem",
    background: isSearching ? "rgba(201, 169, 98, 0.5)" : "linear-gradient(135deg, #c9a962, #a08050)",
    borderRadius: "12px",
    border: "none",
    color: "#1a1612",
    fontWeight: "600",
    fontSize: "1rem",
    cursor: isSearching ? "not-allowed" : "pointer"
  };

  var dropzoneStyle = {
    minHeight: "280px",
    borderRadius: "16px",
    padding: "1.5rem",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    transition: "all 0.3s",
    border: isDragging ? "2px dashed #c9a962" : uploadedImage ? "2px solid rgba(201, 169, 98, 0.5)" : "2px dashed rgba(232, 224, 213, 0.2)",
    background: isDragging ? "rgba(201, 169, 98, 0.1)" : "rgba(232, 224, 213, 0.05)"
  };

  return (
    <>
      <Head>
        <title>ArchaeoFinder - Archaeologische Funde identifizieren</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div style={containerStyle}>
        <header style={headerStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
            <div style={logoIconStyle}>🏺</div>
            <span style={{ fontSize: "1.5rem", fontWeight: "600", color: "#c9a962" }}>
              ArchaeoFinder
            </span>
          </div>
          <div style={versionStyle}>
            Version {APP_VERSION}
          </div>
        </header>

        <section style={{ textAlign: "center", padding: "2rem", maxWidth: "800px", margin: "0 auto" }}>
          <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "0.75rem", color: "#c9a962" }}>
            Finden Sie Vergleichsobjekte
          </h1>
          <p style={{ fontSize: "1rem", color: "rgba(232, 224, 213, 0.6)" }}>
            Waehlen Sie den Objekttyp Ihres Fundes und finden Sie aehnliche Artefakte in Museumssammlungen.
          </p>
        </section>

        <main style={{ padding: "0 2rem 4rem", maxWidth: "1200px", margin: "0 auto" }}>
          
          {error && (
            <div style={{ background: "rgba(220, 50, 50, 0.1)", border: "1px solid rgba(220, 50, 50, 0.3)", borderRadius: "8px", padding: "1rem", marginBottom: "1.5rem", color: "#ff6b6b" }}>
              {error}
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "2rem", marginBottom: "2rem" }}>
            
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={function() { if (!uploadedImage) openFileDialog(); }}
              style={dropzoneStyle}
            >
              <input type="file" id="file-input" accept="image/*" onChange={handleFileInput} style={{ display: "none" }} />
              
              {uploadedImage ? (
                <div style={{ textAlign: "center" }}>
                  <img src={uploadedImage} alt="Bild" style={{ maxHeight: "200px", maxWidth: "100%", borderRadius: "8px" }} />
                  <br />
                  <button
                    onClick={function(e) { e.stopPropagation(); openFileDialog(); }}
                    style={{ marginTop: "1rem", padding: "0.5rem 1rem", border: "1px solid rgba(232, 224, 213, 0.3)", borderRadius: "8px", background: "transparent", color: "rgba(232, 224, 213, 0.6)", cursor: "pointer" }}
                  >
                    Anderes Bild
                  </button>
                </div>
              ) : (
                <div style={{ textAlign: "center" }}>
                  <div style={{ fontSize: "3rem", marginBottom: "1rem", opacity: "0.4" }}>📷</div>
                  <h3 style={{ fontSize: "1.125rem", color: "#e8e0d5", marginBottom: "0.5rem" }}>Bild hier ablegen</h3>
                  <p style={{ color: "rgba(232, 224, 213, 0.4)", fontSize: "0.875rem" }}>optional - klicken zum Auswaehlen</p>
                </div>
              )}
            </div>

            <div style={{ background: "rgba(232, 224, 213, 0.05)", border: "1px solid rgba(232, 224, 213, 0.1)", borderRadius: "16px", padding: "1.5rem" }}>
              <h3 style={{ fontSize: "1.125rem", color: "#c9a962", marginBottom: "1rem" }}>Suchkriterien</h3>
              
              <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                <div>
                  <label style={labelStyle}>Objekttyp - wichtig</label>
                  <select value={filters.objectType} onChange={function(e) { updateFilter("objectType", e.target.value); }} style={inputStyle}>
                    {objectTypes.map(function(t) { return <option key={t} value={t} style={{ background: "#2d2520" }}>{t}</option>; })}
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Zusaetzliche Suchbegriffe</label>
                  <input type="text" placeholder="z.B. geschliffen, durchbohrt..." value={searchKeywords} onChange={function(e) { setSearchKeywords(e.target.value); }} style={inputStyle} />
                </div>

                <div>
                  <label style={labelStyle}>Epoche</label>
                  <select value={filters.epoch} onChange={function(e) { updateFilter("epoch", e.target.value); }} style={inputStyle}>
                    {epochs.map(function(e) { return <option key={e} value={e} style={{ background: "#2d2520" }}>{e}</option>; })}
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>Region</label>
                  <select value={filters.region} onChange={function(e) { updateFilter("region", e.target.value); }} style={inputStyle}>
                    {regions.map(function(r) { return <option key={r} value={r} style={{ background: "#2d2520" }}>{r}</option>; })}
                  </select>
                </div>

                <button onClick={handleSearch} disabled={isSearching} style={buttonStyle}>
                  {isSearching ? "Suche..." : "Vergleichsfunde suchen"}
                </button>
              </div>
            </div>
          </div>

          {showResults && (
            <section>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem", paddingBottom: "1rem", borderBottom: "1px solid rgba(232, 224, 213, 0.1)", flexWrap: "wrap", gap: "1rem" }}>
                <div>
                  <h2 style={{ fontSize: "1.5rem", color: "#c9a962", marginBottom: "0.25rem" }}>Vergleichsfunde</h2>
                  <p style={{ color: "rgba(232, 224, 213, 0.6)" }}>
                    {results.length} von {totalResults} Ergebnissen
                  </p>
                </div>
                <button onClick={resetSearch} style={{ padding: "0.5rem 1rem", border: "1px solid rgba(232, 224, 213, 0.3)", borderRadius: "8px", background: "transparent", color: "rgba(232, 224, 213, 0.6)", cursor: "pointer" }}>
                  Neue Suche
                </button>
              </div>

              {results.length === 0 ? (
                <div style={{ textAlign: "center", padding: "3rem", color: "rgba(232, 224, 213, 0.4)" }}>
                  <p>Keine Ergebnisse. Bitte anderen Objekttyp waehlen.</p>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))", gap: "1rem" }}>
                  {results.map(function(result, index) {
                    return (
                      <div key={result.id || index} style={{ background: "rgba(232, 224, 213, 0.05)", border: "1px solid rgba(232, 224, 213, 0.1)", borderRadius: "12px", overflow: "hidden" }}>
                        <div style={{ position: "relative", height: "160px", background: "rgba(0, 0, 0, 0.2)" }}>
                          {result.image_url ? (
                            <img src={result.image_url} alt={result.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={function(e) { e.target.style.display = "none"; }} />
                          ) : (
                            <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(232, 224, 213, 0.3)" }}>Kein Bild</div>
                          )}
                          {result.similarity && (
                            <span style={{ position: "absolute", top: "8px", right: "8px", padding: "0.2rem 0.5rem", background: "rgba(0, 0, 0, 0.8)", border: "1px solid #c9a962", borderRadius: "999px", fontSize: "0.7rem", color: "#c9a962" }}>
                              {result.similarity}%
                            </span>
                          )}
                        </div>
                        <div style={{ padding: "1rem" }}>
                          <h4 style={{ fontSize: "0.9rem", color: "#e8e0d5", marginBottom: "0.25rem" }}>{result.title}</h4>
                          {result.museum && <p style={{ fontSize: "0.8rem", color: "rgba(232, 224, 213, 0.6)" }}>{result.museum}</p>}
                          {result.source_url && <a href={result.source_url} target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", marginTop: "0.5rem", color: "#c9a962", fontSize: "0.8rem", textDecoration: "none" }}>Zur Quelle</a>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          )}
        </main>

        <footer style={{ borderTop: "1px solid rgba(232, 224, 213, 0.1)", padding: "1.5rem 2rem", textAlign: "center", color: "rgba(232, 224, 213, 0.4)", fontSize: "0.875rem" }}>
          <p>2025 ArchaeoFinder v{APP_VERSION} - Datenquelle: Europeana</p>
        </footer>
      </div>

      <style jsx global>{`
        * { margin: 0; padding: 0; box-sizing: border-box; }
      `}</style>
    </>
  );
}
