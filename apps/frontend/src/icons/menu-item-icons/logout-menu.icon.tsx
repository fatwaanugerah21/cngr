import React from 'react';

interface INavigationProps extends React.SVGAttributes<SVGSVGElement> {
  isActive?: boolean;
}

const LogoutMenuIcon: React.FC<INavigationProps> = ({ isActive, fill, ...props }) => {
  const stroke = isActive ? 'white' : fill;
  return (
    <svg width="16" height="15" viewBox="0 0 16 15" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M9.66667 3.83333V2.16667C9.66667 1.72464 9.49107 1.30072 9.17851 0.988155C8.86595 0.675595 8.44203 0.5 8 0.5H2.16667C1.72464 0.5 1.30072 0.675595 0.988155 0.988155C0.675595 1.30072 0.5 1.72464 0.5 2.16667V12.1667C0.5 12.6087 0.675595 13.0326 0.988155 13.3452C1.30072 13.6577 1.72464 13.8333 2.16667 13.8333H8C8.44203 13.8333 8.86595 13.6577 9.17851 13.3452C9.49107 13.0326 9.66667 12.6087 9.66667 12.1667V10.5M5.5 7.16667H15.5M13 9.66667L15.5 7.16667L13 4.66667" stroke={stroke} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

export default LogoutMenuIcon;
