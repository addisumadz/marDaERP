import { useState, useEffect } from "react";

const SidebarLinkGroup = ({ children, activeCondition }) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (activeCondition) {
      setOpen(true);
    }
  }, [activeCondition]);

  const handleClick = () => {
    setOpen((prev) => !prev);
  };

  // Do NOT wrap in <li> because callers already render <li> items inside children
  // Wrapping here would create <li> nested in <li>, causing hydration warnings
  return <>{children(handleClick, open)}</>;
};

export default SidebarLinkGroup;
