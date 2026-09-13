import React, { useState, useEffect } from 'react';
import { Modal, Box, TextField, Button, Typography, FormControlLabel, Switch } from '@mui/material';

const UpdateSetting = ({ open, onClose, onUpdate, setting }) => {
  const [name, setName] = useState('');
  const [isAllPatientToDoctor, setIsAllPatientToDoctor] = useState(false);

  useEffect(() => {
    if (setting) {
      setName(setting.name);
      setIsAllPatientToDoctor(setting.isAllPatientToDoctor);
    }
  }, [setting]);

  const handleSubmit = () => {
    onUpdate({ ...setting, name, isAllPatientToDoctor });
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{ padding: 3, maxWidth: 400, margin: 'auto' }}>
        <Typography variant="h6">Update Setting</Typography>
        <TextField
          label="Setting Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          margin="normal"
        />
        <FormControlLabel
          control={
            <Switch
              checked={isAllPatientToDoctor}
              onChange={(e) => setIsAllPatientToDoctor(e.target.checked)}
              color="primary"
            />
          }
          label="Is All Docment to Atari"
        />
        <Button onClick={handleSubmit} fullWidth variant="contained" color="primary">
          Update
        </Button>
        <Button onClick={onClose} fullWidth variant="outlined" sx={{ marginTop: 2 }}>
          Cancel
        </Button>
      </Box>
    </Modal>
  );
};

export default UpdateSetting;
