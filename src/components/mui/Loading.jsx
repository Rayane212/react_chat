import React from 'react';
import { Backdrop, CircularProgress } from '@mui/material';

const Loading = ({ loading }) => {
    return (
        <div className='formContainer'>
            <Backdrop
                sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={loading}
                title='Loading'
            >
                <CircularProgress color="inherit" />
            </Backdrop>
        </div>

    );
};

export default Loading;