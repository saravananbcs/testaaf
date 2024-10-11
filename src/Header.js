// src/Header.js
import React from 'react';
import { FaSun, FaMoon } from 'react-icons/fa';

function Header({ darkMode, toggleDarkMode }) {
  return (
    <header className="bg-white dark:bg-gray-800 shadow">
      <div className="container mx-auto flex items-center justify-between p-4">
        {/* Logo */}
        <div className="flex items-center">
          <img src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTHHGxBgp3YY0hcipICIpIgl1CTaJFqfTVBeTWP3rvgI35OI5r5JimTjcgjoeP8HogqV7o&usqp=CAU" alt="Logo" className="h-8 w-8 mr-2" />
          <span className="text-xl font-bold text-gray-800 dark:text-white">
            Synthetic Data Generator
          </span>
        </div>
        {/* Navigation */}
        <nav className="flex items-center">
          <a href="/" className="text-gray-800 dark:text-white hover:underline mr-4">
            Home
          </a>
          <a href="/about" className="text-gray-800 dark:text-white hover:underline">
            About
          </a>
          {/* Dark Mode Toggle */}
          <button
            onClick={toggleDarkMode}
            className="text-gray-800 dark:text-white focus:outline-none ml-4"
          >
            {darkMode ? <FaSun size={20} /> : <FaMoon size={20} />}
          </button>
        </nav>
      </div>
    </header>
  );
}

export default Header;
