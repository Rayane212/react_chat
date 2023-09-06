import { Backdrop, CircularProgress } from '@mui/material';
import React from 'react';

const Loading = ({ loading }) => {
    return (
        <div className='formContainer'>
            <Backdrop
                sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={loading}
            >
                <CircularProgress color="inherit" />
            </Backdrop>
        </div>

    );
};

export default Loading;