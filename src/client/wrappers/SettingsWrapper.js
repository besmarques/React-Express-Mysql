import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const SettingsWrapper = ({ children, featureName, redirectPath }) => {
  const navigate = useNavigate();
  const [isEnabled, setIsEnabled] = useState(false);

  useEffect(() => {
    fetch('/api/settings')
      .then(response => response.json())
      .then(data => setIsEnabled(data[featureName]));
  }, [featureName]);

  if (!isEnabled) {
    navigate(redirectPath);
    return null;
  }

  return children;
};

export default SettingsWrapper;