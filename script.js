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

// Fetching JSON data and updating asset tab content
document.addEventListener("DOMContentLoaded", function () {
  fetch("assetdata.json")
    .then(response => response.json())
    .then(data => {
      const assetSection = document.getElementById("asset-section");
      const models = data.models;
      const currentModel = models.find(model => model.name === "Site Overview");

      // Update Asset tab content function
      const updateAssetTabContent = (modelIndex) => {
        const currentModel = models[modelIndex];

        // Update Asset tab content
        let assetInfoContent = `<h2>${currentModel.name} Info Content</h2>`;
        assetInfoContent += `<p>Nominal Diameter: ${currentModel.NominalDiameter}</p>`;
        assetInfoContent += `<p>Material Grade: ${currentModel.MaterialGrade}</p>`;
        assetInfoContent += `<p>Design Standard: ${currentModel.DesignStandard}</p>`;
        assetInfoContent += `<p>Pressure Class: ${currentModel.PressureClass}</p>`;
        assetInfoContent += `<p>Comission Date: ${currentModel.ComissionDate}</p>`;

        assetSection.innerHTML = assetInfoContent;
      };

      // Initial update
      updateAssetTabContent(0);

      // Event listener for hotspot buttons
      modelViewer.addEventListener("click", (event) => {
        if (event.target.classList.contains("Hotspot")) {
          const hotspotName = event.target.textContent.trim();
          const modelIndex = models.findIndex(model => model.name === hotspotName);
          if (modelIndex !== -1) {
            updateAssetTabContent(modelIndex);
          }
        }
      });
    })
    .catch(error => {
      console.error('Error fetching data:', error);
    });
});

// QR CODE SCANNER
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

// DATA TABS
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

// Live data button click

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

// MODEL DATA
const modelViewer = document.querySelector("model-viewer");
let currentModel = 0; // Index of the current model
let assetData; // To store the hotspots data

// Initial load

fetch("assetdata.json")
  .then((response) => {
    if (!response.ok) {
      throw new Error("Unable to retrieve hotspots.json");
    }
    return response.json();
  })
  .then((data) => {
    assetData = data;
    loadModel(0); // need to make sure 0 is site overview model or change this value
    updateHotspots();
    updateElementContentById("areaName", assetData.models[0].name);
    updateElementContentById("infoTitle", assetData.models[0].name);
    updateElementContentById("infoContent", assetData.models[0].description);
  })
  .catch((error) => {
    console.error("Fetch error: ", error.message);
  });

// Load a model by index and update hotspots
const loadModel = (index) => {
  if (assetData && assetData.models && assetData.models[index]) {
    const asset = assetData.models[index]; // First declaration
    modelViewer.setAttribute("src", asset.src);
    currentModel = index;

    // Update common elements like areaName, infoTitle, and infoContent
    updateElementContentById("areaName", asset.name);
    updateElementContentById("infoTitle", asset.name);
    updateElementContentById("infoContent", asset.description);

  const updateIfExists = (id, data) => {
    if (document.getElementById(id)) {
      updateElementContentById(id, data);
    } else {
      console.warn(`Element with ID ${id} not found.`);
      // Optionally, implement logic to handle the absence of expected elements
    }
  };

  // Update asset details in the "asset" tab
  updateIfExists("nominal-diameter", asset.NominalDiameter);
  updateIfExists("material-grade", asset.MaterialGrade);
  updateIfExists("design-standard", asset.DesignStandard);
  updateIfExists("pressure-class", asset.PressureClass);
  updateIfExists("comission-date", asset.ComissionDate);
}
};

// Load a model by name and update hotspots
const loadModelByName = (modelName) => {
  const modelIndex = assetData.models.findIndex(
    (model) => model.name === modelName
  );
  if (modelIndex !== -1) {
    loadModel(modelIndex);
    updateHotspots();
  }
};

// Updates hotspot annotations
const updateHotspots = () => {
  const hotspots = assetData.models[currentModel].hotspots;

  // Clears any existing hotspots
  modelViewer.querySelectorAll(".Hotspot").forEach((element) => {
    element.remove();
  });
  // Creates new hotspots
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

    // Switches model to match annotation clicked
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

// Site Overview button click
document.getElementById("siteoverviewbutton").addEventListener("click", () => {
  currentModel = 0;
  loadModel(currentModel);
  updateHotspots();
});
