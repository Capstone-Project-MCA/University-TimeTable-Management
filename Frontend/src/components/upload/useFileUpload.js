import { useState, useRef } from 'react';

export const useFileUpload = () => {
    const fileInputRef = useRef(null);
    const uploadTypeRef = useRef('course');
    const [isUploading, setIsUploading] = useState(false);
    const [uploadResult, setUploadResult] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [isSaving, setIsSaving] = useState(false);

    const handleSelectUploadType = (type) => {
        uploadTypeRef.current = type;
        fileInputRef.current?.click();
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file type
        const validExtensions = ['application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 'application/vnd.ms-excel'];
        if (!validExtensions.includes(file.type) && !file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
            alert("Please upload a valid Excel file (.xlsx or .xls)");
            return;
        }

        setSelectedFile(file);
        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", file);

        try {
            const endpointType = uploadTypeRef.current;
            const response = await fetch(`http://localhost:8080/${endpointType}/upload?save=false`, {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error("Upload failed");
            }

            const data = await response.json();
            setUploadResult(data);

        } catch (error) {
            console.error(error);
            alert("Error uploading file");
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    const handleFinalUpload = async () => {
        if (!selectedFile) return;

        setIsSaving(true);
        const formData = new FormData();
        formData.append("file", selectedFile);

        try {
            const endpointType = uploadTypeRef.current;
            const response = await fetch(`http://localhost:8080/${endpointType}/upload?save=true`, {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error("Final upload failed");
            }

            setUploadResult(null);
            setSelectedFile(null);
            alert("File uploaded and saved to database successfully.");

        } catch (error) {
            console.error(error);
            alert("Error saving file to database");
        } finally {
            setIsSaving(false);
        }
    };

    const downloadReport = () => {
        if (!uploadResult?.fileData) return;
        const byteCharacters = atob(uploadResult.fileData);
        const byteNumbers = new Array(byteCharacters.length);
        for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        const blob = new Blob([byteArray], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        const typeLabel = uploadTypeRef.current.charAt(0).toUpperCase() + uploadTypeRef.current.slice(1);
        a.download = `${typeLabel} Validation Result.xlsx`;
        document.body.appendChild(a);
        a.click();

        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
    };

    const closeResultMode = () => {
        setUploadResult(null);
        setSelectedFile(null);
    };

    return {
        fileInputRef,
        isUploading,
        uploadResult,
        isSaving,
        handleSelectUploadType,
        handleFileUpload,
        handleFinalUpload,
        downloadReport,
        closeResultMode
    };
};
