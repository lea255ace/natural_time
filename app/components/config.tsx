'use client';

import { useState } from 'react';
import { ConfigParameters, isValidLatitude, isValidLongitude, useConfigContext } from 'context/configProvider';
import { Box, HStack, VStack, Input, Field, Button, Text } from '@chakra-ui/react';

type DisplayedParameters = {
    latitude: string;
    longitude: string;
};

type ParameterErrors = {
    latitude?: string;
    longitude?: string;
};

function translateConfigValues(configValues: ConfigParameters): DisplayedParameters {
    return { latitude: configValues.latitude.toString(), longitude: configValues.longitude.toString() };
}

// Unlike parseFloat, rejects empty input and trailing text such as "40abc".
function parseCoordinate(value: string) {
    return value.trim() === '' ? NaN : Number(value);
}

export default function Config() {
    const {configValues, timeZone, updateConfig} = useConfigContext();
    // Holds the user's edits until they're submitted; otherwise the form shows the saved values.
    const [draftValues, setDraftValues] = useState<DisplayedParameters | null>(null);
    const [errors, setErrors] = useState<ParameterErrors>({});
    const displayedValues = draftValues ?? translateConfigValues(configValues);

    function editValue(name: keyof DisplayedParameters, value: string) {
        setDraftValues({...displayedValues, [name]: value});
        setErrors({...errors, [name]: undefined});
    }

    function updateConfigValues(e) {
        e.preventDefault();
        const latitude = parseCoordinate(displayedValues.latitude);
        const longitude = parseCoordinate(displayedValues.longitude);
        const newErrors: ParameterErrors = {
            latitude: isValidLatitude(latitude) ? undefined : '-90 to 90',
            longitude: isValidLongitude(longitude) ? undefined : '-180 to 180',
        };
        setErrors(newErrors);
        if (newErrors.latitude || newErrors.longitude) {
            return;
        }
        updateConfig({ latitude, longitude });
        setDraftValues(null);
    }

    return (
        <Box>
            <form onSubmit={updateConfigValues} noValidate>
                <VStack width='fit-content' align='center'>
                    <HStack align='start'>
                        <Field.Root maxWidth='80px' alignItems='center' invalid={!!errors.latitude}>
                            <Field.Label textStyle='md'>Latitude</Field.Label>
                            <Input textStyle='md' name='latitude' textAlign='center'
                                value={displayedValues.latitude}
                                onChange={e => editValue('latitude', e.target.value)}
                            />
                            <Field.ErrorText>{errors.latitude}</Field.ErrorText>
                        </Field.Root>
                        <Field.Root maxWidth='80px' alignItems='center' invalid={!!errors.longitude}>
                            <Field.Label textStyle='md'>Longitude</Field.Label>
                            <Input textStyle='md' name='longitude' textAlign='center'
                                value={displayedValues.longitude}
                                onChange={e => editValue('longitude', e.target.value)}
                            />
                            <Field.ErrorText>{errors.longitude}</Field.ErrorText>
                        </Field.Root>
                    </HStack>
                    <Button type='submit' size='sm' variant='subtle'>Update</Button>
                </VStack>
            </form>
            <br/>
            <Text>Current Latitude: {Math.abs(configValues.latitude) + ' ' + ((configValues.latitude > 0) ? 'N' : 'S')}</Text>
            <Text>Current Longitude: {Math.abs(configValues.longitude) + ' ' + ((configValues.longitude > 0) ? 'E' : 'W')}</Text>
            <Text>Time Zone: {timeZone.replaceAll('_', ' ')}</Text>
        </Box>
    );
}
