// Front-end for the Wisconsin Mutual "Insura" voice demo (Nalashaa POC).
// Loads Retell's browser SDK from a CDN, gets an access token from our own
// local server, and runs the voice call in the browser over WebRTC.
import { RetellWebClient } from "https://esm.sh/retell-client-js-sdk@2";

const retell = new RetellWebClient();

const callBtn = document.getElementById("callBtn");
const callBtnLabel = document.getElementById("callBtnLabel");
const callStatus = document.getElementById("callStatus");
const callHint = document.getElementById("callHint");
const orb = document.getElementById("orb");
const transcriptSection = document.getElementById("transcriptSection");
const transcript = document.getElementById("transcript");

let inCall = false;

function setStatus(text) {
  callStatus.textContent = text;
}

// Render the running transcript that Retell streams back in "update" events.
function renderTranscript(entries) {
  transcriptSection.hidden = false;
  transcript.innerHTML = "";
  for (const entry of entries) {
    const who = entry.role === "agent" ? "agent" : "user";
    const wrap = document.createElement("div");
    wrap.className = `msg ${who}`;
    wrap.innerHTML =
      `<span class="who">${who === "agent" ? "Insura" : "You"}</span>` +
      `<span class="bubble"></span>`;
    wrap.querySelector(".bubble").textContent = entry.content;
    transcript.appendChild(wrap);
  }
  transcript.scrollTop = transcript.scrollHeight;
}

async function startCall() {
  callBtn.disabled = true;
  setStatus("Connecting to Insura…");
  callHint.textContent = "Please allow microphone access when prompted.";

  try {
    // Ask OUR server for an access token (it holds the secret API key).
    const res = await fetch("/api/create-web-call", { method: "POST" });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to create web call");

    await retell.startCall({ accessToken: data.access_token });
    // Success path continues in the "call_started" event below.
  } catch (err) {
    console.error(err);
    setStatus("Couldn't connect. Check the server and credentials.");
    callHint.textContent = String(err.message || err);
    callBtn.disabled = false;
  }
}

function stopCall() {
  retell.stopCall();
}

// ---- Retell SDK events -----------------------------------------------------
retell.on("call_started", () => {
  inCall = true;
  callBtn.disabled = false;
  callBtn.classList.add("in-call");
  callBtnLabel.textContent = "End Call";
  orb.classList.add("listening");
  setStatus("Connected — Insura is listening");
  callHint.textContent = "Speak naturally. Click “End Call” when you're done.";
});

retell.on("call_ended", () => {
  inCall = false;
  callBtn.disabled = false;
  callBtn.classList.remove("in-call");
  callBtnLabel.textContent = "Talk to Insura";
  orb.classList.remove("listening", "speaking");
  setStatus("Call ended — thanks for calling Wisconsin Mutual");
  callHint.textContent = "Click to start a new conversation with Insura.";
});

retell.on("agent_start_talking", () => {
  orb.classList.remove("listening");
  orb.classList.add("speaking");
});

retell.on("agent_stop_talking", () => {
  orb.classList.remove("speaking");
  if (inCall) orb.classList.add("listening");
});

retell.on("update", (update) => {
  if (update?.transcript) renderTranscript(update.transcript);
});

retell.on("error", (err) => {
  console.error("Retell error:", err);
  setStatus("A call error occurred.");
  retell.stopCall();
});

// ---- Button toggles between start and stop ---------------------------------
callBtn.addEventListener("click", () => {
  if (inCall) stopCall();
  else startCall();
});
