import React from 'react';

interface INavigationProps extends React.SVGAttributes<SVGSVGElement> {
  isActive?: boolean;
}

const UserManagementMenuIcon: React.FC<INavigationProps> = ({ isActive, fill, ...props }) => {
  const stroke = isActive ? 'white' : fill;
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path
        d="M1 17V15C1 13.9391 1.42143 12.9217 2.17157 12.1716C2.92172 11.4214 3.93913 11 5 11H8"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M3 6C3 7.65685 4.34315 9 6 9C7.65685 9 9 7.65685 9 6C9 4.34315 7.65685 3 6 3C4.34315 3 3 4.34315 3 6Z"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M15.5 3.5L16.2 5.2L18 5.5L16.6 6.7L16.9 8.5L15.5 7.6L14.1 8.5L14.4 6.7L13 5.5L14.8 5.2L15.5 3.5Z"
        stroke={stroke}
        strokeWidth="1.25"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default UserManagementMenuIcon;
