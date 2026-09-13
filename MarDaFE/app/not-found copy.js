'use client';

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  Tooltip,
} from "@mui/material";

export default function PageNotFound() {
  function signOutHandler() {
    if (typeof window !== "undefined") {
      localStorage.removeItem("user_token");
    }
    signOut({ redirect: true, callbackUrl: "/signin" });
  }

  return (
    <main className="flex h-28 w-full items-center justify-center rounded-lg">
      <div>
        <h2 className="text-3xl text-danger">There was a Problem</h2>
        <p>We could not find the page you are looking for.</p>
        <p>
          <Button onClick={signOutHandler} className="text-primary">
            ይውጡ
          </Button>
        </p>
      </div>
    </main>
  );
}
