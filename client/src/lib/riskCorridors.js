// Haversine formula to calculate distance between two coordinates in km
export const calculateDistance = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
};

// Clusters defects into risk corridors
export const calculateRiskCorridors = (defects, maxDistanceKm = 10, minDefectsForCorridor = 3) => {
  if (!defects || defects.length === 0) return [];

  let unvisited = [...defects];
  const clusters = [];

  while (unvisited.length > 0) {
    const current = unvisited.pop();
    const currentCluster = [current];
    
    // Iterate and find all connected components
    let addedNew = true;
    while(addedNew) {
      addedNew = false;
      for (let i = unvisited.length - 1; i >= 0; i--) {
        const isNeighbor = currentCluster.some(clusterPoint => 
           calculateDistance(clusterPoint.lat, clusterPoint.lng, unvisited[i].lat, unvisited[i].lng) <= maxDistanceKm
        );
  
        if (isNeighbor) {
          currentCluster.push(unvisited[i]);
          unvisited.splice(i, 1);
          addedNew = true;
        }
      }
    }

    if (currentCluster.length >= minDefectsForCorridor) {
      clusters.push(currentCluster);
    }
  }

  // Process clusters into corridor objects
  return clusters.map((cluster, index) => {
    // Sort cluster by longitude (or latitude) to create a sensible polyline
    const sorted = [...cluster].sort((a, b) => a.lng - b.lng);
    const points = sorted.map(d => [d.lat, d.lng]);
    
    // Calculate total length
    let totalLength = 0;
    for(let i = 0; i < sorted.length - 1; i++) {
        totalLength += calculateDistance(sorted[i].lat, sorted[i].lng, sorted[i+1].lat, sorted[i+1].lng);
    }
    
    // Minimum visual length if it's too short
    if (totalLength < 0.1) totalLength = 1.2;

    // Determine overall severity
    const hasCritical = cluster.some(d => d.severity?.toLowerCase() === 'critical');
    const hasHigh = cluster.some(d => d.severity?.toLowerCase() === 'high');
    const severity = hasCritical ? 'Critical' : (hasHigh ? 'High Risk' : 'Attention');

    return {
      id: `RISK-CORR-${index + 1}`,
      points,
      defects: cluster,
      severity,
      lengthKm: totalLength.toFixed(1),
      message: `This ${totalLength.toFixed(1)} km section has an unusually high concentration of defects.`,
      recommendation: `Inspect entire corridor instead of treating ${cluster.length} defects independently.`
    };
  });
};
