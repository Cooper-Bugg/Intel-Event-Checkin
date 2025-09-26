# Intel Sustainability Summit Check-In

This project is a simple web-based check-in system for the Intel Sustainability Summit. It allows event attendees to check in, select their team, and see live updates of attendance and team progress.

## Features
- Attendees enter their name and select a team to check in.
- The total number of attendees and each team's count are displayed and updated in real time.
- A progress bar shows how close the event is to reaching its attendance goal.
- Personalized welcome messages greet each attendee after check-in.
- Duplicate check-ins are prevented, and the system remembers attendance using local storage.

## Project Structure
- `index.html` – Main web page and form
- `style.css` – Styles for the page and progress bar
- `scripts.js` – Handles check-in logic, attendance tracking, and UI updates

## Notes
- The attendance goal is set to 50 by default.
- All check-in data is stored in your browser, so refreshing the page will keep your progress.