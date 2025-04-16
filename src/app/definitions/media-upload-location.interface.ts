export interface MediaUploadLocation {
    uploadUrl: string;
    httpMethod: 'PUT';
    accessLink: string;
    type: 'image/video' | 'thumbnail';
    referenceId: string
}
