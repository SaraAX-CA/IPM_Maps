// Initialize Map
const map = L.map('map').setView([-34.7, 138.7], 11); // Centered roughly on Playford

// Add Base Layer (CartoDB Positron for a clean look)
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 20
}).addTo(map);

let geojsonLayer;
let geojsonData;

// Color Scales
function getColor(d, type) {
    if (type === 'OrganisedDemand_2025') {
        return d > 20 ? '#08519c' :
            d > 15 ? '#3182bd' :
                d > 10 ? '#6baed6' :
                    d > 5 ? '#bdd7e7' :
                        '#eff3ff';
    } else {
        // Casual Demand - Orange Scale
        return d > 20 ? '#a63603' :
            d > 15 ? '#e6550d' :
                d > 10 ? '#fd8d3c' :
                    d > 5 ? '#fdbe85' :
                        '#feedde';
    }
}

function style(feature) {
    const type = document.querySelector('input[name="demandLayer"]:checked').value;
    const value = feature.properties[type];

    return {
        fillColor: getColor(value, type),
        weight: 1,
        opacity: 1,
        color: 'white',
        dashArray: '3',
        fillOpacity: 0.7
    };
}

function highlightFeature(e) {
    const layer = e.target;

    layer.setStyle({
        weight: 3,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.9
    });

    layer.bringToFront();
}

function resetHighlight(e) {
    geojsonLayer.resetStyle(e.target);
}

function onEachFeature(feature, layer) {
    layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight
    });

    const props = feature.properties;
    const content = `
        <div class="popup-header">SA1: ${props.SA1_CODE21 || props.Level0_Identifier}</div>
        <div class="popup-body">
            <div class="popup-stat">
                <span class="popup-label">Organised Demand (2025)</span>
                <span class="popup-value">${props.OrganisedDemand_2025 || 0}</span>
            </div>
            <div class="popup-stat">
                <span class="popup-label">Casual Demand (2025)</span>
                <span class="popup-value">${props.CasualDemand_2025 || 0}</span>
            </div>
            <div class="popup-stat">
                <span class="popup-label">Total Population (2025)</span>
                <span class="popup-value">${props.TotalPopulation_2025 || 0}</span>
            </div>
            <hr style="margin: 8px 0; border: 0; border-top: 1px solid #eee;">
            <div class="popup-stat">
                <span class="popup-label">Organised Demand (2046)</span>
                <span class="popup-value">${props.OrganisedDemand_2046 || 0}</span>
            </div>
            <div class="popup-stat">
                <span class="popup-label">Casual Demand (2046)</span>
                <span class="popup-value">${props.CasualDemand_2046 || 0}</span>
            </div>
            <div class="popup-stat">
                <span class="popup-label">Total Population (2046)</span>
                <span class="popup-value">${props.TotalPopulation_2046 || 0}</span>
            </div>
        </div>
    `;
    layer.bindPopup(content);
}

function updateLegend() {
    const type = document.querySelector('input[name="demandLayer"]:checked').value;
    const legend = document.getElementById('legend');
    const grades = [0, 5, 10, 15, 20];
    const labels = [];

    let content = '<h4>Legend</h4>';

    for (let i = 0; i < grades.length; i++) {
        content += `
            <div class="legend-item">
                <i class="legend-color" style="background:${getColor(grades[i] + 1, type)}"></i>
                <span>${grades[i]}${grades[i + 1] ? '&ndash;' + grades[i + 1] : '+'}</span>
            </div>
        `;
    }

    legend.innerHTML = content;
}

// Load Data
// Data is loaded from data.js as global variable 'hockeyData'
if (typeof hockeyData !== 'undefined') {
    geojsonData = hockeyData;

    geojsonLayer = L.geoJson(hockeyData, {
        style: style,
        onEachFeature: onEachFeature
    }).addTo(map);

    // Fit bounds to data
    map.fitBounds(geojsonLayer.getBounds());

    updateLegend();
} else {
    console.error('Data not loaded. Check data.js');
}

// Event Listeners
document.querySelectorAll('input[name="demandLayer"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
        geojsonLayer.setStyle(style);
        updateLegend();
    });
});
