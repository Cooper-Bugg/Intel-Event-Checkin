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

// New elements for celebration and team attendee lists
var celebrationMessage = document.getElementById("celebrationMessage");
var celebrationText = document.getElementById("celebrationText");
var waterAttendees = document.getElementById("waterAttendees");
var zeroAttendees = document.getElementById("zeroAttendees");
var powerAttendees = document.getElementById("powerAttendees");

// Debug: Check if DOM elements were found
console.log("DOM Elements found:", {
	form: !!form,
	nameInput: !!nameInput,
	teamSelect: !!teamSelect,
	greeting: !!greeting,
	attendeeCountEl: !!attendeeCountEl,
	progressBar: !!progressBar,
	waterCountEl: !!waterCountEl,
	zeroCountEl: !!zeroCountEl,
	powerCountEl: !!powerCountEl,
	celebrationMessage: !!celebrationMessage,
	celebrationText: !!celebrationText,
	waterAttendees: !!waterAttendees,
	zeroAttendees: !!zeroAttendees,
	powerAttendees: !!powerAttendees
});

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
		// Convert old format (string names) to new format (objects with name and team)
		if (data.attendees.length > 0 && typeof data.attendees[0] === 'string') {
			data.attendees = [];
			data.counts = { water: 0, zero: 0, power: 0 };
		}
		return data;
	} catch (e) {
		return {
			counts: { water: 0, zero: 0, power: 0 },
			attendees: [] // array of {name: string, team: string} objects
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
	console.log("Rendering - Total attendees:", total, "State:", state);
	
	attendeeCountEl.textContent = String(total);

	var pct = total >= MAX_ATTENDEES ? 100 : (total / MAX_ATTENDEES) * 100;
	progressBar.style.width = pct + "%";
	console.log("Progress bar updated to:", pct + "%");

	waterCountEl.textContent = String(state.counts.water);
	zeroCountEl.textContent = String(state.counts.zero);
	powerCountEl.textContent = String(state.counts.power);
	console.log("Team counts updated - Water:", state.counts.water, "Zero:", state.counts.zero, "Power:", state.counts.power);

	// Update attendee list
	renderAttendeeList();
	
	// Show celebration if goal reached
	if (total >= MAX_ATTENDEES) {
		showCelebration();
	}
}

function renderAttendeeList() {
	// Clear all team lists first
	var teamElements = {
		water: waterAttendees,
		zero: zeroAttendees,
		power: powerAttendees
	};
	
	// Initialize each team list
	for (var team in teamElements) {
		if (teamElements[team]) {
			teamElements[team].innerHTML = '<p class="no-team-attendees">No members yet</p>';
		}
	}
	
	// Group attendees by team
	var teamMembers = {
		water: [],
		zero: [],
		power: []
	};
	
	for (var i = 0; i < state.attendees.length; i++) {
		var attendee = state.attendees[i];
		if (teamMembers[attendee.team]) {
			teamMembers[attendee.team].push(attendee.name);
		}
	}
	
	// Render each team's attendee list
	for (var team in teamMembers) {
		var teamElement = teamElements[team];
		if (!teamElement) continue;
		
		if (teamMembers[team].length > 0) {
			var html = '';
			for (var j = 0; j < teamMembers[team].length; j++) {
				html += '<div class="team-attendee-item">' + teamMembers[team][j] + '</div>';
			}
			teamElement.innerHTML = html;
		}
	}
}

function getWinningTeam() {
	var maxCount = 0;
	var winningTeam = null;
	
	for (var team in state.counts) {
		if (state.counts[team] > maxCount) {
			maxCount = state.counts[team];
			winningTeam = team;
		}
	}
	
	return winningTeam;
}

function showCelebration() {
	if (!celebrationMessage || !celebrationText) return;
	
	var winningTeam = getWinningTeam();
	var message = "We've reached our attendance goal of " + MAX_ATTENDEES + " attendees!";
	
	if (winningTeam && state.counts[winningTeam] > 0) {
		message += " 🏆 " + TEAM_LABEL[winningTeam] + " leads with " + state.counts[winningTeam] + " members!";
	}
	
	celebrationText.textContent = message;
	celebrationMessage.style.display = "block";
	console.log("Celebration displayed:", message);
}

// ---- Helpers ----
function normalizeName(s) {
	// trim and collapse spaces
	return s.replace(/\s+/g, " ").replace(/^\s+|\s+$/g, "");
}

function alreadyCheckedIn(name) {
	var target = name.toLowerCase();
	for (var i = 0; i < state.attendees.length; i++) {
		if (state.attendees[i].name && state.attendees[i].name.toLowerCase() === target) return true;
	}
	return false;
}

// Show greeting and update count instantly when name is entered
nameInput.addEventListener("input", function () {
	console.log("Name input changed:", nameInput.value);
	var name = normalizeName(nameInput.value || "");
	var team = teamSelect.value;
	console.log("Normalized name:", name, "Selected team:", team);
	
	if (name && team) {
		console.log("Both name and team present, updating preview...");
		var previewCount = totalCount() + (alreadyCheckedIn(name) ? 0 : 1);
		attendeeCountEl.textContent = String(previewCount);
		// Preview progress bar
		var pct = previewCount >= MAX_ATTENDEES ? 100 : (previewCount / MAX_ATTENDEES) * 100;
		progressBar.style.width = pct + "%";
		// Preview team counter
		var teamPreviewCount = state.counts[team] + (alreadyCheckedIn(name) ? 0 : 1);
		var teamCounter = document.getElementById(team + "Count");
		teamCounter.textContent = String(teamPreviewCount);
		// Show preview welcome message
		const message = "Hi, " + name + "! Ready to check in for " + TEAM_LABEL[team] + "?";
		greeting.textContent = message;
		greeting.className = "success-message";
		greeting.style.display = "block";
		console.log("Preview updated with message:", message);
	} else {
		console.log("Missing name or team, resetting to current totals");
		attendeeCountEl.textContent = String(totalCount());
		clearMessage();
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
	console.log("Form submitted!");
	e.preventDefault(); //Prevent default form submission

	//Get form values
	var name = nameInput.value.trim();
	var team = teamSelect.value;
	var teamName = teamSelect.selectedOptions[0] ? teamSelect.selectedOptions[0].text : TEAM_LABEL[team];
	
	console.log("Form data - Name:", name, "Team:", team, "TeamName:", teamName);

	// Validation
	if (!name || !team) {
		console.log("Validation failed: missing name or team");
		const message = "Enter a name and select a team.";
		greeting.textContent = message;
		greeting.className = "error-message";
		greeting.style.display = "block";
		return;
	}
	if (totalCount() >= MAX_ATTENDEES) {
		console.log("Validation failed: capacity reached");
		const message = "Capacity reached (50).";
		greeting.textContent = message;
		greeting.className = "error-message";
		greeting.style.display = "block";
		return;
	}
	if (alreadyCheckedIn(name)) {
		console.log("Validation failed: already checked in");
		const message = "This attendee is already checked in.";
		greeting.textContent = message;
		greeting.className = "error-message";
		greeting.style.display = "block";
		return;
	}

	console.log("Validation passed, updating state...");
	
	// update state - store attendee with name and team
	state.attendees.push({ name: name, team: team });
	state.counts[team] = (state.counts[team] || 0) + 1;
	
	console.log("New state:", state);
	
	saveState();

	// Re-render all counters and progress bar
	render();
	
	console.log("UI updated via render()");

	// Show welcome message
	const message = `🎉 Welcome, ${name} from ${teamName}!`;
	greeting.textContent = message;
	greeting.className = "success-message";
	greeting.style.display = "block";
	
	console.log("Welcome message displayed:", message);

	form.reset(); //Reset form fields
	nameInput.focus();
	
	console.log("Form reset and refocused");
});

// Initial paint
render();

