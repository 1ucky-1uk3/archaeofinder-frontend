import { useState, useRef, useEffect } from “react”;
import Head from “next/head”;
import { createClient } from “@supabase/supabase-js”;

var APP_VERSION = “1.5.0”;
var API_BASE_URL = “https://api.archaeofinder.de”;
var SUPABASE_URL = “https://neyudzqjqbqfaxbfnglx.supabase.co”;
var SUPABASE_ANON_KEY = “eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5leXVkenFqcWJxZmF4YmZuZ2x4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDAwMDAwMDAsImV4cCI6MjA1NTAwMDAwMH0.placeholder”;

var supabase = null;
if (typeof window !== “undefined”) {
supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// =============================================================================
// PHASE 1.1: EXPANDED CLIP LABELS (60 categories)
// =============================================================================

var CLIP_LABELS = [
// Stone Tools - Axes & Celts
“a neolithic polished stone axe”,
“a rough flaked stone hand axe”,
“a stone adze or celt tool”,
// Stone Tools - Points & Blades
“a flint arrowhead”,
“a leaf-shaped flint arrowhead”,
“a triangular flint projectile point”,
“a long flint blade or knife”,
“a flint microlith”,
// Stone Tools - Scrapers & Cores
“a flint end scraper”,
“a flint side scraper”,
“a flint core with flake scars”,
// Stone Tools - Ground Stone
“a stone grinding mortar and pestle”,
“a stone hammer or mace head”,
“a polished stone chisel”,
“a stone spindle whorl”,
// Stone Ornaments
“a stone pendant with a hole”,
“a stone amulet or carved stone”,
“a perforated stone disc”,
// Bronze & Metal - Jewelry
“an ancient bronze fibula brooch”,
“a roman bow-shaped fibula”,
“a bronze bracelet or armring”,
“a bronze finger ring”,
“a bronze or gold torc necklace”,
“a bronze dress pin”,
“a bronze belt buckle or clasp”,
“a bronze pendant or amulet”,
// Bronze & Metal - Weapons
“a bronze sword blade”,
“a bronze dagger or knife”,
“an iron sword or blade”,
“a bronze spearhead”,
“an iron spearhead or lance tip”,
“a bronze or iron axe head”,
// Bronze & Metal - Tools
“a bronze sickle blade”,
“a bronze needle or awl”,
“a bronze chisel tool”,
// Coins
“an ancient roman coin”,
“an ancient greek coin”,
“a celtic coin”,
“a medieval coin”,
// Ceramics
“a pottery fragment or sherd”,
“a decorated pottery rim fragment”,
“a pottery handle fragment”,
“a complete ceramic vessel or pot”,
“a ceramic oil lamp”,
“an amphora or large storage vessel”,
“a ceramic spindle whorl”,
// Figurines & Sculpture
“a clay figurine or idol”,
“a small bronze figurine or statuette”,
“a stone carved head or bust”,
// Bone & Organic
“a bone needle or bone awl”,
“a bone comb”,
“a carved antler tool”,
“an ivory carving or ornament”,
// Glass
“a glass bead”,
“a glass bracelet fragment”,
“an ancient glass vessel”,
// Other
“an amber bead or amber ornament”,
“a shell ornament or shell bead”,
“a stone seal or stamp”,
“a lead weight or plumb bob”,
“a mosaic tile or tessera”,
];

var LABEL_TO_GERMAN = {
“a neolithic polished stone axe”: “Steinbeil (geschliffen)”,
“a rough flaked stone hand axe”: “Faustkeil”,
“a stone adze or celt tool”: “Dechsel/Beil”,
“a flint arrowhead”: “Pfeilspitze (Feuerstein)”,
“a leaf-shaped flint arrowhead”: “Blattfoermige Pfeilspitze”,
“a triangular flint projectile point”: “Dreieckige Pfeilspitze”,
“a long flint blade or knife”: “Feuersteinklinge”,
“a flint microlith”: “Mikrolith”,
“a flint end scraper”: “Kratzer (Endschaber)”,
“a flint side scraper”: “Seitenschaber”,
“a flint core with flake scars”: “Feuersteinknollen/Kern”,
“a stone grinding mortar and pestle”: “Mahlstein/Moerser”,
“a stone hammer or mace head”: “Steinhammer/Keulenkopf”,
“a polished stone chisel”: “Steinmeissel”,
“a stone spindle whorl”: “Spinnwirtel (Stein)”,
“a stone pendant with a hole”: “Steinanhaenger”,
“a stone amulet or carved stone”: “Steinamulett”,
“a perforated stone disc”: “Durchlochte Steinscheibe”,
“an ancient bronze fibula brooch”: “Fibel (Bronze)”,
“a roman bow-shaped fibula”: “Buegelfibel (roemisch)”,
“a bronze bracelet or armring”: “Armreif (Bronze)”,
“a bronze finger ring”: “Ring (Bronze)”,
“a bronze or gold torc necklace”: “Torques/Halsring”,
“a bronze dress pin”: “Gewandnadel”,
“a bronze belt buckle or clasp”: “Guertelschnalle”,
“a bronze pendant or amulet”: “Anhaenger (Bronze)”,
“a bronze sword blade”: “Schwert (Bronze)”,
“a bronze dagger or knife”: “Dolch/Messer (Bronze)”,
“an iron sword or blade”: “Schwert (Eisen)”,
“a bronze spearhead”: “Speerspitze (Bronze)”,
“an iron spearhead or lance tip”: “Lanzenspitze (Eisen)”,
“a bronze or iron axe head”: “Axt (Metall)”,
“a bronze sickle blade”: “Sichel (Bronze)”,
“a bronze needle or awl”: “Nadel/Ahle (Bronze)”,
“a bronze chisel tool”: “Meissel (Bronze)”,
“an ancient roman coin”: “Muenze (roemisch)”,
“an ancient greek coin”: “Muenze (griechisch)”,
“a celtic coin”: “Muenze (keltisch)”,
“a medieval coin”: “Muenze (Mittelalter)”,
“a pottery fragment or sherd”: “Keramikscherbe”,
“a decorated pottery rim fragment”: “Randscherbe (verziert)”,
“a pottery handle fragment”: “Henkelscherbe”,
“a complete ceramic vessel or pot”: “Keramikgefaess”,
“a ceramic oil lamp”: “Oellampe”,
“an amphora or large storage vessel”: “Amphore”,
“a ceramic spindle whorl”: “Spinnwirtel (Keramik)”,
“a clay figurine or idol”: “Tonfigur/Idol”,
“a small bronze figurine or statuette”: “Bronzefigur”,
“a stone carved head or bust”: “Steinkopf/Bueste”,
“a bone needle or bone awl”: “Knochennadel/Ahle”,
“a bone comb”: “Knochenkamm”,
“a carved antler tool”: “Geweihgeraet”,
“an ivory carving or ornament”: “Elfenbeinschnitzerei”,
“a glass bead”: “Glasperle”,
“a glass bracelet fragment”: “Glasarmring-Fragment”,
“an ancient glass vessel”: “Glasgefaess”,
“an amber bead or amber ornament”: “Bernsteinperle”,
“a shell ornament or shell bead”: “Muschelschmuck”,
“a stone seal or stamp”: “Steinsiegel/Stempel”,
“a lead weight or plumb bob”: “Bleigewicht”,
“a mosaic tile or tessera”: “Mosaikstein/Tessera”,
};

var LABEL_TO_SEARCH = {
“a neolithic polished stone axe”: “polished stone axe neolithic”,
“a rough flaked stone hand axe”: “hand axe paleolithic flaked stone”,
“a stone adze or celt tool”: “stone adze celt tool”,
“a flint arrowhead”: “flint arrowhead”,
“a leaf-shaped flint arrowhead”: “leaf shaped flint arrowhead”,
“a triangular flint projectile point”: “triangular projectile point flint”,
“a long flint blade or knife”: “flint blade knife lithic”,
“a flint microlith”: “microlith mesolithic flint”,
“a flint end scraper”: “flint end scraper”,
“a flint side scraper”: “flint side scraper”,
“a flint core with flake scars”: “flint core knapping”,
“a stone grinding mortar and pestle”: “grinding stone mortar pestle”,
“a stone hammer or mace head”: “stone hammer mace head”,
“a polished stone chisel”: “polished stone chisel”,
“a stone spindle whorl”: “stone spindle whorl”,
“a stone pendant with a hole”: “stone pendant perforated”,
“a stone amulet or carved stone”: “stone amulet carved”,
“a perforated stone disc”: “perforated stone disc”,
“an ancient bronze fibula brooch”: “bronze fibula brooch”,
“a roman bow-shaped fibula”: “roman fibula bow shaped”,
“a bronze bracelet or armring”: “bronze bracelet armring”,
“a bronze finger ring”: “bronze ring finger”,
“a bronze or gold torc necklace”: “torc torque necklace”,
“a bronze dress pin”: “bronze dress pin”,
“a bronze belt buckle or clasp”: “belt buckle clasp bronze”,
“a bronze pendant or amulet”: “bronze pendant amulet”,
“a bronze sword blade”: “bronze sword blade”,
“a bronze dagger or knife”: “bronze dagger knife”,
“an iron sword or blade”: “iron sword blade”,
“a bronze spearhead”: “bronze spearhead”,
“an iron spearhead or lance tip”: “iron spearhead lance”,
“a bronze or iron axe head”: “metal axe head bronze iron”,
“a bronze sickle blade”: “bronze sickle”,
“a bronze needle or awl”: “bronze needle awl”,
“a bronze chisel tool”: “bronze chisel”,
“an ancient roman coin”: “roman coin”,
“an ancient greek coin”: “greek coin ancient”,
“a celtic coin”: “celtic coin”,
“a medieval coin”: “medieval coin”,
“a pottery fragment or sherd”: “pottery fragment sherd”,
“a decorated pottery rim fragment”: “pottery rim decorated”,
“a pottery handle fragment”: “pottery handle fragment”,
“a complete ceramic vessel or pot”: “ceramic vessel pot”,
“a ceramic oil lamp”: “oil lamp ceramic ancient”,
“an amphora or large storage vessel”: “amphora storage vessel”,
“a ceramic spindle whorl”: “ceramic spindle whorl”,
“a clay figurine or idol”: “clay figurine idol”,
“a small bronze figurine or statuette”: “bronze figurine statuette”,
“a stone carved head or bust”: “stone head bust carved”,
“a bone needle or bone awl”: “bone needle awl”,
“a bone comb”: “bone comb”,
“a carved antler tool”: “antler tool carved”,
“an ivory carving or ornament”: “ivory carving ornament”,
“a glass bead”: “glass bead ancient”,
“a glass bracelet fragment”: “glass bracelet ring”,
“an ancient glass vessel”: “ancient glass vessel”,
“an amber bead or amber ornament”: “amber bead ornament”,
“a shell ornament or shell bead”: “shell ornament bead”,
“a stone seal or stamp”: “stone seal stamp cylinder”,
“a lead weight or plumb bob”: “lead weight”,
“a mosaic tile or tessera”: “mosaic tessera tile”,
};

// =============================================================================
// EPOCH LABELS (CLIP second pass)
// =============================================================================

var EPOCH_LABELS = [
“a paleolithic stone age artifact”,
“a mesolithic artifact”,
“a neolithic stone age artifact”,
“a bronze age artifact”,
“an iron age artifact”,
“an ancient greek artifact”,
“an ancient roman artifact”,
“an ancient egyptian artifact”,
“a viking norse artifact”,
“a medieval artifact”,
];

var EPOCH_TO_KEY = {
“a paleolithic stone age artifact”: “prehistoric”,
“a mesolithic artifact”: “prehistoric”,
“a neolithic stone age artifact”: “neolithic”,
“a bronze age artifact”: “bronze_age”,
“an iron age artifact”: “iron_age”,
“an ancient greek artifact”: “greek”,
“an ancient roman artifact”: “roman”,
“an ancient egyptian artifact”: “egyptian”,
“a viking norse artifact”: “viking”,
“a medieval artifact”: “medieval”,
};

var EPOCH_TO_GERMAN = {
“a paleolithic stone age artifact”: “Altsteinzeit”,
“a mesolithic artifact”: “Mittelsteinzeit”,
“a neolithic stone age artifact”: “Jungsteinzeit”,
“a bronze age artifact”: “Bronzezeit”,
“an iron age artifact”: “Eisenzeit”,
“an ancient greek artifact”: “Griechische Antike”,
“an ancient roman artifact”: “Roemische Antike”,
“an ancient egyptian artifact”: “Aegyptische Antike”,
“a viking norse artifact”: “Wikingerzeit”,
“a medieval artifact”: “Mittelalter”,
};

// =============================================================================
// MATERIAL LABELS (CLIP third pass)
// =============================================================================

var MATERIAL_LABELS = [
“a stone artifact”,
“a flint artifact”,
“a bronze metal artifact”,
“an iron metal artifact”,
“a ceramic clay artifact”,
“a bone artifact”,
“a glass artifact”,
“a gold artifact”,
“a silver artifact”,
“a wood artifact”,
];

var MATERIAL_TO_KEY = {
“a stone artifact”: “stone”,
“a flint artifact”: “flint”,
“a bronze metal artifact”: “bronze”,
“an iron metal artifact”: “iron”,
“a ceramic clay artifact”: “ceramic”,
“a bone artifact”: “bone”,
“a glass artifact”: “glass”,
“a gold artifact”: “gold”,
“a silver artifact”: “silver”,
“a wood artifact”: “wood”,
};

var MATERIAL_TO_GERMAN = {
“a stone artifact”: “Stein”,
“a flint artifact”: “Feuerstein/Silex”,
“a bronze metal artifact”: “Bronze”,
“an iron metal artifact”: “Eisen”,
“a ceramic clay artifact”: “Keramik/Ton”,
“a bone artifact”: “Knochen”,
“a glass artifact”: “Glas”,
“a gold artifact”: “Gold”,
“a silver artifact”: “Silber”,
“a wood artifact”: “Holz”,
};

// =============================================================================
// MANUAL OBJECT TYPES (expanded)
// =============================================================================

var MANUAL_OBJECT_TYPES = [
{ id: “axe”, german: “Steinbeil/Axt”, search: “stone axe neolithic” },
{ id: “handaxe”, german: “Faustkeil”, search: “hand axe paleolithic” },
{ id: “arrowhead”, german: “Pfeilspitze”, search: “arrowhead projectile flint” },
{ id: “scraper”, german: “Schaber/Kratzer”, search: “scraper flint tool” },
{ id: “blade”, german: “Klinge”, search: “blade flint lithic” },
{ id: “pendant”, german: “Anhaenger/Amulett”, search: “pendant amulet stone” },
{ id: “fibula”, german: “Fibel/Brosche”, search: “fibula brooch” },
{ id: “coin”, german: “Muenze”, search: “coin ancient numismatic” },
{ id: “pottery”, german: “Keramik/Scherbe”, search: “pottery ceramic sherd” },
{ id: “vessel”, german: “Gefaess”, search: “ceramic vessel pot” },
{ id: “ring”, german: “Ring/Schmuck”, search: “ring jewelry bronze” },
{ id: “bracelet”, german: “Armreif”, search: “bracelet armring bronze” },
{ id: “figurine”, german: “Figur/Statue”, search: “figurine statue idol” },
{ id: “sword”, german: “Schwert/Dolch”, search: “sword dagger blade weapon” },
{ id: “spear”, german: “Speerspitze”, search: “spearhead lance point” },
{ id: “needle”, german: “Nadel (Knochen/Bronze)”, search: “needle bone bronze awl” },
{ id: “lamp”, german: “Oellampe”, search: “oil lamp ancient ceramic” },
{ id: “bead”, german: “Perle (Glas/Bernstein)”, search: “bead glass amber” },
{ id: “spindle”, german: “Spinnwirtel”, search: “spindle whorl” },
{ id: “seal”, german: “Siegel/Stempel”, search: “seal stamp cylinder” },
];

export default function Home() {
// Auth State
var userState = useState(null);
var user = userState[0];
var setUser = userState[1];

var showAuthState = useState(false);
var showAuth = showAuthState[0];
var setShowAuth = showAuthState[1];

var authModeState = useState(“login”);
var authMode = authModeState[0];
var setAuthMode = authModeState[1];

var emailState = useState(””);
var email = emailState[0];
var setEmail = emailState[1];

var passwordState = useState(””);
var password = passwordState[0];
var setPassword = passwordState[1];

var authErrorState = useState(””);
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

var clipStatusState = useState(“idle”);
var clipStatus = clipStatusState[0];
var setClipStatus = clipStatusState[1];

var detectState = useState([]);
var detectedLabels = detectState[0];
var setDetectedLabels = detectState[1];

// NEW: Epoch & Material detection
var detectedEpochState = useState(null);
var detectedEpoch = detectedEpochState[0];
var setDetectedEpoch = detectedEpochState[1];

var detectedMaterialState = useState(null);
var detectedMaterial = detectedMaterialState[0];
var setDetectedMaterial = detectedMaterialState[1];

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

var keywordsState = useState(””);
var searchKeywords = keywordsState[0];
var setSearchKeywords = keywordsState[1];

var usedQueryState = useState(””);
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
if (session) { setUser(session.user); } else { setUser(null); }
});
return function() { authListener.data.subscription.unsubscribe(); };
}
}, []);

