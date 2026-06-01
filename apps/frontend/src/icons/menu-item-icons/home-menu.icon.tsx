import React from 'react';

interface INavigationProps extends React.SVGAttributes<SVGSVGElement> {
  isActive?: boolean;
}

const HomeMenuIcon: React.FC<INavigationProps> = ({ isActive, fill, ...props }) => {
  const color = isActive ? 'white' : fill;

  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      {isActive ? (
        <path
          d="M8 1.33333L2 6.66667V14.6667H6.66667V10H9.33333V14.6667H14V6.66667L8 1.33333Z"
          fill={color}
        />
      ) : (
        <path
          d="M8 1.33333L2 6.66667V14.6667H6.66667V10H9.33333V14.6667H14V6.66667L8 1.33333Z"
          stroke={color}
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
    </svg>
  );
};

export default HomeMenuIcon;
