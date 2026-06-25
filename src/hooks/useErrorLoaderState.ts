import { useState } from "react";

export function useErrorLoaderState() {

  const [isErrorActive, setErrorActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoaderActive, setLoaderActive] = useState(false);

  function popError(errorMessage:string){
    setLoaderActive(false);
    setErrorActive(true);
    setErrorMessage(errorMessage);

    setTimeout(()=>{
      setErrorActive(false);
      setErrorMessage("");
    }, 5000)
  }

  return {
    isErrorActive,
    popError,
    errorMessage,
    isLoaderActive,
    setLoaderActive
  };
}