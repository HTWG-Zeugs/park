import { FileWithPath } from "react-dropzone";

export interface ImageFile extends FileWithPath {
  preview: string;
  uploadUrl?: string | null;
  deleteUrl?: string | null;
  isUploaded: boolean;
  uploadedName: string;
  hasUploadError: boolean;
}
