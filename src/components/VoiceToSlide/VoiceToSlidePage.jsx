import React, { useState } from 'react';
import AudioRecorder from './AudioRecorder';
import SlideGenerator from './SlideGenerator';

const VoiceToSlidePage = ({ user, token }) => {
  const [audioBlob, setAudioBlob] = useState(null);
  const [slides, setSlides] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleAudioReady = (blob) => {
    setAudioBlob(blob);
    setError(null);
  };

  const generateSlides = async () => {
    if (!audioBlob) {
      setError('Please record audio first');
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.wav');

      const response = await fetch('http://localhost:8000/voice-to-slide/generate', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to generate slides');
      }

      const data = await response.json();
      setSlides(data.slides);
      setSuccess('Slides generated successfully!');
    } catch (err) {
      setError('Failed to generate slides. Please try again.');
      console.error('Error generating slides:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const resetSession = () => {
    setAudioBlob(null);
    setSlides(null);
    setError(null);
    setSuccess(null);
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file && file.type.startsWith('audio/')) {
      setAudioBlob(file);
      setError(null);
    } else {
      setError('Please select a valid audio file');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-4 sm:py-8">
      <div className="max-w-6xl mx-auto px-2 sm:px-4">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 mb-4">
            Voice-to-Slide Generator
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Record a 3-minute presentation and get a polished slide deck with speaker notes
          </p>
        </div>

        {error && (
          <div className="max-w-md mx-auto mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="max-w-md mx-auto mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            {success}
          </div>
        )}

        {!slides ? (
          <div className="space-y-8">
            <AudioRecorder onAudioReady={handleAudioReady} />
            
            <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-lg">
              <h3 className="text-lg font-semibold mb-4 text-center">Or Upload Audio File</h3>
              <div className="text-center">
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleFileUpload}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                />
              </div>
            </div>
            
            {audioBlob && (
              <div className="max-w-md mx-auto">
                <button
                  onClick={generateSlides}
                  disabled={isGenerating}
                  className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
                >
                  {isGenerating ? 'Generating Slides...' : 'Generate Slides'}
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-8">
            <SlideGenerator 
              slides={slides} 
              isGenerating={isGenerating}
              onGenerateComplete={() => setIsGenerating(false)}
            />
            
            <div className="text-center">
              <button
                onClick={resetSession}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Create New Presentation
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoiceToSlidePage;
