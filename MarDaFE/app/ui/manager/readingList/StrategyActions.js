"use client";
import { useState, memo } from "react";
import {
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import ReplayIcon from "@mui/icons-material/Replay";
import TimelineIcon from "@mui/icons-material/Timeline";
import FunctionsIcon from "@mui/icons-material/Functions";
import AddCircleOutlineIcon from "@mui/icons-material/AddCircleOutline";

/**
 * StrategyActions — Per-row action menu for the "Customers Without Reading" table.
 * Offers calculated reading strategies (Repeat, Last Month, Average) plus manual add.
 */
const StrategyActions = memo(function StrategyActions({
  row,
  onStrategy,
  onAddManual,
}) {
  const [anchor, setAnchor] = useState(null);
  const open = Boolean(anchor);

  return (
    <>
      <IconButton size="small" onClick={(e) => setAnchor(e.currentTarget)}>
        <MoreVertIcon fontSize="small" />
      </IconButton>
      <Menu anchorEl={anchor} open={open} onClose={() => setAnchor(null)}>
        <MenuItem onClick={() => { setAnchor(null); onStrategy(row, "repeat"); }}>
          <ListItemIcon><ReplayIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Repeat Previous</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { setAnchor(null); onStrategy(row, "lastMonth"); }}>
          <ListItemIcon><TimelineIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Last Month</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { setAnchor(null); onStrategy(row, "average"); }}>
          <ListItemIcon><FunctionsIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Average Consumption</ListItemText>
        </MenuItem>
        <MenuItem onClick={() => { setAnchor(null); onAddManual(row); }}>
          <ListItemIcon><AddCircleOutlineIcon fontSize="small" /></ListItemIcon>
          <ListItemText>Add Manually</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
});

export default StrategyActions;
