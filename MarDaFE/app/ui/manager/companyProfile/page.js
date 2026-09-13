"use client";
import { useMemo, useState, useEffect } from "react";
import {
  MRT_EditActionButtons,
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import {
  Box,
  Button,
  DialogActions,
  DialogContent,
  DialogContentText,
  Dialog,
  DialogTitle,
  IconButton,
  Tooltip,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  styled,
} from "@mui/material"; 
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { CampanyProfileService } from "@/app/lib/campanyProfileService";
import Breadcrumb from "@/app/ui/components/Breadcrumbs/Breadcrumb"; 
// import CreateNewProfileModal from "./CreateNewProfileModal"; 
import UpdateProfileModal from "./UpdateProfileModal"; 
 
const CampanyProfile = () => {
  const [createModalOpen, setCreateModalOpen] = useState(false);
    const [updateModalOpen, setUpdateModalOpen] = useState(false);
    const [selectedProfile, setSelectedProfile] = useState(null);

    const [profileData, setProfileData] = useState([]);

  const [validationErrors, setValidationErrors] = useState({});
  const [openDeactivateDialog, setOpenDeactivateDialog] = useState(false);
  const [selectedProfileDeactivate, setSelectedProfileToDeactivate] = useState([]);
  let [statusMessage, setStatusMessage] = useState();
  const [profile, setProfile] = useState([]); 

  const columns = [
    {
      accessorKey: "id",
      header: "ID",
      enableColumnOrdering: false,
      enableEditing: false, //disable editing on this column
      enableSorting: false,
      enableAdding: false,
      size: 10,
    },
    {
      accessorKey: "name",
      header: "ስም",
      muiEditTextFieldProps: {
        type: "text",
        required: true,
        error: !!validationErrors?.name,
        helperText: validationErrors?.name,
        //remove any previous validation errors when campus focuses on the input
        onFocus: () =>
          setValidationErrors({
            ...validationErrors,
            name: undefined,
          }),
        //optionally add validation checking for onBlur or onChange
      },
    },
 
    {
      accessorKey: "code",
      header: "ኮድ",
      muiEditTextFieldProps: {
        type: "text",
        required: true,
        error: !!validationErrors?.code,
        helperText: validationErrors?.code,
        //remove any previous validation errors when campus focuses on the input
        onFocus: () =>
          setValidationErrors({
            ...validationErrors,
            code: undefined,
          }),
        //optionally add validation checking for onBlur or onChange
      },
      // enableColumnOrdering: false,
      // enableEditing: false, //disable editing on this column
      // enableSorting: false,
    },
     
  ];

  //call READ hook
  let {
    // isError: isLoadingCampanyProfileError = false,
    // isFetching: isFetchingPaymentCatagory,
    // isLoading: isLoadingPaymentCatagory,
    // data: listStatusMessage,
  } = useGetCampanyProfile ();  
  
  //call CREATE hook

  let {
    mutateAsync: createCampanyProfile,
    // isPending: isCreatingPaymentCatagory,
    // data: createdStatusMessage,
    // isSuccess: isCreatedStatusMessage = false,
  } = useCreateCampanyProfile();

  //call UPDATE hook
  let {
    // data: updatedStatusMessage,
    mutateAsync: updateCampanyProfile,
    // isPending: isUpdatingPaymentCatagory,
    // isSuccess: isUpdatedStatusMessage = false,
  } = useUpdateCampanyProfile();

  //call DELETE hook
  let {
    // data: deactivateStatusMessage,
    mutateAsync: deactivatePaymentCatagory,
    // isPending: isDeactivatingPaymentCatagory,
    // isSuccess: isDeactivateStatusMessage = false,
  } = useDeactivateCampanyProfile();

  //CREATE action

  const handleCreateCampanyProfile = (profile) => { 
    // You can add your logic to handle the new category creation here, e.g., update state or make an API call.
     createCampanyProfile(profile);
  };

    //UPDATE action
  const handleUpdateProfile = (updatedProfile) => {
    const updatedProfiles = profile.map((cat) =>
      cat.id === updatedProfile.id ? { ...cat, ...updatedProfile } : cat
    ); 
    setProfile(updatedProfiles)
    
      updateCampanyProfile(updatedProfile); 
  };
 
  //DELETE action 
  const handleDeactivateRow = (profile) => {
    //send api delete request here, then refetch or update local table data for re-render
    deactivatePaymentCatagory(profile.original);
  };

  function validateCampanyProfile(profile) {
    return {
      name: !validateRequired(profile.name) ? "ስም ያስፈልጋል" : "", 
     code: !validateRequired(profile.code) ? "ኮድ ያስፈልጋል" : "", 
    };
  }

  const HandleDeactivateRow = ({ open, handleClose, onAgree, profile  }) => {
  
  
    if (profile.original === undefined) {
      return null;
    }
    const handleDeactivateRow = () => {
      onAgree(profile);
      handleClose();
    };

    return (
      <Dialog open={open} aria-labelledby="responsive-dialog-title">
        <DialogTitle id="responsive-dialog-title">
          እርግጠኛ ኖት{" "}
          <span style={{ color: "red" }}>{profile.original.name}</span> {" "} ይሰረዝ
        </DialogTitle>

        <DialogContent>
          <DialogContentText>
          መመለስ አይችሉም
          </DialogContentText>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose}>ተወው</Button>
          <Button onClick={handleDeactivateRow} color="primary" autoFocus>
            አወ
          </Button>
        </DialogActions>
      </Dialog>
    );
  };
 
  const table = useMaterialReactTable({
    columns,
    data: profile,
    createDisplayMode: "modal", //default ('row', and 'custom' are also available)
    editDisplayMode: "modal", //default ('row', 'cell', 'table', and 'custom' are also available)
    enableEditing: true,
    initialState: { columnVisibility: { id: false } }, //hide id column by default

    getRowId: (row) => row.id,

     

    muiTableContainerProps: {
      sx: {
        minHeight: "500px",
      },
    },
    columnResizeMode: "onChange", //default
    // enableExpanding: true, 
    enableGrouping: true,
    enableColumnFilterModes: true,
    enableDensityToggle: true,
    enableGlobalFilter: true,
    enableRowPinning: true,
    // enableFilterMatchHighlighting: true,
    enablePinning: true,
    enableGrouping: true,
    enableStickyHeader: true,
    enableStickyFooter: true,
    enableColumnOrdering: true,
    rowPinningDisplayMode: "top",
    enableRowNumbers: true, 
    enableSorting: true, //usually you do not want to sort when re-ordering
    // enableSelectAll: true,
    // enableRowOrdering: true,

    // enableRowPinning: true, 
    // enableStickyHeader: true,
    // rowPinningDisplayMode: "select-sticky",

    enableFacetedValues: true,
    // muiPaginationProps: {
    //   color: "primary",
    //   rowsPerPageOptions: [10, 20, 30],
    //   shape: "rounded",
    //   variant: "outlined",
    // },
    // paginationDisplayMode: "pages",

    // muiSearchTextFieldProps: {
    //   size: "small",
    //   variant: "outlined",
    // },
    // muiTableBodyRowProps: ({ row, table }) => {
    //   const { density } = table.getState();
    //   return {
    //     sx: {
    //       //Set a fixed height for pinned rows
    //       height: row.getIsPinned()
    //         ? `${
    //             //Default mrt row height estimates. Adjust as needed.
    //             density === "compact" ? 37 : density === "comfortable" ? 53 : 69
    //           }px`
    //         : undefined,
    //     },
    //   };
    // },
    //clicking anywhere on the row will select it
    // muiTableBodyRowProps: ({ row }) => ({
    //   onClick: row.getToggleSelectedHandler(),
    //   sx: { cursor: "pointer" },
    // }),

    // muiRowDragHandleProps: ({ table }) => ({
    //   onDragEnd: () => {
    //     const { draggingRow, hoveredRow } = table.getState();
    //     if (hoveredRow && draggingRow) {
    //       profile .splice(
    //         hoveredRow.index,
    //         0,
    //         profile.splice(draggingRow.index, 1)[0]
    //       );
    //       setProfile([...profile]);
    //     }
    //   },
    // }),
    // muiSelectCheckboxProps: ({ row }) => ({
    //   color: "secondary",
    //   // disabled: row.original.isAccountLocked, //access the row data to determine if the checkbox should be disabled
    // }),
    onCreatingRowCancel: () => setValidationErrors({}),
    
    onEditingRowCancel: () => setValidationErrors({}), 
    //optionally customize modal content
    renderCreateRowDialogContent: ({ table, row, internalEditComponents }) => (
      <>
        <DialogTitle variant="h3">የክፍያ አይነት መዝግብ</DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: "1rem" }}
        >
          {internalEditComponents}

          {/* or render custom edit components here */}
        </DialogContent>
        <DialogActions>
          <MRT_EditActionButtons variant="icon" table={table} row={row} />
        </DialogActions>
      </>
    ),
    //optionally customize modal content
    renderEditRowDialogContent: ({ table, row, internalEditComponents }) => (
      <>
        <DialogTitle variant="h3">አስተካክል</DialogTitle>
        <DialogContent
          sx={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
        >
          {internalEditComponents} {/* or render custom edit components here */}
        </DialogContent>
        <DialogActions>
          <MRT_EditActionButtons variant="icon" table={table} row={row} />
        </DialogActions>
      </>
    ),
    renderRowActions: ({ row }) => (
      <Box sx={{ display: "flex", gap: "1rem" }}>
        <Tooltip arrow placement="left" title="የክፍያ አይነት አስተካክል">
          <IconButton
            color="success"
            onClick={() => {
            
              setUpdateModalOpen(true);  
              setSelectedProfile(row.original);          
            }} 
          >
            <EditIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="የክፍያ አይነት ሰርዝ">
          <IconButton
            color="error"
            onClick={() => {
              setOpenDeactivateDialog(true);
              setSelectedProfileToDeactivate(row);
            }}
          >
            <DeleteIcon />
          </IconButton>
        </Tooltip>
        <UpdateProfileModal
        open={updateModalOpen}
        onClose={() => setUpdateModalOpen(false)}
        onUpdate={handleUpdateProfile}
        profile={selectedProfile} 
      />
        <HandleDeactivateRow
          open={openDeactivateDialog}
          handleClose={() => setOpenDeactivateDialog(false)}
          onAgree={handleDeactivateRow}
          profile={selectedProfileDeactivate} 
        />
      </Box>
    ),

    renderTopToolbarCustomActions: ({ table, row }) => {
     
      return (
        <div style={{ display: "flex", gap: "0.5rem" }}>

          {/* <Button
          className="bg-meta-5"
          variant="contained"
           onClick={() => {
              setCreateModalOpen(true);
            }}
        >
         የክፍያ አይነት መዝግብ
        </Button> */}
          
         
          
          {/* <CreateNewProfileModal
         open={createModalOpen}
            onClose={() => setCreateModalOpen(false)}
            onSubmit={handleCreateCampanyProfile}
           
          /> */}

        </div>
      );
     },
    
  });

  return (
    <>
      <Breadcrumb pageName="የድርጅቱ ገጽታ" />

      <div>
        <MaterialReactTable table={table} />
      </div>
    </>
  );

   
  function useGetCampanyProfile () {
    let fetchedCampanyProfileList = null;
    function getCampanyProfile() {
      const campanyProfileService = new CampanyProfileService();
      const status = "Active";
      campanyProfileService
      .getAllCampanyProfile(status)
         .then((response) => {
          setProfile(response.data); 
          fetchedCampanyProfileList = response.data; 
        
        })
        .catch((e) => { 
        });
    }
    return useQuery({
      queryKey: ["CampanyProfile"],
      queryFn: async () => {
        //send api request here

        await new Promise((resolve) => setTimeout(resolve, 1000), getCampanyProfile()); //fake api call

        return Promise.resolve(fetchedCampanyProfileList);
      },
    });
  }
  //CREATE hook (post new campus to api)

  function useCreateCampanyProfile () {
    let statusMessage = null;

    const queryClient = useQueryClient();
    const campanyProfileService = new CampanyProfileService();

    return useMutation({
      mutationFn: async (catagory) => {
        //send api update request here 
    

        catagory.name = catagory.profileName;
        catagory.code = catagory.profileCode;
        catagory.status = "active";
       await campanyProfileService
          .createCampanyProfile(catagory)
          .then((response) => {
            statusMessage = "የክፍያ አይነት በትክክል ተመዝግቧል";
          })
          .catch((e) => {
            statusMessage = e.message;
          });

        await new Promise((resolve) => setTimeout(resolve, 20)); //fake api call
        setStatusMessage(statusMessage);

        return Promise.resolve(statusMessage);
      },
      //client side optimistic update

      onMutate: (newPaymentCatagoryInfo) => {
        queryClient.setQueryData(["CampanyProfile"], (prevPaymentCatagory) => [
          ...prevPaymentCatagory,
          {
            ...newPaymentCatagoryInfo,
            id: (Math.random() + 1).toString(36).substring(7),
          },
        ]);
      },
      // onSettled: () => queryClient.invalidateQueries({queryKey: ['Buildinges'] }), //refetch Buildinges after mutation, disabled for demo
    });
  } 
  function useUpdateCampanyProfile() {
    let statusMessage = null;
    const campanyProfileService = new CampanyProfileService();
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: async (profile) => {
        //send api update request here
        campanyProfileService
          .updateCampanyProfile(profile, profile.id)
          .then((response) => {
            statusMessage = "የክፍያ አይነት በትክክል ተስተካክሏል";
          })
          .catch((e) => {});
        await new Promise((resolve) => setTimeout(resolve, 500)); //fake api call
        setStatusMessage(statusMessage);
        return Promise.resolve(statusMessage);
      },
      //client side optimistic update
      onMutate: (newPaymentCatagoryInfo) => {
        queryClient.setQueryData(["CampanyProfile"], (prevPaymentCatagorys) =>
          prevPaymentCatagorys?.map((prevPaymentCatagory) =>
            prevPaymentCatagory.id === newPaymentCatagoryInfo.id ? newPaymentCatagoryInfo : prevPaymentCatagory
          )
        );
      },
      // onSettled: () => queryClient.invalidateQueries({ queryKey: ['campuses'] }), //refetch campuses after mutation, disabled for demo
    });
  }
 
  function useDeactivateCampanyProfile() {
    let statusMessage = null;
    let profileId = null;
    let statusvalue = -1;
    const queryClient = useQueryClient();
    return useMutation({
      mutationFn: async (profile) => {
        //send api update request here 
        const campanyProfileService = new CampanyProfileService();
        profileId = profile.id;
        await campanyProfileService.deactivateCampanyProfile(profile).then((response) => {
          statusvalue = response.data.status;
          statusMessage = response.data.message;
        });
        await new Promise((resolve) => setTimeout(resolve, 1000)); //fake api call
        setStatusMessage(statusMessage);
        return Promise.resolve(statusMessage);
      },

      //client side optimistic update
      onSuccess: () => {
        if (statusvalue === 1 && profileId != null) {
          queryClient.setQueryData(["CampanyProfile"], (prevProfiles) =>
            prevProfiles?.filter((p) => p.id !== profileId)
          );
        }
      },
      // onSettled: () => queryClient.invalidateQueries({ queryKey: ['campuses'] }), //refetch campuses after mutation, disabled for demo
    });
  }
  
};

const validateRequired = (value) => value !== undefined && value !== null && String(value).trim().length > 0;

const queryClient = new QueryClient();

const CampanyProfileWithProviders = () => (
  //Put this with your other react-query providers near root of your app
  <QueryClientProvider client={queryClient}>
    <CampanyProfile />
  </QueryClientProvider>
);

export default CampanyProfileWithProviders;