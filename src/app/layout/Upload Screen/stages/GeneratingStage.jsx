import React from "react";
import { STRINGS } from "../../../consts/text-strings";
import Loader from "../../../components/Loader";


export default function GeneratingStage() {
  return (
    <>
      <h1>{STRINGS.WAITING_TEXT}</h1>
      <Loader />
      
    </>
  );
}
