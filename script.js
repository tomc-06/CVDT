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
const sensorLink = document.getElementById("sensor-link");
const infoSection = document.getElementById("info-section");
const assetSection = document.getElementById("asset-section");
const sensorSection = document.getElementById("sensor-section");

// Function to hide all sections and update active link
function showSection(sectionToShow, activeLink) {
  infoSection.style.display = "none";
  assetSection.style.display = "none";
  sensorSection.style.display = "none";

  infoLink.classList.remove("active");
  assetLink.classList.remove("active");
  sensorLink.classList.remove("active");

  sectionToShow.style.display = "block";
  activeLink.classList.add("active");
}

infoLink.addEventListener("click", function () {
  showSection(infoSection, infoLink);
});

assetLink.addEventListener("click", function () {
  showSection(assetSection, assetLink);
});

sensorLink.addEventListener("click", function () {
  showSection(sensorSection, sensorLink);
});

showSection(infoSection, infoLink);


//Sensor positions formerly Live data button click

document.getElementById("livedatabutton").addEventListener("click", () => {
  const liveDataButton = document.getElementById("livedatabuttonstring");
  const isShowingPositions = liveDataButton.textContent.includes("Hide");

 
  if (currentModel !== 0) { // If not on the main model, reset to main model
    document.getElementById("siteoverviewbutton").click();
  } else { // Toggle sensor positions for the main model
    if (isShowingPositions) {
      updateElementContentById("livedatabuttonstring", "Show Sensor Positions");
      updateHotspots(false);
    } else {
      updateElementContentById("livedatabuttonstring", "Hide Sensor Positions");
      updateHotspots(true);
    }
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
  const modelData = assetData.models[index];
  const modelViewer = document.getElementById("model-viewer");
  modelViewer.setAttribute("src", modelData.src);

  if (index === 0) {
    const iosSrc = modelData.iosSrc || modelData.src.replace('.glb', '.usdz');
    modelViewer.setAttribute("ios-src", iosSrc);
    console.log(`Switching to USDZ: ${iosSrc}`);
  } else {
    modelViewer.removeAttribute("ios-src");
    console.log("Removed ios-src attribute");
  }
  currentModel = index;
 // const modelData = assetData.models[index];
 // modelViewer.setAttribute("src", modelData.src);
  //currentModel = index;
  updateAttributesFromModel(modelData);
  console.log("Current model", index);
   // Ensure the button state is correct for the loaded model
   const showSensorButtonState = (currentModel === 0) ? "Show Sensor Positions" : "Show Sensor Positions";
   updateElementContentById("livedatabuttonstring", showSensorButtonState);
  console.log("Attempting to load index:", index);
  updateElementContentById("areaName", assetData.models[index].name);
  updateElementContentById("infoTitle", assetData.models[index].name);
  updateElementContentById("infoContent", assetData.models[index].description);
  updateElementContentById("assetTitle", assetData.models[index].name); // Assumes you have an element with ID 'assetTitle'
  updateElementContentById("nominalDiameter", "Nominal Diameter: " + assetData.models[index].NominalDiameter); 
  updateElementContentById("materialGrade", "Material Grade: " + assetData.models[index].MaterialGrade); 
  updateElementContentById("designStandard", "Design Standard: " + assetData.models[index].DesignStandard); 
  updateElementContentById("pressureClass", "Pressure Class: " + assetData.models[index].PressureClass); 
  updateElementContentById("comissionDate", "Commission Date: " + assetData.models[index].ComissionDate); 
  updateHotspots(currentModel === 0); // Show sensor positions only for main model initially
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
const updateHotspots = (showPositions) => {
  const jsonFile = showPositions && currentModel === 0 ? "sensorposition_new.json" : "hotspots.json";
  fetch(jsonFile)
    .then(response => response.json())
    .then(data => {
      modelViewer.querySelectorAll(".Hotspot").forEach(el => el.remove());
      const hotspots = data.models[currentModel].hotspots;

      // Creates new hotspots based on the fetched data
      hotspots.forEach((hotspot, index) => {
        const button = document.createElement("button");
        button.className = "Hotspot";
        button.setAttribute("slot", `hotspot-${index + 1}`);
        button.setAttribute("data-position", hotspot["data-position"].join(" "));
        button.setAttribute("data-normal", hotspot["data-normal"].join(" "));
        button.setAttribute("data-visibility-attribute", "visible");

        const annotation = document.createElement("div");
        annotation.className = "HotspotAnnotation";
        // Use sensor-name for the annotation text if showPositions is true
        annotation.textContent = showPositions ? hotspot["sensor-name"] : hotspot.name;
        button.appendChild(annotation);

        button.addEventListener("click", () => {
          const modelIndex = assetData.models.findIndex(model => model.name === hotspot.name);
      
          if (modelIndex !== -1) {
              // It's a main model
              loadModel(modelIndex);
          } else {
              // It's a sub-model; find its parent model and then update attributes from the hotspot details
              const parentModel = assetData.models.find(model => model.hotspots.some(h => h.name === hotspot.name));
              if (parentModel) {
                  const hotspotDetails = parentModel.hotspots.find(h => h.name === hotspot.name);
                  if (hotspotDetails) {
                      // Use hotspotDetails to update attributes for a sub-model
                      updateAttributesFromModel(hotspotDetails); // This function is now universally used for updating UI
                  }
              }
          }
      });

        modelViewer.appendChild(button);
      });
    })
    .catch((error) => {
      console.error("Fetch error: ", error.message);
    });
};


// This function updates the UI elements with the model's attributes
function updateAttributesFromModel(modelDetails) {
  updateElementContentById("areaName", modelDetails.name);
  updateElementContentById("infoTitle", modelDetails.name);
  updateElementContentById("infoContent", modelDetails.description);
  updateElementContentById("assetTitle", modelDetails.name);
  updateElementContentById("nominalDiameter", "Nominal Diameter: " + (modelDetails.NominalDiameter || '-')); 
  updateElementContentById("materialGrade", "Material Grade: " + (modelDetails.MaterialGrade || '-')); 
  updateElementContentById("designStandard", "Design Standard: " + (modelDetails.DesignStandard || '-')); 
  updateElementContentById("pressureClass", "Pressure Class: " + (modelDetails.PressureClass || '-')); 
  updateElementContentById("comissionDate", "Commission Date: " + (modelDetails.ComissionDate || '-'));
}

//Site Overview button click
document.getElementById("siteoverviewbutton").addEventListener("click", () => {
  currentModel = 0;
  loadModel(currentModel);
  // Explicitly set sensor positions to not show when loading the main model
  updateElementContentById("livedatabuttonstring", "Show Sensor Positions");
  updateHotspots(false); // Make sure sensor positions are not shown by default when returning to the main model
});
