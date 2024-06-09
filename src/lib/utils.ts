import toast from "react-hot-toast";

export const handleError = (error: unknown) => {
    let message = "";
    if(error instanceof Error) {
      const message = error.message;
    } else if (typeof error === "string") {
      message = error;
    } else {
      message = "An error occurred"
    }
    toast.error(message);
  }