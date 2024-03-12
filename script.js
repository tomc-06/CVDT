if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .register("./serviceworker.js")
    .then((registration) => {
      console.log("Service Worker registered with scope:", registration.scope);
    })
    .catch((err) => {
      console.log("Service Worker registration failed:", err);
    });
}

function updateElementContentById(elementId, content) {
  const element = document.getElementById(elementId);
  if (element) {
    element.textContent = content;
  } else {
    console.warn(`Element with ID ${elementId} not found.`);
  }
}

//QR CODE SCANNER
document.getElementById("qr-code-button").addEventListener("click", showhideQR);
let html5QrcodeScanner;

function initializeScanner() {
  if (!html5QrcodeScanner) {
    function onScanSuccess(decodedText, decodedResult) {
      console.log(`Code matched = ${decodedText}`, decodedResult);
      clearScanner();
      updateElementContentById("icon", "qr_code_scanner");

      if (assetData) {
        const matchingModel = assetData.models.find(
          (model) => model.name === decodedText
        );
        if (matchingModel) {
          loadModelByName(decodedText);
        }
      } else {
        console.error("Hotspots data not loaded yet.");
      }
    }

    function onScanFailure(error) {
      console.warn(`Code scan error = ${error}`);
    }

    html5QrcodeScanner = new Html5QrcodeScanner(
      "reader",
      { fps: 10, qrbox: { width: 250, height: 250 } },
      false
    );
    html5QrcodeScanner.render(onScanSuccess, onScanFailure);
  } else {
    console.warn("Scanner is already initialized.");
  }
}

function clearScanner() {
  if (html5QrcodeScanner) {
    html5QrcodeScanner.clear();
    html5QrcodeScanner = null;
  }
}

function showhideQR() {
  const x = document.getElementById("qrscanner");
  if (x.style.display === "none") {
    x.style.display = "block";
    updateElementContentById("icon", "close");
    initializeScanner();
  } else {
    x.style.display = "none";
    updateElementContentById("icon", "qr_code_scanner");
    clearScanner();
  }
}

//DATA TABS
// Get references to the navigation links and sections
const infoLink = document.getElementById("info-link");
const assetLink = document.getElementById("asset-link");
const dataLink = document.getElementById("data-link");
const infoSection = document.getElementById("info-section");
const assetSection = document.getElementById("asset-section");
const dataSection = document.getElementById("data-section");

// Function to hide all sections and update active link
function showSection(sectionToShow, activeLink) {
  infoSection.style.display = "none";
  assetSection.style.display = "none";
  dataSection.style.display = "none";

  infoLink.classList.remove("active");
  assetLink.classList.remove("active");
  dataLink.classList.remove("active");

  sectionToShow.style.display = "block";
  activeLink.classList.add("active");
}

infoLink.addEventListener("click", function () {
  showSection(infoSection, infoLink);
});

assetLink.addEventListener("click", function () {
  showSection(assetSection, assetLink);
});

dataLink.addEventListener("click", function () {
  showSection(dataSection, dataLink);
});

showSection(infoSection, infoLink);

//Live data button click

document.getElementById("livedatabutton").addEventListener("click", () => {
  const x = document.getElementById("livedatastrings");
  if (x.style.display === "none") {
    fetch(
      "http://cvdt-api.cfms.org.uk:8082/gateway/veracity/assets/1/dataChannels/1/latest?nLatest=1"
    )
      .then((response) => response.json())
      .then((siteData) => {
        updateElementContentById(
          "flowString",
          `Gas flow = ${siteData[0].flow_m3ph} m^3/h`
        );
        updateElementContentById(
          "compString",
          `Gas composition = ${siteData[0].h2_comp_pct} %`
        );
        updateElementContentById(
          "pressString",
          `Gas pressure = ${siteData[0].pressure_barg} barg`
        );
        updateElementContentById(
          "tempString",
          `Gas temperature = ${siteData[0].temperature_degC} °C`
        );
      });
    modelViewer.querySelectorAll(".Hotspot").forEach((element) => {
      element.remove();
    });
    x.style.display = "block";
    updateElementContentById("icon2", "close");
    updateElementContentById("livedatabuttonstring", "Hide Live Data");
  } else {
    x.style.display = "none";
    updateElementContentById("icon2", "query_stats");
    updateElementContentById("livedatabuttonstring", "Get Live Data");
    updateHotspots();
  }
});

