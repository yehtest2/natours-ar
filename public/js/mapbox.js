/* eslint-disable*/
export const dispalyMap = locations => {
  mapboxgl.accessToken =
    'pk.eyJ1IjoieWVhaGpzb24iLCJhIjoiY2wyZDQ0em15MDMxdDNibXV0M3Bib2xjciJ9.I6_6bDSqyWnmTa4u9ZAajA';
  var map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/yeahjson/cl2d5j9mm001e14nucwue0dbn',
    scrollZoom: false
  });
  const bounds = new mapboxgl.LngLatBounds();
  locations.forEach(element => {
    const el = document.createElement('div');
    el.className = 'marker';
    new mapboxgl.Marker({
      element: el,
      anchor: 'bottom'
    })
      .setLngLat(element.coordinates)
      .addTo(map);

    bounds.extend(element.coordinates);
    new mapboxgl.Popup({
      offset: 30
    })
      .setLngLat(element.coordinates)
      .setHTML(`<p>Day ${element.day}:${element.description}</p>`)
      .addTo(map);
  });

  map.fitBounds(bounds, {
    padding: {
      top: 200,
      left: 200,
      right: 150,
      bottom: 100
    }
  });
};
