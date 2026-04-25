import React from 'react';

interface INavigationProps extends React.SVGAttributes<SVGSVGElement> {
  isActive?: boolean;
}

const ProductionMenuIcon: React.FC<INavigationProps> = ({ isActive, fill, ...props }) => {
  const stroke = isActive ? 'white' : fill;
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <rect x="1" y="1" width="7" height="7" rx="1" stroke={stroke} strokeWidth="2" />
      <rect x="12" y="1" width="7" height="7" rx="1" stroke={stroke} strokeWidth="2" />
      <rect x="1" y="12" width="7" height="7" rx="1" stroke={stroke} strokeWidth="2" />
      <rect x="12" y="12" width="7" height="7" rx="1" stroke={stroke} strokeWidth="2" />
    </svg>
  );
};

export default ProductionMenuIcon;
