"use client";
import { useMemo, useState, useEffect } from "react";
import {
  MaterialReactTable,
  useMaterialReactTable,
} from "material-react-table";
import {
  Box,
  Button,
  Grid,
  IconButton,
  Tooltip,
  Paper,
  Typography,
} from "@mui/material";
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { YeMaiberAbalatService } from "../../../lib/yeMahiberAbalatService";
import { KebeleService } from "../../../lib/kebeleService";
import { MesriabetService } from "../../../lib/mesriaBetService";
import { SettingService } from "../../../lib/settingService";
import { userService } from "../../../lib/userService";
import { MahiberService } from "@/app/lib/mahiberService";
import Breadcrumb from "@/app/ui/components/Breadcrumbs/Breadcrumb";
import CreateNewyeMaiberAbalatModal from "./CreateNewyeMaiberAbalatModal";
import UpdateyeMaiberAbalatModal from "./UpdateyeMaiberAbalatModal";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import ViewyeMaiberAbalatModal from "./ViewyeMaiberAbalatModal";
var ethiopianDate = require("ethiopian-date");
import { amharicFuzzyFilter } from "../../../lib/amharicFuzzyFilter";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import "./nyala-normal"; // ✅ Ensure Nyala font is registered

export const exportPDFForYeMaiberAbalat = (
  dataForPdfBody,
  columnsForPdf,
  logoBase64Data = null,
  companyName = " "
) => {
  const doc = new jsPDF();
  doc.setFont("nyala"); // ✅ Amharic font

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const title = "2 ዓመት ያልሞላቸው የማህበር አባላት ዝርዝር ሪፖርት";
  const PAGE_MARGIN = 14;

  const HEADER_LOGO_WIDTH = 25;
  const HEADER_LOGO_HEIGHT = 25;
  const HEADER_LOGO_X = PAGE_MARGIN;
  const HEADER_LOGO_Y = PAGE_MARGIN - 7;
  const HEADER_TEXT_X = HEADER_LOGO_X + HEADER_LOGO_WIDTH + 8;
  const HEADER_TEXT_Y = HEADER_LOGO_Y + HEADER_LOGO_HEIGHT / 2;
  const HEADER_LINE_Y = HEADER_LOGO_Y + HEADER_LOGO_HEIGHT + 4;

  const EFFECTIVE_HEADER_BOTTOM_Y = HEADER_LINE_Y + 1;
  const PDF_TITLE_Y_PAGE_1 = EFFECTIVE_HEADER_BOTTOM_Y + 1;
  let currentY = PDF_TITLE_Y_PAGE_1;

  doc.setFont("nyala");
  doc.setFontSize(18);
  doc.text(
    "የባሕር ዳር ከተማ አስተዳደር ኅብረት ስራ ማህበራት ማስፋፊያ ጽ/ቤት",
    pageWidth / 2,
    currentY,
    { align: "center" }
  );
  currentY += 10; // add space after the line
  // Title
  doc.setFontSize(16);
  doc.text(title, pageWidth / 2, currentY, { align: "center" });
  currentY += 10;
  // Prepare table data
  const head = [columnsForPdf.map((col) => col.header)];
  const body = dataForPdfBody.map((row, index) =>
    columnsForPdf.map((col) => {
      if (col.header === "ቁጥር") return index + 1;
      const accessorKey = col.accessorKey || col.id;
      let val = row[accessorKey];

      // 📌 Add this logic to format 'የአገልግሎት ዘመን'
      if (col.header === "የአገልግሎት ዘመን" && typeof val === "string") {
        const parts = val.split(".");
        const years = parseInt(parts[0], 10);
        const months = parseInt(parts[1] || "0", 10);
        if (!isNaN(years) && !isNaN(months)) {
          return `${years} ዓመት ${months} ወር`;
        }
      }

      return val || "-";
    })
  );

  const columnStyles = {};
  columnsForPdf.forEach((col, index) => {
    columnStyles[index] = { halign: "center", cellWidth: "auto" };
  });

  autoTable(doc, {
    startY: currentY,
    head,
    body,
    theme: "grid", // ✅ Use grid to show full borders
    styles: {
      font: "nyala",
      fontSize: 14,
      cellPadding: 2,
      lineColor: [0, 0, 0], // black border lines
      lineWidth: 0.1, // thin borders
      valign: "middle",
    },
    headStyles: {
      font: "nyala",
      fontStyle: "bold",
      fillColor: [41, 128, 185],
      textColor: [255, 255, 255],
      lineColor: [0, 0, 0], // ensure header borders match
      lineWidth: 0.1,
    },
    columnStyles,
    margin: { top: 10, left: PAGE_MARGIN, right: PAGE_MARGIN, bottom: 20 },

    didDrawPage: ({ doc: docInstance, pageNumber }) => {
      docInstance.setFont("nyala");

      // Header with optional logo
      if (logoBase64Data) {
        try {
          const format = logoBase64Data
            .split(";")[0]
            .split("/")[1]
            .toUpperCase();
          docInstance.addImage(
            logoBase64Data,
            format,
            HEADER_LOGO_X,
            HEADER_LOGO_Y,
            HEADER_LOGO_WIDTH,
            HEADER_LOGO_HEIGHT
          );
        } catch (e) {
          console.error("Failed to load logo into PDF:", e);
        }
      }

      docInstance.setFontSize(16);
      docInstance.text(companyName, HEADER_TEXT_X, HEADER_TEXT_Y, {
        baseline: "middle",
      });

      // Footer
      const [ey, em, ed] = ethiopianDate.toEthiopian(
        new Date().getFullYear(),
        new Date().getMonth() + 1,
        new Date().getDate()
      );
      const reportDate = `${ed}/${em}/${ey} ዓ.ም`;

      docInstance.setFontSize(12).setTextColor(100);
      docInstance.text(`ሪፖርት ቀን: ${reportDate}`, PAGE_MARGIN, pageHeight - 15);
      docInstance.text(
        `ገጽ ${pageNumber}`,
        pageWidth - PAGE_MARGIN,
        pageHeight - 15,
        { align: "right" }
      );
    },
  });

  if (typeof doc.putTotalPages === "function") {
    doc.putTotalPages("{totalPages}");
  }

  doc.save("mahiberAbalat_report.pdf");
};