// Auth Functions
async function handleLogin() {
setAuthLoading(true);
setAuthError(””);
try {
var result = await supabase.auth.signInWithPassword({ email: email, password: password });
if (result.error) { setAuthError(result.error.message); }
else { setShowAuth(false); setEmail(””); setPassword(””); }
} catch (e) { setAuthError(“Login fehlgeschlagen”); }
setAuthLoading(false);
}

async function handleRegister() {
setAuthLoading(true);
setAuthError(””);
try {
var result = await supabase.auth.signUp({ email: email, password: password });
if (result.error) { setAuthError(result.error.message); }
else { setAuthError(””); setAuthMode(“login”); alert(“Registrierung erfolgreich! Bitte bestaetigen Sie Ihre E-Mail.”); }
} catch (e) { setAuthError(“Registrierung fehlgeschlagen”); }
setAuthLoading(false);
}

async function handleLogout() {
await supabase.auth.signOut();
setUser(null); setMyFinds([]); setShowFinds(false);
}

// Finds Functions
async function loadMyFinds() {
if (!user) return;
setFindsLoading(true);
try {
var session = await supabase.auth.getSession();
var token = session.data.session.access_token;
var response = await fetch(API_BASE_URL + “/api/finds”, {
headers: { “Authorization”: “Bearer “ + token }
});
if (response.ok) {
var data = await response.json();
setMyFinds(data.finds || []);
}
} catch (e) { console.error(“Error loading finds:”, e); }
setFindsLoading(false);
}

