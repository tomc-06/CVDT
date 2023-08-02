// Handles loading the events for <model-viewer>'s slotted progress bar
const onProgress = (event) => {
  const progressBar = event.target.querySelector('.progress-bar');
  const updatingBar = event.target.querySelector('.update-bar');
  updatingBar.style.width = `${event.detail.totalProgress * 100}%`;
  if (event.detail.totalProgress === 1) {
    progressBar.classList.add('hide');
    event.target.removeEventListener('progress', onProgress);
  } else {
    progressBar.classList.remove('hide');
  }
};
document.querySelector('model-viewer').addEventListener('progress', onProgress);

//API calls

document.addEventListener("click", function (event) {
  // Checking if the button was clicked
  if (!event.target.matches("#livedatabutton")) return;

  fetch('http://cvdt-api.cfms.org.uk:8082/gateway/veracity/assets/1/dataChannels/1/latest?nLatest=1')
    .then(response => response.json())
    .then(siteData => {
      const flowString = `Gas flow = ${siteData[0].flow_m3ph} m^3/h`;
      const compString = `Gas composition = ${siteData[0].h2_comp_pct} %`;
      const pressString = `Gas pressure = ${siteData[0].pressure_barg} barg`;
      const tempString = `Gas temperature = ${siteData[0].temperature_degC} °C`;

      document.getElementById('flowString').textContent = flowString;
      document.getElementById('compString').textContent = compString;
      document.getElementById('pressString').textContent = pressString;
      document.getElementById('tempString').textContent = tempString;
    });
  });