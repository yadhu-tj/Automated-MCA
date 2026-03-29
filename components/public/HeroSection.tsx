import React from 'react';

export const HeroSection: React.FC = () => {
  return (
    <section className="relative bg-mca-900 text-white overflow-hidden">
      <div className="absolute inset-0">
        <img 
          className="w-full h-full object-cover opacity-20" 
          src="https://picsum.photos/1600/600?grayscale" 
          alt="Department Background" 
        />
      </div>
      <div className="relative max-w-7xl mx-auto px-4 py-24 sm:px-6 lg:px-8 flex flex-col items-center text-center">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-4 font-serif">
          MCA Department
        </h1>
        <p className="text-xl text-mca-100 max-w-2xl">
          Celebrating excellence, innovation, and community. Welcome to our automated greetings and announcements portal.
        </p>
      </div>
    </section>
  );
};
