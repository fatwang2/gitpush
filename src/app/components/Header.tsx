import React from 'react';

export function Header() {
  return (
    <div className="text-center mb-12">
      <h1 className="text-5xl font-extrabold text-gray-900 tracking-tight">
        <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-400">
          GitPush
        </span>
      </h1>
      <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
        GitHub Repository Management & Updates
      </p>
    </div>
  );
}
