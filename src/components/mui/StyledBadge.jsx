import { styled } from '@mui/material/styles';
import Badge from '@mui/material/Badge';

const StyledBadge = styled(Badge)(({ theme, mode }) => {
  let badgeStyles = {};

  if (mode === 'newMessage') {
    badgeStyles = {
      backgroundColor: 'red!important',
      color: 'white',
    };
  } else if (mode === "online") {
    badgeStyles = {
      backgroundColor: '#44b700',
      color: '#44b700',
    };
  } else if (mode === "offline") {
    badgeStyles = {
      backgroundColor: 'grey',
      color: 'grey',
    };
  } else if (mode === "inactive") {
    badgeStyles = {
      backgroundColor: 'orange',
      color: 'orange',
    };
  }

  return {
    '& .MuiBadge-badge': {
      ...badgeStyles,
      boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
      '&::after': {
        position: 'absolute',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        borderRadius: '50%',
        content: '""',
      },
    },
  };
});

export default StyledBadge;