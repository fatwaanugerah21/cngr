import React from 'react';

interface INavigationProps extends React.SVGAttributes<SVGSVGElement> {
  isActive?: boolean;
}

const ReportMenuIcon: React.FC<INavigationProps> = ({ isActive, fill, ...props }) => {
  const stroke = isActive ? 'white' : fill;
  return (
    <svg width="13" height="16" viewBox="0 0 13 16" fill="none" xmlns="http://www.w3.org/2000/svg" {...props}>
      <path d="M8 0.5V3.83333C8 4.05435 8.0878 4.26631 8.24408 4.42259C8.40036 4.57887 8.61232 4.66667 8.83333 4.66667H12.1667M12.1667 4.66667L8 0.5H2.16667C1.72464 0.5 1.30072 0.675595 0.988155 0.988155C0.675595 1.30072 0.5 1.72464 0.5 2.16667V13.8333C0.5 14.2754 0.675595 14.6993 0.988155 15.0118C1.30072 15.3244 1.72464 15.5 2.16667 15.5H10.5C10.942 15.5 11.366 15.3244 11.6785 15.0118C11.9911 14.6993 12.1667 14.2754 12.1667 13.8333V4.66667ZM3.83333 12.1667V8M6.33333 12.1667V11.3333M8.83333 12.1667V9.66667" stroke={stroke} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

export default ReportMenuIcon;
