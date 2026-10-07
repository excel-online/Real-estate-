import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Home } from 'lucide-react';

export default function SavedPropertiesPage() {
  const [savedProperties, setSavedProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(false);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-8">
          <Heart className="h-8 w-8 text-red-500 fill-red-500" />
          <h1 className="text-3xl font-bold text-gray-900">Your Saved Properties</h1>
        </div>

        {loading ? (
          <p className="text-gray-600">Loading your saved items...</p>
        ) : savedProperties.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
            <Home className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-800 mb-2">No saved properties yet</h2>
            <p className="text-gray-600 mb-6">Explore our listings and save properties you love to view them here.</p>
            <Link
              to="/properties"
              className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition"
            >
              Explore Properties
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Map through saved properties here when connected to API */}
          </div>
        )}
      </div>
    </div>
  );
}
