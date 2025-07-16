A silly little blog for silly little thoughts. I like to make silly late games. I currently do a lot of silly little things. 

This mostly has quite old blog posts from a prior life. I've revived them for fun. I may or may not endorse them anymore.

<div id="potion-shop" style="font-family: monospace; max-width: 500px; margin: 2rem auto;">
  <h2>🧪 Potion Shop: Color Match</h2>
  <p>Your customer wants a potion of this color:</p>
  <div id="target-color" style="width: 100%; height: 50px; border: 2px solid #000;"></div>

  <p>Mix your potion:</p>
  <label>🔴 Red: <input type="range" id="red" min="0" max="255" value="128"></label><br>
  <label>🟢 Green: <input type="range" id="green" min="0" max="255" value="128"></label><br>
  <label>🔵 Blue: <input type="range" id="blue" min="0" max="255" value="128"></label><br>
  <label>🕯️ Add Darkness? <input type="checkbox" id="darkness"></label><br><br>

  <button onclick="mixAndScore()">🧪 Mix Potion</button>
  <button onclick="newCustomer()">🔁 New Customer</button>

  <p>Your potion color:</p>
  <div id="your-color" style="width: 100%; height: 50px; border: 2px solid #000;"></div>

  <p id="score-result" style="font-weight: bold;"></p>
</div>

<script>
  let target = { r: 0, g: 0, b: 0 };

  function getColorString({ r, g, b }) {
    return `rgb(${r}, ${g}, ${b})`;
  }

  function applyDarkness(color) {
    return {
      r: Math.floor(color.r * 0.7),
      g: Math.floor(color.g * 0.7),
      b: Math.floor(color.b * 0.7)
    };
  }

  function newCustomer() {
    target.r = Math.floor(Math.random() * 256);
    target.g = Math.floor(Math.random() * 256);
    target.b = Math.floor(Math.random() * 256);
    document.getElementById("target-color").style.backgroundColor = getColorString(target);
    document.getElementById("score-result").textContent = "";
    document.getElementById("your-color").style.backgroundColor = "#ccc";
  }

  function mixAndScore() {
    let r = parseInt(document.getElementById("red").value);
    let g = parseInt(document.getElementById("green").value);
    let b = parseInt(document.getElementById("blue").value);
    const dark = document.getElementById("darkness").checked;

    let potion = { r, g, b };
    if (dark) potion = applyDarkness(potion);

    // Show potion color
    document.getElementById("your-color").style.backgroundColor = getColorString(potion);

    // Score based on color distance
    const dist = Math.sqrt(
      Math.pow(potion.r - target.r, 2) +
      Math.pow(potion.g - target.g, 2) +
      Math.pow(potion.b - target.b, 2)
    );

    const maxDist = Math.sqrt(3 * 255 * 255);
    const score = Math.round((1 - dist / maxDist) * 100);
    document.getElementById("score-result").textContent = `🎯 Match Score: ${score}%`;
  }

  // Start with a customer
  newCustomer();
</script>
