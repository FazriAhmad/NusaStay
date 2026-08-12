const MapPlaceholder = ({ location = "Harmoni Stay Resort, Indonesia" }: { location?: string }) => {
  return (
    <div className="relative h-64 rounded-xl overflow-hidden border border-outline-variant">
      <iframe
        title="Map"
        src={`https://www.openstreetmap.org/export/embed.html?bbox=106.6%2C-6.4%2C107.0%2C-6.0&layer=mapnik&marker=-6.2,106.8`}
        className="w-full h-full"
        loading="lazy"
      />
      <div className="absolute top-3 left-3 bg-surface-container-lowest/95 backdrop-blur px-3 py-2 rounded-lg shadow-sm flex items-center gap-2 text-sm">
        <span className="material-symbols-outlined text-error fill">location_on</span>
        <span className="text-on-surface font-medium">{location}</span>
      </div>
    </div>
  );
};

export default MapPlaceholder;
