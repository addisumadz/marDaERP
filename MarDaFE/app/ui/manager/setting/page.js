"use client"
import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Tooltip,
  Switch,TextField,
  FormControlLabel,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete'; 
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { MaterialReactTable } from 'material-react-table';
import { SettingService } from '../../../lib/settingService';

const Setting = () => {
  const [settings, setSettings] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentSetting, setCurrentSetting] = useState({});
  const [validationErrors, setValidationErrors] = useState({});
 const settingService= new SettingService();
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const data = await settingService.getAllSettingsByStatus('active');
      setSettings(data);
    } catch (error) {
    
       toast.error('Failed to fetch settings');
    }
  };

  const openModal = (setting = {}) => {
    setEditMode(!!setting.id);
    setCurrentSetting(setting);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentSetting({});
    setValidationErrors({});
  };

  const handleSubmit = async () => {
    if (currentSetting.name.trim() === '') {
      setValidationErrors({ name: 'Name is required' });
      return;
    }

    try {
      if (editMode) { 
       
        await settingService.updateSetting(currentSetting.id, currentSetting);
        toast.success('Setting updated');
      } else {
        await settingService.createSetting(currentSetting);
        toast.success('Setting created');
      }
      fetchSettings();
      closeModal();
    } catch (error) {
      toast.error('Failed to save setting');
    }
  };

  const handleDelete = async (id) => {
    try {
      await settingService.deleteSetting(id);
      toast.success('Setting deleted');
      fetchSettings();
    } catch (error) {
      toast.error('Failed to delete setting');
    }
  };

  const columns = [
    { accessorKey: 'name', header: 'Name' },
    {
      accessorKey: 'isAllPatientToDoctor',
      header: 'Is All Docment to Atari',
      Cell: ({ row }) => (
        <Switch
          checked={row.original.isAllPatientToDoctor}
          disabled
        />
      ),
    },
    {
      id: 'actions',
      header: 'Actions',
      Cell: ({ row }) => (
        <Box sx={{ display: 'flex', gap: '1rem' }}>
          <Tooltip title="Edit">
            <IconButton onClick={() => openModal(row.original)}>
              <EditIcon />
            </IconButton>
          </Tooltip>
          {/* <Tooltip title="Delete">
            <IconButton onClick={() => handleDelete(row.original.id)}>
              <DeleteIcon />
            </IconButton>
          </Tooltip> */}
        </Box>
      ),
    },
  ];

  return (
    <Box>
     {/* // <Button onClick={() => openModal()}>Add Setting</Button> */}
      <MaterialReactTable columns={columns} data={settings} />
      <Dialog open={isModalOpen} onClose={closeModal}>
        <DialogTitle>{editMode ? 'Edit Setting' : 'Add Setting'}</DialogTitle>
        <DialogContent>
          <TextField
            label="Name"
            value={currentSetting.name || ''}
            onChange={(e) => setCurrentSetting({ ...currentSetting, name: e.target.value })}
            fullWidth
            error={!!validationErrors.name}
            helperText={validationErrors.name}
          />
          <FormControlLabel
            control={
              <Switch
                checked={currentSetting.isAllPatientToDoctor || false}
                onChange={(e) => setCurrentSetting({ ...currentSetting, isAllPatientToDoctor: e.target.checked })}
                color="primary"
              />
            }
            label="Is All Patient to Doctor"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeModal}>Cancel</Button>
          <Button onClick={handleSubmit}>{editMode ? 'Update' : 'Create'}</Button>
        </DialogActions>
      </Dialog>
      <ToastContainer 
                position="top-right" // Ensure the position is set to top-right
                autoClose={5000} // Duration for auto-close
                hideProgressBar={false} // Show progress bar or not
                newestOnTop={false} // Newest toast will appear at the top
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
            />
    </Box>
  );
};

export default Setting;
