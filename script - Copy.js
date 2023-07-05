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

//API 

document.addEventListener("click", function (event) {
  // Checking if the button was clicked
  if (!event.target.matches("#livedatabutton")) return;

  fetch('http://datapoint.metoffice.gov.uk/public/data/val/wxfcs/all/json/3224?res=daily&key=172d6a84-bef1-4394-8364-614b49ea678d')
    .then(response => response.json())
    .then(weatherData => {
      // Access the specific temperature value
      const temperature = weatherData.SiteRep.DV.Location.Period[0].Rep[0].Dm;
      const temperatureString = 'Daily Max Ambient Temp = ' + temperature + ' °C';
      // Display the temperature on the webpage
      document.getElementById('temperatureString').textContent = temperatureString;
    })
    .catch(error => {
      console.log('Error fetching weather data:', error);
    });

    fetch('http://www.randomnumberapi.com/api/v1.0/random?min=20&max=70&count=1')
    .then(response => response.json())
    .then(gasPressureData => {
      // Access the specific gas pressure value
      const gasPressure = gasPressureData[0];
      const gasPressureString = 'Current Gas Pressure = ' + gasPressure + ' bar';
      // Display the gas pressure on the webpage
      document.getElementById('gasPressureString').textContent = gasPressureString;
    })
    .catch(error => {
      console.log('Error fetching gas pressure data:', error);
    });

    fetch('http://www.randomnumberapi.com/api/v1.0/random?min=10&max=20&count=1')
    .then(response => response.json())
    .then(gasTempData => {
      // Access the specific gas pressure value
      const gasTemp = gasTempData[0];
      const gasTempString = 'Current Gas Temp = ' + gasTemp + ' °C';
      // Display the gas pressure on the webpage
      document.getElementById('gasTempString').textContent = gasTempString;
    })
    .catch(error => {
      console.log('Error fetching gas temp data:', error);
    });

    fetch('http://www.randomnumberapi.com/api/v1.0/random?min=0&max=100&count=1')
    .then(response => response.json())
    .then(gasBlendData => {
      // Access the specific gas pressure value
      const gasBlend = gasBlendData[0];
      const gasBlendString = 'Current Gas Blend = ' + gasBlend + '% H2 in NG';
      // Display the gas pressure on the webpage
      document.getElementById('gasBlendString').textContent = gasBlendString;
    })
    .catch(error => {
      console.log('Error fetching gas blend data:', error);
    });

  // Scroll to the bottom of the page
  const element = document.getElementById("gasBlendString");
  element.scrollIntoView({ behavior: "smooth", block: "end" });
  
});