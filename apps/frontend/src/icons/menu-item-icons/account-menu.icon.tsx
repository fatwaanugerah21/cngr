import React from 'react';

interface INavigationProps extends React.SVGAttributes<SVGSVGElement> {
  isActive?: boolean;
}

const AccountMenuIcon: React.FC<INavigationProps> = ({ isActive, fill, ...props }) => {
  const stroke = isActive ? 'white' : fill;
  return (
    <svg width="11" height="16" viewBox="0 0 11 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M0.5 15.5V13.8333C0.5 12.9493 0.851189 12.1014 1.47631 11.4763C2.10143 10.8512 2.94928 10.5 3.83333 10.5H7.16667C8.05072 10.5 8.89857 10.8512 9.52369 11.4763C10.1488 12.1014 10.5 12.9493 10.5 13.8333V15.5M2.16667 3.83333C2.16667 4.71739 2.51786 5.56523 3.14298 6.19036C3.7681 6.81548 4.61594 7.16667 5.5 7.16667C6.38405 7.16667 7.2319 6.81548 7.85702 6.19036C8.48214 5.56523 8.83333 4.71739 8.83333 3.83333C8.83333 2.94928 8.48214 2.10143 7.85702 1.47631C7.2319 0.851189 6.38405 0.5 5.5 0.5C4.61594 0.5 3.7681 0.851189 3.14298 1.47631C2.51786 2.10143 2.16667 2.94928 2.16667 3.83333Z" stroke={stroke} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

export default AccountMenuIcon;
