import { MapContainer, Marker, Popup, TileLayer, useMapEvents } from 'react-leaflet';

const defaultCenter = [12.9716, 77.5946];

export function LandMap({ lands = [], pickerValue, onPick, height = 360 }) {
  const markers = lands
    .map((land) => {
      const coordinates = land.location?.coordinates?.coordinates;
      return coordinates ? { land, position: [coordinates[1], coordinates[0]] } : null;
    })
    .filter(Boolean);

  const center = pickerValue
    ? [pickerValue.latitude, pickerValue.longitude]
    : markers[0]?.position ?? defaultCenter;

  return (
    <div className="overflow-hidden rounded-md border" style={{ height }}>
      <MapContainer center={center} zoom={pickerValue || markers.length ? 11 : 7} className="h-full w-full">
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {onPick ? <MapPicker onPick={onPick} /> : null}
        {pickerValue ? <Marker position={[pickerValue.latitude, pickerValue.longitude]} /> : null}
        {markers.map(({ land, position }) => (
          <Marker key={land._id ?? land.slug} position={position}>
            <Popup>{land.title}</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

function MapPicker({ onPick }) {
  useMapEvents({
    click(event) {
      onPick({
        latitude: Number(event.latlng.lat.toFixed(6)),
        longitude: Number(event.latlng.lng.toFixed(6)),
      });
    },
  });
  return null;
}
