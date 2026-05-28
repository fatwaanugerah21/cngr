import React from 'react';

interface INavigationProps extends React.SVGAttributes<SVGSVGElement> {
  isActive?: boolean;
}

const ProductionMenuIcon: React.FC<INavigationProps> = ({ isActive, fill, ...props }) => {
  const stroke = isActive ? 'white' : fill;
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M7.5 2.5H3.33333C2.8731 2.5 2.5 2.8731 2.5 3.33333V9.16667C2.5 9.6269 2.8731 10 3.33333 10H7.5C7.96024 10 8.33333 9.6269 8.33333 9.16667V3.33333C8.33333 2.8731 7.96024 2.5 7.5 2.5Z" stroke={stroke} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16.667 2.5H12.5003C12.0401 2.5 11.667 2.8731 11.667 3.33333V5.83333C11.667 6.29357 12.0401 6.66667 12.5003 6.66667H16.667C17.1272 6.66667 17.5003 6.29357 17.5003 5.83333V3.33333C17.5003 2.8731 17.1272 2.5 16.667 2.5Z" stroke={stroke} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M16.667 10H12.5003C12.0401 10 11.667 10.3731 11.667 10.8333V16.6667C11.667 17.1269 12.0401 17.5 12.5003 17.5H16.667C17.1272 17.5 17.5003 17.1269 17.5003 16.6667V10.8333C17.5003 10.3731 17.1272 10 16.667 10Z" stroke={stroke} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M7.5 13.333H3.33333C2.8731 13.333 2.5 13.7061 2.5 14.1663V16.6663C2.5 17.1266 2.8731 17.4997 3.33333 17.4997H7.5C7.96024 17.4997 8.33333 17.1266 8.33333 16.6663V14.1663C8.33333 13.7061 7.96024 13.333 7.5 13.333Z" stroke={stroke} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

export default ProductionMenuIcon;
