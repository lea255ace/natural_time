'use client';

import { useState } from 'react';
import { ConfigParameters, isValidLatitude, isValidLongitude, useConfigContext } from 'context/configProvider';
import { CITIES, cityAt } from 'types/cities';
import { Box, HStack, VStack, Input, Field, Button, NativeSelect, Separator, Text } from '@chakra-ui/react';

type DisplayedParameters = {
    latitude: string;
    longitude: string;
};

// The dropdown value that shows the latitude and longitude fields.
const CUSTOM_LOCATION = 'custom';

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

// Four decimal places is about 11 meters, more precise than the clock needs and vague enough to keep private.
function roundCoordinate(value: number) {
    return Math.round(value * 10000) / 10000;
}

function geolocationErrorMessage(error: GeolocationPositionError) {
    switch (error.code) {
    case error.PERMISSION_DENIED:
        return 'Location access was denied.';
    case error.TIMEOUT:
        return 'Finding your location took too long.';
    default:
        return 'Your location is unavailable.';
    }
}

export default function Config() {
    const {configValues, timeZone, updateConfig} = useConfigContext();
    // Holds the user's edits until they're submitted; otherwise the form shows the saved values.
    const [draftValues, setDraftValues] = useState<DisplayedParameters | null>(null);
    const [errors, setErrors] = useState<ParameterErrors>({});
    const [locating, setLocating] = useState(false);
    const [locationError, setLocationError] = useState<string | null>(null);
    // True after the user picks "Custom location" while the saved location is still a preset city.
    const [customRequested, setCustomRequested] = useState(false);
    const displayedValues = draftValues ?? translateConfigValues(configValues);
    const selectedCity = customRequested ? undefined : cityAt(configValues.latitude, configValues.longitude);

    // Saves a location from outside the form and discards any unsubmitted edits.
    function setLocation(latitude: number, longitude: number) {
        updateConfig({ latitude, longitude });
        setDraftValues(null);
        setErrors({});
        setLocationError(null);
    }

    function selectCity(name: string) {
        const city = CITIES.find(city => city.name === name);
        setCustomRequested(!city);
        if (city) {
            setLocation(city.latitude, city.longitude);
        }
    }

    function locateUser() {
        if (!('geolocation' in navigator)) {
            setLocationError('This browser can\'t share your location.');
            return;
        }
        setLocating(true);
        setLocationError(null);
        navigator.geolocation.getCurrentPosition(
            position => {
                setLocating(false);
                setLocation(roundCoordinate(position.coords.latitude), roundCoordinate(position.coords.longitude));
            },
            error => {
                setLocating(false);
                setLocationError(geolocationErrorMessage(error));
            },
            { timeout: 15000, maximumAge: 10 * 60 * 1000 },
        );
    }

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
            <Text>Current Latitude: {Math.abs(configValues.latitude) + ' ' + ((configValues.latitude > 0) ? 'N' : 'S')}</Text>
            <Text>Current Longitude: {Math.abs(configValues.longitude) + ' ' + ((configValues.longitude > 0) ? 'E' : 'W')}</Text>
            <Text>Time Zone: {timeZone.replaceAll('_', ' ')}</Text>
            <Separator borderColor='border.emphasized' marginY='4' />
            <VStack width='fit-content' align='center' gap='4'>
                <NativeSelect.Root size='sm' width='200px'>
                    <NativeSelect.Field aria-label='City' textStyle='md'
                        value={selectedCity?.name ?? CUSTOM_LOCATION}
                        onChange={e => selectCity(e.target.value)}>
                        {CITIES.map(city => <option key={city.name} value={city.name}>{city.name}</option>)}
                        <option value={CUSTOM_LOCATION}>Custom location</option>
                    </NativeSelect.Field>
                    <NativeSelect.Indicator />
                </NativeSelect.Root>
                <Button size='sm' variant='subtle' onClick={locateUser} loading={locating}>
                    Use My Location
                </Button>
                {locationError && <Text color='red.500'>{locationError}</Text>}
                {!selectedCity &&
                    <form onSubmit={updateConfigValues} noValidate>
                        <VStack width='fit-content' align='center'>
                            <HStack align='start'>
                                <Field.Root maxWidth='120px' alignItems='center' invalid={!!errors.latitude}>
                                    <Field.Label textStyle='md'>Latitude</Field.Label>
                                    <Input textStyle='md' name='latitude' textAlign='center'
                                        value={displayedValues.latitude}
                                        onChange={e => editValue('latitude', e.target.value)}
                                    />
                                    <Field.ErrorText>{errors.latitude}</Field.ErrorText>
                                </Field.Root>
                                <Field.Root maxWidth='120px' alignItems='center' invalid={!!errors.longitude}>
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
                }
            </VStack>
        </Box>
    );
}
