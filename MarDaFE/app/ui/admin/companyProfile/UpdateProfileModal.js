 
import React, { useState, useEffect } from 'react';
import { Modal, Box, TextField, Button, Typography } from '@mui/material';

const UpdateProfileModal = ({ open, onClose, onUpdate, profile }) => {
  const [name, setProfileName] = useState('');
  const [code, setProfileCode] = useState(''); 

  useEffect(() => { 
    if (profile) {
      setProfileName(profile.name || '');
      setProfileCode(profile.code || ''); 
    }
  }, [profile]);

  const handleNameChange = (event) => {
    setProfileName(event.target.value);
  };

  const handleCodeChange = (event) => {
    setProfileCode(event.target.value);
  };

 

  const handleSubmit = () => {
    const updatedProfile = {
      ...profile,
      name,
      code,
     
    };

    
    onUpdate(updatedProfile);
    onClose(); // Close the modal after updating
  };
  const handleClose = () => {
    setProfileName(''); // Clear the input if modal is closed without submission
    setProfileCode(''); 
    onClose(); // Close the modal without submitting
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{
        position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
        width: 400, bgcolor: 'background.paper', boxShadow: 24, p: 4
      }}>
        <Typography variant="h6" component="h2">
        Profile አስተካክል
        </Typography>
         <TextField
          fullWidth
          label="የProfile ስም"
          value={name}
          onChange={handleNameChange}
          margin="normal"
        />  
        <TextField
          fullWidth
          label="የProfile ኮድ"
          value={code}
          onChange={handleCodeChange}
          margin="normal"
        />
         
         
        <Button
          variant="contained" 
          className="bg-meta-5"
          onClick={handleSubmit}
          style={{ marginTop: '10px' }}
        >
          አስተካክል
        </Button>  
        <Button
          variant="contained" 
           className="bg-meta-5"
          onClick={handleClose}
          style={{ marginLeft: '10px' }}
        >
          ዝጋ
        </Button>
      </Box>
    </Modal>
  );
};

export default UpdateProfileModal;
