import React from 'react';

const EyeIcon: React.FC<React.SVGAttributes<SVGElement>> = ({ fill, ...props }) => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path
      d="M12 5C7 5 2.73 8.11 1 12.5C2.73 16.89 7 20 12 20C17 20 21.27 16.89 23 12.5C21.27 8.11 17 5 12 5ZM12 17.5C9.51 17.5 7.5 15.49 7.5 13C7.5 10.51 9.51 8.5 12 8.5C14.49 8.5 16.5 10.51 16.5 13C16.5 15.49 14.49 17.5 12 17.5ZM12 10.5C10.62 10.5 9.5 11.62 9.5 13C9.5 14.38 10.62 15.5 12 15.5C13.38 15.5 14.5 14.38 14.5 13C14.5 11.62 13.38 10.5 12 10.5Z"
      fill={fill || '#64748B'}
    />
  </svg>
);

export default EyeIcon;
