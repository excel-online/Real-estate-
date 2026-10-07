import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Building, ShieldCheck, TrendingUp } from 'lucide-react';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="relative bg-blue-900 text-white py-24 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight">
            Find Your Dream Home Today
          </h1>
          <p className="text-lg md:text-xl text-blue-100 mb-8">
            Explore verified listings, luxury apartments, and prime real estate investments tailored for you.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/properties"
              className="bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
            >
              Browse Properties
            </Link>
            <Link
              to="/register"
              className="bg-white text-blue-900 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition"
            >
              Get Started
            </Link>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto py-16 px-6 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
        <div className="p-6 bg-gray-50 rounded-xl shadow-sm">
          <div className="inline-flex p-3 bg-blue-100 text-blue-600 rounded-full mb-4">
            <Building className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold mb-2">Verified Listings</h3>
          <p className="text-gray-600">Every property is carefully vetted to guarantee authenticity and accurate pricing.</p>
        </div>
        <div className="p-6 bg-gray-50 rounded-xl shadow-sm">
          <div className="inline-flex p-3 bg-blue-100 text-blue-600 rounded-full mb-4">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold mb-2">Secure Transactions</h3>
          <p className="text-gray-600">Built with robust authentication and encrypted protocols to keep your data safe.</p>
        </div>
        <div className="p-6 bg-gray-50 rounded-xl shadow-sm">
          <div className="inline-flex p-3 bg-blue-100 text-blue-600 rounded-full mb-4">
            <TrendingUp className="h-6 w-6" />
          </div>
          <h3 className="text-xl font-bold mb-2">Smart Investment</h3>
          <p className="text-gray-600">Track high-yield real estate options designed for maximum capital growth.</p>
        </div>
      </div>
    </div>
  );
}
