package com.capstone.University.Time.Table.manager.DTO;

public class UploadResponse {
    private int correctCount;
    private int faultCount;
    private String fileData; // Base64 encoded byte array

    public UploadResponse() {
    }

    public UploadResponse(int correctCount, int faultCount, String fileData) {
        this.correctCount = correctCount;
        this.faultCount = faultCount;
        this.fileData = fileData;
    }

    public int getCorrectCount() {
        return correctCount;
    }

    public void setCorrectCount(int correctCount) {
        this.correctCount = correctCount;
    }

    public int getFaultCount() {
        return faultCount;
    }

    public void setFaultCount(int faultCount) {
        this.faultCount = faultCount;
    }

    public String getFileData() {
        return fileData;
    }

    public void setFileData(String fileData) {
        this.fileData = fileData;
    }
}