async function saveFindToCollection() {
if (!user) { setShowAuth(true); return; }
if (!uploadedImage || detectedLabels.length === 0) { alert(“Bitte erst ein Bild analysieren”); return; }
try {
var session = await supabase.auth.getSession();
var token = session.data.session.access_token;
var findData = {
title: detectedLabels[0] ? detectedLabels[0].german : “Unbekannter Fund”,
object_type: detectedLabels[0] ? detectedLabels[0].german : “”,
epoch: detectedEpoch ? detectedEpoch.german : “”,
material: detectedMaterial ? detectedMaterial.german : “”,
image_data: uploadedImage,
ai_labels: detectedLabels,
matched_artifacts: results.slice(0, 5)
};
var response = await fetch(API_BASE_URL + “/api/finds”, {
method: “POST”,
headers: { “Authorization”: “Bearer “ + token, “Content-Type”: “application/json” },
body: JSON.stringify(findData)
});
if (response.ok) { alert(“Fund gespeichert!”); loadMyFinds(); }
else { alert(“Fehler beim Speichern”); }
} catch (e) { console.error(“Error saving find:”, e); alert(“Fehler beim Speichern”); }
}

async function deleteFind(findId) {
if (!confirm(“Fund wirklich loeschen?”)) return;
try {
var session = await supabase.auth.getSession();
var token = session.data.session.access_token;
var response = await fetch(API_BASE_URL + “/api/finds/” + findId, {
method: “DELETE”,
headers: { “Authorization”: “Bearer “ + token }
});
if (response.ok) { loadMyFinds(); }
} catch (e) { console.error(“Error deleting find:”, e); }
}

