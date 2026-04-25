import React from 'react';

const DeleteRowIcon: React.FC<React.SVGAttributes<{}>> = ({ fill, ...props }) => {
  return <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
    <path d="M6.83333 6.83333L10.1667 10.1667M10.1667 6.83333L6.83333 10.1667M8.5 1C14.5 1 16 2.5 16 8.5C16 14.5 14.5 16 8.5 16C2.5 16 1 14.5 1 8.5C1 2.5 2.5 1 8.5 1Z" stroke={fill || "#D42525"} stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
  </svg>

}
export default DeleteRowIcon;