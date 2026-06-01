import React from 'react';

interface INavigationProps extends React.SVGAttributes<SVGSVGElement> {
  isActive?: boolean;
}

const RehabDasMenuIcon: React.FC<INavigationProps> = ({ isActive, fill, ...props }) => {
  const stroke = isActive ? 'white' : fill;
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" {...props}>
      <path
        d="M3.33301 16.667L10.833 9.16699L14.1663 12.5003L16.6663 10.0003"
        stroke={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12.5 3.33301H16.6667V7.49967"
        stroke={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M7.5 10.833L3.33333 14.9997M10.8333 3.33301L16.6667 9.16634"
        stroke={stroke}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default RehabDasMenuIcon;
