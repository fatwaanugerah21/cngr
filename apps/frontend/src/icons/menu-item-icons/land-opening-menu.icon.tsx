import React from 'react';

interface INavigationProps extends React.SVGAttributes<SVGSVGElement> {
  isActive?: boolean;
}

const LandOpeningMenuIcon: React.FC<INavigationProps> = ({ isActive, fill, ...props }) => {
  const stroke = isActive ? 'white' : fill;
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" {...props}>
      <path d="M10 10.8337V1.66699L16.6667 5.00033L10 8.33366" stroke={stroke} strokeLinecap="round" strokeLinejoin="round" />
      <path d="M17.1251 8.52454C17.5686 9.89133 17.6101 11.3567 17.2447 12.7464C16.8792 14.1361 16.1223 15.3916 15.0639 16.3634C14.0055 17.3353 12.6902 17.9827 11.2745 18.2286C9.85874 18.4744 8.40218 18.3084 7.07808 17.7503C5.75397 17.1922 4.61808 16.2654 3.80552 15.0803C2.99296 13.8952 2.53795 12.5016 2.49462 11.0653C2.45129 9.62905 2.82147 8.21056 3.56111 6.97862C4.30076 5.74668 5.37873 4.75314 6.66678 4.11621" stroke="white" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M6.66638 8.33301C6.2488 8.88886 5.97694 9.54037 5.87558 10.2282C5.77422 10.916 5.84657 11.6182 6.08604 12.2709C6.32552 12.9236 6.7245 13.506 7.24665 13.965C7.76879 14.424 8.3975 14.7451 9.07549 14.899C9.75347 15.0529 10.4592 15.0346 11.1283 14.846C11.7975 14.6573 12.4088 14.3043 12.9066 13.8189C13.4043 13.3336 13.7727 12.7314 13.9782 12.0672C14.1837 11.403 14.2197 10.698 14.083 10.0163" stroke="white" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

export default LandOpeningMenuIcon;
