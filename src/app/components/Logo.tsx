import React from 'react';

interface LogoProps {
  className?: string;
  width?: number;
  height?: number;
}

export default function Logo({ className = '', width = 800, height = 200 }: LogoProps) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      viewBox="0 0 800 200"
      width={width}
      height={height}
      className={className}
    >
      <defs>
        <linearGradient id="nextGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style={{stopColor:"#000000"}}/>
          <stop offset="100%" style={{stopColor:"#333333"}}/>
        </linearGradient>
      </defs>

      <g transform="translate(20, 10)">
        <g transform="translate(20, 40)">
          <path d="M40,10 A30,30 0 0,1 40,70" 
                className="dark:stroke-white stroke-black"
                strokeWidth="12" 
                fill="none" 
                strokeLinecap="round"/>
          
          <path d="M35,40 L65,40 L55,30 M65,40 L55,50" 
                className="dark:stroke-white stroke-black"
                strokeWidth="8" 
                fill="none" 
                strokeLinecap="round" 
                strokeLinejoin="round"/>
        </g>
        
        <g transform="translate(100, 30)">
          <text x="0" y="45" 
                fontFamily="Arial, sans-serif" 
                fontWeight="600" 
                fontSize="40" 
                className="dark:fill-white fill-black">
            CADDY NEXT
          </text>
          <text x="3" y="65" 
                fontFamily="Arial, sans-serif" 
                fontSize="14" 
                className="dark:fill-gray-400 fill-gray-600"
                letterSpacing="2">
            PROXY MANAGER
          </text>
        </g>
      </g>
    </svg>
  );
}
