'use client';

import {
    ChakraProvider,
    createSystem,
    defaultConfig,
    defineConfig,
    defineRecipe,
    defineSlotRecipe,
} from '@chakra-ui/react';
import { listAnatomy, nativeSelectAnatomy, sliderAnatomy } from '@chakra-ui/react/anatomy';
import React from 'react';

const baseFonts = defaultConfig.theme?.tokens?.fonts;

// Chakra v2's color scales, which the site was designed with.
function colorScale(values: string[]) {
    const steps = ['50', '100', '200', '300', '400', '500', '600', '700', '800', '900'];
    return Object.fromEntries(steps.map((step, i) => [step, { value: values[i] }]));
}

const config = defineConfig({
    globalCss: {
        html: {
            bg: '#f8f8f8',
            color: 'gray.800'
        },
        body: {
            bg: '#f8f8f8'
        }
    },
    theme: {
        tokens: {
            fonts: {
                heading: { value: `Times New Roman, ${baseFonts?.heading?.value}` },
                body: { value: `Times New Roman, ${baseFonts?.body?.value}` },
            },
            colors: {
                gray: colorScale(['#F7FAFC', '#EDF2F7', '#E2E8F0', '#CBD5E0', '#A0AEC0',
                    '#718096', '#4A5568', '#2D3748', '#1A202C', '#171923']),
                blue: colorScale(['#EBF8FF', '#BEE3F8', '#90CDF4', '#63B3ED', '#4299E1',
                    '#3182CE', '#2B6CB0', '#2C5282', '#2A4365', '#1A365D']),
                purple: colorScale(['#FAF5FF', '#E9D8FD', '#D6BCFA', '#B794F4', '#9F7AEA',
                    '#805AD5', '#6B46C1', '#553C9A', '#44337A', '#322659']),
                yellow: colorScale(['#FFFFF0', '#FEFCBF', '#FAF089', '#F6E05E', '#ECC94B',
                    '#D69E2E', '#B7791F', '#975A16', '#744210', '#5F370E']),
            }
        },
        recipes: {
            heading: defineRecipe({
                base: {
                    marginTop: '8',
                    marginBottom: '4',
                    fontWeight: 'bold'
                }
            }),
            input: defineRecipe({
                variants: {
                    variant: {
                        outline: {
                            bg: 'white',
                            borderColor: 'gray.500'
                        }
                    }
                }
            }),
            button: defineRecipe({
                base: {
                    fontWeight: 'normal',
                    fontFamily: 'Arial',
                    borderColor: 'gray.500',
                    borderWidth: '1px'
                },
                variants: {
                    variant: {
                        subtle: {
                            borderColor: 'gray.500'
                        }
                    }
                }
            }),
            link: defineRecipe({
                base: {
                    display: 'inline'
                },
                variants: {
                    variant: {
                        plain: {
                            color: 'purple.500',
                            textDecoration: 'underline'
                        }
                    }
                }
            })
        },
        slotRecipes: {
            list: defineSlotRecipe({
                slots: listAnatomy.keys(),
                variants: {
                    variant: {
                        marker: {
                            item: {
                                _marker: { color: 'inherit' }
                            }
                        }
                    }
                }
            }),
            nativeSelect: defineSlotRecipe({
                slots: nativeSelectAnatomy.keys(),
                variants: {
                    variant: {
                        outline: {
                            field: {
                                bg: 'white',
                                borderColor: 'gray.500'
                            }
                        }
                    }
                }
            }),
            slider: defineSlotRecipe({
                slots: sliderAnatomy.keys(),
                variants: {
                    variant: {
                        outline: {
                            track: {
                                bg: 'gray.200',
                                shadow: 'none'
                            },
                            thumb: {
                                borderWidth: '0',
                                bg: 'white',
                                boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
                            }
                        }
                    }
                }
            })
        }
    }
});

const system = createSystem(defaultConfig, config);

export function UIProvider({ children }: { children: React.ReactNode }) {
    return (
        <ChakraProvider value={system}>
            {children}
        </ChakraProvider>
    );
}
