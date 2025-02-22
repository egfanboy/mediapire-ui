import React from "react";
import { useParams } from "react-router-dom";
import { TransferPage } from "./transfer.tsx/transfer";

export const ManagePage = () => {
  const params = useParams();

  if (params.slug === "transfer") {
    return <TransferPage />;
  }
  return <div>{JSON.stringify(params)}</div>;
};
