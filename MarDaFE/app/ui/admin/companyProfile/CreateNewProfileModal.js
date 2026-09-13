// // components/CreateNewCatagoryModal.js
// import React, { useState } from 'react';
// import { Modal, Box, TextField, Button, Typography, FormControl, FormControlLabel, RadioGroup, Radio } from '@mui/material';

// const CreateNewProfileModal = ({ open, onClose, onSubmit }) => {
//   const [profileName, setProfileName] = useState('');
//   const [profileCode, setProfileCode] = useState('');
//    const [errors, setErrors] = useState({ name: false, code: false });

//   const handleNameChange = (event) => {
//     setProfileName(event.target.value);
//     setErrors({ ...errors, name: false });
//   };

//   const handleCodeChange = (event) => {
//     setProfileCode(event.target.value);
//     setErrors({ ...errors, code: false });
//   };

   

//   const handleSubmit = () => {
//     const nameError = profileName.trim() === '';
//     const codeError = profileCode.trim() === '';

//     if (nameError || codeError) {
//       setErrors({ name: nameError, code: codeError });
//       return;
//     }

//     onSubmit({ profileName, profileCode});
//     setProfileName(''); // Clear the input after submission
//     setProfileCode('');
    
//     onClose(); // Close the modal after submission
//   };

//   const handleClose = () => {
//     setProfileName(''); // Clear the input after submission
//     setProfileCode('');
//     onClose(); // Close the modal without submitting
//   };

//   return (
//     <Modal open={open} onClose={handleClose}>
//       <Box sx={{
//         position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
//         width: 400, bgcolor: 'background.paper', boxShadow: 24, p: 4
//       }}>
//         <Typography variant="h6" component="h2">
//         Profile Add
//         </Typography>
//         <TextField
//           fullWidth
//           label="ስም"
//           value={profileName}
//           onChange={handleNameChange}
//           margin="normal"
//           error={errors.name}
//           helperText={errors.name ? 'ስም ያስፈልጋል' : ''}
//         />
//         <TextField
//           fullWidth
//           label=" ኮድ"
//           value={profileCode}
//           onChange={handleCodeChange}
//           margin="normal"
//           error={errors.code}
//           helperText={errors.code ? ' ኮድ ያስፈልጋል' : ''}
//         />
    

//         <Button
//           variant="contained"
//           className="bg-meta-5"
//           onClick={handleSubmit}
//         >
//           መዝግብ
//         </Button>
//         <Button
//           variant="contained" 
//            className="bg-meta-5"
//           onClick={handleClose}
//           style={{ marginLeft: '10px' }}
//         >
//           ዝጋ
//         </Button>
        
//       </Box>
//     </Modal>
//   );
// };

// export default CreateNewProfileModal;
