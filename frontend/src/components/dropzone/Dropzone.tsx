import React, { useCallback, useEffect, useMemo } from "react";
import { FileError, FileWithPath, useDropzone } from "react-dropzone";

import "src/components/dropzone/Dropzone.css";
import "src/components/thumbnail/Thumbs.css";
import { ImageFile } from "src/models/ImageFile";
import { useTranslation } from "react-i18next";


interface DropzoneProps {
  images: ImageFile[];
  setImages: React.Dispatch<React.SetStateAction<ImageFile[]>>;
}

export default function Dropzone({ images, setImages }: DropzoneProps) {
  const onDrop = useCallback(
    (acceptedFiles: FileWithPath[]) => {
      const previewImages = acceptedFiles.map((file) => {
        return Object.assign(file, {
          preview: URL.createObjectURL(file),
          isUploaded: false,
          signedUrl: "",
          uploadedName: "",
          hasUploadError: false,
        });
      });
      setImages((prevImages) => [...prevImages, ...previewImages]);
    },
    [images, setImages]
  );

  const { t } = useTranslation();

  function customFileValidator<T extends File>(
    file: T
  ): FileError | readonly FileError[] | null {
    // Check if file is already in the list
    if (images.some((image) => image.name === file.name)) {
      return {
        code: "file-already-in-list",
        message: "File already in list",
      };
    }
    return null;
  }

  const { getRootProps, getInputProps, isFocused, isDragAccept, isDragReject } =
    useDropzone({
      accept: {
        "image/jpeg": [],
      },
      onDrop,
      validator: customFileValidator,
    });

  const style = useMemo(() => {
    let styles = "baseStyle";

    if (isFocused) {
      styles += " focusedStyle";
    }

    if (isDragAccept) {
      styles += " acceptStyle";
    }

    if (isDragReject) {
      styles += " rejectStyle";
    }

    return styles;
  }, [isFocused, isDragAccept, isDragReject]);

  useEffect(() => {
    return () => images.forEach((file) => URL.revokeObjectURL(file.preview));
  }, [images]);

  return (
    <section className="container">
      <div {...getRootProps({ className: `dropzone ${style}` })}>
        {/*
          Add a hidden file input. Best to use opacity 0, so that the required validation message will appear on form submission.
        */}
        <input {...getInputProps()} />
        <p>{t("component_dropzone.drop_files_here")}</p>
      </div>
    </section>
  );
}
