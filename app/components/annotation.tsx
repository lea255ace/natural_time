import {
    chakra,
    Popover,
    Portal,
} from '@chakra-ui/react';

export default function Annotation ({ trigger, body }) {
    return (
        <Popover.Root lazyMount unmountOnExit positioning={{ placement: 'right-end', offset: { mainAxis: 6, crossAxis: 0 }, flip: ['bottom-end'] }}>
            <Popover.Trigger asChild>
                <chakra.span color='purple.500' cursor='pointer'><sup>[<u>{trigger}</u>]</sup></chakra.span>
            </Popover.Trigger>
            <Portal>
                <Popover.Positioner>
                    <Popover.Content width='auto' maxWidth='350px' p='0'
                        bg='yellow.50' borderRadius='4' borderWidth='1px' borderColor='gray.400'
                        boxShadow='md'>
                        <Popover.Body fontSize='sm' px='3' py='2'>
                            {body}
                        </Popover.Body>
                    </Popover.Content>
                </Popover.Positioner>
            </Portal>
        </Popover.Root>
    );
}