// =============================================================================
// CLIP Functions (Phase 1.1: Multi-step analysis)
// =============================================================================

async function loadClipModel() {
if (clipRef.current) return true;
try {
setClipStatus(“loading”);
var transformers = await import(”@xenova/transformers”);
clipRef.current = await transformers.pipeline(“zero-shot-image-classification”, “Xenova/clip-vit-base-patch32”);
setClipStatus(“ready”);
return true;
} catch (err) {
setClipStatus(“error”);
return false;
}
}

async function analyzeImage(imageUrl) {
var loaded = await loadClipModel();
if (!loaded) return { labels: [], epoch: null, material: null };

```
try {
  // Step 1: Object classification (60 labels)
  setClipStatus("analyzing");
  var clipResults = await clipRef.current(imageUrl, CLIP_LABELS);
  var sorted = clipResults.sort(function(a, b) { return b.score - a.score; });
  var top = sorted.slice(0, 5).filter(function(r) { return r.score > 0.02; });
  
  var labels = top.map(function(r) {
    return {
      label: r.label,
      german: LABEL_TO_GERMAN[r.label] || r.label,
      search: LABEL_TO_SEARCH[r.label] || "",
      score: Math.round(r.score * 100),
      selected: true
    };
  });

  // Step 2: Epoch classification
  setClipStatus("Epoche...");
  var epochResults = await clipRef.current(imageUrl, EPOCH_LABELS);
  var epochSorted = epochResults.sort(function(a, b) { return b.score - a.score; });
  var topEpoch = epochSorted[0];
  var epochResult = null;
  if (topEpoch && topEpoch.score > 0.05) {
    epochResult = {
      label: topEpoch.label,
      german: EPOCH_TO_GERMAN[topEpoch.label] || topEpoch.label,
      key: EPOCH_TO_KEY[topEpoch.label] || "",
      score: Math.round(topEpoch.score * 100),
    };
  }

  // Step 3: Material classification
  setClipStatus("Material...");
  var materialResults = await clipRef.current(imageUrl, MATERIAL_LABELS);
  var materialSorted = materialResults.sort(function(a, b) { return b.score - a.score; });
  var topMaterial = materialSorted[0];
  var materialResult = null;
  if (topMaterial && topMaterial.score > 0.05) {
    materialResult = {
      label: topMaterial.label,
      german: MATERIAL_TO_GERMAN[topMaterial.label] || topMaterial.label,
      key: MATERIAL_TO_KEY[topMaterial.label] || "",
      score: Math.round(topMaterial.score * 100),
    };
  }

  setClipStatus("ready");
  return { labels: labels, epoch: epochResult, material: materialResult };
} catch (err) {
  setClipStatus("error");
  return { labels: [], epoch: null, material: null };
}
```

}

