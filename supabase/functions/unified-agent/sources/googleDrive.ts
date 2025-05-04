
// Google Drive search and analysis functionality
export async function searchGoogleDrive(supabase, userId, query, providerToken, userToken) {
  try {
    let driveToken = providerToken;
    
    // If no provider token, try to get from database
    if (!driveToken && userId) {
      const { data: tokenData } = await supabase
        .from('google_drive_access')
        .select('access_token')
        .eq('user_id', userId)
        .maybeSingle();
        
      driveToken = tokenData?.access_token;
    }
    
    if (!driveToken) {
      throw new Error('No Google Drive access token available');
    }
    
    // Validate the token first
    console.log("Validating Google Drive token...");
    try {
      const validationResponse = await fetch(
        'https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=' + driveToken
      );
      
      if (!validationResponse.ok) {
        const validationData = await validationResponse.text();
        console.error(`Token validation error (${validationResponse.status}): ${validationData}`);
        throw new Error(`Invalid Google Drive token (${validationResponse.status}): ${validationResponse.statusText}`);
      }
      
      const validationData = await validationResponse.json();
      console.log(`Token validated successfully with scope: ${validationData.scope}`);
    } catch (validationError) {
      console.error("Token validation failed:", validationError);
      throw new Error(`Token validation failed: ${validationError.message}`);
    }
    
    // Build search query with improved error handling
    console.log(`Building Google Drive search query for: "${query}"`);
    try {
      // Removed the problematic 'orderBy' parameter
      const queryParams = new URLSearchParams({
        q: `fullText contains '${query}'`,
        fields: 'files(id,name,mimeType,description,thumbnailLink,webViewLink,modifiedTime,size,iconLink,fileExtension,parents)',
        pageSize: '10'
      });
      
      console.log(`Making request to Google Drive API: /drive/v3/files?${queryParams}`);
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files?${queryParams}`, 
        {
          headers: { 'Authorization': `Bearer ${driveToken}` }
        }
      );
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Google Drive API error (${response.status}): ${errorText}`);
        throw new Error(`Google Drive API error: ${response.status} ${response.statusText} - ${errorText}`);
      }
      
      const data = await response.json();
      console.log(`Google Drive search completed successfully with ${data.files?.length || 0} results`);
      return data.files || [];
    } catch (searchError) {
      console.error("Error in Drive search:", searchError);
      throw searchError;
    }
  } catch (error) {
    console.error("Error in searchGoogleDrive:", error);
    throw error;
  }
}

// Function to analyze Google Drive file content
export async function analyzeGoogleDriveFile(fileId, accessToken) {
  try {
    if (!accessToken) {
      throw new Error('No access token available for file analysis');
    }
    
    // Get file metadata to determine type
    console.log(`Getting metadata for file: ${fileId}`);
    const metadataResponse = await fetch(
      `https://www.googleapis.com/drive/v3/files/${fileId}?fields=mimeType,name`, 
      {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      }
    );
    
    if (!metadataResponse.ok) {
      const errorText = await metadataResponse.text();
      console.error(`Failed to get file metadata (${metadataResponse.status}): ${errorText}`);
      throw new Error(`Failed to get file metadata: ${metadataResponse.status} ${metadataResponse.statusText}`);
    }
    
    const metadata = await metadataResponse.json();
    const { mimeType, name } = metadata;
    console.log(`File ${fileId} (${name}) is of type: ${mimeType}`);
    
    // For Google Docs, Sheets, Slides, use the export API
    if (mimeType.includes('application/vnd.google-apps.')) {
      let exportMimeType = 'text/plain';
      let exportUrl = `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=${exportMimeType}`;
      
      console.log(`Exporting Google Workspace file using URL: ${exportUrl}`);
      const contentResponse = await fetch(exportUrl, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      
      if (!contentResponse.ok) {
        // If export fails, try to get at least the metadata
        const errorText = await contentResponse.text();
        console.error(`Export API error (${contentResponse.status}): ${errorText}`);
        return {
          type: 'google-workspace',
          fileName: name,
          mimeType: mimeType,
          contentInfo: `Could not export content: ${contentResponse.status} ${contentResponse.statusText}`
        };
      }
      
      const content = await contentResponse.text();
      console.log(`Successfully exported ${content.length} characters of content`);
      
      // Limit content length to avoid overwhelming the AI
      const maxContentLength = 5000;
      const truncatedContent = content.length > maxContentLength 
        ? content.substring(0, maxContentLength) + '...[content truncated]'
        : content;
      
      return {
        type: 'google-workspace',
        content: truncatedContent,
        fileName: name,
        mimeType: mimeType
      };
    }
    
    // For text-based files, get content directly
    else if (mimeType.includes('text/') || 
        mimeType.includes('application/json') || 
        mimeType.includes('application/xml')) {
      
      console.log(`Getting content for text-based file: ${fileId}`);
      const contentResponse = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      });
      
      if (!contentResponse.ok) {
        const errorText = await contentResponse.text();
        console.error(`Content retrieval error (${contentResponse.status}): ${errorText}`);
        return `Could not download file content: ${contentResponse.status}`;
      }
      
      const content = await contentResponse.text();
      console.log(`Successfully retrieved ${content.length} characters of content`);
      
      // Limit content length to avoid overwhelming the AI
      const maxContentLength = 5000;
      const truncatedContent = content.length > maxContentLength 
        ? content.substring(0, maxContentLength) + '...[content truncated]'
        : content;
      
      return {
        type: 'text',
        content: truncatedContent,
        fileName: name,
        mimeType: mimeType
      };
    }
    
    // For PDF files
    else if (mimeType.includes('application/pdf')) {
      console.log(`PDF file detected: ${fileId}. PDFs require special handling.`);
      return {
        type: 'pdf',
        fileName: name,
        mimeType: mimeType,
        contentInfo: 'PDF content extraction not supported. For best results, convert PDF to Google Docs.'
      };
    }
    
    // For other files, just return metadata
    console.log(`Non-text file detected: ${fileId}. Returning metadata only.`);
    return {
      type: 'non-text',
      fileName: name,
      mimeType: mimeType,
      contentInfo: 'Content not extracted - non-text file type'
    };
  } catch (error) {
    console.error("Error analyzing file:", error);
    return `Error analyzing file: ${error.message}`;
  }
}
