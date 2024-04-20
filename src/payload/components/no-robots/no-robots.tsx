import React from 'react';
import Helmet from 'react-helmet';

export const NoRobots: React.FC = () => {
  return (
    <Helmet>
      <meta content="noindex, nofollow" name="robots" />
      <meta content="noindex, nofollow" name="googlebot" />
    </Helmet>
  );
};
