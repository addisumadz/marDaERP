import React, { useState } from 'react';
import { Modal, Box, TextField, Button, Typography, FormControlLabel, Switch } from '@mui/material';

const CreateSetting = ({ open, onClose, onSubmit }) => {
  const [name, setName] = useState('');
  const [isAllPatientToDoctor, setIsAllPatientToDoctor] = useState(false);
  const [errors, setErrors] = useState({ name: false });

  const handleSubmit = () => {
    if (!name) {
      setErrors({ name: true });
      return;
    }

    onSubmit({ name, isAllPatientToDoctor });
    setName('');
    setIsAllPatientToDoctor(false);
    onClose();
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Box sx={{ padding: 3, maxWidth: 400, margin: 'auto' }}>
        <Typography variant="h6">Create Setting</Typography>
        <TextField
          label="Setting Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          fullWidth
          error={errors.name}
          helperText={errors.name ? 'Name is required' : ''}
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
          Create
        </Button>
        <Button onClick={onClose} fullWidth variant="outlined" sx={{ marginTop: 2 }}>
          Cancel
        </Button>
      </Box>
    </Modal>
  );
};

export default CreateSetting;
