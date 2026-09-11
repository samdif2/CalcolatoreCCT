import React from 'react';

const MoneyBagIcon: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="h-6 w-6"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    {/* Tied gathered neck at top */}
    <path d="M10 5L9 2h6l-1 3" />
    <path d="M8 5h8" />
    {/* Sack body */}
    <path d="M6 9c0-1.8 1.5-3.5 3.5-3.8h5c2 .3 3.5 2 3.5 3.8 0 5.5-1.5 10-6 11-4.5-1-6-5.5-6-11z" />
    {/* Euro/Dollar symbol detail inside */}
    <path d="M13.5 11a2 2 0 0 0-2.8 0 2 2 0 0 0 0 2.8c.8.7 2 .6 2.8 0" />
    <path d="M9.5 12.4h4" />
  </svg>
);

export default MoneyBagIcon;
