import { useState, useRef, useEffect } from "react";
import Head from "next/head";
import { createClient } from "@supabase/supabase-js";

var APP_VERSION = "1.4.0";
var API_BASE_URL = "https://api.archaeofinder.de";
var SUPABASE_URL = "https://neyudzqjqbqfaxbfnglx.supabase.co";
var SUPABASE_ANON_KEY = "sb_publishable_VHd1YE7yPwEjNhLDd5HUNQ_GV0OgMd5";

var supabase = null;
if (typeof window !== "undefined") {
  supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

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
  { id: "fibula", german: "Fibel/Brosche", search: "fibula brooch roman" },
  { id: "coin", german: "Muenze", search: "coin ancient numismatic" },
  { id: "pottery", german: "Keramik", search: "pottery ceramic vessel" },
  { id: "ring", german: "Ring/Schmuck", search: "ring jewelry bronze" },
  { id: "figurine", german: "Figur/Statue", search: "figurine statue idol" },
  { id: "sword", german: "Schwert/Dolch", search: "sword dagger blade weapon" }
];

export default function Home() {
  // Auth State
  var userState = useState(null);
  var user = userState[0];
  var setUser = userState[1];

  var showAuthState = useState(false);
  var showAuth = showAuthState[0];
  var setShowAuth = showAuthState[1];

  var authModeState = useState("login");
  var authMode = authModeState[0];
  var setAuthMode = authModeState[1];

  var emailState = useState("");
  var email = emailState[0];
  var setEmail = emailState[1];

  var passwordState = useState("");
  var password = passwordState[0];
  var setPassword = passwordState[1];

  var authErrorState = useState("");
  var authError = authErrorState[0];
  var setAuthError = authErrorState[1];

  var authLoadingState = useState(false);
  var authLoading = authLoadingState[0];
  var setAuthLoading = authLoadingState[1];

  // Finds State
  var showFindsState = useState(false);
  var showFinds = showFindsState[0];
  var setShowFinds = showFindsState[1];

  var myFindsState = useState([]);
  var myFinds = myFindsState[0];
  var setMyFinds = myFindsState[1];

  var findsLoadingState = useState(false);
  var findsLoading = findsLoadingState[0];
  var setFindsLoading = findsLoadingState[1];

  // Search State
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

  var clipRef = useRef(null);

  // Check auth on mount
  useEffect(function() {
    if (supabase) {
      supabase.auth.getSession().then(function(result) {
        if (result.data.session) {
          setUser(result.data.session.user);
        }
      });

      var authListener = supabase.auth.onAuthStateChange(function(event, session) {
        if (session) {
          setUser(session.user);
        } else {
          setUser(null);
        }
      });

      return function() {
        authListener.data.subscription.unsubscribe();
      };
    }
  }, []);

  // Auth Functions
  async function handleLogin() {
    setAuthLoading(true);
    setAuthError("");
    try {
      var result = await supabase.auth.signInWithPassword({
        email: email,
        password: password
      });
      if (result.error) {
        setAuthError(result.error.message);
      } else {
        setShowAuth(false);
        setEmail("");
        setPassword("");
      }
    } catch (e) {
      setAuthError("Login fehlgeschlagen");
    }
    setAuthLoading(false);
  }

  async function handleRegister() {
    setAuthLoading(true);
    setAuthError("");
    try {
      var result = await supabase.auth.signUp({
        email: email,
        password: password
      });
      if (result.error) {
        setAuthError(result.error.message);
      } else {
        setAuthError("");
        setAuthMode("login");
        alert("Registrierung erfolgreich! Bitte bestaetigen Sie Ihre E-Mail.");
      }
    } catch (e) {
      setAuthError("Registrierung fehlgeschlagen");
    }
    setAuthLoading(false);
  }

  async function handleLogout() {
    await supabase.auth.signOut();
    setUser(null);
    setMyFinds([]);
    setShowFinds(false);
  }

  // Finds Functions
  async function loadMyFinds() {
    if (!user) return;
    setFindsLoading(true);
    try {
      var session = await supabase.auth.getSession();
      var token = session.data.session.access_token;
      
      var response = await fetch(API_BASE_URL + "/api/finds", {
        headers: {
          "Authorization": "Bearer " + token
        }
      });
      
      if (response.ok) {
        var data = await response.json();
        setMyFinds(data.finds || []);
      }
    } catch (e) {
      console.error("Error loading finds:", e);
    }
    setFindsLoading(false);
  }

  async function saveFindToCollection() {
    if (!user) {
      setShowAuth(true);
      return;
    }
    
    if (!uploadedImage || detectedLabels.length === 0) {
      alert("Bitte erst ein Bild analysieren");
      return;
    }

    try {
      var session = await supabase.auth.getSession();
      var token = session.data.session.access_token;
      
      var findData = {
        title: detectedLabels[0] ? detectedLabels[0].german : "Unbekannter Fund",
        object_type: detectedLabels[0] ? detectedLabels[0].german : "",
        image_data: uploadedImage,
        ai_labels: detectedLabels,
        matched_artifacts: results.slice(0, 5)
      };
      
      var response = await fetch(API_BASE_URL + "/api/finds", {
        method: "POST",
        headers: {
          "Authorization": "Bearer " + token,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(findData)
      });
      
      if (response.ok) {
        alert("Fund gespeichert!");
        loadMyFinds();
      } else {
        alert("Fehler beim Speichern");
      }
    } catch (e) {
      console.error("Error saving find:", e);
      alert("Fehler beim Speichern");
    }
  }

  async function deleteFind(findId) {
    if (!confirm("Fund wirklich loeschen?")) return;
    
    try {
      var session = await supabase.auth.getSession();
      var token = session.data.session.access_token;
      
      var response = await fetch(API_BASE_URL + "/api/finds/" + findId, {
        method: "DELETE",
        headers: {
          "Authorization": "Bearer " + token
        }
      });
      
      if (response.ok) {
        loadMyFinds();
      }
    } catch (e) {
      console.error("Error deleting find:", e);
    }
  }

  // CLIP Functions
  async function loadClipModel() {
    if (clipRef.current) return true;
    try {
      setClipStatus("loading");
      var transformers = await import("@xenova/transformers");
      clipRef.current = await transformers.pipeline("zero-shot-image-classification", "Xenova/clip-vit-base-patch32");
      setClipStatus("ready");
      return true;
    } catch (err) {
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
        setShowResults(false);
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
        setShowResults(false);
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

    try {
      var searchParts = [];
      if (searchKeywords.trim()) searchParts.push(searchKeywords.trim());
      detectedLabels.forEach(function(label) {
        if (label.selected && label.search) searchParts.push(label.search);
      });
      selectedTags.forEach(function(tag) {
        searchParts.push(tag.search);
      });

      var searchTerms = searchParts.join(" ") || "archaeology artifact";
      setUsedQuery(searchTerms);

      var response = await fetch(API_BASE_URL + "/api/search?q=" + encodeURIComponent(searchTerms) + "&limit=20");
      if (!response.ok) throw new Error("Server error");

      var data = await response.json();
      setResults(data.results || []);
      setTotalResults(data.total_results || 0);
      setShowResults(true);
    } catch (err) {
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
  }

  function getStatusText() {
    if (clipStatus === "loading") return "Lade KI...";
    if (clipStatus === "analyzing") return "Analysiere...";
    if (clipStatus === "ready") return "KI bereit";
    return "";
  }

  // Styles
  var containerStyle = { minHeight: "100vh", background: "linear-gradient(165deg, #1a1612 0%, #2d2520 50%, #1a1612 100%)", color: "#e8e0d5", fontFamily: "system-ui, sans-serif" };
  var inputStyle = { width: "100%", padding: "0.75rem", background: "rgba(0,0,0,0.3)", border: "1px solid rgba(232,224,213,0.2)", borderRadius: "8px", color: "#e8e0d5", fontSize: "1rem" };
  var buttonStyle = { padding: "0.75rem 1.5rem", background: "linear-gradient(135deg, #c9a962, #a08050)", borderRadius: "8px", border: "none", color: "#1a1612", fontWeight: "600", cursor: "pointer" };
  var tagActiveStyle = { display: "inline-flex", alignItems: "center", gap: "0.3rem", padding: "0.25rem 0.6rem", background: "rgba(201,169,98,0.3)", border: "2px solid #c9a962", borderRadius: "999px", fontSize: "0.75rem", color: "#c9a962", cursor: "pointer", marginRight: "0.4rem", marginBottom: "0.4rem" };
  var tagInactiveStyle = { ...tagActiveStyle, background: "transparent", border: "2px solid rgba(232,224,213,0.3)", color: "rgba(232,224,213,0.5)", textDecoration: "line-through" };
  var modalStyle = { position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.8)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 };
  var modalContentStyle = { background: "#2d2520", borderRadius: "16px", padding: "2rem", maxWidth: "400px", width: "90%", border: "1px solid rgba(201,169,98,0.3)" };

  return (
    <>
      <Head>
        <title>ArchaeoFinder v{APP_VERSION}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <div style={containerStyle}>
        {/* Header */}
        <header style={{ padding: "1rem 2rem", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid rgba(180, 140, 80, 0.2)", flexWrap: "wrap", gap: "1rem" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <div style={{ width: "40px", height: "40px", background: "linear-gradient(135deg, #c9a962, #a08050)", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px" }}>🏺</div>
            <span style={{ fontSize: "1.25rem", fontWeight: "600", color: "#c9a962" }}>ArchaeoFinder</span>
            <span style={{ padding: "0.2rem 0.5rem", background: "rgba(201,169,98,0.1)", borderRadius: "4px", fontSize: "0.65rem", color: "#c9a962" }}>v{APP_VERSION}</span>
          </div>
          
          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
            {clipStatus && clipStatus !== "idle" && <span style={{ fontSize: "0.75rem", color: "#c9a962" }}>{getStatusText()}</span>}
            
            {user ? (
              <>
                <button onClick={function() { setShowFinds(true); loadMyFinds(); }} style={{ ...buttonStyle, background: "transparent", border: "1px solid #c9a962", color: "#c9a962", padding: "0.5rem 1rem", fontSize: "0.85rem" }}>
                  Meine Funde
                </button>
                <button onClick={handleLogout} style={{ ...buttonStyle, background: "transparent", border: "1px solid rgba(232,224,213,0.3)", color: "rgba(232,224,213,0.6)", padding: "0.5rem 1rem", fontSize: "0.85rem" }}>
                  Logout
                </button>
              </>
            ) : (
              <button onClick={function() { setShowAuth(true); }} style={{ ...buttonStyle, padding: "0.5rem 1rem", fontSize: "0.85rem" }}>
                Anmelden
              </button>
            )}
          </div>
        </header>

        {/* Auth Modal */}
        {showAuth && (
          <div style={modalStyle} onClick={function() { setShowAuth(false); }}>
            <div style={modalContentStyle} onClick={function(e) { e.stopPropagation(); }}>
              <h2 style={{ color: "#c9a962", marginBottom: "1.5rem", textAlign: "center" }}>
                {authMode === "login" ? "Anmelden" : "Registrieren"}
              </h2>
              
              {authError && <p style={{ color: "#ff6b6b", marginBottom: "1rem", fontSize: "0.85rem" }}>{authError}</p>}
              
              <div style={{ marginBottom: "1rem" }}>
                <input type="email" placeholder="E-Mail" value={email} onChange={function(e) { setEmail(e.target.value); }} style={inputStyle} />
              </div>
              <div style={{ marginBottom: "1.5rem" }}>
                <input type="password" placeholder="Passwort" value={password} onChange={function(e) { setPassword(e.target.value); }} style={inputStyle} />
              </div>
              
              <button onClick={authMode === "login" ? handleLogin : handleRegister} disabled={authLoading} style={{ ...buttonStyle, width: "100%", opacity: authLoading ? 0.7 : 1 }}>
                {authLoading ? "..." : (authMode === "login" ? "Anmelden" : "Registrieren")}
              </button>
              
              <p style={{ textAlign: "center", marginTop: "1rem", fontSize: "0.85rem", color: "rgba(232,224,213,0.6)" }}>
                {authMode === "login" ? "Noch kein Konto? " : "Bereits registriert? "}
                <span onClick={function() { setAuthMode(authMode === "login" ? "register" : "login"); setAuthError(""); }} style={{ color: "#c9a962", cursor: "pointer" }}>
                  {authMode === "login" ? "Registrieren" : "Anmelden"}
                </span>
              </p>
            </div>
          </div>
        )}

        {/* My Finds Modal */}
        {showFinds && (
          <div style={modalStyle} onClick={function() { setShowFinds(false); }}>
            <div style={{ ...modalContentStyle, maxWidth: "600px", maxHeight: "80vh", overflow: "auto" }} onClick={function(e) { e.stopPropagation(); }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                <h2 style={{ color: "#c9a962" }}>Meine Funde</h2>
                <button onClick={function() { setShowFinds(false); }} style={{ background: "none", border: "none", color: "#c9a962", fontSize: "1.5rem", cursor: "pointer" }}>×</button>
              </div>
              
              {findsLoading ? (
                <p style={{ textAlign: "center", color: "rgba(232,224,213,0.6)" }}>Lade...</p>
              ) : myFinds.length === 0 ? (
                <p style={{ textAlign: "center", color: "rgba(232,224,213,0.6)" }}>Noch keine Funde gespeichert.</p>
              ) : (
                <div style={{ display: "grid", gap: "1rem" }}>
                  {myFinds.map(function(find) {
                    return (
                      <div key={find.id} style={{ background: "rgba(0,0,0,0.3)", borderRadius: "8px", padding: "1rem", display: "flex", gap: "1rem" }}>
                        {find.image_data && (
                          <img src={find.image_data} alt={find.title} style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "8px" }} />
                        )}
                        <div style={{ flex: 1 }}>
                          <h4 style={{ color: "#e8e0d5", marginBottom: "0.25rem" }}>{find.title}</h4>
                          <p style={{ fontSize: "0.75rem", color: "rgba(232,224,213,0.5)" }}>{find.object_type}</p>
                          <p style={{ fontSize: "0.7rem", color: "rgba(232,224,213,0.4)" }}>{new Date(find.created_at).toLocaleDateString("de-DE")}</p>
                        </div>
                        <button onClick={function() { deleteFind(find.id); }} style={{ background: "none", border: "none", color: "#ff6b6b", cursor: "pointer", fontSize: "0.8rem" }}>Loeschen</button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Main Content */}
        <section style={{ textAlign: "center", padding: "1.5rem 1rem", maxWidth: "700px", margin: "0 auto" }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "0.5rem", color: "#c9a962" }}>KI-gestuetzte Fundbestimmung</h1>
          <p style={{ fontSize: "0.85rem", color: "rgba(232,224,213,0.6)" }}>Laden Sie ein Foto hoch - die KI erkennt den Objekttyp.</p>
        </section>

        <main style={{ padding: "0 1.5rem 3rem", maxWidth: "1100px", margin: "0 auto" }}>
          {error && <div style={{ background: "rgba(220,50,50,0.1)", border: "1px solid rgba(220,50,50,0.3)", borderRadius: "8px", padding: "1rem", marginBottom: "1rem", color: "#ff6b6b" }}>{error}</div>}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem", marginBottom: "1.5rem" }}>
            
            {/* Left Panel */}
            <div style={{ background: "rgba(232,224,213,0.05)", border: "1px solid rgba(232,224,213,0.1)", borderRadius: "14px", padding: "1.25rem" }}>
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={function() { if (!uploadedImage) openFileDialog(); }}
                style={{ minHeight: "160px", borderRadius: "10px", padding: "1rem", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", border: isDragging ? "2px dashed #c9a962" : uploadedImage ? "2px solid rgba(201,169,98,0.5)" : "2px dashed rgba(232,224,213,0.2)", background: "rgba(0,0,0,0.2)" }}
              >
                <input type="file" id="file-input" accept="image/*" onChange={handleFileInput} style={{ display: "none" }} />
                {uploadedImage ? (
                  <div style={{ textAlign: "center" }}>
                    <img src={uploadedImage} alt="Bild" style={{ maxHeight: "120px", maxWidth: "100%", borderRadius: "8px" }} />
                    <button onClick={function(e) { e.stopPropagation(); openFileDialog(); }} style={{ marginTop: "0.5rem", padding: "0.25rem 0.5rem", border: "1px solid rgba(232,224,213,0.3)", borderRadius: "6px", background: "transparent", color: "rgba(232,224,213,0.6)", cursor: "pointer", fontSize: "0.7rem" }}>Anderes Bild</button>
                  </div>
                ) : (
                  <div style={{ textAlign: "center" }}>
                    <div style={{ fontSize: "2rem", marginBottom: "0.5rem", opacity: "0.4" }}>📷</div>
                    <p style={{ fontSize: "0.85rem", color: "#e8e0d5" }}>Bild hochladen</p>
                  </div>
                )}
              </div>

              {uploadedImage && (
                <button onClick={handleAnalyzeOnly} disabled={isLoading} style={{ marginTop: "0.75rem", width: "100%", padding: "0.6rem", background: "rgba(201,169,98,0.2)", border: "1px solid #c9a962", borderRadius: "8px", color: "#c9a962", fontSize: "0.85rem", cursor: "pointer" }}>
                  {clipStatus === "analyzing" ? "Analysiere..." : "KI-Erkennung starten"}
                </button>
              )}

              {detectedLabels.length > 0 && (
                <div style={{ marginTop: "0.75rem" }}>
                  <p style={{ fontSize: "0.65rem", color: "rgba(232,224,213,0.5)", marginBottom: "0.4rem", textTransform: "uppercase" }}>KI-Erkennung:</p>
                  {detectedLabels.map(function(l, i) {
                    return <span key={i} onClick={function() { toggleTag(i); }} style={l.selected ? tagActiveStyle : tagInactiveStyle}>{l.german} ({l.score}%)</span>;
                  })}
                </div>
              )}

              {selectedTags.length > 0 && (
                <div style={{ marginTop: "0.5rem" }}>
                  <p style={{ fontSize: "0.65rem", color: "rgba(232,224,213,0.5)", marginBottom: "0.4rem", textTransform: "uppercase" }}>Manuell:</p>
                  {selectedTags.map(function(t) {
                    return <span key={t.id} onClick={function() { removeManualTag(t.id); }} style={{ ...tagActiveStyle, background: "rgba(100,180,100,0.2)", borderColor: "#6b6", color: "#8c8" }}>{t.german} ✕</span>;
                  })}
                </div>
              )}

              <button onClick={function() { setShowManualSelect(!showManualSelect); }} style={{ marginTop: "0.75rem", width: "100%", padding: "0.5rem", background: "transparent", border: "1px dashed rgba(232,224,213,0.3)", borderRadius: "8px", color: "rgba(232,224,213,0.6)", fontSize: "0.8rem", cursor: "pointer" }}>
                + Objekttyp manuell
              </button>

              {showManualSelect && (
                <div style={{ marginTop: "0.5rem", background: "rgba(0,0,0,0.4)", borderRadius: "8px", padding: "0.5rem", maxHeight: "150px", overflowY: "auto" }}>
                  {MANUAL_OBJECT_TYPES.map(function(obj) {
                    return <div key={obj.id} onClick={function() { addManualTag(obj); }} style={{ padding: "0.4rem", borderRadius: "4px", cursor: "pointer", color: "#e8e0d5", fontSize: "0.8rem" }}>{obj.german}</div>;
                  })}
                </div>
              )}

              {/* Save Button */}
              {detectedLabels.length > 0 && (
                <button onClick={saveFindToCollection} style={{ marginTop: "1rem", width: "100%", padding: "0.6rem", background: user ? "linear-gradient(135deg, #6b6, #4a4)" : "rgba(100,100,100,0.3)", border: "none", borderRadius: "8px", color: user ? "#1a1612" : "rgba(232,224,213,0.5)", fontSize: "0.85rem", fontWeight: "600", cursor: "pointer" }}>
                  {user ? "Fund speichern" : "Anmelden zum Speichern"}
                </button>
              )}
            </div>

            {/* Right Panel */}
            <div style={{ background: "rgba(232,224,213,0.05)", border: "1px solid rgba(232,224,213,0.1)", borderRadius: "14px", padding: "1.25rem" }}>
              <h3 style={{ fontSize: "1rem", color: "#c9a962", marginBottom: "1rem" }}>Suchoptionen</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.7rem", color: "rgba(232,224,213,0.6)", textTransform: "uppercase", marginBottom: "0.4rem" }}>Zusaetzliche Begriffe</label>
                  <input type="text" placeholder="z.B. durchbohrt, Bronze..." value={searchKeywords} onChange={function(e) { setSearchKeywords(e.target.value); }} style={inputStyle} />
                </div>
                <button onClick={handleSearch} disabled={isLoading} style={{ ...buttonStyle, width: "100%", opacity: isLoading ? 0.7 : 1 }}>
                  {isLoading ? "Suche..." : "Vergleichsfunde suchen"}
                </button>
              </div>

              {usedQuery && (
                <div style={{ marginTop: "1rem", padding: "0.5rem", background: "rgba(0,0,0,0.2)", borderRadius: "6px" }}>
                  <p style={{ fontSize: "0.65rem", color: "rgba(232,224,213,0.5)" }}>Suche: {usedQuery}</p>
                </div>
              )}
            </div>
          </div>

          {/* Results */}
          {showResults && (
            <section>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem", paddingBottom: "0.75rem", borderBottom: "1px solid rgba(232,224,213,0.1)" }}>
                <div>
                  <h2 style={{ fontSize: "1.25rem", color: "#c9a962" }}>Ergebnisse</h2>
                  <p style={{ fontSize: "0.8rem", color: "rgba(232,224,213,0.6)" }}>{results.length} von {totalResults} Funden</p>
                </div>
                <button onClick={resetAll} style={{ padding: "0.4rem 0.8rem", border: "1px solid rgba(232,224,213,0.3)", borderRadius: "6px", background: "transparent", color: "rgba(232,224,213,0.6)", cursor: "pointer", fontSize: "0.75rem" }}>Neue Suche</button>
              </div>

              {results.length === 0 ? (
                <p style={{ textAlign: "center", padding: "2rem", color: "rgba(232,224,213,0.4)" }}>Keine Ergebnisse gefunden.</p>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))", gap: "1rem" }}>
                  {results.map(function(r, i) {
                    return (
                      <div key={r.id || i} style={{ background: "rgba(232,224,213,0.05)", border: "1px solid rgba(232,224,213,0.1)", borderRadius: "10px", overflow: "hidden" }}>
                        <div style={{ height: "120px", background: "rgba(0,0,0,0.2)", position: "relative" }}>
                          {r.image_url ? <img src={r.image_url} alt={r.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} onError={function(e) { e.target.style.display = "none"; }} /> : <div style={{ height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(232,224,213,0.3)" }}>Kein Bild</div>}
                          {r.source && <span style={{ position: "absolute", top: "4px", left: "4px", padding: "0.1rem 0.3rem", background: "rgba(0,0,0,0.8)", borderRadius: "4px", fontSize: "0.55rem", color: "#c9a962" }}>{r.source}</span>}
                        </div>
                        <div style={{ padding: "0.6rem" }}>
                          <h4 style={{ fontSize: "0.8rem", color: "#e8e0d5", marginBottom: "0.15rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.title || "Unbekannt"}</h4>
                          {r.museum && <p style={{ fontSize: "0.7rem", color: "rgba(232,224,213,0.5)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.museum}</p>}
                          {r.source_url && <a href={r.source_url} target="_blank" rel="noopener noreferrer" style={{ display: "inline-block", marginTop: "0.3rem", color: "#c9a962", fontSize: "0.7rem", textDecoration: "none" }}>Zur Quelle</a>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          )}
        </main>

        <footer style={{ borderTop: "1px solid rgba(232,224,213,0.1)", padding: "1rem", textAlign: "center", color: "rgba(232,224,213,0.4)", fontSize: "0.75rem" }}>
          ArchaeoFinder v{APP_VERSION} - Daten: Europeana, Met Museum, V&A, Rijksmuseum, Smithsonian, Harvard
        </footer>
      </div>

      <style jsx global>{`* { margin: 0; padding: 0; box-sizing: border-box; }`}</style>
    </>
  );
}
