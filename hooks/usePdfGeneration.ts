import * as FileSystem from 'expo-file-system';
import * as Haptics from 'expo-haptics';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { useState } from 'react';
import { CapturedPage } from '../types';
import { formatDate } from '../utils/dateUtils';

interface UsePdfGenerationReturn {
  isGenerating: boolean;
  generatePdf: (projectName: string, description: string, pages: CapturedPage[]) => Promise<void>;
}

export default function usePdfGeneration(): UsePdfGenerationReturn {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePdf = async (projectName: string, description: string, pages: CapturedPage[]) => {
    if (pages.length === 0) {
      throw new Error('No pages to generate PDF from');
    }

    setIsGenerating(true);
    
    try {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      // Create HTML content for the PDF with base64 images
      const htmlContent = await createHtmlContent(projectName, description, pages);
      
      // Generate PDF using expo-print
      const pdfUri = await generatePdfFromHtml(htmlContent, projectName);
      
      // Share the PDF
      await sharePdf(pdfUri);
      
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (error) {
      console.error('PDF generation failed:', error);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      throw error;
    } finally {
      setIsGenerating(false);
    }
  };

  const createHtmlContent = async (projectName: string, description: string, pages: CapturedPage[]): Promise<string> => {
    const pagesWithBase64 = await Promise.all(
      pages
        .filter(page => page.photoUri)
        .map(async (page) => {
          try {
            // Convert local URI to base64
            const base64 = await FileSystem.readAsStringAsync(page.photoUri!, {
              encoding: FileSystem.EncodingType.Base64,
            });
            
            const mimeType = getMimeType(page.photoUri!);
            const dataUri = `data:${mimeType};base64,${base64}`;
            
            return {
              ...page,
              photoDataUri: dataUri
            };
          } catch (error) {
            console.error('Error converting image to base64:', error);
            return {
              ...page,
              photoDataUri: null
            };
          }
        })
    );

    const pagesHtml = pagesWithBase64
      .map((page) => {
        const timestamp = formatDate(page.timestamp, 'long');
        
        if (!page.photoDataUri) {
          return `
            <div style="padding: 15px; page-break-after: always;">
              <div style="text-align: center; margin-bottom: 5px;">
                <h2 style="margin-bottom: 1px; color: #333; font-size: 18px;">Page ${page.pageNumber}</h2>
                <p style="margin-bottom: 0; color: #666; font-size: 12px;">${timestamp}</p>
              </div>
              <div style="text-align: center; margin-top: 10px;">
                <p style="color: #999; font-style: italic; font-size: 14px;">Image not available</p>
              </div>
            </div>
          `;
        }
        
        return `
          <div style="padding: 15px; page-break-after: always;">
            <div style="text-align: center; margin-bottom: 5px;">
              <h2 style="margin-bottom: 1px; color: #333; font-size: 18px;">Page ${page.pageNumber}</h2>
              <p style="margin-bottom: 0; color: #666; font-size: 12px;">${timestamp}</p>
            </div>
            <div style="text-align: center; margin-top: 10px;">
              <img src="${page.photoDataUri}" style="max-width: 75%; max-height: 65vh; object-fit: contain;" />
            </div>
          </div>
        `;
      })
      .join('');

    return `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <title>${projectName}</title>
          <style>
            body { 
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              margin: 0; 
              padding: 0; 
              background: white;
            }
            @page { 
              margin: 20px; 
              size: A4;
            }
          </style>
        </head>
        <body>
          <div style="text-align: center; padding: 20px 40px; page-break-after: always;">
            <h1 style="margin: 0 0 20px 0; color: #333; font-size: 32px; font-weight: bold;">${projectName}</h1>
            ${description ? `<p style="margin: 0 0 20px 0; color: #555; font-size: 16px; max-width: 80%; line-height: 1.4; text-align: center; margin-left: auto; margin-right: auto;">${description}</p>` : ''}
            <p style="margin: 0; color: #666; font-size: 18px;">Generated on ${new Date().toLocaleDateString()}</p>
          </div>
          ${pagesHtml}
        </body>
      </html>
    `;
  };

  const getMimeType = (uri: string): string => {
    const extension = uri.split('.').pop()?.toLowerCase();
    switch (extension) {
      case 'jpg':
      case 'jpeg':
        return 'image/jpeg';
      case 'png':
        return 'image/png';
      case 'gif':
        return 'image/gif';
      case 'webp':
        return 'image/webp';
      default:
        return 'image/jpeg';
    }
  };

  const generatePdfFromHtml = async (htmlContent: string, projectName: string): Promise<string> => {
    try {
      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false
      });
      
      return uri;
    } catch (error) {
      console.error('PDF generation error:', error);
      throw new Error('Failed to generate PDF');
    }
  };

  const sharePdf = async (pdfUri: string): Promise<void> => {
    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(pdfUri, {
        mimeType: 'application/pdf',
        dialogTitle: 'Share PDF'
      });
    } else {
      console.log('Sharing not available');
    }
  };

  return {
    isGenerating,
    generatePdf
  };
} 