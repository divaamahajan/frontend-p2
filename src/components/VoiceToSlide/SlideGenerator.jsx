import React, { useState } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

const SlideGenerator = ({ slides, isGenerating, onGenerateComplete }) => {
  const [currentView, setCurrentView] = useState('preview'); // 'preview' or 'presentation'
  const [currentSlide, setCurrentSlide] = useState(0);

  const exportToPDF = async () => {
    const pdf = new jsPDF('landscape', 'mm', 'a4');
    const slideWidth = 297; // A4 landscape width
    const slideHeight = 210; // A4 landscape height

    for (let i = 0; i < slides.length; i++) {
      const slideElement = document.getElementById(`slide-${i}`);
      if (slideElement) {
        const canvas = await html2canvas(slideElement, {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff'
        });
        
        const imgData = canvas.toDataURL('image/png');
        pdf.addImage(imgData, 'PNG', 0, 0, slideWidth, slideHeight);
        
        if (i < slides.length - 1) {
          pdf.addPage();
        }
      }
    }
    
    pdf.save('presentation.pdf');
  };

  const exportToHTML = () => {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Generated Presentation</title>
        <style>
          body { margin: 0; font-family: Arial, sans-serif; }
          .slide { 
            width: 100vw; height: 100vh; 
            display: flex; flex-direction: column; 
            justify-content: center; align-items: center;
            padding: 40px; box-sizing: border-box;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
          }
          .slide h1 { font-size: 3em; margin-bottom: 20px; text-align: center; }
          .slide p { font-size: 1.5em; text-align: center; max-width: 80%; }
          .slide.notes { background: #f5f5f5; color: #333; }
          .slide.notes h1 { color: #333; }
          .slide.notes p { color: #666; }
        </style>
      </head>
      <body>
        ${slides.map((slide, index) => `
          <div class="slide">
            <h1>${slide.title}</h1>
            <p>${slide.content}</p>
          </div>
          <div class="slide notes">
            <h1>Speaker Notes - Slide ${index + 1}</h1>
            <p>${slide.notes}</p>
          </div>
        `).join('')}
      </body>
      </html>
    `;
    
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'presentation.html';
    a.click();
  };

  if (isGenerating) {
    return (
      <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <h3 className="text-lg font-semibold mb-2">Generating Your Presentation...</h3>
          <p className="text-gray-600">This may take a few moments</p>
        </div>
      </div>
    );
  }

  if (!slides || slides.length === 0) {
    return null;
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Your Generated Presentation</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setCurrentView('preview')}
            className={`px-4 py-2 rounded ${currentView === 'preview' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Preview
          </button>
          <button
            onClick={() => setCurrentView('presentation')}
            className={`px-4 py-2 rounded ${currentView === 'presentation' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            Presentation Mode
          </button>
        </div>
      </div>

      {currentView === 'preview' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {slides.map((slide, index) => (
            <div key={index} className="border rounded-lg p-4 bg-gray-50">
              <h3 className="font-semibold mb-2">Slide {index + 1}</h3>
              <h4 className="text-lg font-bold mb-2">{slide.title}</h4>
              <p className="text-sm mb-2">{slide.content}</p>
              <details className="text-xs">
                <summary className="cursor-pointer text-blue-600">Speaker Notes</summary>
                <p className="mt-2 text-gray-600">{slide.notes}</p>
              </details>
            </div>
          ))}
        </div>
      ) : (
        <div className="relative">
          <div 
            id={`slide-${currentSlide}`}
            className="w-full h-96 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex flex-col justify-center items-center text-white p-8"
          >
            <h1 className="text-4xl font-bold mb-4 text-center">{slides[currentSlide].title}</h1>
            <p className="text-xl text-center max-w-3xl">{slides[currentSlide].content}</p>
          </div>
          
          <div className="flex justify-between items-center mt-4">
            <button
              onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
              disabled={currentSlide === 0}
              className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span className="text-sm">
              Slide {currentSlide + 1} of {slides.length}
            </span>
            <button
              onClick={() => setCurrentSlide(Math.min(slides.length - 1, currentSlide + 1))}
              disabled={currentSlide === slides.length - 1}
              className="px-4 py-2 bg-gray-300 rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      )}

      <div className="flex justify-center space-x-4 mt-6">
        <button
          onClick={exportToPDF}
          className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded font-semibold transition-colors"
        >
          Export as PDF
        </button>
        <button
          onClick={exportToHTML}
          className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded font-semibold transition-colors"
        >
          Export as HTML
        </button>
      </div>
    </div>
  );
};

export default SlideGenerator;



