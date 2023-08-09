//Model Data
document.addEventListener("DOMContentLoaded", function () {
  const modelViewer = document.querySelector("model-viewer");
  let currentModel = 0; // Index of the current model
  let hotspotsData; // To store the hotspots data

  //Updates hotspot annotations
  const updateHotspots = () => {
    const hotspots = hotspotsData.models[currentModel].hotspots;

    //Clears any existing hotspots
    modelViewer.querySelectorAll(".Hotspot").forEach((element) => {
      element.remove();
    });
    //Creates hotspots
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
        const modelIndex = hotspotsData.models.findIndex(
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

  //Load a model and update hotspots
  const loadModel = (index) => {
    modelViewer.setAttribute("src", hotspotsData.models[index].src);
    currentModel = index;
  };

  //Initial load
  fetch("hotspots.json")
    .then((response) => response.json())
    .then((data) => {
      hotspotsData = data;
      loadModel(0); //need to make sure 0 is site overview model or change this value
      updateHotspots();
    })
    .catch((error) => {
      console.error("Error loading hotspots data:", error);
    });

  //Site Overview button click
  document
    .getElementById("siteoverviewbutton")
    .addEventListener("click", () => {
      currentModel = 0; 
      loadModel(currentModel); 
      updateHotspots(); 
    });
});

//Live data button click
document.getElementById("livedatabutton").addEventListener("click", () => {
  fetch(
    "http://cvdt-api.cfms.org.uk:8082/gateway/veracity/assets/1/dataChannels/1/latest?nLatest=1"
  )
    .then((response) => response.json())
    .then((siteData) => {
      const flowString = `Gas flow = ${siteData[0].flow_m3ph} m^3/h`;
      const compString = `Gas composition = ${siteData[0].h2_comp_pct} %`;
      const pressString = `Gas pressure = ${siteData[0].pressure_barg} barg`;
      const tempString = `Gas temperature = ${siteData[0].temperature_degC} °C`;

      document.getElementById("flowString").textContent = flowString;
      document.getElementById("compString").textContent = compString;
      document.getElementById("pressString").textContent = pressString;
      document.getElementById("tempString").textContent = tempString;
    });
});