function toggleTag(index) {
var newLabels = detectedLabels.map(function(label, i) {
if (i === index) { return { …label, selected: !label.selected }; }
return label;
});
setDetectedLabels(newLabels);
}

function addManualTag(objType) {
var exists = selectedTags.find(function(t) { return t.id === objType.id; });
if (!exists) { setSelectedTags([…selectedTags, objType]); }
setShowManualSelect(false);
}

function removeManualTag(id) {
setSelectedTags(selectedTags.filter(function(t) { return t.id !== id; }));
}

function handleDragOver(e) { e.preventDefault(); setIsDragging(true); }
function handleDragLeave(e) { e.preventDefault(); setIsDragging(false); }

function handleDrop(e) {
e.preventDefault(); setIsDragging(false);
var file = e.dataTransfer.files[0];
if (file && file.type.startsWith(“image/”)) {
var reader = new FileReader();
reader.onload = function(ev) {
setUploadedImage(ev.target.result);
setDetectedLabels([]); setSelectedTags([]);
setDetectedEpoch(null); setDetectedMaterial(null);
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
setDetectedLabels([]); setSelectedTags([]);
setDetectedEpoch(null); setDetectedMaterial(null);
setShowResults(false);
};
reader.readAsDataURL(file);
}
}

function openFileDialog() { document.getElementById(“file-input”).click(); }

