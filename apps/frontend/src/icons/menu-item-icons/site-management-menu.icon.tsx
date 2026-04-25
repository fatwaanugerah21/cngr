import React from 'react';

interface INavigationProps extends React.SVGAttributes<SVGSVGElement> {
  isActive?: boolean;
}

const SiteManagementMenuIcon: React.FC<INavigationProps> = ({ isActive, fill, ...props }) => {
  const stroke = isActive ? 'white' : fill;
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect x="1" y="1" width="6" height="6" rx="1" stroke={stroke} strokeWidth="2" />
      <rect x="13" y="1" width="6" height="6" rx="1" stroke={stroke} strokeWidth="2" />
      <rect x="7" y="10" width="6" height="6" rx="1" stroke={stroke} strokeWidth="2" />
      <path d="M4 7V9.5M4 9.5L7 9.5M7 9.5V10M13 7V9.5M13 9.5L10 9.5M10 9.5V10" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
};

export default SiteManagementMenuIcon;
