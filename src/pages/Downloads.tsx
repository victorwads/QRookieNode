import React from 'react';
import Icon, { Icons } from '../components/Icons';

const Downloads: React.FC = () => {
  return (
    <div className='horizontal-display'>
      <h1><Icon icon={Icons.solid.faDownload} size="lg" />Downloads Page</h1>
    </div>
  );
};

export default Downloads;