async function handleAnalyzeOnly() {
if (!uploadedImage) return;
setIsLoading(true);
var result = await analyzeImage(uploadedImage);
setDetectedLabels(result.labels);
setDetectedEpoch(result.epoch);
setDetectedMaterial(result.material);
setIsLoading(false);
}

// =============================================================================
// SEARCH (Phase 1.2: Smart query logic)
// =============================================================================

async function handleSearch() {
setIsLoading(true);
setError(null);
setResults([]);

```
try {
  // Phase 1.2: Use only TOP-1 label as primary, TOP-2 as secondary
  var primaryQuery = "";
  var secondaryQuery = "";
  var epochFilter = "";
  var materialFilter = "";

  // Top selected KI label = primary search
  var selectedKILabels = detectedLabels.filter(function(l) { return l.selected; });
  if (selectedKILabels.length > 0) {
    primaryQuery = selectedKILabels[0].search;
    if (selectedKILabels.length > 1) {
      secondaryQuery = selectedKILabels[1].search;
    }
  }

  // Manual tags: first one becomes primary if no KI labels
  if (!primaryQuery && selectedTags.length > 0) {
    primaryQuery = selectedTags[0].search;
    if (selectedTags.length > 1) {
      secondaryQuery = selectedTags[1].search;
    }
  } else if (selectedTags.length > 0) {
    // Add first manual tag as secondary if not already set
    if (!secondaryQuery) {
      secondaryQuery = selectedTags[0].search;
    }
  }

  // Additional keywords override or append
  if (searchKeywords.trim()) {
    if (!primaryQuery) {
      primaryQuery = searchKeywords.trim();
    } else {
      primaryQuery = primaryQuery + " " + searchKeywords.trim();
    }
  }

  // Epoch and material from KI detection
  if (detectedEpoch) {
    epochFilter = detectedEpoch.key;
  }
  if (detectedMaterial) {
    materialFilter = detectedMaterial.key;
  }

  // Fallback
  if (!primaryQuery) {
    primaryQuery = "archaeology artifact";
  }

  // Build URL with new structured params
  var url = API_BASE_URL + "/api/search?q=" + encodeURIComponent(primaryQuery) + "&limit=20";
  if (secondaryQuery) {
    url += "&q2=" + encodeURIComponent(secondaryQuery);
  }
  if (epochFilter) {
    url += "&epoch=" + encodeURIComponent(epochFilter);
  }
  if (materialFilter) {
    url += "&material=" + encodeURIComponent(materialFilter);
  }

  setUsedQuery(primaryQuery + (secondaryQuery ? " | " + secondaryQuery : ""));

  var response = await fetch(url);
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
```

}

function resetAll() {
setUploadedImage(null); setShowResults(false); setResults([]);
setError(null); setSearchKeywords(””); setDetectedLabels([]);
setSelectedTags([]); setUsedQuery(””); setShowManualSelect(false);
setDetectedEpoch(null); setDetectedMaterial(null);
}

function getStatusText() {
if (clipStatus === “loading”) return “Lade KI…”;
if (clipStatus === “analyzing”) return “Analysiere Objekt…”;
if (clipStatus === “Epoche…”) return “Erkenne Epoche…”;
if (clipStatus === “Material…”) return “Erkenne Material…”;
if (clipStatus === “ready”) return “KI bereit”;
return “”;
}

