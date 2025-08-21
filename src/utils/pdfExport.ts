
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { SimulationParams, SimulationResult } from '../types';
import { toast } from '@/components/ui/sonner';

/**
 * Exports the current simulation results to a PDF file
 */
export const exportToPDF = async (
  params: SimulationParams,
  result: SimulationResult | null,
  compareAlgorithm: string | null,
  compareResult: SimulationResult | null,
) => {
  if (!result) {
    toast.error("Please run simulation first");
    return;
  }

  toast.info("Preparing PDF for download...");
  
  try {
    const pdf = new jsPDF('p', 'mm', 'a4');
    const contentElement = document.getElementById('pdf-content');
    
    if (!contentElement) {
      toast.error("Could not generate PDF");
      return;
    }
    
    // Title
    pdf.setFontSize(18);
    pdf.text("DAA Algorithm Comparison Report", 20, 20);
    
    // Date
    pdf.setFontSize(12);
    const date = new Date().toLocaleDateString();
    pdf.text(`Generated on: ${date}`, 20, 30);
    
    // Parameters
    pdf.setFontSize(14);
    pdf.text(`Route Parameters`, 20, 40);
    pdf.setFontSize(12);
    pdf.text(`Map Type: ${params.mapType}`, 25, 47);
    pdf.text(`Algorithm: ${params.algorithm}${compareAlgorithm ? ` compared with ${compareAlgorithm}` : ''}`, 25, 54);
    pdf.text(`Weather: ${params.weather}, Time: ${params.timeOfDay}, Vehicle: ${params.vehicle}`, 25, 61);
    
    // Convert content to image
    const canvas = await html2canvas(contentElement, {
      scale: 1,
      useCORS: true,
      allowTaint: true,
      logging: false,
    });
    
    const contentImage = canvas.toDataURL('image/png');
    
    // Add content image
    pdf.addImage(contentImage, 'PNG', 10, 70, 190, 180);
    
    // Save PDF
    pdf.save(`algorithm_comparison_${params.algorithm}_${date.replace(/\//g, '-')}.pdf`);
    
    toast.success("PDF downloaded successfully");
  } catch (error) {
    console.error("PDF generation error:", error);
    toast.error("Error generating PDF");
  }
};
