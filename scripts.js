// script.js  (basic ES5 JavaScript)

var MAX_ATTENDEES = 50;
var STORAGE_KEY = "iss-checkin";

// DOM
var form = document.getElementById("checkInForm");
var nameInput = document.getElementById("attendeeName");
var teamSelect = document.getElementById("teamSelect");
var greeting = document.getElementById("greeting");

var attendeeCountEl = document.getElementById("attendeeCount");
var progressBar = document.getElementById("progressBar");

var waterCountEl = document.getElementById("waterCount");
var zeroCountEl = document.getElementById("zeroCount");
var powerCountEl = document.getElementById("powerCount");

// Team labels used in the welcome banner
var TEAM_LABEL = {
	water: "Team Water Wise",
	zero: "Team Net Zero",
	power: "Team Renewables"
};

// ---- State + persistence ----
function loadState() {
	try {
		var raw = localStorage.getItem(STORAGE_KEY);
		if (!raw) throw new Error();
		var data = JSON.parse(raw);
		if (!data || !data.counts || !data.attendees) throw new Error();
		// ensure keys exist
		data.counts.water = data.counts.water || 0;
		data.counts.zero = data.counts.zero || 0;
		data.counts.power = data.counts.power || 0;
		return data;
	} catch (e) {
		return {
			counts: { water: 0, zero: 0, power: 0 },
			attendees: [] // array of names (strings)
		};
	}
}

function saveState() {
	localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

var state = loadState();

// ---- Rendering ----
function totalCount() {
	return state.counts.water + state.counts.zero + state.counts.power;
}

function render() {
	var total = totalCount();
	attendeeCountEl.textContent = String(total);

	var pct = total >= MAX_ATTENDEES ? 100 : (total / MAX_ATTENDEES) * 100;
	progressBar.style.width = pct + "%";

	waterCountEl.textContent = String(state.counts.water);
	zeroCountEl.textContent = String(state.counts.zero);
	powerCountEl.textContent = String(state.counts.power);
}

// ---- Helpers ----
function normalizeName(s) {
	// trim and collapse spaces
	return s.replace(/\s+/g, " ").replace(/^\s+|\s+$/g, "");
}

function alreadyCheckedIn(name) {
	var target = name.toLowerCase();
	for (var i = 0; i < state.attendees.length; i++) {
		if (state.attendees[i].toLowerCase() === target) return true;
	}
	return false;
}

// Show greeting and update count instantly when name is entered
nameInput.addEventListener("input", function () {
	var name = normalizeName(nameInput.value || "");
	var team = teamSelect.value;
	if (name && team) {
		var previewCount = totalCount() + (alreadyCheckedIn(name) ? 0 : 1);
		attendeeCountEl.textContent = String(previewCount);
		const message = "Hi, " + name + "! Ready to check in for " + TEAM_LABEL[team] + "?";
		console.log(message);
	} else {
		attendeeCountEl.textContent = String(totalCount());
	}
});

function setMessage(text, ok) {
	if (ok === void 0) ok = true;
	greeting.textContent = text;
	greeting.className = ok ? "success-message" : "";
	greeting.style.display = "block";
}

function clearMessage() {
	greeting.textContent = "";
	greeting.className = "";
	greeting.style.display = "none";
}

// ---- Submit handler ----
form.addEventListener("submit", function (e) {
	e.preventDefault(); //Prevent default form submission

	//Get form values
	var name = nameInput.value.trim();
	var team = teamSelect.value;
	var teamName = teamSelect.selectedOptions[0] ? teamSelect.selectedOptions[0].text : TEAM_LABEL[team];

	// Validation
	if (!name || !team) {
		const message = "Enter a name and select a team.";
		greeting.textContent = message;
		greeting.className = "error-message";
		return;
	}
	if (totalCount() >= MAX_ATTENDEES) {
		const message = "Capacity reached (50).";
		greeting.textContent = message;
		greeting.className = "error-message";
		return;
	}
	if (alreadyCheckedIn(name)) {
		const message = "This attendee is already checked in.";
		greeting.textContent = message;
		greeting.className = "error-message";
		return;
	}

	// update state
	state.attendees.push(name);
	state.counts[team] = (state.counts[team] || 0) + 1;

	saveState();

	// Increment count and update progress bar
	var count = totalCount();
	attendeeCountEl.textContent = String(count);
	var percentage = Math.round((count / MAX_ATTENDEES) * 100) + "%";
	progressBar.style.width = percentage;

	// Update team counter
	var teamCounter = document.getElementById(team + "Count");
	teamCounter.textContent = String(state.counts[team]);

	// Show welcome message
	const message = `🎉 Welcome, ${name} from ${teamName}!`;
	greeting.textContent = message;
	greeting.className = "success-message";

	form.reset(); //Reset form fields
	nameInput.focus();
});

// Initial paint
render();

