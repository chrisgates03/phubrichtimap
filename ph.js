    <script>
 
        var map = L.map('map').setView([31.8, -86.8], 8);
        

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        }).addTo(map);
        
  
        document.getElementById('status').innerHTML = 'CSV loading';
        
      
        var csvFiles = ['phub.csv', 'phub.csv.csv', 'phub csv.csv'];
        var currentTry = 0;
        
        function tryLoadCSV() {

            }
            
            var filename = csvFiles[currentTry];
            document.getElementById('status').innerHTML = `Trying to load: ${filename}...`;
            
            fetch(filename)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`File not found: ${filename}`);
                    }
                    return response.text();
                })
                .then(csvText => {
                    document.getElementById('status').innerHTML = 'Parsing CSV data...';
                    
                    Papa.parse(csvText, {
                        header: true,
                        skipEmptyLines: true,
                        complete: function(results) {
                            var points = [];
                            
                            results.data.forEach(row => {
                                var lat = parseFloat(row.decimalLatitude);
                                var lng = parseFloat(row.decimalLongitude);
                                
                                if (!isNaN(lat) && !isNaN(lng) && lat && lng) {
                                    points.push({
                                        lat: lat,
                                        lng: lng,
                                        locality: row.locality || 'Not specified',
                                        state: row.stateProvince || 'Alabama',
                                        year: row.year || 'Unknown',
                                        gbifID: row.gbifID || ''
                                    });
                                }
                            });
                            
                            document.getElementById('pointCount').innerHTML = points.length;
                            document.getElementById('status').innerHTML = ` Loaded ${points.length} occurrence records`;
 
                            var bounds = [];
                            
                            points.forEach(point => {
                                var popupContent = `
                                    <strong> Red Hills Salamander</strong><br>
                                    <strong>Location:</strong> ${point.locality}<br>
                                    <strong>State:</strong> ${point.state}<br>
                                    <strong>Year:</strong> ${point.year}<br>
                                    <strong>Coordinates:</strong> ${point.lat.toFixed(4)}°, ${point.lng.toFixed(4)}°
                                    ${point.gbifID ? `<br><a href="https://www.gbif.org/occurrence/${point.gbifID}" target="_blank">View on GBIF</a>` : ''}
                                `;
                                
                                var marker = L.circleMarker([point.lat, point.lng], {
                                    radius: 7,
                                    fillColor: '#ff4081',
                                    color: '#ffffff',
                                    weight: 1.5,
                                    opacity: 1,
                                    fillOpacity: 0.8
                                }).bindPopup(popupContent);
                                
                                marker.addTo(map);
                                bounds.push([point.lat, point.lng]);
                            });
                            
                      
                            if (bounds.length > 0) {
                                map.fitBounds(bounds);
                            }
                            
                            console.log(`Added ${points.length} points to map`);
                        }
                    });
                })
                .catch(error => {
                    console.log(`Failed to load ${filename}:`, error);
                    currentTry++;
                    tryLoadCSV();
                });
        }
        

        tryLoadCSV();
        

        console.log('Map works! ^_^');

