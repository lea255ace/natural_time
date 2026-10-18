'use client';

import { useState, useEffect } from 'react';
import { ConfigParameters, useConfigContext } from 'context/configProvider';
import { Box, HStack, VStack, Input, Field, Button, Text } from '@chakra-ui/react';

type DisplayedParameters = {
    latitude: string;
    longitude: string;
};

export default function Config() {
    const {configValues, updateConfig} = useConfigContext();
    const [displayedValues, setDisplayedValues] = useState<DisplayedParameters>(translateConfigValues(configValues));

    function translateConfigValues(configValues: ConfigParameters) {
        return { latitude: configValues.latitude.toString(), longitude: configValues.longitude.toString() };
    }

    function updateConfigValues(e) {
        e.preventDefault();
        const form = e.target;
        const formData = new FormData(form);
        const parameters = {} as ConfigParameters;
        for (const [k, v] of formData.entries()) {
            parameters[k] = parseFloat(v as string);
        }
        updateConfig(parameters);
    }

    useEffect(() => {
        setDisplayedValues(translateConfigValues(configValues));
    }, [configValues]);

    return (
        <Box>
            <form onSubmit={updateConfigValues}>
                <VStack width='fit-content' align='center'>
                    <HStack>
                        <Field.Root maxWidth='80px' alignItems='center'>
                            <Field.Label textStyle='md'>Latitude</Field.Label>
                            <Input textStyle='md' name='latitude' textAlign='center'
                                value={displayedValues.latitude}
                                onChange={e => setDisplayedValues({...displayedValues, latitude: e.target.value})}
                            />
                        </Field.Root>
                        <Field.Root maxWidth='80px' alignItems='center'>
                            <Field.Label textStyle='md'>Longitude</Field.Label>
                            <Input textStyle='md' name='longitude' textAlign='center'
                                value={displayedValues.longitude}
                                onChange={e => setDisplayedValues({...displayedValues, longitude: e.target.value})}
                            />
                        </Field.Root>
                    </HStack>
                    <Button type='submit' size='sm' variant='subtle'>Update</Button>
                </VStack>
            </form>
            <br/>
            <Text>Current Latitude: {Math.abs(configValues.latitude) + ' ' + ((configValues.latitude > 0) ? 'N' : 'S')}</Text>
            <Text>Current Longitude: {Math.abs(configValues.longitude) + ' ' + ((configValues.longitude > 0) ? 'E' : 'W')}</Text>
        </Box>
    );
}
