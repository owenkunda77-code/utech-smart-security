import React from 'react';

const DeviceTracking: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-4xl font-bold mb-4">Device Tracking</h1>
      <div className="bg-white rounded-lg shadow p-6 h-96">
        <p className="text-gray-600">Map will be displayed here using Leaflet</p>
      </div>
    </div>
  );
};

export default DeviceTracking;
