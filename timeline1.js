const events = [];

async function loadData() {
    const eventsResponse = await fetch('http://localhost:3000/events');
    const loadedEvents = await eventsResponse.json();
    events.push(...loadedEvents);
    renderTimeline();

    const notesResponse = await fetch('http://localhost:3000/notes');
    const loadedNotes = await notesResponse.json();
    if (loadedNotes) {
        document.getElementById('notes-textarea').value = loadedNotes.content;
    }
}

async function saveData() {
    for (const event of events) {
        await fetch('http://localhost:3000/events', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(event),
        });
    }

    const notes = document.getElementById('notes-textarea').value;
    await fetch('http://localhost:3000/notes', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ content: notes }),
    });
}

function toggleDropdown() {
    const dropdown = document.getElementById('event-dropdown');
    dropdown.style.display = dropdown.style.display === 'none' || dropdown.style.display === '' ? 'flex' : 'none';
}

async function addEvent() {
    const title = document.getElementById('event-title').value;
    const description = document.getElementById('event-description').value;
    const date = document.getElementById('event-date').value;
    const color = document.getElementById('event-color').value;
    const importance = document.getElementById('event-importance').value;

    if (title && description && date) {
        const event = {
            id: Date.now(), // Unique ID for each event
            title,
            description,
            date,
            color,
            importance,
            details: ""
        };
        events.push(event);
        events.sort((a, b) => new Date(a.date) - new Date(b.date));
        renderTimeline();
        toggleDropdown();
        clearForm();
        await saveData();
    } else {
        alert('Please fill out all fields');
    }
}

function renderTimeline() {
    const timeline = document.getElementById('timeline');
    timeline.innerHTML = '';
    events.forEach(event => renderEvent(event));
}

function renderEvent(event) {
    if (typeof event.details === 'undefined') {
        event.details = "";
    }

    const eventElement = document.createElement('div');
    eventElement.className = 'event';
    eventElement.style.backgroundColor = event.color;
    eventElement.innerHTML = `
        <div class="event-header">
            <h3>${event.title}</h3>
            <button onclick="toggleDetails(this)">Details</button>
            <button class="delete-btn" onclick="deleteEvent(${event.id})">Delete</button>
        </div>
        <p>${event.description}</p>
        <p>${event.date}</p>
        <p>Importance: ${event.importance}</p>
        <div class="details">
            <textarea placeholder="More details" oninput="saveDetails(${event.id}, this.value)">${event.details}</textarea>
        </div>
    `;
    timeline.appendChild(eventElement);
}

function toggleDetails(button) {
    const details = button.closest('.event').querySelector('.details');
    details.style.display = details.style.display === 'none' || details.style.display === '' ? 'block' : 'none';
}

async function deleteEvent(id) {
    if (confirm('Are you sure you want to delete this event?')) {
        const index = events.findIndex(event => event.id === id);
        if (index !== -1) {
            events.splice(index, 1);
            renderTimeline();
            await fetch(`http://localhost:3000/events/${id}`, {
                method: 'DELETE'
            });
            await saveData();
        }
    }
}

function saveDetails(id, details) {
    const event = events.find(event => event.id === id);
    if (event) {
        event.details = details;
        saveData();
    }
}

function clearForm() {
    document.getElementById('event-title').value = '';
    document.getElementById('event-description').value = '';
    document.getElementById('event-date').value = '';
    document.getElementById('event-color').value = '#ffffff'; // Set default color to white
    document.getElementById('event-importance').value = 5;
    updateImportance(5);
}

function updateImportance(value) {
    const importanceValue = document.getElementById('importance-value');
    importanceValue.textContent = value;
    importanceValue.style.color = `rgb(${value * 25.5}, ${(10 - value) * 25.5}, 0)`;
}

function toggleNotes() {
    const notes = document.getElementById('notes');
    notes.style.display = notes.style.display === 'none' || notes.style.display === '' ? 'block' : 'none';
    const timeline = document.getElementById('timeline');
    timeline.style.marginRight = notes.style.display === 'none' ? '0' : '25%';
    saveData();
}
