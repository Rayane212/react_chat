import React, { useRef, useImperativeHandle, useState } from 'react';

const AudioPlayer = React.forwardRef(({ src }, ref) => {
    const audioRef = useRef(null);
    const [isLoaded, setIsLoaded] = useState(true);

    useImperativeHandle(ref, () => ({
        play: () => {
            if (audioRef.current && isLoaded) {
                audioRef.current.currentTime = 0;
                audioRef.current.play();
            }
        }
    }));

    const handleCanPlay = () => {
        setIsLoaded(true);
    };

    return (
        <audio
            ref={audioRef}
            src={src}
            preload="auto"
            onCanPlay={handleCanPlay}
        ></audio>
    );
});

export default AudioPlayer;
