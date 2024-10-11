// src/Footer.js
import React from 'react';

function Footer() {
  return (
    <footer className="bg-white dark:bg-gray-800 shadow mt-4">
      <div className="container mx-auto p-4 text-center">
        <p className="text-gray-800 dark:text-white">
          &copy; {new Date().getFullYear()} AAFC. All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export default Footer;