//MODEL DATA
const modelViewer = document.querySelector("model-viewer");
let currentModel = 0; // Index of the current model
let assetData; // To store the hotspots data

//Initial load

fetch("assetdata.json")
  .then((response) => {
    if (!response.ok) {
      throw new Error("Unable to retrieve hotspots.json");
    }
    return response.json();
  })
  .then((data) => {
    assetData = data;
    loadModel(0); //need to make sure 0 is site overview model or change this value
    updateHotspots();
    updateElementContentById("areaName", assetData.models[0].name);
    updateElementContentById("infoTitle", assetData.models[0].name);
    updateElementContentById("infoContent", assetData.models[0].description);
  })
  .catch((error) => {
    console.error("Fetch error: ", error.message);
  });

//Load a model by index and update hotspots
const loadModel = (index) => {
  modelViewer.setAttribute("src", assetData.models[index].src);
  currentModel = index;
  console.log("Attempting to load index:", index);
  updateElementContentById("areaName", assetData.models[index].name);
  updateElementContentById("infoTitle", assetData.models[index].name);
  updateElementContentById("infoContent", assetData.models[index].description);
  updateElementContentById("assetTitle", assetData.models[index].name); // Assumes you have an element with ID 'assetTitle'
  updateElementContentById("nominalDiameter", "Nominal Diameter: " + assetData.models[index].NominalDiameter); 
  updateElementContentById("materialGrade", "Material Grade: " + assetData.models[index].NominalDiameter); 
  updateElementContentById("designStandard", "Design Standard: " + assetData.models[index].NominalDiameter); 
  updateElementContentById("pressureClass", "Pressure Class: " + assetData.models[index].NominalDiameter); 
  updateElementContentById("comissionDate", "Commission Date: " + assetData.models[index].NominalDiameter); 
};

// Load a model by name and update hotspots
const loadModelByName = (modelName) => {
  console.log("Attempting to load model:", modelName);
  const modelIndex = assetData.models.findIndex(
    (model) => model.name === modelName
  );
  if (modelIndex !== -1) {
    console.log("Model found at index:", modelIndex);
    loadModel(modelIndex);
    updateHotspots();
    updateElementContentById("areaName", assetData.models[modelIndex].name);
    updateElementContentById("infoTitle", assetData.models[modelIndex].name);
    updateElementContentById(
      "infoContent",
      assetData.models[modelIndex].description
    );
  }
};

//Updates hotspot annotations
const updateHotspots = () => {
  const hotspots = assetData.models[currentModel].hotspots;

  //Clears any existing hotspots
  modelViewer.querySelectorAll(".Hotspot").forEach((element) => {
    element.remove();
  });
  //Creates new hotspots
  hotspots.forEach((hotspot, index) => {
    const button = document.createElement("button");
    button.className = "Hotspot";
    button.setAttribute("slot", `hotspot-${index + 1}`);
    button.setAttribute("data-position", hotspot["data-position"].join(" "));
    button.setAttribute("data-normal", hotspot["data-normal"].join(" "));
    button.setAttribute("data-visibility-attribute", "visible");

    const annotation = document.createElement("div");
    annotation.className = "HotspotAnnotation";
    annotation.textContent = hotspot.name;

    button.appendChild(annotation);

    //Switches model to match annotation clicked
    button.addEventListener("click", () => {
      const hotspotModelName = hotspot.name;
      const modelIndex = assetData.models.findIndex(
        (model) => model.name === hotspotModelName
      );

      if (modelIndex !== -1) {
        loadModel(modelIndex);
        updateHotspots();
      }
    });

    modelViewer.appendChild(button);
  });
};

//Site Overview button click
document.getElementById("siteoverviewbutton").addEventListener("click", () => {
  currentModel = 0;
  loadModel(currentModel);
  updateHotspots();
});