const YeMaiberAbalat = () => {
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [updateModalOpen, setUpdateModalOpen] = useState(false);

  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewedAbalat, setViewedAbalat] = useState(null);

  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [rowToDelete, setRowToDelete] = useState(null);

  const [selectedyeMaiberAbalat, setSelectedyeMaiberAbalat] = useState(null);
  const [mahibers, setMahibers] = useState([]); // To store Mahiber data
  const [mahiberAbalat, setMahiberAbalat] = useState([]); // To store Mahiber data
  const [kebeles, setKebeles] = useState([]); // New state for kebeles
  const [settings, setSettings] = useState([]); // New state for kebeles
  const [mesriabets, setMesriabets] = useState([]); // New state for  mesriabets
  const queryClient = useQueryClient();
  const [selectedRow1, setSelectedRow] = useState(null); // Store selected row data for modal
  const [rowSelectionTable1, setRowSelectionTable1] = useState({});
  const [rowSelectionTable2, setRowSelectionTable2] = useState({});
  const [selectedRowIdToLoad, setSelectedRowIdToLoad] = useState(null); // Store selected row data for modal
  const [selectedRowToEdit, setSelectedRowToEdit] = useState(null); // Store selected row data for modal
  const [selected, setSelected] = useState(null); // Store selected row data for modal
  const [fetchedUsers, setFetchedUsers] = useState([]);

  const isActionEnabledTable2 = Object.keys(rowSelectionTable2).length > 0;
  const selectedRowId = Object.keys(rowSelectionTable2)[0];
  // const selectedRow = mahiberAbalat.find((row) => row.id === selectedRowId);

  const yeMaiberAbalatService = new YeMaiberAbalatService();

  // Fetch kebeles
  useEffect(() => {
    const fetchKebeles = async () => {
      const kebeleService = new KebeleService();
      try {
        const response = await kebeleService.getAllKebele("active");
        setKebeles(response.data);
      } catch (e) {
        toast.error("Failed to load Setting.");
      }
    };
    fetchKebeles();
  }, []);
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const users = await userService.getAllUsers("active");

        const filteredUsers = users.filter((user) =>
          user.roles?.some((role) => role.name === "ROLE_USER")
        );

        setFetchedUsers(filteredUsers);
      } catch (error) {
        console.error("Error fetching users:", error);
      }
    };
    fetchUsers();
  }, []);

  // Fetch kebeles
  useEffect(() => {
    const fetchSettings = async () => {
      const settingService = new SettingService();
      try {
        const response = await settingService.getAllSettingsByStatus("active");
        setSettings(response);
      } catch (e) {
        toast.error("Failed to load Setting.");
      }
    };
    fetchSettings();
  }, []);

  useEffect(() => {
    const fetchMesriabets = async () => {
      const mesriaBetService = new MesriabetService();
      try {
        const response = await mesriaBetService.getAllMesriabet("active");
        setMesriabets(response.data);
      } catch (e) {
        toast.error("Failed to load Mesriabet.");
      }
    };
    fetchMesriabets();
  }, []);

  useEffect(() => {
    if (selectedRowIdToLoad) {
      fetchMahiberAbalat(selectedRowIdToLoad);
    }
  }, [selectedRowIdToLoad]);

  // Fetch mahibers
  const { data: mahiberData = [] } = useQuery({
    queryKey: ["Mahiber"],
    queryFn: async () => {
      const mahiberService = new MahiberService();
      const response = await mahiberService.getAllMahiber("Active");

      setMahibers(response.data);
      return response.data;
    },
  });
  const handleViewRow = () => {
    const selectedRowId = Object.keys(rowSelectionTable2)[0]; // assuming single select
    if (selectedRowId) {
      const rowData = mahiberAbalat.find(
        (row) => row.id.toString() === selectedRowId
      );
      if (rowData) {
        setViewedAbalat(rowData);
        setViewModalOpen(true);
      }
    } else {
      toast.error("እባኮትን ሰንጠረዡ ላይ ረድ፡፡");
    }
  };
  const handleCreateyeMaiberAbalat = async (newData) => {
    const yeMaiberAbalatService = new YeMaiberAbalatService();
    let mahiberId = newData.mahiberId;
    newData.mesriaBet = newData.mesriabet;
    newData.status = "Active";
    newData.createdAt = new Date();

    delete newData.mahiberId;
    delete newData.mesriabet;

    try {
      await yeMaiberAbalatService.createyeMahiberAbalat(newData, mahiberId); // create new yeMaiberAbalat
      toast.success("አባላት ተመዝግቧል።");
      setSelectedRowIdToLoad(mahiberId); // Refetch data to update table after creation
      setCreateModalOpen(false); // Close the modal
    } catch (error) {
      toast.error("ስህተት አለ። እባኮትን ተመልከቱ።");
    }
  };

  const handleUpdateyeMaiberAbalat = async (updatedData) => {
    const yeMaiberAbalatService = new YeMaiberAbalatService();
    let yeMahiberAbalatId = parseInt(updatedData.id, 10); // Convert to integer
    let mahiberId = parseInt(updatedData.mahiberId, 10); // Convert to integer
    updatedData.updatedAt = new Date();
    delete updatedData.mahiberId;

    try {
      await yeMaiberAbalatService.updateyeMahiberAbalat(
        updatedData,
        yeMahiberAbalatId,
        mahiberId
      ); // update yeMaiberAbalat
      toast.success("አባላት ተሻሻለበት።");
      setSelectedRowIdToLoad(mahiberId); // Refetch data to update table after creation// Refetch data to update table after update
      setUpdateModalOpen(false); // Close the modal
    } catch (error) {
      toast.error("ስህተት አለ። እባኮትን ተመልከቱ።");
    }
  };

  const confirmDelete = async () => {
    if (!rowToDelete) return;

    try {
      await yeMaiberAbalatService.deleteyeMahiberAbalat(
        rowToDelete.original.id
      );
      toast.success("አባሉ ተሰርዟል።");

      setSelectedRowIdToLoad(rowToDelete.original.mahiber.id);
    } catch (error) {
      toast.error("ስህተት አለ። እባኮትን ተመልከቱ።");
    } finally {
      setConfirmDeleteOpen(false);
      setRowToDelete(null);
    }
  };

  useEffect(() => {
    if (mahibers.length > 0) {
      const firstId = mahibers[0].id;
      setRowSelectionTable1({ [firstId]: true });
      setSelectedRow(mahibers[0]);

      // Call the fetch function with the first ID
      fetchMahiberAbalat(firstId);
    }
  }, [mahibers]);

  // Fetch function
  const fetchMahiberAbalat = async (selectedRowIdToLoad) => {
    try {
      const response =
        await yeMaiberAbalatService.getAllyeMahiberAbalatNotMilitary2(
          "active",
          0
        );

      setMahiberAbalat(response.data);
    } catch (error) {
      toast.error("Failed to fetch settings");
    }
  };

  // Table 2 Configuration (yeMaiberAbalat List)
  const table2 = useMaterialReactTable({
    columns: [
      {
        header: "ቁጥር",
        size: 20,
        Cell: ({ table, row }) => {
          const sortedRowIndex = table
            .getSortedRowModel()
            .rows.findIndex((r) => r.id === row.id);
          return sortedRowIndex + 1;
        },
      },
      { accessorKey: "teraKutir", header: "ዶክመንት ቁጥር", size: 20 },
      {
        accessorKey: "firstName",
        header: "ስም",
        size: 40,
        filterFn: amharicFuzzyFilter,
      },
      {
        accessorKey: "middleName",
        header: "የአባት ስም",
        size: 40,
        filterFn: amharicFuzzyFilter,
      },
      {
        accessorKey: "lastName",
        header: "የአያት ስም",
        filterFn: amharicFuzzyFilter,
      },
      {
        accessorKey: "yagelgilotZemen",
        header: "የአገልግሎት ዘመን",
        filterFn: amharicFuzzyFilter,
        Cell: ({ cell }) => {
          const value = cell.getValue();

          // Ensure the value is a string and can be processed
          if (typeof value !== "string" || value.trim() === "") {
            return null; // or return value;
          }

          const parts = value.split(".");
          const years = parseInt(parts[0], 10);
          const months = parseInt(parts[1] || "0", 10);

          // Check if parsing resulted in valid numbers
          if (isNaN(years) || isNaN(months)) {
            return <span style={{ color: "orange" }}>{value}</span>; // Show invalid data in a different color
          }

          // Determine the color based on the month value
          const color = months > 12 ? "red" : "green";

          const formattedText = `${years} ዓመት ${months} ወር`;

          return <strong style={{ color: color }}>{formattedText}</strong>;
        },
      },
      {
        accessorKey: "phoneNumber",
        header: "ስልክ ቁጥር",
        size: 20,
      },
      {
        accessorKey: "sex",
        accessorFn: (row) => {
          if (row.sex === "male") return "ወንድ";
          if (row.sex === "female") return "ሴት";
          return "—";
        },
        header: "ፆታ",
        size: 20,
        filterFn: "equals",
        filterSelectOptions: [
          { label: "ወንድ", value: "ወንድ" },
          { label: "ሴት", value: "ሴት" },
        ],
        filterVariant: "select",
      },

      { accessorKey: "address", header: "አድራሻ" },
      // { accessorKey: "yebitKutir", header: "የቤት ቁጥር " },
      {
        accessorKey: "mesriaBet", // assuming this is an object
        header: "መስሪያ ቤት",
        filterFn: "equals",
        filterSelectOptions: mesriabets.map((m) => ({
          label: m.name,
          value: m.name, // or m.id, depending on how you store it
        })),
        filterVariant: "select",
        cell: ({ row }) => {
          const mesriaBet = row.getValue("mesriaBet");
          return mesriaBet?.name || "-";
        },
      },

      // { accessorKey: "yemesiraBetHalafinet", header: "የመስሪያ ቤት ሐላፊነት" },

      {
        header: "መዝጋቢ",
        accessorFn: (row) => row?.mezigabi?.name || "",
        cell: ({ row }) => row?.original?.mezigabi?.name || "-",
        filterFn: "equals",
        filterVariant: "select",
        filterSelectOptions: fetchedUsers.map((m) => ({
          label: m.name,
          value: m.name,
        })),
      },
      {
        accessorKey: "createdAt",
        header: "c",
        size: 30,
        enableEditing: false,
        Cell: (props) => {
          // if (props.row.original.bitQualification !== undefined) {
          let gc = props.row.original.createdAt;
          let gcc = new Date(gc);
          let ethiopianFormatedDateArray = ethiopianDate.toEthiopian(
            gcc.getFullYear(),
            gcc.getMonth() + 1,
            gcc.getDate()
          );
          let ethiopianFormatedDate =
            ethiopianFormatedDateArray[2] +
            "/" +
            ethiopianFormatedDateArray[1] +
            "/" +
            ethiopianFormatedDateArray[0];

          return <>{ethiopianFormatedDate}</>;
          // } else return <>{props.row.original.QualificationName}</>;
        },
      },

      // { accessorKey: "yeTidarAgarSm", header: "የትዳር አጋር ስም" },
      // { accessorKey: "yeTidarAgarGender", header: "የትዳር አጋር ፆታ" },
      // { accessorKey: "yeTidarAgarAdress", header: "የትዳር አጋር አድራሻ" },
      // { accessorKey: "yeTidarAgarSilk", header: "የትዳር አጋር ስልክ" },
      // { accessorKey: "yeTidarAgarMesiriaBet", header: "የትዳር አጋር መስሪያ ቤት" },
      // { accessorKey: "halafinet", header: "ሐላፊነት" },
    ],
    data: mahiberAbalat, // Populate table with yeMaiberAbalat data
    // enableEditing: true,
    state: { rowSelection: rowSelectionTable2 },
    enableRowSelection: true, // ✅ enables row selection
    enableMultiRowSelection: false, //use radio buttons instead of checkboxes

    enableSelectAll: false,
    getRowId: (row) => row.id, // ensure this returns a unique key

    onRowSelectionChange: setRowSelectionTable2,
  });
  const handleExportPDF = () => {
    const excludedHeaders = [
      "Select",
      "አድራሻ",
      "የተመዘገበት ቀን",
      "መዝጋቢ",
      "c",
      "ፆታ",
      "ስልክ ቁጥር",
    ];

    const columnsForPdf = table2
      .getAllColumns()
      .map((col) => ({
        header: col.columnDef.header,
        accessorKey: col.columnDef.accessorKey || col.id,
      }))
      .filter((col) => !excludedHeaders.includes(col.header));

    //exportPDFForYeMaiberAbalat(mahiberAbalat, columnsForPdf, null);
    const sortedData = table2.getSortedRowModel().rows.map((r) => r.original);
    exportPDFForYeMaiberAbalat(sortedData, columnsForPdf, null);
  };

  return (
    <>
      <ToastContainer autoClose={5000} hideProgressBar theme="colored" />
      <Breadcrumb pageName="የማህበር አባላት" />
      <div style={{ marginBottom: "1rem" }}>
        <Button
          variant="contained"
          color="secondary"
          startIcon={<PictureAsPdfIcon />}
          onClick={() => handleExportPDF(table2, mahiberAbalat)}
          disabled={!mahiberAbalat || mahiberAbalat.length === 0}
        >
          PDF አውርድ
        </Button>
      </div>
      {/* <Grid container direction="column" spacing={2} mt={3} alignItems="center"> */}

      <Grid item xs={12} sx={{ width: "100%" }}>
        <Paper elevation={3} sx={{ padding: 2 }}>
          <Box sx={{ display: "flex", gap: "8px", marginBottom: "16px" }}>
            <Button
              variant="contained"
              onClick={handleViewRow}
              className="bg-meta-1"
              disabled={!isActionEnabledTable2} // Enable only when a row is selected in Table 1
            >
              View
            </Button>
          </Box>
          <MaterialReactTable table={table2} />
        </Paper>
      </Grid>
      {/* Second Table Section */}

      {/* </Grid> */}

      <CreateNewyeMaiberAbalatModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onCreate={handleCreateyeMaiberAbalat}
        mahibers={mahibers}
        kebeles={kebeles}
        mesriabets={mesriabets}
        selectedRowId={selected} // Pass selected row data to the modal
      />
      <UpdateyeMaiberAbalatModal
        open={updateModalOpen}
        onClose={() => setUpdateModalOpen(false)}
        onUpdate={handleUpdateyeMaiberAbalat}
        abalat={selectedyeMaiberAbalat}
        mahibers={mahibers}
        kebeles={kebeles}
        mesriabets={mesriabets}
      />
      <ViewyeMaiberAbalatModal
        open={viewModalOpen}
        onClose={() => setViewModalOpen(false)}
        abalat={viewedAbalat}
      />

      <ConfirmDeleteModal
        open={confirmDeleteOpen}
        onClose={() => setConfirmDeleteOpen(false)}
        onConfirm={confirmDelete}
        message="ይህን አባል ማጥፋት ትፈልጋለህ?"
      />
    </>
  );
};

const queryClient = new QueryClient();

const YeMaiberAbalatPage = () => (
  <QueryClientProvider client={queryClient}>
    <YeMaiberAbalat />
  </QueryClientProvider>
);

export default YeMaiberAbalatPage;
