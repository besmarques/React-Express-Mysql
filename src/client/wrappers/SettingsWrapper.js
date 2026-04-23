import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

const SettingsWrapper = ({ children, featureName, redirectPath }) => {
  const [isEnabled, setIsEnabled] = useState(null);

  useEffect(() => {
    let isMounted = true;

    fetch('/api/settings')
      .then(response => response.json())
      .then(data => {
        if (isMounted) {
          setIsEnabled(Boolean(data[featureName]));
        }
      })
      .catch(() => {
        if (isMounted) {
          setIsEnabled(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [featureName]);

  if (isEnabled === null) {
    return <div>Loading...</div>;
  }

  if (!isEnabled) {
    return <Navigate to={redirectPath} />;
  }

  return children;
};

export default SettingsWrapper;
