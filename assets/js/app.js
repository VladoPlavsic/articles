// If you want to use Phoenix channels, run `mix help phx.gen.channel`
// to get started and then uncomment the line below.
// import "./user_socket.js"

// You can include dependencies in two ways.
//
// The simplest option is to put them in assets/vendor and
// import them using relative paths:
//
//     import "../vendor/some-package.js"
//
// Alternatively, you can `npm install some-package --prefix assets` and import
// them using a path starting with the package name:
//
//     import "some-package"
//
// If you have dependencies that try to import CSS, esbuild will generate a separate `app.css` file.
// To load it, simply add a second `<link>` to your `root.html.heex` file.

// Include phoenix_html to handle method=PUT/DELETE in forms and buttons.
import "phoenix_html"
// Establish Phoenix Socket and LiveView configuration.
import {Socket} from "phoenix"
import {LiveSocket} from "phoenix_live_view"
import {hooks as colocatedHooks} from "phoenix-colocated/articles"
import topbar from "../vendor/topbar"

// Matrix digital rain effect
// assets/js/app.js
document.addEventListener("DOMContentLoaded", () => {
  console.log("app.js loaded");
  const canvases = document.querySelectorAll(".matrix-rain");
  if (canvases.length === 0) {
    console.warn("No canvas elements with class 'matrix-rain' found.");
    return;
  }

  canvases.forEach((canvas, index) => {
    console.log(`Initializing canvas ${index + 1}`);
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      console.error(`Failed to get 2D context for canvas ${index + 1}`);
      return;
    }

    // Resize canvas to full viewport
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      console.log(`Canvas ${index + 1} resized to ${canvas.width}x${canvas.height}`);
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const chars = "0101ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops = Array(columns).fill(1);
    let animationId = null;
    let isRunning = false;

    function draw() {
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)"; // Fade effect
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "#00ff00"; // Neon green
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const text = chars.charAt(Math.floor(Math.random() * chars.length));
        const x = i * fontSize;
        const y = drops[i] * fontSize;
        ctx.fillText(text, x, y);

        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    }

    // Start animation
    function startAnimation() {
      if (!isRunning) {
        animationId = setInterval(draw, 33);
        isRunning = true;
        console.log(`Canvas ${index + 1} animation started`);
      }
    }

    // Stop animation
    function stopAnimation() {
      if (isRunning) {
        clearInterval(animationId);
        isRunning = false;
        console.log(`Canvas ${index + 1} animation stopped`);
      }
    }

    // Initial start
    startAnimation();

    // Toggle switch
    const toggleSwitch = document.querySelector(".toggle-rain");
    const toggleLabel = document.querySelector(".toggle-label");
    if (toggleSwitch && toggleLabel) {
      toggleSwitch.addEventListener("change", () => {
        if (toggleSwitch.checked) {
          startAnimation();
          toggleLabel.textContent = "Rain On";
        } else {
          stopAnimation();
          toggleLabel.textContent = "Rain Off";
        }
      });
    } else {
      console.warn("Toggle switch or label not found.");
    }
  });
});
/*
const csrfToken = document.querySelector("meta[name='csrf-token']").getAttribute("content")
const liveSocket = new LiveSocket("/live", Socket, {
  longPollFallbackMs: 2500,
  params: {_csrf_token: csrfToken},
  hooks: {...colocatedHooks},
})

// Show progress bar on live navigation and form submits
topbar.config({barColors: {0: "#29d"}, shadowColor: "rgba(0, 0, 0, .3)"})
window.addEventListener("phx:page-loading-start", _info => topbar.show(300))
window.addEventListener("phx:page-loading-stop", _info => topbar.hide())

// connect if there are any LiveViews on the page
liveSocket.connect()

// expose liveSocket on window for web console debug logs and latency simulation:
// >> liveSocket.enableDebug()
// >> liveSocket.enableLatencySim(1000)  // enabled for duration of browser session
// >> liveSocket.disableLatencySim()
window.liveSocket = liveSocket

// The lines below enable quality of life phoenix_live_reload
// development features:
//
//     1. stream server logs to the browser console
//     2. click on elements to jump to their definitions in your code editor
//
if (process.env.NODE_ENV === "development") {
  window.addEventListener("phx:live_reload:attached", ({detail: reloader}) => {
    // Enable server log streaming to client.
    // Disable with reloader.disableServerLogs()
    reloader.enableServerLogs()

    // Open configured PLUG_EDITOR at file:line of the clicked element's HEEx component
    //
    //   * click with "c" key pressed to open at caller location
    //   * click with "d" key pressed to open at function component definition location
    let keyDown
    window.addEventListener("keydown", e => keyDown = e.key)
    window.addEventListener("keyup", e => keyDown = null)
    window.addEventListener("click", e => {
      if(keyDown === "c"){
        e.preventDefault()
        e.stopImmediatePropagation()
        reloader.openEditorAtCaller(e.target)
      } else if(keyDown === "d"){
        e.preventDefault()
        e.stopImmediatePropagation()
        reloader.openEditorAtDef(e.target)
      }
    }, true)

    window.liveReloader = reloader
  })
}

*/
