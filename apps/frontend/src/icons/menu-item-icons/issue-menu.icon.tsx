import React from 'react';

interface INavigationProps extends React.SVGAttributes<SVGSVGElement> {
  isActive?: boolean;
}

const IssueMenuIcon: React.FC<INavigationProps> = ({ isActive, fill, ...props }) => {
  const stroke = isActive ? 'white' : fill;
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <circle cx="10" cy="10" r="8" stroke={stroke} strokeWidth="2" />
      <path d="M10 6V11M10 14V14.01" stroke={stroke} strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
};

export default IssueMenuIcon;
