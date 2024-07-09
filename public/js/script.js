console.log("Script loaded"); // Ensure the script is loaded

const socket = io();

socket.on('connect', () => {
    console.log("Connected to server");
});

socket.on('connect_error', (err) => {
    console.error("Connection error:", err);
});

if (navigator.geolocation) {
    console.log("Geolocation is supported by this browser.");
    navigator.geolocation.watchPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            console.log(`Position: ${latitude}, ${longitude}`);
            socket.emit("send-location", { latitude, longitude });
        },
        (error) => {
            console.error("Geolocation error:", error);
        },
        {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        }
    );
} else {
    console.error("Geolocation is not supported by this browser.");
}

const map = L.map('map').setView([0, 0], 2); // Start with zoom level 2 for global view

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: "jai's map"
}).addTo(map);

const markers = {};

socket.on('receive-location', (data) => {
    const { id, latitude, longitude } = data;
    console.log(`Received location from ${id}: ${latitude}, ${longitude}`);
    if (markers[id]) {
        markers[id].setLatLng([latitude, longitude]);
        console.log(`Updated marker for ${id} to new position: ${latitude}, ${longitude}`);
    } else {
        markers[id] = L.marker([latitude, longitude]).addTo(map);
        console.log(`Added new marker for ${id} at position: ${latitude}, ${longitude}`);
    }

    // If the current user is the sender, center the map on their location
    if (id === socket.id) {
        map.setView([latitude, longitude], 16); // Adjust zoom level as needed
        console.log(`Centered map on user's location: ${latitude}, ${longitude}`);
    }
});