// Styles
var containerStyle = { minHeight: “100vh”, background: “linear-gradient(165deg, #1a1612 0%, #2d2520 50%, #1a1612 100%)”, color: “#e8e0d5”, fontFamily: “system-ui, sans-serif” };
var inputStyle = { width: “100%”, padding: “0.75rem”, background: “rgba(0,0,0,0.3)”, border: “1px solid rgba(232,224,213,0.2)”, borderRadius: “8px”, color: “#e8e0d5”, fontSize: “1rem” };
var buttonStyle = { padding: “0.75rem 1.5rem”, background: “linear-gradient(135deg, #c9a962, #a08050)”, borderRadius: “8px”, border: “none”, color: “#1a1612”, fontWeight: “600”, cursor: “pointer” };
var tagActiveStyle = { display: “inline-flex”, alignItems: “center”, gap: “0.3rem”, padding: “0.25rem 0.6rem”, background: “rgba(201,169,98,0.3)”, border: “2px solid #c9a962”, borderRadius: “999px”, fontSize: “0.75rem”, color: “#c9a962”, cursor: “pointer”, marginRight: “0.4rem”, marginBottom: “0.4rem” };
var tagInactiveStyle = { …tagActiveStyle, background: “transparent”, border: “2px solid rgba(232,224,213,0.3)”, color: “rgba(232,224,213,0.5)”, textDecoration: “line-through” };
var infoTagStyle = { display: “inline-flex”, alignItems: “center”, gap: “0.3rem”, padding: “0.2rem 0.5rem”, borderRadius: “6px”, fontSize: “0.7rem”, marginRight: “0.4rem”, marginBottom: “0.4rem” };
var modalStyle = { position: “fixed”, top: 0, left: 0, right: 0, bottom: 0, background: “rgba(0,0,0,0.8)”, display: “flex”, alignItems: “center”, justifyContent: “center”, zIndex: 1000 };
var modalContentStyle = { background: “#2d2520”, borderRadius: “16px”, padding: “2rem”, maxWidth: “400px”, width: “90%”, border: “1px solid rgba(201,169,98,0.3)” };

return (
<>
<Head>
<title>ArchaeoFinder v{APP_VERSION}</title>
<meta name="viewport" content="width=device-width, initial-scale=1" />
</Head>

```
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
            <button onClick={function() { setShowFinds(true); loadMyFinds(); }} style={{ ...buttonStyle, background: "transparent", border: "1px solid #c9a962", color: "#c9a962", padding: "0.5rem 1rem", fontSize: "0.85rem" }}>Meine Funde</button>
            <button onClick={handleLogout} style={{ ...buttonStyle, background: "transparent", border: "1px solid rgba(232,224,213,0.3)", color: "rgba(232,224,213,0.6)", padding: "0.5rem 1rem", fontSize: "0.85rem" }}>Logout</button>
          </>
        ) : (
          <button onClick={function() { setShowAuth(true); }} style={{ ...buttonStyle, padding: "0.5rem 1rem", fontSize: "0.85rem" }}>Anmelden</button>
        )}
      </div>
    </header>

    {/* Auth Modal */}
    {showAuth && (
      <div style={modalStyle} onClick={function() { setShowAuth(false); }}>
        <div style={modalContentStyle} onClick={function(e) { e.stopPropagation(); }}>
          <h2 style={{ color: "#c9a962", marginBottom: "1.5rem", textAlign: "center" }}>{authMode === "login" ? "Anmelden" : "Registrieren"}</h2>
          {authError && <p style={{ color: "#ff6b6b", marginBottom: "1rem", fontSize: "0.85rem" }}>{authError}</p>}
          <div style={{ marginBottom: "1rem" }}><input type="email" placeholder="E-Mail" value={email} onChange={function(e) { setEmail(e.target.value); }} style={inputStyle} /></div>
          <div style={{ marginBottom: "1.5rem" }}><input type="password" placeholder="Passwort" value={password} onChange={function(e) { setPassword(e.target.value); }} style={inputStyle} /></div>
          <button onClick={authMode === "login" ? handleLogin : handleRegister} disabled={authLoading} style={{ ...buttonStyle, width: "100%", opacity: authLoading ? 0.7 : 1 }}>{authLoading ? "..." : (authMode === "login" ? "Anmelden" : "Registrieren")}</button>
          <p style={{ textAlign: "center", marginTop: "1rem", fontSize: "0.85rem", color: "rgba(232,224,213,0.6)" }}>
            {authMode === "login" ? "Noch kein Konto? " : "Bereits registriert? "}
            <span onClick={function() { setAuthMode(authMode === "login" ? "register" : "login"); setAuthError(""); }} style={{ color: "#c9a962", cursor: "pointer" }}>{authMode === "login" ? "Registrieren" : "Anmelden"}</span>
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
            <button onClick={function() { setShowFinds(false); }} style={{ background: "none", border: "none", color: "#c9a962", fontSize: "1.5rem", cursor: "pointer" }}>x</button>
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
                    {find.image_data && <img src={find.image_data} alt={find.title} style={{ width: "80px", height: "80px", objectFit: "cover", borderRadius: "8px" }} />}
                    <div style={{ flex: 1 }}>
                      <h4 style={{ color: "#e8e0d5", marginBottom: "0.25rem" }}>{find.title}</h4>
                      <p style={{ fontSize: "0.75rem", color: "rgba(232,224,213,0.5)" }}>{find.object_type}{find.epoch ? " | " + find.epoch : ""}{find.material ? " | " + find.material : ""}</p>
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
      <p style={{ fontSize: "0.85rem", color: "rgba(232,224,213,0.6)" }}>Laden Sie ein Foto hoch - die KI erkennt Objekttyp, Epoche und Material.</p>
    </section>

    <main style={{ padding: "0 1.5rem 3rem", maxWidth: "1100px", margin: "0 auto" }}>
      {error && <div style={{ background: "rgba(220,50,50,0.1)", border: "1px solid rgba(220,50,50,0.3)", borderRadius: "8px", padding: "1rem", marginBottom: "1rem", color: "#ff6b6b" }}>{error}</div>}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "1.5rem", marginBottom: "1.5rem" }}>

        {/* Left Panel */}
        <div style={{ background: "rgba(232,224,213,0.05)", border: "1px solid rgba(232,224,213,0.1)", borderRadius: "14px", padding: "1.25rem" }}>
          <div onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop} onClick={function() { if (!uploadedImage) openFileDialog(); }}
            style={{ minHeight: "160px", borderRadius: "10px", padding: "1rem", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", cursor: "pointer", border: isDragging ? "2px dashed #c9a962" : uploadedImage ? "2px solid rgba(201,169,98,0.5)" : "2px dashed rgba(232,224,213,0.2)", background: "rgba(0,0,0,0.2)" }}>
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
              {clipStatus === "analyzing" || clipStatus === "Epoche..." || clipStatus === "Material..." ? getStatusText() : "KI-Erkennung starten"}
            </button>
          )}

          {/* KI Object Labels */}
          {detectedLabels.length > 0 && (
            <div style={{ marginTop: "0.75rem" }}>
              <p style={{ fontSize: "0.65rem", color: "rgba(232,224,213,0.5)", marginBottom: "0.4rem", textTransform: "uppercase" }}>KI-Erkennung (Objekttyp):</p>
              {detectedLabels.map(function(l, i) {
                return <span key={i} onClick={function() { toggleTag(i); }} style={l.selected ? tagActiveStyle : tagInactiveStyle}>{l.german} ({l.score}%)</span>;
              })}
            </div>
          )}

          {/* Epoch & Material Info */}
          {(detectedEpoch || detectedMaterial) && (
            <div style={{ marginTop: "0.5rem", display: "flex", flexWrap: "wrap", gap: "0.25rem" }}>
              {detectedEpoch && (
                <span style={{ ...infoTagStyle, background: "rgba(100,149,237,0.2)", border: "1px solid rgba(100,149,237,0.5)", color: "#6495ed" }}>
                  🕐 {detectedEpoch.german} ({detectedEpoch.score}%)
                </span>
              )}
              {detectedMaterial && (
                <span style={{ ...infoTagStyle, background: "rgba(144,238,144,0.15)", border: "1px solid rgba(144,238,144,0.4)", color: "#90ee90" }}>
                  🔬 {detectedMaterial.german} ({detectedMaterial.score}%)
                </span>
              )}
            </div>
          )}

          {/* Manual Tags */}
          {selectedTags.length > 0 && (
            <div style={{ marginTop: "0.5rem" }}>
              <p style={{ fontSize: "0.65rem", color: "rgba(232,224,213,0.5)", marginBottom: "0.4rem", textTransform: "uppercase" }}>Manuell:</p>
              {selectedTags.map(function(t) {
                return <span key={t.id} onClick={function() { removeManualTag(t.id); }} style={{ ...tagActiveStyle, background: "rgba(100,180,100,0.2)", borderColor: "#6b6", color: "#8c8" }}>{t.german} x</span>;
              })}
            </div>
          )}

          <button onClick={function() { setShowManualSelect(!showManualSelect); }} style={{ marginTop: "0.75rem", width: "100%", padding: "0.5rem", background: "transparent", border: "1px dashed rgba(232,224,213,0.3)", borderRadius: "8px", color: "rgba(232,224,213,0.6)", fontSize: "0.8rem", cursor: "pointer" }}>
            + Objekttyp manuell
          </button>

          {showManualSelect && (
            <div style={{ marginTop: "0.5rem", background: "rgba(0,0,0,0.4)", borderRadius: "8px", padding: "0.5rem", maxHeight: "200px", overflowY: "auto" }}>
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

            {/* Search Info */}
            {(detectedEpoch || detectedMaterial) && (
              <div style={{ padding: "0.5rem", background: "rgba(0,0,0,0.2)", borderRadius: "6px" }}>
                <p style={{ fontSize: "0.65rem", color: "rgba(232,224,213,0.5)", marginBottom: "0.3rem" }}>Automatische Filter (aus KI):</p>
                {detectedEpoch && <p style={{ fontSize: "0.7rem", color: "#6495ed" }}>Epoche: {detectedEpoch.german}</p>}
                {detectedMaterial && <p style={{ fontSize: "0.7rem", color: "#90ee90" }}>Material: {detectedMaterial.german}</p>}
              </div>
            )}

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
              <p style={{ fontSize: "0.8rem", color: "rgba(232,224,213,0.6)" }}>{results.length} von {totalResults} Funden (dedupliziert)</p>
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
                      {r.epoch && <p style={{ fontSize: "0.65rem", color: "rgba(100,149,237,0.7)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.epoch}</p>}
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
```

);
}
