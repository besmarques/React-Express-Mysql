import React from 'react';
import Button from '@mui/material/Button';

const CustomButton = (props) => {
    return (
        <Button variant={props.variant} color={props.color} onClick={props.onClick}>
            {props.name}
        </Button>
    );
}

export default CustomButton;