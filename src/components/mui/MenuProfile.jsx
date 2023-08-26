import React, { useState } from 'react';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import PersonIcon from '@mui/icons-material/Person';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import { Divider, IconButton, ListItemIcon, Tooltip } from '@mui/material';
import Profile from '../Profile';
import { signOut } from 'firebase/auth';
import { auth, db } from '../../firebase';
import { doc, updateDoc } from 'firebase/firestore';


const MenuProfile = ({currentUser}) => {
    const [anchorEl, setAnchorEl] = useState(null);
    const [isProfileOpen, setIsProfileOpen] = useState(false);


    const handleOpenProfileModal = () => {
        setIsProfileOpen(true);
    };

    const handleCloseProfileModal = () => {
        setIsProfileOpen(false);
    };

    const handleOpen = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleMenuItemClick = async (action) => {
        handleClose();
        if (action === 'profile') {
            handleOpenProfileModal()
        } else if (action === 'logout') {
            await signOut(auth)
            await updateDoc(doc(db, "users", currentUser.uid), { online: "offline" });

        }
    };

    return (
        <div className='menu'>
            <Tooltip title="Menu">
            <IconButton
                className='iconbutton'
                id="menu-button"
                aria-controls={anchorEl ? 'custom-menu' : undefined}
                aria-haspopup="true"
                onClick={handleOpen}
            >
                <ManageAccountsIcon sx={{ color: "white" }} />
            </IconButton>
            </Tooltip>
            <Menu
                id="custom-menu"
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleClose}
                MenuListProps={{
                    'aria-labelledby': 'menu-button',
                }}
            >
                <MenuItem onClick={() => handleMenuItemClick('profile')}>
                    <ListItemIcon>
                        <PersonIcon />
                    </ListItemIcon>
                    Profile
                </MenuItem>
                <Divider />
                <MenuItem onClick={() => handleMenuItemClick('logout')} >
                    <ListItemIcon>
                        <ExitToAppIcon />
                    </ListItemIcon>
                    Logout
                </MenuItem>
            </Menu>
            <Profile isOpen={isProfileOpen} onClose={handleCloseProfileModal} />

        </div>
    );
}

export default MenuProfile