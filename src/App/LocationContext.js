import { assign } from 'lodash';

import { DefaultAppContext } from './AppContext';

export const LocationContext = React.createContext(assign({ location: null, match: null, path: null }, DefaultAppContext));

export default LocationContext;
