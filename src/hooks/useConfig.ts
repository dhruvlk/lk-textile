import { ConfigContext } from 'contexts/configContext';
import { useContext } from 'react';

const useConfig = () => useContext(ConfigContext);

export default useConfig;
