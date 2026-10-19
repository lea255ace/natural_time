import { ReactNode, createContext, useContext } from 'react';
import Astrolabe from 'types/astrolabe';
import { useConfigContext } from 'context/configProvider';

const AstrolabeContext = createContext<Astrolabe>({} as Astrolabe);

export function AstrolabeProvider({ date, children }: { date: Date, children?: ReactNode }) {
    const {configValues, timeZone} = useConfigContext();
    const astrolabe = new Astrolabe({
        date: date,
        latitude: configValues.latitude,
        longitude: configValues.longitude,
        timeZone,
    });
    return (
        <AstrolabeContext.Provider value={astrolabe}>
            {children}
        </AstrolabeContext.Provider>
    );
}

export function useAstrolabeContext() {
    return useContext(AstrolabeContext);
}